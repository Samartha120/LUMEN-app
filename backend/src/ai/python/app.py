from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
import time

from config import settings
from detector import detector

class DetectRequest(BaseModel):
    url: str
    description: str = ""

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model once on startup
    detector.load_model()
    yield
    # Cleanup on shutdown if necessary

app = FastAPI(
    title="LUMEN AI Inference Service",
    description="FastAPI service for YOLO11 damage detection",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "device": detector.device,
        "model_loaded": detector.model is not None
    }

@app.post("/detect/image")
def detect_image(req: DetectRequest):
    try:
        start_time = time.time()
        result = detector.predict_image(req.url)
        elapsed = time.time() - start_time
        
        result["metadata"] = {
            "processingTimeMs": int(elapsed * 1000),
            "device": detector.device,
            "type": "image"
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/video")
def detect_video(req: DetectRequest):
    try:
        start_time = time.time()
        result = detector.predict_video(req.url)
        elapsed = time.time() - start_time
        
        result["metadata"] = {
            "processingTimeMs": int(elapsed * 1000),
            "device": detector.device,
            "type": "video",
            "sampleRateFps": settings.VIDEO_SAMPLE_RATE
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=settings.HOST, port=settings.PORT, reload=False)
