require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rate limiting for AI endpoint
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests. Please wait a moment.' }
});

// Routes
app.use('/api/ai', aiLimiter, require('./routes/ai'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'StudyAI API running' }));

// Connect DB (optional)
if (process.env.MONGO_URI) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.warn('⚠️  MongoDB not connected (running without DB):', err.message));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StudyAI backend running on http://localhost:${PORT}`);
  console.log(`   AI endpoint: POST http://localhost:${PORT}/api/ai/ask`);
});
