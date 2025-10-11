const express = require('express');
const router = express.Router();
const { initializeFirebase, getFirestore } = require('../lib/firebase');

// Initialize Firebase Admin SDK
const admin = initializeFirebase();
const db = getFirestore();

// Middleware: Verify session token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    // Decode token
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [uid, timestamp] = decoded.split(":");

    if (!uid) throw new Error("Invalid token format");

    // Check expiry (24h)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      throw new Error("Token expired");
    }

    const userRecord = await admin.auth().getUser(uid);

    req.user = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
    };

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = router;
