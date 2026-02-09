#!/bin/bash

# Guild Boss Timer - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🎮 Guild Boss Timer - Quick Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Step 1: Backend Setup
echo "📦 Step 1: Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
    echo ""
else
    echo ".env file already exists"
fi

echo "Installing backend dependencies..."
npm install

echo "✅ Backend setup complete!"
echo ""

# Step 2: Frontend Setup
echo "📦 Step 2: Setting up frontend..."
cd ../frontend

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local created with default values"
else
    echo ".env.local file already exists"
fi

echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"
echo ""

# Back to root
cd ..

# Final instructions
echo "=================================="
echo "🎉 Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your database:"
echo "   - Edit backend/.env"
echo "   - Set DATABASE_URL to your PostgreSQL connection string"
echo ""
echo "2. Run database migration:"
echo "   cd backend"
echo "   npm run build"
echo "   npm run migrate"
echo ""
echo "3. Start the backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "4. Start the frontend (in new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "Default password: naiwan"
echo ""
echo "📖 For more help, see QUICKSTART.md"
echo ""
