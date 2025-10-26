// COMMIT 2 - Crisis detection added

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const crisisKeywords = [
  'suicide','kill myself','end my life','self harm','want to die'
];

const detectCrisis = (msg) => {
  const m = msg.toLowerCase();
  return crisisKeywords.some(k => m.includes(k));
};

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (detectCrisis(message)) {
      return res.json({
        reply: "I'm really concerned about what you're sharing. Please reach out to someone you trust. In India, you can call 1800-599-0019.",
        crisis: true,
        timestamp: new Date().toISOString()
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }]
    });

    const response = await result.response;

    res.json({
      reply: response.text(),
      crisis: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;