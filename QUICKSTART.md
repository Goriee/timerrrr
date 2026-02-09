# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Setup Database

You need a PostgreSQL database. Choose one:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database: guild_boss_timer
createdb guild_boss_timer
```

**Option B: Aiven (Free Tier)**
1. Sign up at https://aiven.io
2. Create PostgreSQL service
3. Copy connection string

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/guild_boss_timer
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run Database Migration

```bash
cd backend
npm run build
npm run migrate
```

You should see:
```
✓ Bosses table created
✓ Settings table created
✓ Admin password set (naiwan)
✓ Sample bosses inserted
Migration completed successfully!
```

### 5. Start Backend

```bash
cd backend
npm run dev
```

Backend running at http://localhost:3001

### 6. Configure Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend running at http://localhost:3000

### 8. Open in Browser

Visit http://localhost:3000

**Default Password:** `naiwan`

## 🎮 Usage

### View Bosses
- Home page shows all bosses with live timers
- Filter by location, type, or status
- Auto-refreshes every minute

### Mark Boss as Killed
1. Click "Kill" button
2. Enter password: `naiwan`
3. Next spawn is auto-calculated

### Edit Boss Times
1. Click "Edit" button
2. Enter password: `naiwan`
3. Modify last kill or next spawn time
4. Click "Auto" to calculate from last kill
5. Save changes

### Calendar View
1. Click "📅 Calendar View"
2. See all spawns on calendar
3. Click event to edit

## 📦 Sample Data

The migration includes 4 sample bosses:

1. **Dragon Lord** - Level 80, Magic, 24h respawn
2. **Shadow Knight** - Level 75, Melee, 12h respawn
3. **Ice Queen** - Level 85, Magic, 48h respawn
4. **Thunder Beast** - Level 70, Melee, 6h respawn

## 🔧 Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure port 3001 is available

### Frontend can't connect
- Check backend is running on port 3001
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check browser console for errors

### Migration fails
- Ensure database exists
- Check connection string format
- Verify PostgreSQL version (9.6+)

### Password doesn't work
- Default password is `naiwan` (lowercase)
- Check backend logs for errors
- Verify migration ran successfully

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm run dev      # Start dev server with hot reload
npm run build    # Build TypeScript
npm start        # Run production build
npm run migrate  # Run database migration
```

### Frontend
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

## 📝 Next Steps

1. **Change Password** - Update hash in settings table
2. **Add More Bosses** - Insert into database
3. **Customize Styling** - Edit Tailwind classes
4. **Deploy** - Follow DEPLOYMENT.md guide

## 🔗 Useful Links

- Full Documentation: README.md
- Deployment Guide: DEPLOYMENT.md
- API Documentation: See README.md API section

---

**Need help? Check the README.md or open an issue!**
