from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_socketio import SocketIO
import base64
import time
import threading
import camera
from model import next_frame

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Start the fake camera background thread
camera.start()

_latest_result = None
_latest_frame_bytes = None
_lock = threading.Lock()

_LEVEL_NAMES = {0: 'low', 1: 'medium', 2: 'high'}
_previous_warning_level = None


def inference_loop():
    """
    Runs inference in a background thread, completely decoupled from streaming.
    Always processes the latest frame; intermediate frames are dropped if inference
    is slower than the camera capture rate.
    """
    global _latest_result, _latest_frame_bytes, _previous_warning_level
    while True:
        frame = camera.get_latest_frame()
        if frame is None:
            time.sleep(0.001)
            continue

        result = next_frame(frame)

        img_bytes = base64.b64decode(result.image)

        with _lock:
            _latest_result = result
            _latest_frame_bytes = img_bytes

        current_level = result.warningLevel
        if _previous_warning_level is not None and current_level != _previous_warning_level:
            socketio.emit('risk_change', {
                'previous': _LEVEL_NAMES.get(_previous_warning_level),
                'current': _LEVEL_NAMES.get(current_level),
                'timestamp': time.time(),
            })
        _previous_warning_level = current_level


_inference_thread = threading.Thread(target=inference_loop, daemon=True)
_inference_thread.start()


def generate_frames():
    """
    Streams at a stable 10fps using deadline-based sleeping.
    Never blocks on inference — always serves the latest available frame.
    """
    frame_interval = 1 / 10

    while True:
        frame_start = time.monotonic()

        with _lock:
            frame_bytes = _latest_frame_bytes

        if frame_bytes is not None:
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
            )

        # Deadline-based sleep: accounts for time already spent above
        elapsed = time.monotonic() - frame_start
        sleep_time = frame_interval - elapsed
        if sleep_time > 0:
            time.sleep(sleep_time)


@app.route('/video')
def video_feed():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )


@app.route('/analysis')
def analysis():
    with _lock:
        result = _latest_result
    if result is None:
        return jsonify({})
    result_dict = result.to_dict()
    result_dict.pop('image', None)
    return jsonify(result_dict)


@app.route('/api/data', methods=['GET'])
def test():
    return jsonify({'message': 'Hello from the backend!', 'data': [1, 2, 3, 4, 5]})


if __name__ == '__main__':
    socketio.run(app, port=5001, debug=True)