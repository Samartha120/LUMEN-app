import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models/best.pt")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
    DEVICE: str = os.getenv("DEVICE", "") # leave empty for auto-detect (cuda if available, else cpu)
    VIDEO_SAMPLE_RATE: int = int(os.getenv("VIDEO_SAMPLE_RATE", "1")) # Extract 1 frame per second

settings = Settings()
