import base64
import os
import cv2
import torch
from io import BytesIO
from scipy.spatial import KDTree
from PIL import Image
import numpy as np
from transformers import DepthProImageProcessorFast, DepthProForDepthEstimation, Sam3Processor, Sam3Model
from dataclasses import dataclass
from typing import List


@dataclass
class Child:
    isInPool: bool
    distance: float


@dataclass
class FrameResult:
    image: str
    children: List[Child]
    warningLevel: int

    def to_dict(self):
        return {
            "image": self.image,
            "children": [
                {"isInPool": c.isInPool, "distance": c.distance}
                for c in self.children
            ],
            "warningLevel": self.warningLevel,
        }

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

depth_processor = DepthProImageProcessorFast.from_pretrained("apple/DepthPro-hf")
depth_model = DepthProForDepthEstimation.from_pretrained("apple/DepthPro-hf").to(device)

sam_model = Sam3Model.from_pretrained("facebook/sam3").to(device)
sam_processor = Sam3Processor.from_pretrained("facebook/sam3")

try:
    from huggingface_hub import login
    hf_token = userdata.get(os.environ.get("HF_API_KEY"))
    login(token=hf_token)
except Exception as e:
    print("Add the HF_API_KEY environment variable")

def get_depth_raw_output(image):
    inputs = image_processor(images=image, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = depth_model(**inputs)

    post_processed_output = image_processor.post_process_depth_estimation(
        outputs, target_sizes=[(image.height, image.width)],
    )[0]

    # Extract the tensors (keep them as tensors since your calculate_safety_distance
    # function expects to call .squeeze().cpu().numpy() and .item() on them)
    depth_tensor = post_processed_output["predicted_depth"]
    focal_length_px = post_processed_output["focal_length"]

    # Package them into the dictionary your distance function expects
    depth_output = {
        "depth": depth_tensor,
        "focallength_px": focal_length_px
    }

    return depth_output

def get_sam_raw_output(image, prompt_text):
    """Runs SAM 3 and returns the raw output needed for the distance calculator."""
    inputs = sam_processor(images=image, text=prompt_text, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = sam_model(**inputs)

    # Return the RAW outputs, not the post-processed results
    return outputs

def get_sam_count(outputs, image):
    results = sam_processor.post_process_instance_segmentation(
        outputs,
        threshold=0.5,
        target_sizes=[image.size[::-1]]
    )[0]

    return len(results["masks"])

def calculate_safety_distance(sam_output_kid, sam_output_pool, depth_output, kid_idx=0, pool_idx=0):
    """
    Takes raw outputs from SAM and Depth Pro to find real-world distance in meters.
    """
    # 1. Extract depth and focal length
    depth_map = depth_output["depth"].squeeze().cpu().numpy()
    f_px = depth_output["focallength_px"].item()
    target_size = depth_map.shape

    # 2. Extract and align masks
    kid_masks = sam_processor.post_process_instance_segmentation(
        sam_output_kid,
        threshold=0.5,
        target_sizes=[target_size]
    )[0]["masks"]

    pool_masks = sam_processor.post_process_instance_segmentation(
        sam_output_pool,
        threshold=0.5,
        target_sizes=[target_size]
    )[0]["masks"]

    kid_mask = kid_masks[kid_idx].cpu().numpy()
    pool_mask = pool_masks[pool_idx].cpu().numpy()

    # 3. Project 2D Pixels to 3D Metric Points
    def project_to_3d(mask, depth, focal_length):
        v, u = np.where(mask)
        z = depth[v, u]

        h, w = depth.shape
        cx, cy = w / 2.0, h / 2.0

        x = (u - cx) * z / focal_length
        y = (v - cy) * z / focal_length

        return np.stack((x, y, z), axis=-1)

    kid_coords = project_to_3d(kid_mask, depth_map, f_px)
    pool_coords = project_to_3d(pool_mask, depth_map, f_px)

    if kid_coords.size == 0 or pool_coords.size == 0:
        return float('inf')

    # Optional: Light subsampling to speed up KDTree if masks are massive
    # A step of 5 is much safer than 20 and runs very fast with KDTree
    kid_coords_sampled = kid_coords[::5]
    pool_coords_sampled = pool_coords[::5]

    # 4. Calculate Distance using KDTree for memory/speed efficiency
    pool_tree = KDTree(pool_coords_sampled)

    # query() returns the distance to the nearest neighbor for each point in kid_coords
    distances, _ = pool_tree.query(kid_coords_sampled)

    # 5. Robust Minimum: Use the 1st percentile to ignore edge-depth artifacts
    # (e.g., if 1 stray mask pixel grabs the background depth)
    min_dist = np.percentile(distances, 1)

    return min_dist

def apply_mask_overlay(img, output, color=(0, 255, 255, 128)):
    masks = sam_processor.post_process_instance_segmentation(
        output,
        threshold=0.5,
        target_sizes=[img.size[::-1]]
    )[0]["masks"]
    
    # 1. Convert base image to RGBA to support transparency
    base_img = img.convert("RGBA")
    
    if len(masks) == 0:
        print("No masks found to draw.")
        return base_img.convert("RGB")

    # 2. Create an empty numpy array for the overlay (Height, Width, 4)
    # Note: PIL uses (Width, Height) but NumPy uses (Height, Width)
    overlay_np = np.zeros((base_img.size[1], base_img.size[0], 4), dtype=np.uint8)

    # 3. Paint the color onto the overlay array wherever a mask is True
    for mask in masks:
        # Handle PyTorch tensors gracefully
        if hasattr(mask, 'cpu'):
            m = mask.cpu().numpy().astype(bool)
        else:
            m = np.array(mask).astype(bool)
            
        overlay_np[m] = color

    # 4. Convert the NumPy array back to a PIL Image
    overlay_img = Image.fromarray(overlay_np, mode="RGBA")

    # 5. Composite the overlay onto the base image
    blended_img = Image.alpha_composite(base_img, overlay_img)

    # 6. Convert back to standard RGB before returning (drops the alpha channel)
    return blended_img.convert("RGB")

def image_to_base64(pil_image, image_format="JPEG"):
    """
    Converts a PIL Image to a Base64 encoded string.
    """
    # 1. Create an in-memory buffer
    buffered = io.BytesIO()
    
    # 2. Save the PIL image to the buffer
    pil_image.save(buffered, format=image_format)
    
    # 3. Get the byte data from the buffer
    img_bytes = buffered.getvalue()
    
    # 4. Encode the bytes to base64, then decode to a standard UTF-8 string
    b64_string = base64.b64encode(img_bytes).decode('utf-8')
    
    return b64_string

def next_frame(image) -> FrameResult:
    if "," in image:
        image = image.split(",")[1]

    image_bytes = base64.b64decode(image)
    image = Image.open(BytesIO(image_bytes))

    depth = get_depth_raw_output(image)
    kids = get_sam_raw_output(image, "kid")
    pool = get_sam_raw_output(image, "pool")

    level = 0
    children = []
    for k in range(get_sam_count(kids)):
        min = float('inf')
        for p in range(get_sam_count(pool)):
            dist = calculate_safety_distance(kids, pool, depth, kid_idx=p, pool_idx=k)
            print(dist)
            if dist < min:
                min = dist
        
        if dist <= 0.5:
            level = 2
        elif dist < 3 and level != 2:
            level = 1

        children.append(Child(isInPool=dist<=0, distance=dist))

    masked = apply_mask_overlay(image, kids, (0, 255, 0, 128))
    masked = apply_mask_overlay(image, pool, (0, 255, 255, 128))

    return FrameResult(
        image=image_to_base64(masked),
        children=children,
        warningLevel=level,
    )