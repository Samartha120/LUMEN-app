import torch
from ultralytics import YOLO
from config import settings
from postprocess import format_predictions, merge_video_predictions
from preprocess import download_image, download_video_frames

class YOLODetector:
    def __init__(self):
        self.model = None
        self.device = None
        
    def load_model(self):
        print(f"Loading YOLO model from {settings.MODEL_PATH}...")
        
        # Determine device
        if settings.DEVICE:
            self.device = settings.DEVICE
        else:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            
        print(f"Using device: {self.device}")
        
        try:
            self.model = YOLO(settings.MODEL_PATH)
            # Move to device if needed, ultralytics handles this usually via the device param in predict
        except Exception as e:
            print(f"Error loading model: {e}")
            print("WARNING: Starting without model. Inference will fail if requested.")
            
    def predict_image(self, url: str) -> dict:
        if not self.model:
            raise Exception("Model not loaded")
            
        image = download_image(url)
        results = self.model.predict(
            source=image, 
            conf=settings.CONFIDENCE_THRESHOLD,
            device=self.device,
            verbose=False
        )
        
        return format_predictions(results, self.model.names)
        
    def predict_video(self, url: str) -> dict:
        if not self.model:
            raise Exception("Model not loaded")
            
        frames = download_video_frames(url, settings.VIDEO_SAMPLE_RATE)
        if not frames:
            return {"damageClass": "UNKNOWN", "confidenceScore": 0.0, "boundingBoxes": []}
            
        frame_predictions = []
        for frame in frames:
            results = self.model.predict(
                source=frame,
                conf=settings.CONFIDENCE_THRESHOLD,
                device=self.device,
                verbose=False
            )
            pred = format_predictions(results, self.model.names)
            frame_predictions.append(pred)
            
        return merge_video_predictions(frame_predictions)

# Singleton instance
detector = YOLODetector()
