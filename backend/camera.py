import cv2
import threading
import time
import os
from collections import deque

VIDEO_PATH = os.path.join(os.path.dirname(__file__), 'test.mp4')

_frames = []
_fps = 5.0  # Your target emulated FPS
frame_buffer = deque(maxlen=10)
_lock = threading.Lock()
_running = False

def _preload():
    """Only load frames that match the target _fps into memory."""
    global _frames
    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print(f"[camera] Error: Could not open {VIDEO_PATH}")
        return

    native_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    
    # Calculate the step: if video is 30fps and target is 5fps, we take every 6th frame
    frame_step = native_fps / _fps
    
    current_video_idx = 0
    target_frame_count = 0
    
    while True:
        success, frame = cap.read()
        if not success:
            break
        
        # Logic: Only keep the frame if it's the "closest" to our target timeline
        if current_video_idx >= (target_frame_count * frame_step):
            _frames.append(frame)
            target_frame_count += 1
            
        current_video_idx += 1
        
    cap.release()
    print(f"[camera] Resampled {current_video_idx} native frames into {len(_frames)} cached frames at {_fps} FPS")

def _capture_loop():
    if not _frames:
        return
        
    delay = 1.0 / _fps
    idx = 0
    
    # Use a fixed start point to maintain perfect cadence
    start_time = time.monotonic()
    
    while _running:
        with _lock:
            frame_buffer.append(_frames[idx])
        
        idx = (idx + 1) % len(_frames)
        
        # Calculate next wake up time relative to start to prevent drift
        # This ensures 5fps stays 5fps over long durations
        next_wake = start_time + (idx * delay)
        
        # Reset timeline on loop
        if idx == 0:
            start_time = time.monotonic()
            next_wake = start_time + delay
            
        sleep_time = next_wake - time.monotonic()
        if sleep_time > 0:
            time.sleep(sleep_time)

def start():
    global _running
    _preload()
    _running = True
    t = threading.Thread(target=_capture_loop, daemon=True)
    t.start()

def stop():
    global _running
    _running = False


def get_frames():
    """Return a copy of the current frame buffer (oldest to newest)."""
    with _lock:
        return list(frame_buffer)


def get_latest_frame():
    """Return the most recent frame, or None if buffer is empty."""
    with _lock:
        return frame_buffer[-1] if frame_buffer else None


def get_frame(idx: int):
    """Return a pre-loaded frame by index (no lock needed — _frames is read-only after preload)."""
    return _frames[idx] if _frames else None


def get_frame_count() -> int:
    """Return total number of pre-loaded frames."""
    return len(_frames)