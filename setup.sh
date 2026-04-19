#!/bin/bash
# StudyAI - Quick Setup Script

set -e

echo ""
echo "╔══════════════════════════════════╗"
echo "║   StudyAI — Setup Script         ║"
echo "╚══════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js v18+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Backend setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚙️  Created backend/.env from example."
  echo "   ➜ Add your OPENAI_API_KEY to backend/.env"
fi
cd ..

# Frontend setup
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created frontend/.env"
fi
cd ..

echo ""
echo "════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "To start the app, open TWO terminals:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo "════════════════════════════════════"
echo ""
