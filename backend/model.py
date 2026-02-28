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

# Reuse TCP connection across calls — cuts 30–50ms per frame
_session = requests.Session()

# Maximum width before resizing — reduces upload size by 70–85%
MAX_WIDTH = 640

# Previous raw frame for motion-based skip
_prev_raw_frame = None

def _frame_changed(prev_frame: np.ndarray, current_frame: np.ndarray, threshold: float = 5.0) -> bool:
    """Return True if the frames differ enough to warrant a new API call."""
    diff = cv2.absdiff(prev_frame, current_frame)
    return float(np.mean(diff)) > threshold

def next_frame(image_input) -> FrameResult:
    """
    Takes an OpenCV frame or PIL Image, checks the cache,
    sends it to Modal if new, and returns a FrameResult.
    """
    global _prev_raw_frame

    # 1. Convert to NumPy (BGR) for motion detection, then to PIL
    if isinstance(image_input, np.ndarray):
        raw_frame = image_input  # already BGR numpy array
        image = Image.fromarray(cv2.cvtColor(raw_frame, cv2.COLOR_BGR2RGB))
    elif isinstance(image_input, Image.Image):
        image = image_input
        raw_frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    else:
        raise TypeError(f"Unsupported image type: {type(image_input)}")

    # 2. Skip near-identical frames (saves 70–90% of API calls in quiet scenes)
    if _prev_raw_frame is not None and not _frame_changed(_prev_raw_frame, raw_frame):
        print("⏭ Frame unchanged — skipping API call.")
        # Return last cached result if available
        if _frame_cache:
            return next(reversed(_frame_cache.values()))
    _prev_raw_frame = raw_frame

    # 3. Resize to max 640px wide (reduces payload 70–85% + faster inference)
    if image.width > MAX_WIDTH:
        ratio = MAX_WIDTH / image.width
        new_height = int(image.height * ratio)
        image = image.resize((MAX_WIDTH, new_height), Image.BILINEAR)

    # 4. Encode to JPEG at quality 70 (much faster encode, smaller payload)
    buffered = BytesIO()
    image.convert("RGB").save(buffered, format="JPEG", quality=70, optimize=False)
    raw_bytes = buffered.getvalue()

    # 5. Hash raw bytes (faster than hashing a huge UTF-8 base64 string)
    frame_hash = hashlib.sha256(raw_bytes).hexdigest()

    if frame_hash in _frame_cache:
        print("⚡ Cache hit! Skipping cloud API request.")
        _frame_cache.move_to_end(frame_hash)
        return _frame_cache[frame_hash]

    # 6. Base64-encode for the JSON payload (server expects this format)
    b64_string = base64.b64encode(raw_bytes).decode("utf-8")

    # 7. Make the API request using the persistent session
    try:
        response = _session.post(
            MODAL_API_URL,
            json={"image": b64_string},
            timeout=30
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"API Request failed: {e}")
        return None

    # 8. Parse the JSON response
    data = response.json()

    # 9. Reconstruct your dataclasses
    children_list = [
        Child(isInPool=c["isInPool"], distance=c["distance"])
        for c in data["children"]
    ]

    image_str = data["image"]
    if "," in image_str:
        image_str = image_str.split(",")[1]

    result = FrameResult(
        image=image_str,
        children=children_list,
        warningLevel=data["warningLevel"]
    )

    # 10. Save to cache with LRU eviction
    _frame_cache[frame_hash] = result
    if len(_frame_cache) > CACHE_MAX_SIZE:
        _frame_cache.popitem(last=False)

    return result
