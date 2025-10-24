from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
from pymongo import MongoClient
import random

app = Flask(__name__)
CORS(app)  # allow requests from React frontend

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["moodDB"]
collection = db["predictions"]

# Mock mood prediction (replace with your ML model)
def predict_mood(image: Image.Image):
    moods = ["happy", "sad", "neutral", "angry"]
    return random.choice(moods)

def save_mood_to_db(mood):
    collection.insert_one({"mood": mood})

@app.route("/predictMood", methods=["POST"])
def predict_mood_endpoint():
    try:
        data = request.json
        img_data = data["image"].split(",")[1] 
        img_bytes = base64.b64decode(img_data)
        img = Image.open(BytesIO(img_bytes))

        mood = predict_mood(img)
        save_mood_to_db(mood) 

        return jsonify({"mood": mood}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
