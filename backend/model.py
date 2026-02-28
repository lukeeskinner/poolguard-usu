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

def next_frame(image_input) -> FrameResult:
    """
    Takes an OpenCV frame or PIL Image, sends it to Modal, and returns a FrameResult.
    """
    # 1. Convert OpenCV NumPy array to PIL Image
    if isinstance(image_input, np.ndarray):
        # OpenCV uses BGR, PIL uses RGB. We must convert the color channels!
        image = Image.fromarray(cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB))
    elif isinstance(image_input, Image.Image):
        image = image_input
    else:
        raise TypeError(f"Unsupported image type: {type(image_input)}")

    # 2. Encode the PIL image to Base64
    buffered = BytesIO()
    image.convert("RGB").save(buffered, format="JPEG")
    b64_string = base64.b64encode(buffered.getvalue()).decode("utf-8")

    # 3. Make the API request to your Modal A100 Server
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

    # 4. Parse the JSON response
    data = response.json()

    # 5. Reconstruct your dataclasses
    children_list = [
        Child(isInPool=c["isInPool"], distance=c["distance"]) 
        for c in data["children"]
    ]
    
    return FrameResult(
        image=data["image"],
        children=children_list,
        warningLevel=data["warningLevel"]
    )