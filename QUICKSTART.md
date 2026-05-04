# ScoutTree Quick Start Guide

Get ScoutTree running locally in 10 minutes.

## Prerequisites

- Docker & Docker Compose (recommended) OR
- Node.js 18+, PostgreSQL 14+, Redis 7+

## Option 1: Docker (Easiest) ⭐

### 1. Setup Environment
```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### 2. Start Everything
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- API server on port 5000
- Analysis worker (background)

### 3. Run Database Migration
```bash
docker-compose exec api node src/db/migrate.js
```

### 4. Verify It's Running
```bash
curl http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-11-29T...",
  "uptime": 1.234,
  "environment": "development"
}
```

### 5. Start Frontend
```bash
cd ..  # back to root
yarn install
yarn start
```

Frontend runs on http://localhost:3000

### 6. Create Your First Report

1. Open http://localhost:3000
2. Navigate to ScoutTree section (or integrate into existing UI)
3. Enter username: "DrNykterstein"
4. Click "Generate Report"
5. Wait ~30 seconds (first time) or instant (if cached)

✅ **Done!** You're running ScoutTree.

---

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (if needed)
cd ..
yarn install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb scouttree

# Set DATABASE_URL in backend/.env
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/scouttree" >> backend/.env

# Run migrations
cd backend
node src/db/migrate.js
```

### 3. Start Redis

```bash
redis-server
```

### 4. Start Backend Services

```bash
# Terminal 1: API Server
cd backend
npm run dev

# Terminal 2: Worker
cd backend
npm run worker
```

### 5. Start Frontend

```bash
# Terminal 3: React App
yarn start
```

---

## Test the API

### Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

Save the `accessToken` from the response.

### Create Scout Report
```bash
curl -X POST http://localhost:5000/api/v1/scout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "DrNykterstein",
    "platform": "lichess",
    "color": "white",
    "time_control": "blitz",
    "max_games": 100
  }'
```

Save the `job_id` from the response.

### Check Report Status
```bash
curl http://localhost:5000/api/v1/scout/YOUR_JOB_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Demo Report (No Auth Required)
```bash
curl http://localhost:5000/api/v1/scout/demo
```

---

## Troubleshooting

### "Connection refused" on port 5000
- Check if API is running: `docker-compose ps` or check Terminal 1
- Check logs: `docker-compose logs api` or check console output
- Verify port 5000 is not in use: `lsof -i :5000`

### "Database connection failed"
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env matches your setup
- Check logs: `docker-compose logs postgres`

### "Redis connection failed"
- Check Redis is running: `redis-cli ping`
- Should return "PONG"
- Check REDIS_HOST and REDIS_PORT in .env

### Worker not processing jobs
- Check worker logs: `docker-compose logs worker`
- Verify Redis connection
- Check queue: `redis-cli KEYS bull:scout-reports:*`

### Lichess/Chess.com API errors
- Verify internet connection
- Check if platform APIs are accessible
- Check logs for rate limit errors
- Consider using demo data for testing

---

## Next Steps

1. **Customize Configuration**
   - Edit `backend/.env` with your settings
   - Configure Stripe keys for payments
   - Set up Sentry for error tracking

2. **Integrate with OpeningTree**
   - Add ScoutTree routes to existing app
   - Style components to match OpeningTree theme
   - Add navigation links

3. **Deploy to Production**
   - See SCOUTTREE_README.md for deployment guide
   - Configure production database
   - Set up monitoring

4. **Extend Functionality**
   - Add custom analysis rules
   - Integrate more platforms
   - Build custom training drills

---

## Project Structure Reference

```
backend/
├── src/
│   ├── api/routes/
│   │   ├── auth.js         # Authentication
│   │   ├── scout.js        # Scout reports
│   │   ├── user.js         # User management
│   │   └── admin.js        # Admin panel
│   ├── services/
│   │   ├── platformFetcher.js      # Fetch games
│   │   ├── stockfishAnalyzer.js    # Engine analysis
│   │   └── scoutReportGenerator.js # Generate reports
│   ├── workers/
│   │   └── analysisWorker.js       # Background jobs
│   └── db/
│       └── schema.sql              # Database schema
├── Dockerfile
├── docker-compose.yml
└── package.json

src/scouttree/
├── pages/
│   ├── LandingPage.js
│   ├── ScoutPage.js
│   └── ReportPage.js
└── api/
    └── client.js
```

---

## Support

- 📖 Full docs: See SCOUTTREE_README.md
- 🐛 Issues: GitHub Issues
- 💬 Questions: Discord or email

---

**Happy Scouting! ♟️**
