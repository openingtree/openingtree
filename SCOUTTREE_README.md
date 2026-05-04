# ScoutTree - Opponent Scouting for Chess

ScoutTree is a comprehensive opponent analysis platform built on top of OpeningTree. It transforms any chess username into a detailed scouting report with opening preparation, tactical patterns, and a pre-game checklist.

## 🚀 Features

### Core Functionality
- **One-Click Scouting**: Enter opponent's username → Get comprehensive report in under 2 minutes
- **Multi-Platform Support**: Lichess, Chess.com, or PGN upload
- **Engine Analysis**: Stockfish 16+ integration for deep position evaluation
- **Opening Tree**: Interactive tree with win/loss statistics and frequency analysis
- **Weakness Detection**: Automated pattern recognition with confidence scoring
- **Preparation Lines**: 3 recommended lines (exploitation, surprise, solid) with explanations
- **Pre-Game Checklist**: 60-90 second summary with key points and avoid-list
- **Training Drill**: 3 positions for rapid pre-game warm-up

### Technical Architecture
- **Backend**: Node.js/Express with Redis job queue
- **Database**: PostgreSQL with JSONB for flexible report storage
- **Analysis**: Stockfish integration with FEN-based caching
- **Frontend**: React with existing OpeningTree UI components
- **API**: RESTful API with JWT authentication
- **Payments**: Stripe integration for subscriptions

## 📦 Project Structure

```
openingtree/
├── backend/                    # ScoutTree backend
│   ├── src/
│   │   ├── api/               # Express routes and middleware
│   │   │   ├── routes/        # API endpoints
│   │   │   └── middleware/    # Auth, rate limiting, errors
│   │   ├── db/                # Database
│   │   │   ├── schema.sql     # PostgreSQL schema
│   │   │   ├── connection.js  # Database client
│   │   │   └── migrate.js     # Migration script
│   │   ├── workers/           # Background jobs
│   │   │   ├── scoutQueue.js  # Bull queue setup
│   │   │   └── analysisWorker.js # Report processor
│   │   ├── services/          # Business logic
│   │   │   ├── platformFetcher.js        # Game fetching
│   │   │   ├── stockfishAnalyzer.js      # Engine analysis
│   │   │   └── scoutReportGenerator.js   # Report generation
│   │   ├── utils/             # Utilities
│   │   │   ├── logger.js
│   │   │   └── scoutReportSchema.js # JSON schema
│   │   ├── config/            # Configuration
│   │   └── server.js          # Entry point
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env.example
├── src/scouttree/             # ScoutTree frontend
│   ├── pages/
│   │   ├── LandingPage.js     # Marketing page
│   │   ├── ScoutPage.js       # Report creation
│   │   └── ReportPage.js      # Report viewer
│   ├── components/            # Reusable UI components
│   └── api/
│       └── client.js          # API client
└── [existing OpeningTree files]
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional but recommended)

### Quick Start with Docker (Recommended)

1. **Clone and Navigate**
```bash
cd /home/user/openingtree/backend
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start Services**
```bash
docker-compose up -d
```

4. **Run Migrations**
```bash
docker-compose exec api node src/db/migrate.js
```

5. **Verify**
```bash
curl http://localhost:5000/health
```

### Manual Installation

#### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb scouttree

# Run migrations
node src/db/migrate.js
```

3. **Start Redis**
```bash
redis-server
```

4. **Start API Server**
```bash
npm start
# or for development
npm run dev
```

5. **Start Worker**
```bash
# In a new terminal
npm run worker
```

#### Frontend Setup

1. **Install Dependencies** (if not already done)
```bash
cd ..  # Back to root
yarn install
```

2. **Configure API URL**
```bash
# Add to .env or environment
REACT_APP_API_URL=http://localhost:5000/api/v1
```

3. **Start Development Server**
```bash
yarn start
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## 🔧 Configuration

### Environment Variables

See `backend/.env.example` for all available options. Key variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/scouttree

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Platform APIs
LICHESS_API_URL=https://lichess.org
CHESSCOM_API_URL=https://api.chess.com/pub

# Analysis
STOCKFISH_DEPTH_BLITZ=20
STOCKFISH_DEPTH_RAPID=25
MAX_GAMES_FETCH=500
```

## 📡 API Endpoints

### Authentication
```bash
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login
POST   /api/v1/auth/logout            # Logout
GET    /api/v1/auth/me                # Get current user
POST   /api/v1/auth/generate-api-key  # Generate API key
```

### Scout Reports
```bash
POST   /api/v1/scout                  # Create scout report
GET    /api/v1/scout/:jobId           # Get report status/result
GET    /api/v1/scout/report/:reportId # Download report
POST   /api/v1/scout/upload-pgn       # Upload PGN for analysis
GET    /api/v1/scout/search-match     # Fuzzy username search
GET    /api/v1/scout/demo             # Get demo report
```

### User Management
```bash
GET    /api/v1/user/reports           # Get report history
GET    /api/v1/user/usage             # Get usage stats
DELETE /api/v1/user/reports/:id       # Delete report
```

### Admin
```bash
GET    /api/v1/admin/stats            # System statistics
GET    /api/v1/admin/users            # List users
GET    /api/v1/admin/jobs             # View job queue
POST   /api/v1/admin/jobs/:id/retry   # Retry failed job
```

## 🎯 Usage Examples

### Creating a Scout Report

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/scout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "DrNykterstein",
    "platform": "lichess",
    "color": "white",
    "time_control": "blitz",
    "max_games": 500,
    "include_engine_analysis": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": "uuid",
    "job_id": "scout_uuid",
    "status": "pending",
    "estimated_time_seconds": 120
  }
}
```

### Checking Report Status

```bash
curl http://localhost:5000/api/v1/scout/scout_uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Complete Report Structure

See `backend/src/utils/scoutReportSchema.js` for the complete JSON schema, including:
- Player profile with ratings and stats
- Time control breakdown
- Opening tree (nested structure, 10 plies deep)
- Weaknesses with evidence and confidence
- Recommended lines with explanations
- Pre-game checklist with summary
- Training drill (3 positions)
- Metadata and data limitations

## 🚢 Deployment

### Docker Deployment (Production)

1. **Build Images**
```bash
cd backend
docker-compose -f docker-compose.yml build
```

2. **Set Production Environment**
```bash
export NODE_ENV=production
# Configure .env with production settings
```

3. **Deploy**
```bash
docker-compose up -d
```

4. **Scale Workers**
```bash
docker-compose up -d --scale worker=3
```

### AWS/GCP Deployment

1. **Database**: Use RDS (PostgreSQL) or Cloud SQL
2. **Cache**: Use ElastiCache (Redis) or Memorystore
3. **API**: Deploy on ECS, App Engine, or Kubernetes
4. **Workers**: Auto-scaling group based on queue length
5. **Storage**: S3 or Cloud Storage for artifacts
6. **CDN**: CloudFront or Cloud CDN for frontend

### Terraform Configuration (Example)

```hcl
# See deployment/terraform/ for complete configuration
resource "aws_db_instance" "scouttree_db" {
  identifier = "scouttree-postgres"
  engine = "postgres"
  engine_version = "14.7"
  instance_class = "db.t3.medium"
  allocated_storage = 100
  # ... additional config
}

resource "aws_elasticache_cluster" "scouttree_redis" {
  cluster_id = "scouttree-redis"
  engine = "redis"
  node_type = "cache.t3.micro"
  num_cache_nodes = 1
}
```

## 📊 Monitoring

### Prometheus Metrics

API exposes metrics at `/metrics`:
- Request counts and latency
- Job queue statistics
- Database connection pool
- Cache hit rates

### Logs

- Application logs: `backend/logs/combined.log`
- Error logs: `backend/logs/error.log`
- Winston format with timestamps and metadata

### Sentry Integration

Configure Sentry DSN in `.env` for error tracking:
```bash
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🧪 Testing

### Run Tests
```bash
cd backend
npm test
```

### API Testing with Postman

Import the OpenAPI spec (see API documentation below) or use the included Postman collection:

```bash
# Generate OpenAPI spec
npm run generate-docs

# Import into Postman or use curl
```

## 📚 API Documentation

Generate OpenAPI/Swagger documentation:

```bash
cd backend
npm run generate-docs
# Access at http://localhost:5000/api-docs
```

## 🎬 Demo Script (5 Minutes)

1. **Landing Page** (1 min)
   - Show hero with value proposition
   - Scroll through features
   - Click "Try Free Demo"

2. **Scout Page** (1 min)
   - Enter username "DrNykterstein"
   - Select platform "lichess", color "white", time control "blitz"
   - Click "Generate Report"
   - Show progress bar

3. **Report Page** (3 min)
   - Left panel: Show 60-second checklist
   - Right panel: Interactive opening tree
   - Scroll to weaknesses with evidence
   - Show recommended preparation lines
   - Demonstrate training drill
   - Download JSON report
   - Copy moves to clipboard

## 🔐 Security Notes

1. **Never commit secrets**: Use `.env` files, not version control
2. **JWT Tokens**: Rotate secrets regularly
3. **Rate Limiting**: Configured per subscription tier
4. **SQL Injection**: Using parameterized queries
5. **CORS**: Configured for specific origins only
6. **Helmet**: Security headers enabled
7. **API Keys**: Hashed and secure

## 📈 Performance Optimization

1. **Caching Strategy**
   - Games: 7 days
   - Engine analysis: 30 days (by FEN)
   - Reports: 24 hours
   - Username matches: 7 days

2. **Database Indexing**
   - Indexed on username + platform
   - JSONB GIN index for report search
   - Composite indexes on frequent queries

3. **Queue Optimization**
   - Horizontal worker scaling
   - Configurable concurrency
   - Job retry with exponential backoff

## 🆘 Troubleshooting

### Common Issues

**Problem**: Worker not processing jobs
```bash
# Check Redis connection
docker-compose logs redis

# Restart worker
docker-compose restart worker

# Check queue status
curl http://localhost:5000/api/v1/admin/jobs
```

**Problem**: Database connection errors
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Recreate database
docker-compose down -v
docker-compose up -d
node src/db/migrate.js
```

**Problem**: Lichess/Chess.com API rate limiting
```bash
# Check cache hit rate
# Implement exponential backoff (already configured)
# Consider upgrading platform API limits
```

## 📝 Legal & Compliance

1. **TOS Compliance**: Respects platform rate limits and robots.txt
2. **Data Privacy**: GDPR compliant with user data removal
3. **Cache Retention**: 7-day games, 24-hour reports
4. **Attribution**: Links back to source games
5. **Opt-Out**: Users can request data removal

## 🤝 Contributing

Contributions welcome! This is built as an extension to OpeningTree.

## 📄 License

Same license as OpeningTree (see main LICENSE file)

## 🔗 Links

- OpeningTree: https://www.openingtree.com
- Lichess API: https://lichess.org/api
- Chess.com API: https://www.chess.com/news/view/published-data-api

## 📞 Support

- GitHub Issues: [Report bugs or request features]
- Email: [Contact from main OpeningTree]
- Discord: [Join OpeningTree Discord]

---

**Built with ♟️ by the OpeningTree team**

*ScoutTree - Know your opponent before the first move*
