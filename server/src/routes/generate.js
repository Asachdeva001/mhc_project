const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeFirebase, logConversation } = require('../lib/firebase');

const admin = initializeFirebase();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const crisisKeywords = ['suicide','kill myself','end my life','self harm','want to die'];
const detectCrisis = (msg) => crisisKeywords.some(k => msg.toLowerCase().includes(k));

router.post('/', async (req, res) => {
  try {
    const { message, userId = 'anonymous' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (detectCrisis(message)) {
      const crisisReply = "I'm concerned for your safety. Please call 1800-599-0019.";
      await logConversation(userId, message, crisisReply, true);
      return res.json({ reply: crisisReply, crisis: true });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }]
    });

    const aiReply = (await result.response).text();
    await logConversation(userId, message, aiReply, false);

    res.json({ reply: aiReply, crisis: false });

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
