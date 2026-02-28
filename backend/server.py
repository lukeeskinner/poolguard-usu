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
    Iterates through pre-loaded frames sequentially by index so every loop hits
    the same frames in the same order, keeping the model cache valid.
    """
    global _latest_result, _latest_frame_bytes, _previous_warning_level

    # Wait until frames are available
    while camera.get_frame_count() == 0:
        time.sleep(0.01)

    frame_interval = 1 / 10
    idx = 0
    while True:
        frame_start = time.monotonic()

        frame = camera.get_frame(idx)
        idx = (idx + 1) % camera.get_frame_count()

        result = next_frame(frame)
        if result is None:
            continue
        print(result.image)

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

        elapsed = time.monotonic() - frame_start
        sleep_time = frame_interval - elapsed
        if sleep_time > 0:
            time.sleep(sleep_time)


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


@app.route('/snapshot')
def snapshot():
    with _lock:
        frame_bytes = _latest_frame_bytes
    if frame_bytes is None:
        return Response(status=503)
    return Response(
        frame_bytes,
        mimetype='image/jpeg',
        headers={'Cache-Control': 'no-store'},
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
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)