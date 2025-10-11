const express = require('express');
const router = express.Router();
const { initializeFirebase, getFirestore } = require('../lib/firebase');

const admin = initializeFirebase();
const db = getFirestore();

// Token middleware
const verifyToken = async (req, res, next) => { /* SAME AS IN COMMIT 1 */ };

// --- Activities Pool ---
const allActivities = [
  {
    id: 'breathing-exercise',
    title: '5-Minute Breathing Exercise',
    description: 'Practice deep breathing to reduce stress and anxiety',
    duration: '5 minutes',
    category: 'Mindfulness',
    difficulty: 'Easy',
    moodRange: [1, 10]
  },
  {
    id: 'meditation',
    title: 'Guided Meditation',
    description: 'Listen to a calming meditation session',
    duration: '10 minutes',
    category: 'Mindfulness',
    difficulty: 'Medium',
    moodRange: [1, 8]
  },
  {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    description: 'Progressive relaxation from head to toe',
    duration: '15 minutes',
    category: 'Mindfulness',
    difficulty: 'Medium',
    moodRange: [1, 7]
  },
  {
    id: 'walk-outside',
    title: 'Take a Walk Outside',
    description: 'Get some fresh air and gentle movement',
    duration: '15 minutes',
    category: 'Physical',
    difficulty: 'Easy',
    moodRange: [3, 10]
  },
  {
    id: 'stretching',
    title: 'Gentle Stretching',
    description: 'Release tension with simple stretches',
    duration: '10 minutes',
    category: 'Physical',
    difficulty: 'Easy',
    moodRange: [1, 10]
  },
  {
    id: 'dance-break',
    title: 'Dance Break',
    description: 'Put on your favorite song and move your body',
    duration: '5 minutes',
    category: 'Physical',
    difficulty: 'Easy',
    moodRange: [4, 10]
  },
  {
    id: 'gratitude-journal',
    title: 'Gratitude Journaling',
    description: 'Write down three things you’re grateful for today',
    duration: '10 minutes',
    category: 'Reflection',
    difficulty: 'Easy',
    moodRange: [1, 10]
  },
  {
    id: 'mood-reflection',
    title: 'Mood Reflection',
    description: 'Reflect on what influenced your mood today',
    duration: '8 minutes',
    category: 'Reflection',
    difficulty: 'Easy',
    moodRange: [1, 8]
  },
  {
    id: 'future-self',
    title: 'Future Self Visualization',
    description: 'Imagine your best self and what they would do',
    duration: '12 minutes',
    category: 'Reflection',
    difficulty: 'Medium',
    moodRange: [3, 10]
  },
  {
    id: 'doodle',
    title: 'Free-form Doodling',
    description: 'Let your creativity flow with simple drawing',
    duration: '10 minutes',
    category: 'Creative',
    difficulty: 'Easy',
    moodRange: [2, 10]
  },
  {
    id: 'music-listening',
    title: 'Music Therapy',
    description: 'Listen to music that matches or improves your mood',
    duration: '15 minutes',
    category: 'Creative',
    difficulty: 'Easy',
    moodRange: [1, 10]
  },
  {
    id: 'reach-out',
    title: 'Reach Out to Someone',
    description: 'Send a message to a friend or family member',
    duration: '5 minutes',
    category: 'Social',
    difficulty: 'Easy',
    moodRange: [1, 10]
  },
  {
    id: 'compliment-self',
    title: 'Self-Compassion Practice',
    description: 'Write yourself a kind and encouraging message',
    duration: '8 minutes',
    category: 'Social',
    difficulty: 'Easy',
    moodRange: [1, 8]
  }
];

module.exports = router;
