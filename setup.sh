#!/bin/bash

echo "🚀 Setting up PitchLine Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Start database services
echo "🐘 Starting database services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Setup backend
echo "⚙️ Setting up backend..."
cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please update it with your configuration."
fi

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Seed database
npm run db:seed

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "VITE_API_URL=http://localhost:3001/api" > .env
    echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here" >> .env
    echo "📝 Created frontend .env file."
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "🔐 Test Accounts:"
echo "Admin: admin@pitchline.com / admin123"
echo "Decision Maker: john.doe@techcorp.com / password123"
echo "Pitcher: jane.smith@startup.com / password123"
echo ""
echo "🚀 To start the application:"
echo "npm run dev"
echo ""
echo "📚 Backend API: http://localhost:3001"
echo "🎨 Frontend App: http://localhost:3000"