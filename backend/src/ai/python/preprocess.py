import cv2
import numpy as np
import requests
from io import BytesIO
from PIL import Image

def download_image(url: str) -> np.ndarray:
    response = requests.get(url)
    response.raise_for_status()
    image = Image.open(BytesIO(response.content)).convert("RGB")
    return np.array(image)

def download_video_frames(url: str, frames_per_second: int = 1) -> list[np.ndarray]:
    frames = []
    
    # Try capturing directly from URL (works for some S3 presigned URLs depending on OpenCV build)
    cap = cv2.VideoCapture(url)
    
    if not cap.isOpened():
        raise Exception(f"Unable to open video from {url}")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30 # fallback
        
    frame_interval = int(fps / frames_per_second)
    if frame_interval < 1:
        frame_interval = 1
        
    count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if count % frame_interval == 0:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame_rgb)
            
        count += 1
        
    cap.release()
    return frames
