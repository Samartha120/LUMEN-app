import asyncio
import logging
import gc
import time
import numpy as np
import torch
from typing import Optional, List, Dict, Any
from ultralytics import YOLO
from config import settings
from postprocess import format_single_prediction, merge_video_predictions
from preprocess import download_image_async, download_video_frames_async

logger = logging.getLogger("uvicorn.error")

class YOLODetector:
    model: Optional[YOLO]
    device: Optional[str]
    queue: Optional[asyncio.Queue]
    worker_task: Optional[asyncio.Task]
    _running: bool

    def __init__(self):
        self.model = None
        self.device = None
        self.queue = None
        self.worker_task = None
        self._running = False
        
    def load_model(self):
        logger.info(f"Loading YOLO model from {settings.MODEL_PATH}...")
        
        # Determine device
        if settings.DEVICE:
            self.device = settings.DEVICE
        else:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            
        logger.info(f"Using device: {self.device}")
        
        # Explicit CPU threading optimization
        if self.device == "cpu":
            logger.info(f"Setting PyTorch CPU threads to {settings.TORCH_NUM_THREADS}")
            torch.set_num_threads(settings.TORCH_NUM_THREADS)
        
        # Load model; fail fast if model file cannot be loaded
        try:
            self.model = YOLO(settings.MODEL_PATH)
            
            # Pre-warm model to allocate memory cache and warm up execution engine
            logger.info("Pre-warming YOLO model...")
            dummy_input = np.zeros((640, 640, 3), dtype=np.uint8)
            self.model.predict(source=dummy_input, device=self.device, verbose=False)
            logger.info("YOLO model loaded and pre-warmed successfully.")
        except Exception as e:
            logger.critical(f"FATAL: Failed to load YOLO model: {e}", exc_info=True)
            raise e
            
    def unload_model(self):
        logger.info("Unloading YOLO model...")
        self.model = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        elif hasattr(torch, "mps") and hasattr(torch.mps, "empty_cache"):
            torch.mps.empty_cache()
        gc.collect()
        logger.info("YOLO model unloaded successfully and memory released.")


    async def start_worker(self):
        """Starts the background dynamic batching worker task."""
        self.queue = asyncio.Queue(maxsize=settings.MAX_QUEUE_SIZE)
        self._running = True
        self.worker_task = asyncio.create_task(self._batching_worker())
        logger.info("Dynamic batching worker started.")

    async def stop_worker(self):
        """Stops the background dynamic batching worker task."""
        logger.info("Stopping dynamic batching worker...")
        self._running = False
        if self.worker_task:
            self.worker_task.cancel()
            try:
                await self.worker_task
            except asyncio.CancelledError:
                pass
            self.worker_task = None
        logger.info("Dynamic batching worker stopped.")
            
    async def predict_image(self, url: str) -> dict:
        if not self.model:
            raise RuntimeError("YOLO model not loaded")
        if self.queue is None:
            raise RuntimeError("Worker queue not initialized. Did you call start_worker()?")
            
        logger.info(f"Queueing image prediction for: {url}")
        image = await download_image_async(url)
        
        future = asyncio.Future()
        item = {"image": image, "future": future}
        
        # Attempt to enqueue. If full, raise QueueFull immediately (triggers 503)
        try:
            self.queue.put_nowait(item)
        except asyncio.QueueFull:
            logger.warning("Inference queue is full. Rejecting request.")
            raise asyncio.QueueFull("Inference queue capacity exceeded. Please retry later.")
            
        # Await the future until resolved by the background batching worker
        pred = await future
        return pred
        
    async def predict_video(self, url: str) -> dict:
        if not self.model:
            raise RuntimeError("YOLO model not loaded")
        if self.queue is None:
            raise RuntimeError("Worker queue not initialized. Did you call start_worker()?")
            
        logger.info(f"Downloading and extracting frames from video: {url}")
        frames = await download_video_frames_async(url, settings.VIDEO_SAMPLE_RATE)
        if not frames:
            logger.warning("No frames extracted from video.")
            return {"damageClass": "UNKNOWN", "confidenceScore": 0.0, "boundingBoxes": []}
            
        logger.info(f"Submitting {len(frames)} frames to dynamic batching queue...")
        
        # Check if queue can accommodate all frames to prevent partial submission
        if self.queue.qsize() + len(frames) > settings.MAX_QUEUE_SIZE:
            logger.warning("Inference queue lacks capacity to accept video request.")
            raise asyncio.QueueFull("Inference queue capacity exceeded. Please retry later.")
            
        futures = []
        try:
            for frame in frames:
                future = asyncio.Future()
                item = {"image": frame, "future": future}
                self.queue.put_nowait(item)
                futures.append(future)
        except asyncio.QueueFull:
            # Clean up and cancel any enqueued frames in this batch
            for fut in futures:
                if not fut.done():
                    fut.set_exception(asyncio.QueueFull("Queue became full during submission."))
            raise asyncio.QueueFull("Inference queue capacity exceeded.")
            
        # Wait for all frame predictions to resolve
        results = await asyncio.gather(*futures)
        logger.info("Video prediction processing complete.")
        return merge_video_predictions(results)

    async def _batching_worker(self):
        """Background loop for dynamic batching."""
        while self._running:
            try:
                if self.queue is None:
                    logger.error("Queue is not initialized in worker loop.")
                    await asyncio.sleep(0.1)
                    continue
                    
                # Wait for at least one item from the queue
                first_item = await self.queue.get()
                self.queue.task_done()
                
                batch = [first_item]
                start_time = time.time()
                
                # Accumulate further items up to MAX_BATCH_SIZE or timeout expiration
                while len(batch) < settings.MAX_BATCH_SIZE:
                    time_elapsed = (time.time() - start_time) * 1000.0  # in ms
                    time_left = settings.BATCH_TIMEOUT_MS - time_elapsed
                    if time_left <= 0:
                        break
                    
                    try:
                        item = await asyncio.wait_for(self.queue.get(), timeout=max(0.001, time_left / 1000.0))
                        batch.append(item)
                        self.queue.task_done()
                    except asyncio.TimeoutError:
                        break
                
                # Filter out cancelled futures (e.g. client disconnected before inference)
                active_batch = [item for item in batch if not item["future"].done()]
                if active_batch:
                    try:
                        await self._execute_batch(active_batch)
                    except Exception as e:
                        logger.error(f"Error during batch execution: {e}", exc_info=True)
                        for item in active_batch:
                            if not item["future"].done():
                                item["future"].set_exception(e)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Unexpected error in batching worker: {e}", exc_info=True)
                await asyncio.sleep(0.05)

    async def _execute_batch(self, batch):
        if self.model is None:
            raise RuntimeError("YOLO model not loaded")
            
        images = [item["image"] for item in batch]
        futures = [item["future"] for item in batch]
        
        # Run inference in worker thread pool to avoid blocking the event loop
        try:
            logger.info("YOLO started")
            results = await asyncio.to_thread(
                self.model.predict,
                source=images,
                conf=settings.CONFIDENCE_THRESHOLD,
                device=self.device,
                verbose=False
            )
            logger.info("YOLO completed")
            
            for i, result in enumerate(results):
                pred = format_single_prediction(result, self.model.names)
                if not futures[i].done():
                    futures[i].set_result(pred)
        except Exception as e:
            for fut in futures:
                if not fut.done():
                    fut.set_exception(e)
            raise e

# Singleton instance
detector = YOLODetector()
