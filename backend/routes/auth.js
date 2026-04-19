const express = require('express');
const router = express.Router();

// Stub auth endpoints — wire to MongoDB + bcrypt + JWT for production
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  // TODO: hash password, save to DB, return JWT
  res.json({ message: 'Registration endpoint ready. Connect MongoDB to enable.', user: { name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  // TODO: verify credentials, return JWT
  res.json({ message: 'Login endpoint ready. Connect MongoDB to enable.', token: 'demo-token' });
});

module.exports = router;
