import cv2
import threading
import time
import os
from collections import deque

VIDEO_PATH = os.path.join(os.path.dirname(__file__), 'test.mp4')

# Pre-loaded frames so every loop hits the exact same pixel data
_frames = []
_fps = 30.0

# Shared buffer of the last 10 frames
frame_buffer = deque(maxlen=10)
_lock = threading.Lock()
_running = False


def _preload():
    """Load all video frames into memory once so loops are deterministic."""
    global _fps
    cap = cv2.VideoCapture(VIDEO_PATH)
    _fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    while True:
        success, frame = cap.read()
        if not success:
            break
        _frames.append(frame)
    cap.release()
    print(f"[camera] Pre-loaded {len(_frames)} frames at {_fps:.1f} fps")


def _capture_loop():
    if not _frames:
        return
    delay = 1.0 / _fps
    idx = 0
    while _running:
        with _lock:
            frame_buffer.append(_frames[idx])
        idx = (idx + 1) % len(_frames)
        time.sleep(delay)


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