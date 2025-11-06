from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image
from pymongo import MongoClient
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
import cv2
from mtcnn.mtcnn import MTCNN
import os

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["moodDB"]
collection = db["predictions"]

MODEL_PATH = "server/src/effnetb0_fer_to_rafdb_final.keras"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")


class Cast(tf.keras.layers.Layer):
    def __init__(self, dtype=tf.float32, **kwargs):
        super().__init__(**kwargs)
        self.target_dtype = dtype

    def call(self, inputs):
        return tf.cast(inputs, self.target_dtype)

    def get_config(self):
        config = super().get_config()
        config.update({"dtype": self.target_dtype})
        return config

# Load model
model = load_model(MODEL_PATH, custom_objects={"Cast": Cast}, compile=False)
print(f"✅ Loaded fine-tuned model: {MODEL_PATH}")


EMOTION_LABELS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]


detector = MTCNN()

def detect_face(image: Image.Image):
    img_rgb = np.array(image)
    detections = detector.detect_faces(img_rgb)
    if len(detections) == 0:
        return None

    face = max(detections, key=lambda d: d['box'][2] * d['box'][3])
    x, y, w, h = face['box']
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(img_rgb.shape[1], x + w), min(img_rgb.shape[0], y + h)

    cropped_face = img_rgb[y1:y2, x1:x2]
    if cropped_face.size == 0:
        return None

    return Image.fromarray(cropped_face)


def preprocess_face(image: Image.Image):
    image = image.resize((224, 224))
    img_array = np.array(image)
    img_array = preprocess_input(np.expand_dims(img_array, axis=0))
    return img_array


def predict_emotion(image: Image.Image):
    face = detect_face(image)
    if face is None:
        return "no_face_detected", 0.0

    face_input = preprocess_face(face)
    preds = model.predict(face_input, verbose=0)

    # Temperature scaling to sharpen probabilities
    preds = np.exp(np.log(preds + 1e-8) / 0.5)
    preds /= np.sum(preds, axis=1, keepdims=True)

    emotion_idx = np.argmax(preds[0])
    emotion = EMOTION_LABELS[emotion_idx]
    confidence = float(np.max(preds[0]))

    print(f"[DEBUG] Prediction: {emotion} ({confidence*100:.2f}%)")
    return emotion, confidence

def save_to_db(emotion, confidence):
    collection.insert_one({
        "emotion": emotion,
        "confidence": confidence
    })


@app.route("/predictMood", methods=["POST"])
def predict_mood_endpoint():
    try:
        data = request.json
        if "image" not in data:
            return jsonify({"error": "Missing 'image' field"}), 400

        img_data = data["image"].split(",")[1]
        img_bytes = base64.b64decode(img_data)
        image = Image.open(BytesIO(img_bytes)).convert("RGB")

        emotion, confidence = predict_emotion(image)
        if emotion == "no_face_detected":
            return jsonify({"error": "No face detected"}), 400

        save_to_db(emotion, confidence)
        return jsonify({"emotion": emotion, "confidence": confidence}), 200

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    print("🚀 Running Emotion Detection API (TensorFlow + MTCNN) ...")
    app.run(host="0.0.0.0", port=5000, debug=True)
