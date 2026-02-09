# 📚 Documentation Index

Welcome to the Guild Boss Timer documentation! This index will help you find the information you need.

## 🚀 Getting Started

**New to the project? Start here:**

1. **[START_HERE.md](START_HERE.md)** - Complete overview and quick start
2. **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
3. **[README.md](README.md)** - Full project documentation

## 📖 Core Documentation

### Project Information
- **[README.md](README.md)** - Main documentation with features, setup, and usage
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical overview and architecture
- **[ARCHITECTURE.txt](ARCHITECTURE.txt)** - Visual system architecture diagrams
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes

### Setup & Installation
- **[QUICKSTART.md](QUICKSTART.md)** - Quick setup in 5 minutes
- **[setup.bat](setup.bat)** - Automated setup script (Windows)
- **[setup.sh](setup.sh)** - Automated setup script (Linux/Mac)

### Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for production
  - Aiven Database setup
  - Render backend deployment
  - Vercel frontend deployment
  - Environment configuration
  - Troubleshooting deployment issues

### Development
- **[backend/README.md](backend/README.md)** - Backend-specific documentation
- **[frontend/README.md](frontend/README.md)** - Frontend-specific documentation
- **[API.md](API.md)** - Complete API endpoint documentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project

### Troubleshooting
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
  - Installation problems
  - Backend issues
  - Frontend issues
  - Database problems
  - Deployment errors
  - Runtime issues

## 🗂️ By Topic

### For Users
- [What is Guild Boss Timer?](#what-is-it)
- [How to use the app](#usage)
- [Features overview](#features)

### For Developers
- [Architecture overview](#architecture)
- [Tech stack](#tech-stack)
- [API documentation](#api)
- [Database schema](#database)
- [Contributing](#contributing)

### For DevOps
- [Deployment guide](#deployment)
- [Environment variables](#environment)
- [Security considerations](#security)
- [Monitoring](#monitoring)

---

## What is it?

**Guild Boss Timer** is a full-stack web application for tracking boss respawn timers in online games.

**Key Features:**
- Live countdown timers
- Boss management
- Calendar visualization
- Password-protected admin controls
- Mobile responsive

**Read more:** [README.md](README.md) | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## Usage

### Quick Start
1. Install dependencies: See [QUICKSTART.md](QUICKSTART.md)
2. Configure database: See [DEPLOYMENT.md](DEPLOYMENT.md)
3. Run migration: `npm run migrate`
4. Start servers: `npm run dev`

### Using the Application
- **View bosses:** Home page shows all bosses with live timers
- **Mark boss killed:** Click "Kill" button, enter password "naiwan"
- **Edit times:** Click "Edit" button, modify spawn times
- **Calendar view:** Click "Calendar View" for visual overview

**Read more:** [START_HERE.md](START_HERE.md) | [README.md](README.md#features-walkthrough)

---

## Features

### Core Features
- ✅ Live countdown timers (updates every second)
- ✅ Auto-calculation of next spawn times
- ✅ Manual time editing
- ✅ Calendar visualization (monthly/weekly)
- ✅ Filter by location, type, status
- ✅ Password protection
- ✅ Mobile responsive

### Technical Features
- ✅ Server-side rendering (Next.js)
- ✅ Real-time updates
- ✅ Auto-refresh every 60 seconds
- ✅ Color-coded timers
- ✅ Dark mode support

**Read more:** [README.md](README.md#features) | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md#core-functionality)

---

## Architecture

```
Frontend (Next.js) → Backend (Express) → Database (PostgreSQL)
     ↓                    ↓                     ↓
   Vercel              Render                Aiven
```

**Components:**
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Aiven
- **Calendar:** FullCalendar library

**Read more:** [ARCHITECTURE.txt](ARCHITECTURE.txt) | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md#architecture)

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- FullCalendar
- Axios

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL (pg)
- bcrypt
- CORS & Helmet

### Deployment
- Vercel (Frontend)
- Render (Backend)
- Aiven (Database)

**Read more:** [README.md](README.md#tech-stack) | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md#technology-choices)

---

## API

### Endpoints

**Public:**
- `GET /health` - Health check
- `GET /api/bosses` - Get all bosses

**Protected (require password):**
- `POST /api/auth/check` - Validate password
- `POST /api/bosses/:id/update` - Update boss times
- `POST /api/bosses/:id/kill` - Mark boss as killed

**Default Password:** `naiwan`

**Read more:** [API.md](API.md)

---

## Database

### Schema

**Bosses Table:**
- id, name, attack_type, level
- respawn_hours, location
- last_kill_at, next_spawn_at
- is_scheduled, created_at, updated_at

**Settings Table:**
- id, key, value
- created_at, updated_at

**Read more:** [README.md](README.md#database-schema) | [backend/DATABASE_COMMANDS.sql](backend/DATABASE_COMMANDS.sql)

---

## Deployment

### Quick Deploy

**Backend (Render):**
1. Connect GitHub repo
2. Set `DATABASE_URL` env var
3. Deploy

**Frontend (Vercel):**
1. Import repo
2. Set `NEXT_PUBLIC_API_URL`
3. Deploy

**Database (Aiven):**
1. Create PostgreSQL service
2. Copy connection string
3. Run migration

**Read more:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Environment

### Backend (.env)
```env
PORT=3001
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Read more:** [DEPLOYMENT.md](DEPLOYMENT.md#environment-variables-reference)

---

## Security

### Implemented
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ SQL injection prevention
- ✅ Helmet.js security headers
- ✅ Environment variables for secrets

### Best Practices
- Change default password
- Use HTTPS in production
- Enable database SSL
- Restrict CORS origins
- Regular dependency updates

**Read more:** [README.md](README.md#security-basics) | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md#security)

---

## Contributing

### How to Contribute
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Style
- TypeScript for all code
- ESLint for linting
- Functional React components
- Tailwind for styling

**Read more:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Monitoring

### Local Development
- Backend logs in console
- Frontend logs in browser console
- Database queries in PostgreSQL logs

### Production
- Render: Service logs
- Vercel: Deployment logs
- Aiven: Database metrics

**Read more:** [DEPLOYMENT.md](DEPLOYMENT.md#monitoring)

---

## File Organization

```
finaltimer/
├── backend/                # Backend API
│   ├── src/               # Source code
│   └── README.md          # Backend docs
├── frontend/              # Frontend app
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   └── README.md          # Frontend docs
├── README.md              # Main docs
├── QUICKSTART.md          # Quick start
├── DEPLOYMENT.md          # Deploy guide
├── API.md                 # API docs
├── TROUBLESHOOTING.md     # Help
└── START_HERE.md          # Overview
```

---

## Quick Links

### Documentation
- [Main README](README.md)
- [Quick Start](QUICKSTART.md)
- [API Docs](API.md)
- [Deployment](DEPLOYMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)

### Code
- [Backend Code](backend/src/)
- [Frontend Code](frontend/app/)
- [Components](frontend/components/)

### Configuration
- [Backend package.json](backend/package.json)
- [Frontend package.json](frontend/package.json)
- [Environment Examples](backend/.env.example)

---

## Help & Support

### Common Issues
- Installation problems → [TROUBLESHOOTING.md](TROUBLESHOOTING.md#installation-issues)
- Backend errors → [TROUBLESHOOTING.md](TROUBLESHOOTING.md#backend-issues)
- Frontend errors → [TROUBLESHOOTING.md](TROUBLESHOOTING.md#frontend-issues)
- Database issues → [TROUBLESHOOTING.md](TROUBLESHOOTING.md#database-issues)
- Deployment problems → [TROUBLESHOOTING.md](TROUBLESHOOTING.md#deployment-issues)

### Need Help?
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Read relevant documentation
3. Search existing issues
4. Open new issue with details

---

## Version Information

**Current Version:** 1.0.0  
**Release Date:** January 1, 2024  
**License:** MIT

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Additional Resources

### External Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Aiven Docs](https://docs.aiven.io)

### Learning Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [FullCalendar](https://fullcalendar.io/docs)

---

**Happy Boss Hunting! 🗡️**

*Last Updated: January 1, 2024*
