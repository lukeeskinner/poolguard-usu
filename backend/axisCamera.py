import cv2
import threading
import time
from collections import deque

CAMERA_IP = "192.168.1.90"
USER = "root"
PASS = "password"

_URL = f"http://{USER}:{PASS}@{CAMERA_IP}/axis-cgi/mjpg/video.cgi"

# Shared buffer of the last 10 frames
frame_buffer = deque(maxlen=10)
_lock = threading.Lock()
_running = False


def _capture_loop():
    while _running:
        cap = cv2.VideoCapture(_URL)
        while cap.isOpened() and _running:
            success, frame = cap.read()
            if not success:
                break
            with _lock:
                frame_buffer.append(frame)
        cap.release()
        if _running:
            time.sleep(1)  # brief pause before reconnecting on dropped stream


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
