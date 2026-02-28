import torch
import numpy as np
from scipy.spatial.distance import cdist
import torch.nn.functional as F

def calculate_safety_distance(sam_output_kid, sam_output_pool, depth_output, processor, kid_idx=0, pool_idx=0):
    """
    Takes raw outputs from SAM 3 and Depth Pro to find real-world distance.

    Args:
        sam_output_kid: Raw output from Sam3Model for the kid detection
        sam_output_pool: Raw output from Sam3Model for the pool detection
        depth_output: Dict from depth_pro model.infer()
                      e.g., {"depth": tensor, "focallength_px": tensor}
        processor: The Sam3Processor used for the image
        kid_idx: Index of the 'kid' mask in sam_output_kid's detection list
        pool_idx: Index of the 'pool' mask in sam_output_pool's detection list
    """
    depth_map = depth_output["depth"].squeeze().cpu().numpy()
    f_px = depth_output["focallength_px"].item()

    target_size = depth_map.shape

    kid_masks = processor.post_process_instance_segmentation(
        sam_output_kid,
        threshold=0.5,
        target_sizes=[target_size]
    )[0]["masks"]

    pool_masks = processor.post_process_instance_segmentation(
        sam_output_pool,
        threshold=0.5,
        target_sizes=[target_size]
    )[0]["masks"]

    kid_mask = kid_masks[kid_idx].cpu().numpy()
    pool_mask = pool_masks[pool_idx].cpu().numpy()

    # 3. Formula: Project 2D Pixels to 3D Metric Points
    def project_to_3d(mask, depth, focal_length):
        v, u = np.where(mask)
        z = depth[v, u]
        
        h, w = depth.shape
        cx, cy = w / 2, h / 2
        

        x = (u - cx) * z / focal_length
        y = (v - cy) * z / focal_length
        
        return np.stack((x, y, z), axis=-1)

    kid_coords = project_to_3d(kid_mask, depth_map, f_px)
    pool_coords = project_to_3d(pool_mask, depth_map, f_px)

    if kid_coords.size == 0 or pool_coords.size == 0:
        return float('inf')

    distances = cdist(kid_coords[::20], pool_coords[::20])
    min_dist = np.min(distances)

    return min_dist