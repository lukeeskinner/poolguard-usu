import os
import json
import time
from google import genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))


def makeAPICall(video_path, prompt):
    client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

    video_file = client.files.upload(file=video_path)

    while video_file.state.name == "PROCESSING":
        time.sleep(1)
        video_file = client.files.get(name=video_file.name)

    if video_file.state.name == "FAILED":
        raise Exception("Video processing failed")

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[video_file, prompt]
    )

    result = response.text

    with open("gemini_response.json", "w") as f:
        json.dump({"response": result}, f)

    return result

