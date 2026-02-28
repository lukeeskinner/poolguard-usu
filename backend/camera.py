import cv2
import threading
import time
import os
from collections import deque

VIDEO_PATH = os.path.join(os.path.dirname(__file__), 'test.mp4')

# Shared buffer of the last 10 frames
frame_buffer = deque(maxlen=10)
_lock = threading.Lock()
_running = False


def _capture_loop():
    while _running:
        cap = cv2.VideoCapture(VIDEO_PATH)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        delay = 1.0 / fps
        while cap.isOpened() and _running:
            success, frame = cap.read()
            if not success:
                break
            with _lock:
                frame_buffer.append(frame)
            time.sleep(delay)
        cap.release()


def start():
    global _running
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