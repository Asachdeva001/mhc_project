const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeFirebase, logConversation } = require('../lib/firebase');

const admin = initializeFirebase();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [uid, ts] = decoded.split(':');
    const age = Date.now() - parseInt(ts);

    if (age > 86400000) return res.status(401).json({ error: 'Token expired' });

    const userRecord = await admin.auth().getUser(uid);
    req.user = { uid: userRecord.uid };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/save-conversation', async (req, res) => {
  try {
    const db = getFirestore();
    const { messages, sessionId, userId } = req.body;

    const data = {
      userId,
      messages,
      sessionId: sessionId || `session_${Date.now()}`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('chatConversations').add(data);

    res.json({ message: 'Saved', sessionId: data.sessionId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});


router.post('/', verifyToken, async (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
