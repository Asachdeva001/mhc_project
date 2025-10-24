import express from "express";
import fetch from "node-fetch";
import Mood from "../models/Mood.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { frame } = req.body;

    if (!frame) return res.status(400).json({ error: "Frame is required" });

    // Send frame to Flask for instant mood detection
    const flaskRes = await fetch("http://127.0.0.1:5000/predictMood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: frame }),
    });

    const data = await flaskRes.json();
    const mood = data.mood;

    // Save frame + mood to MongoDB
    const newEntry = new Mood({ frame, mood });
    await newEntry.save();

    res.json({ mood });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
