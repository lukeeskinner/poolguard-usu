from collections import OrderedDict
import hashlib

import requests
import base64
from io import BytesIO
from PIL import Image
import numpy as np
from dataclasses import dataclass
from typing import List
import cv2

# 1. Keep your dataclasses locally so your app logic doesn't have to change
@dataclass
class Child:
    isInPool: bool
    distance: float

@dataclass
class FrameResult:
    image: str
    children: List[Child]
    warningLevel: int

# Paste the URL Modal gave you when you ran `modal deploy deploy_a100.py`
MODAL_API_URL = "https://u1446904--pool-safety-a100-safetycalculator-next-frame.modal.run"

CACHE_MAX_SIZE = 50
_frame_cache = OrderedDict()

def next_frame(image_input) -> FrameResult:
    """
    Takes an OpenCV frame or PIL Image, checks the cache, 
    sends it to Modal if new, and returns a FrameResult.
    """
    # 1. Convert OpenCV NumPy array to PIL Image
    if isinstance(image_input, np.ndarray):
        image = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
    elif isinstance(image_input, Image.Image):
        image = image_input
    else:
        raise TypeError(f"Unsupported image type: {type(image_input)}")

    # 2. Encode the PIL image to Base64
    buffered = BytesIO()
    image.convert("RGB").save(buffered, format="JPEG")
    b64_string = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # 3. HASH AND CACHE CHECK
    # We create a unique digital fingerprint of the image
    frame_hash = hashlib.sha256(b64_string.encode('utf-8')).hexdigest()
    
    if frame_hash in _frame_cache:
        print("⚡ Cache hit! Skipping cloud API request.")
        # Move this item to the end of the OrderedDict so it isn't deleted as "old"
        _frame_cache.move_to_end(frame_hash)
        return _frame_cache[frame_hash]

    # 4. Make the API request to your Modal A100 Server
    try:
        response = requests.post(
            MODAL_API_URL, 
            json={"image": b64_string},
            timeout=30 
        )
        response.raise_for_status() 
    except requests.exceptions.RequestException as e:
        print(f"API Request failed: {e}")
        return None

    # 5. Parse the JSON response
    data = response.json()

    # 6. Reconstruct your dataclasses
    children_list = [
        Child(isInPool=c["isInPool"], distance=c["distance"]) 
        for c in data["children"]
    ]
    
    result = FrameResult(
        image=data["image"],
        children=children_list,
        warningLevel=data["warningLevel"]
    )

    # 7. SAVE TO CACHE
    _frame_cache[frame_hash] = result
    
    # Enforce the maximum cache size to prevent memory leaks
    if len(_frame_cache) > CACHE_MAX_SIZE:
        # popitem(last=False) removes the oldest (First-In) item
        _frame_cache.popitem(last=False)

    return result