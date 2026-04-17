#!/bin/bash
# Backend startup script for Linux/Mac

set -e  # Exit on error

echo "╔════════════════════════════════════════════════╗"
echo "║   Starting Whizz Backend Server                ║"
echo "╚════════════════════════════════════════════════╝"

# Check if running from correct directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

echo "📦 Installing dependencies..."
cd backend
npm install

echo "
✅ Setup complete!

Starting backend server...
📍 Port: ${PORT:-5000}
🌐 URL: http://localhost:${PORT:-5000}
"

# Run based on NODE_ENV
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi
