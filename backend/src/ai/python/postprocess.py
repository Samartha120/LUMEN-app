from collections import Counter

def format_predictions(results, names) -> dict:
    if not results or len(results) == 0:
        return {"damageClass": "UNKNOWN", "confidenceScore": 0.0, "boundingBoxes": []}
        
    result = results[0]
    boxes = result.boxes
    
    if len(boxes) == 0:
        return {"damageClass": "UNKNOWN", "confidenceScore": 0.0, "boundingBoxes": []}
        
    formatted_boxes = []
    classes = []
    confidences = []
    
    for box in boxes:
        cls_id = int(box.cls[0].item())
        conf = float(box.conf[0].item())
        xyxy = box.xyxy[0].tolist()
        
        label = names[cls_id]
        classes.append(label)
        confidences.append(conf)
        
        formatted_boxes.append({
            "label": label,
            "confidence": conf,
            "xmin": xyxy[0],
            "ymin": xyxy[1],
            "xmax": xyxy[2],
            "ymax": xyxy[3]
        })
        
    # Majority vote for primary damage class
    most_common_class = Counter(classes).most_common(1)[0][0]
    avg_confidence = sum(confidences) / len(confidences)
    
    return {
        "damageClass": most_common_class.upper(),
        "confidenceScore": avg_confidence,
        "boundingBoxes": formatted_boxes
    }

def merge_video_predictions(frame_predictions: list) -> dict:
    if not frame_predictions:
        return {"damageClass": "UNKNOWN", "confidenceScore": 0.0, "boundingBoxes": []}
        
    all_classes = []
    all_confidences = []
    
    for pred in frame_predictions:
        if pred["damageClass"] != "UNKNOWN":
            all_classes.append(pred["damageClass"])
            all_confidences.append(pred["confidenceScore"])
            
    if not all_classes:
        return {"damageClass": "UNKNOWN", "confidenceScore": 0.0, "boundingBoxes": []}
        
    # Get overall most common class across all frames
    most_common_class = Counter(all_classes).most_common(1)[0][0]
    avg_confidence = sum(all_confidences) / len(all_confidences)
    
    # For bounding boxes in video, we could return all or sample them. 
    # Returning empty to save payload size, as tracking bboxes across video is complex.
    # We will just return the most confident frame's boxes.
    best_frame = max(frame_predictions, key=lambda x: x["confidenceScore"])
    
    return {
        "damageClass": most_common_class,
        "confidenceScore": avg_confidence,
        "boundingBoxes": best_frame["boundingBoxes"]
    }
