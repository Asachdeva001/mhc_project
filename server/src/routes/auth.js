const express = require("express");
const router = express.Router();
const { initializeFirebase, getFirestore } = require("../lib/firebase");

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

// Create user
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name required" });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      preferences: { notifications: true, theme: "light" },
    });

    const sessionToken = Buffer.from(${userRecord.uid}:${Date.now()}).toString("base64");

    res.json({
      message: "User created successfully",
      sessionToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === "auth/email-already-exists") {
      res.status(400).json({ error: "Email already exists" });
    } else if (error.code === "auth/invalid-email") {
      res.status(400).json({ error: "Invalid email" });
    } else if (error.code === "auth/weak-password") {
      res.status(400).json({ error: "Weak password" });
    } else {
      res.status(500).json({ error: "Failed to create user" });
    }
  }
});