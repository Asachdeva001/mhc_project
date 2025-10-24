import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  mood: String,
  frame: String, // base64-encoded image
});

const Mood = mongoose.model("Mood", moodSchema);
export default Mood;
