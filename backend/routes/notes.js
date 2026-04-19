const express = require('express');
const router = express.Router();

let notes = [];

router.get('/', (req, res) => res.json(notes));

router.post('/', (req, res) => {
  const { title, content, question, color } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required.' });
  const note = { id: Date.now().toString(), title: title || 'Untitled Note', content, question: question || '', color: color || '#10b981', createdAt: new Date() };
  notes.unshift(note);
  res.status(201).json(note);
});

router.delete('/:id', (req, res) => {
  notes = notes.filter(n => n.id !== req.params.id);
  res.json({ success: true });
});

module.exports = router;
