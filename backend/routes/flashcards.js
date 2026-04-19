const express = require('express');
const router = express.Router();

// In-memory store for demo (replace with MongoDB model in production)
let flashcards = [];

router.get('/', (req, res) => {
  res.json(flashcards);
});

router.post('/', (req, res) => {
  const { front, back, topic, color } = req.body;
  if (!front || !back) return res.status(400).json({ error: 'Front and back are required.' });
  const card = { id: Date.now().toString(), front, back, topic: topic || 'General', color: color || '#6366f1', createdAt: new Date() };
  flashcards.unshift(card);
  res.status(201).json(card);
});

router.delete('/:id', (req, res) => {
  flashcards = flashcards.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

router.put('/:id', (req, res) => {
  const idx = flashcards.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Card not found.' });
  flashcards[idx] = { ...flashcards[idx], ...req.body };
  res.json(flashcards[idx]);
});

module.exports = router;
