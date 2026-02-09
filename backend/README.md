# Backend README

## Overview

Node.js/Express backend for Guild Boss Timer with PostgreSQL database.

## Structure

```
backend/
├── src/
│   ├── index.ts      # Main Express server
│   ├── db.ts         # Database connection
│   ├── migrate.ts    # Database migration script
│   └── types.ts      # TypeScript interfaces
├── dist/             # Compiled JavaScript (generated)
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── .env              # Environment variables (create from .env.example)
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Run database migration:
```bash
npm run build
npm run migrate
```

## Development

Start dev server with hot reload:
```bash
npm run dev
```

Server runs on http://localhost:3001

## Production

Build and start:
```bash
npm run build
npm start
```

## API Routes

See `/API.md` in root directory for full documentation.

### Available Endpoints

- `GET /health` - Health check
- `GET /api/bosses` - Get all bosses
- `GET /api/bosses/:id` - Get single boss
- `POST /api/auth/check` - Validate password
- `POST /api/bosses/:id/update` - Update boss times
- `POST /api/bosses/:id/kill` - Mark boss as killed

## Database Schema

### Bosses Table
```sql
CREATE TABLE bosses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  attack_type VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL,
  respawn_hours INTEGER NOT NULL,
  location VARCHAR(255) NOT NULL,
  last_kill_at TIMESTAMP WITH TIME ZONE,
  next_spawn_at TIMESTAMP WITH TIME ZONE,
  is_scheduled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |
| NODE_ENV | Environment | development or production |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm run migrate` | Run database migration |

## Dependencies

### Production
- `express` - Web framework
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `cors` - CORS middleware
- `helmet` - Security headers
- `dotenv` - Environment variables

### Development
- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server with hot reload
- `@types/*` - TypeScript type definitions

## Security

- Passwords hashed with bcrypt (cost factor 10)
- CORS configured for frontend origin only
- Helmet.js for security headers
- Environment variables for secrets
- SQL injection protected by parameterized queries

## Deployment

Deploy to Render:

1. Push to GitHub
2. Create Render Web Service
3. Set environment variables
4. Deploy
5. Run migration in shell

See `DEPLOYMENT.md` for detailed instructions.

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3001 (Linux/Mac)
lsof -ti:3001 | xargs kill

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database connection fails
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Test connection with psql

### Migration fails
- Ensure database exists
- Check if tables already exist
- Verify PostgreSQL version

## Testing

Test endpoints with curl:

```bash
# Health check
curl http://localhost:3001/health

# Get all bosses
curl http://localhost:3001/api/bosses

# Validate password
curl -X POST http://localhost:3001/api/auth/check \
  -H "Content-Type: application/json" \
  -d '{"password":"naiwan"}'
```
