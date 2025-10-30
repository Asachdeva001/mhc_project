// COMMIT 4 - Add 3-part structured prompt system

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeFirebase, logConversation } = require('../lib/firebase');

const admin = initializeFirebase();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const crisisKeywords = ['suicide','kill myself','end my life','self harm','want to die'];
const detectCrisis = (msg) => crisisKeywords.some(k => msg.toLowerCase().includes(k));

const generateResponse = async (messages) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const userMsg = messages[messages.length - 1].content;

  const part1 = `You are an empathetic AI Wellness Guide...`;
  let part2 = `Conversation History:\n`;
  messages.slice(0, -1).forEach(m => part2 += `${m.role}: ${m.content}\n`);
  const part3 = `Respond to: ${userMsg}`;

  const prompt = `${part1}\n\n${part2}\n\n${part3}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });
  return (await result.response).text();
};

router.post('/', async (req, res) => {
  try {
    const { message, messages = [], userId = 'anonymous' } = req.body;

    if (detectCrisis(message)) {
      const reply = "I'm concerned about you. Please call 1800-599-0019.";
      await logConversation(userId, message, reply, true);
      return res.json({ reply, crisis: true });
    }

    const full = [...messages, { role: 'user', content: message }];
    const aiResponse = await generateResponse(full);

    await logConversation(userId, message, aiResponse, false);

    res.json({ reply: aiResponse, crisis: false });

  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
