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
        time.sleep(2)
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


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))

    video_path = os.path.join(script_dir, "test.mp4")
    prompt_path = os.path.join(script_dir, "masterprompt.txt")

    with open(prompt_path, "r") as f:
        prompt = f.read()

    result = makeAPICall(video_path, prompt)
    print(result)
