# Guild Boss Timer - Project Summary

## 📋 Overview

A full-stack web application for tracking guild boss respawn timers in online games. Features live countdowns, manual time editing, calendar visualization, and password-protected admin controls.

## 🎯 Core Functionality

### User Features
- **Live Countdown Timers** - Real-time display showing days, hours, minutes, seconds
- **Boss List View** - Table showing all bosses with status and timers
- **Calendar View** - Monthly/weekly visualization of boss spawns
- **Filtering** - By location, attack type, and status
- **Mobile Responsive** - Works on all devices

### Admin Features (Password: "naiwan")
- **Mark Boss as Killed** - Auto-calculates next spawn time
- **Manual Time Editing** - Set custom spawn times
- **Boss Management** - Update respawn hours

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│              Next.js 14 + TypeScript             │
│            Deployed on Vercel                    │
│                                                  │
│  Pages:                                          │
│  • Boss List (/)                                │
│  • Calendar (/calendar)                         │
│                                                  │
│  Components:                                     │
│  • LiveTimer - Real-time countdown             │
│  • PasswordModal - Authentication               │
│  • EditBossModal - Time editing                │
└─────────────┬───────────────────────────────────┘
              │
              │ REST API (HTTP/JSON)
              │
┌─────────────▼───────────────────────────────────┐
│                   Backend                        │
│            Node.js + Express + TypeScript        │
│            Deployed on Render                    │
│                                                  │
│  Routes:                                         │
│  • GET  /api/bosses                             │
│  • POST /api/bosses/:id/update                  │
│  • POST /api/bosses/:id/kill                    │
│  • POST /api/auth/check                         │
└─────────────┬───────────────────────────────────┘
              │
              │ pg (PostgreSQL client)
              │
┌─────────────▼───────────────────────────────────┐
│                  Database                        │
│              PostgreSQL (Aiven)                  │
│                                                  │
│  Tables:                                         │
│  • bosses - Boss data and spawn times           │
│  • settings - Configuration (password hash)     │
└──────────────────────────────────────────────────┘
```

## 📊 Data Model

### Boss Entity
```typescript
{
  id: number                    // Primary key
  name: string                  // "Dragon Lord"
  attackType: "melee" | "magic" // Attack classification
  level: number                 // Boss level (70-90)
  respawnHours: number          // Hours until respawn (6-72)
  location: string              // "Dragon Peak"
  lastKillAt: string | null     // UTC timestamp
  nextSpawnAt: string | null    // UTC timestamp
  isScheduled: boolean          // Has scheduled spawn
}
```

## 🎨 User Interface

### Boss List Page
```
┌───────────────────────────────────────────────────┐
│  Guild Boss Timers          [Calendar] [Refresh]  │
├───────────────────────────────────────────────────┤
│                                                   │
│  Filters: [Location ▼] [Type ▼] [Status ▼]      │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Name    │ Type │ Level │ Location │ Timer │ │ │
│  ├─────────────────────────────────────────────┤ │
│  │ Dragon  │ 🔮   │  80   │ Dragon   │ 1d 4h │ │ │
│  │ Lord    │Magic │       │ Peak     │ 22m   │ │ │
│  │         │      │       │          │ 11s   │ │ │
│  │                         [Edit] [Kill]       │ │
│  ├─────────────────────────────────────────────┤ │
│  │ Shadow  │ ⚔️   │  75   │ Dark     │🔴ALIVE │ │
│  │ Knight  │Melee │       │ Castle   │       │ │ │
│  │                         [Edit] [Kill]       │ │
│  └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

### Calendar Page
```
┌───────────────────────────────────────────────────┐
│  Boss Spawn Calendar              [← Back to List]│
├───────────────────────────────────────────────────┤
│  Legend: 🔴 Melee  🟣 Magic                       │
│                                                   │
│       January 2024                                │
│  Su  Mo  Tu  We  Th  Fr  Sa                      │
│   1   2   3   4   5   6   7                      │
│   8   9  [10] 11  12  13  14                     │
│           🔴                                      │
│        Dragon                                     │
│         Lord                                      │
│  15  16  17  18  19  20  21                      │
│       🟣                                          │
│      Ice                                          │
│     Queen                                         │
└───────────────────────────────────────────────────┘
```

## 🔐 Security

### Password Protection
```
User Action → Password Modal → Backend Validation → Action Allowed
                    ↓
            Bcrypt Hash Check
                    ↓
          Database (settings table)
```

- Password: "naiwan"
- Hashed with bcrypt (cost factor 10)
- Never exposed to frontend
- Validated on every admin action

### Other Security Measures
- HTTPS in production
- CORS restricted to frontend origin
- Helmet.js security headers
- SQL injection prevention (parameterized queries)
- Environment variables for secrets

## ⏱️ Timer Logic

### Countdown Calculation
```typescript
function calculateTimeRemaining(targetDate: string) {
  const now = Date.now()
  const target = new Date(targetDate).getTime()
  const difference = target - now
  
  if (difference <= 0) return { isAlive: true }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isAlive: false
  }
}
```

### Timer Colors
- **Green** - More than 1 hour remaining
- **Yellow** - Less than 1 hour remaining
- **Red** - Less than 10 minutes remaining
- **Red + Pulse** - Boss is ALIVE

### Update Frequency
- Timer: Updates every 1 second
- Data: Auto-refreshes from backend every 60 seconds
- Manual: Refresh button available

## 🔄 Data Flow

### Viewing Bosses
```
User → Frontend → GET /api/bosses → Backend → Database
                                         ↓
User ← Frontend ← JSON Response ← Backend ← Boss Data
         ↓
    Live Timer Starts
```

### Marking Boss as Killed
```
User → [Kill Button] → Password Modal
                           ↓
                    Enter "naiwan"
                           ↓
              POST /api/bosses/:id/kill
                           ↓
                Backend Validates Password
                           ↓
            Calculate: nextSpawn = now + respawnHours
                           ↓
                   Update Database
                           ↓
            Frontend ← Updated Boss Data
                           ↓
                 Timer Restarts
```

### Manual Time Edit
```
User → [Edit Button] → Password Modal → Edit Modal
                           ↓                ↓
                    Enter "naiwan"    Set Times
                           ↓                ↓
              POST /api/bosses/:id/update
                           ↓
                Backend Validates Password
                           ↓
                   Update Database
                           ↓
            Frontend ← Updated Boss Data
```

## 🚀 Deployment Architecture

### Production Setup
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Vercel     │ ------> │   Render     │ ------> │   Aiven      │
│  (Frontend)  │   API   │  (Backend)   │   SQL   │ (PostgreSQL) │
│              │         │              │         │              │
│ Next.js App  │         │ Express API  │         │ Boss Data    │
│ Static Files │         │ Node.js      │         │ Settings     │
└──────────────┘         └──────────────┘         └──────────────┘
      ↑
   HTTPS
      ↑
┌──────────────┐
│    Users     │
│  (Browser)   │
└──────────────┘
```

### Environment Variables

**Frontend (Vercel)**
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

**Backend (Render)**
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

## 📁 File Structure

```
finaltimer/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server
│   │   ├── db.ts              # Database connection
│   │   ├── migrate.ts         # Setup script
│   │   └── types.ts           # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Boss list
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Styles
│   │   └── calendar/
│   │       └── page.tsx       # Calendar view
│   ├── components/
│   │   ├── LiveTimer.tsx      # Countdown timer
│   │   ├── PasswordModal.tsx  # Auth modal
│   │   └── EditBossModal.tsx  # Edit form
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Helpers
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── README.md                   # Main documentation
├── QUICKSTART.md              # Setup guide
├── DEPLOYMENT.md              # Deploy guide
├── API.md                     # API docs
├── CONTRIBUTING.md            # Contribution guide
├── LICENSE                    # MIT license
└── .gitignore                 # Git ignore rules
```

## 🛠️ Technology Choices

### Why Next.js?
- Server-side rendering for better SEO
- App Router for modern routing
- Built-in optimization
- Easy Vercel deployment

### Why Express?
- Minimal and flexible
- Large ecosystem
- Easy to understand
- Perfect for REST APIs

### Why PostgreSQL?
- Reliable and mature
- ACID compliance
- Excellent for relational data
- Free tier on Aiven

### Why Tailwind CSS?
- Rapid development
- Consistent styling
- Small bundle size
- Great mobile support

### Why TypeScript?
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

## 📈 Performance Considerations

### Frontend
- Server Components for static content
- Client Components only when needed
- Optimized re-renders
- Efficient timer updates

### Backend
- Connection pooling
- Indexed database queries
- Minimal middleware
- Efficient queries

### Database
- Primary key indexes
- Timestamp indexes for sorting
- Minimal table scans
- Prepared statements

## 🔮 Future Enhancements

### Potential Features
- [ ] User authentication (multiple admins)
- [ ] Boss images/icons
- [ ] Sound alerts when boss spawns
- [ ] Push notifications
- [ ] Export/import boss data
- [ ] Boss kill history
- [ ] Statistics dashboard
- [ ] Discord webhook integration
- [ ] Multi-guild support
- [ ] Custom boss attributes
- [ ] Reminder system
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline
- [ ] Database migrations system
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] GraphQL API option
- [ ] WebSocket for real-time updates
- [ ] Docker containerization

## 📊 Metrics

### Lines of Code (Approximate)
- Backend: ~400 lines
- Frontend: ~800 lines
- Total: ~1,200 lines

### Files Created
- TypeScript: 12 files
- Configuration: 8 files
- Documentation: 7 files
- Total: 27 files

### Dependencies
- Backend: 11 packages
- Frontend: 13 packages
- Total: 24 packages

## 🎓 Learning Resources

### Technologies Used
- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [FullCalendar](https://fullcalendar.io/docs)

### Deployment Platforms
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Aiven Documentation](https://docs.aiven.io)

---

**Built with ❤️ for guild coordination**
