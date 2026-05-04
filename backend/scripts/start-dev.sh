#!/bin/bash
# Start ScoutTree backend in development mode

echo "🚀 Starting ScoutTree Backend (Development)"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found! Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your configuration"
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Starting Redis..."
    redis-server --daemonize yes
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Run migrations
echo "🔧 Running database migrations..."
node src/db/migrate.js

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start API server and worker in parallel
echo "✅ Starting services..."
echo "   - API server on port 5000"
echo "   - Analysis worker with concurrency 2"
echo ""

# Use concurrently or tmux to run both
npm run dev &
API_PID=$!

sleep 2

npm run worker &
WORKER_PID=$!

echo "✅ ScoutTree backend is running!"
echo ""
echo "API: http://localhost:5000"
echo "Health: http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "kill $API_PID $WORKER_PID; exit" INT TERM

wait
