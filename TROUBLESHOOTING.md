# Troubleshooting Guide

Common issues and solutions for Guild Boss Timer.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Database Issues](#database-issues)
- [Deployment Issues](#deployment-issues)
- [Runtime Issues](#runtime-issues)

---

## Installation Issues

### Node.js Version Error

**Problem:** `Error: The engine "node" is incompatible with this module`

**Solution:**
```bash
# Check your Node.js version
node --version

# Install Node.js 18 or higher
# Visit https://nodejs.org/
```

### npm Install Fails

**Problem:** `npm install` fails with errors

**Solution 1:** Clear npm cache
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**Solution 2:** Use different package manager
```bash
# Try yarn
npm install -g yarn
yarn install

# Or pnpm
npm install -g pnpm
pnpm install
```

### Permission Denied

**Problem:** `EACCES: permission denied`

**Solution (Linux/Mac):**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Solution (Windows):** Run terminal as Administrator

---

## Backend Issues

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution (Linux/Mac):**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)
```

**Solution (Windows):**
```powershell
# Find process
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Failed

**Problem:** `Error: connect ECONNREFUSED` or connection timeout

**Solutions:**

1. **Check DATABASE_URL format:**
```env
# Correct format
DATABASE_URL=postgresql://username:password@host:port/database

# With SSL (Aiven)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

2. **Test connection:**
```bash
# Install psql
# Then test
psql "postgresql://username:password@host:port/database"
```

3. **Check firewall:** Ensure PostgreSQL port (usually 5432) is open

4. **Verify credentials:** Double-check username, password, host, port

### Migration Fails

**Problem:** `Error: relation "bosses" already exists`

**Solution 1:** Tables already exist, skip migration

**Solution 2:** Drop tables and re-run
```sql
-- Connect to database
psql "your_connection_string"

-- Drop tables
DROP TABLE IF EXISTS bosses CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Exit and re-run migration
\q
npm run migrate
```

### TypeScript Compilation Errors

**Problem:** `TS2304: Cannot find name 'process'`

**Solution:**
```bash
# Install Node types
npm install --save-dev @types/node
```

### bcrypt Installation Issues

**Problem:** `Error: Cannot find module 'bcrypt'`

**Solution (Rebuild):**
```bash
npm rebuild bcrypt
```

**Solution (Alternative):**
```bash
# Use bcryptjs instead
npm uninstall bcrypt
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

Then update `src/index.ts` and `src/migrate.ts`:
```typescript
import bcrypt from 'bcryptjs';
```

---

## Frontend Issues

### Cannot Connect to Backend

**Problem:** Network errors, CORS errors

**Solution 1:** Check environment variable
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Solution 2:** Verify backend is running
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok",...}
```

**Solution 3:** Check CORS in backend
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Build Fails

**Problem:** `npm run build` fails

**Solution 1:** Clear cache
```bash
rm -rf .next
npm run build
```

**Solution 2:** Check TypeScript errors
```bash
npx tsc --noEmit
```

**Solution 3:** Update dependencies
```bash
npm update
```

### Page Not Found (404)

**Problem:** Calendar page shows 404

**Solution:** Ensure file exists at `app/calendar/page.tsx`

### Styles Not Loading

**Problem:** Tailwind classes don't work

**Solution 1:** Check `tailwind.config.js` content paths
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
}
```

**Solution 2:** Restart dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### FullCalendar Not Rendering

**Problem:** Calendar is blank or crashes

**Solution 1:** Check imports
```typescript
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
// etc.
```

**Solution 2:** Ensure it's a Client Component
```typescript
'use client';  // Must be at top of file
```

---

## Database Issues

### Connection Pool Exhausted

**Problem:** `Error: Connection pool exhausted`

**Solution:** Increase pool size in `backend/src/db.ts`:
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increase from default
});
```

### Slow Queries

**Problem:** Database queries are slow

**Solution 1:** Add indexes
```sql
CREATE INDEX idx_next_spawn_at ON bosses(next_spawn_at);
CREATE INDEX idx_location ON bosses(location);
CREATE INDEX idx_attack_type ON bosses(attack_type);
```

**Solution 2:** Analyze query
```sql
EXPLAIN ANALYZE SELECT * FROM bosses ORDER BY next_spawn_at;
```

### Password Hash Not Working

**Problem:** Password validation always fails

**Solution 1:** Re-run migration
```bash
cd backend
npm run migrate
```

**Solution 2:** Generate new hash
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('naiwan', 10);
console.log(hash);
// Copy hash to settings table
```

---

## Deployment Issues

### Vercel Build Fails

**Problem:** Deployment fails on Vercel

**Solution 1:** Check build logs in Vercel dashboard

**Solution 2:** Ensure environment variables are set
- `NEXT_PUBLIC_API_URL`

**Solution 3:** Test build locally
```bash
cd frontend
npm run build
```

### Render Service Won't Start

**Problem:** Render deployment crashes

**Solution 1:** Check Render logs

**Solution 2:** Verify environment variables
- `DATABASE_URL`
- `FRONTEND_URL`
- `PORT` (should be 3001 or blank)

**Solution 3:** Ensure build command is correct
```
npm install && npm run build
```

**Solution 4:** Ensure start command is correct
```
npm start
```

### Aiven Connection Issues

**Problem:** Can't connect to Aiven database

**Solution 1:** Enable public access
- Go to Aiven console
- Enable "Public Internet" access
- OR add your IP to allowlist

**Solution 2:** Use correct SSL mode
```env
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
```

**Solution 3:** Check service status
- Ensure Aiven service is running
- Check for maintenance windows

### CORS Errors in Production

**Problem:** CORS errors after deployment

**Solution:** Update backend `FRONTEND_URL`
```env
# On Render
FRONTEND_URL=https://your-app.vercel.app
```

Then update frontend `NEXT_PUBLIC_API_URL`:
```env
# On Vercel
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

Redeploy both services.

---

## Runtime Issues

### Timers Not Updating

**Problem:** Countdown timers freeze

**Solution 1:** Check browser console for errors

**Solution 2:** Verify boss has `nextSpawnAt` set
```bash
curl http://localhost:3001/api/bosses
# Check that nextSpawnAt is not null
```

**Solution 3:** Hard refresh browser
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Password Not Working

**Problem:** "Invalid password" error

**Checks:**
1. ✅ Password is "naiwan" (lowercase)
2. ✅ Migration ran successfully
3. ✅ Settings table has admin_password_hash
4. ✅ Backend is using correct bcrypt version

**Solution:** Regenerate password hash
```javascript
// Create hash_password.js
const bcrypt = require('bcrypt');
bcrypt.hash('naiwan', 10).then(hash => {
  console.log(hash);
});

// Run it
node hash_password.js

// Update database
UPDATE settings 
SET value = 'paste_hash_here' 
WHERE key = 'admin_password_hash';
```

### Boss List Empty

**Problem:** No bosses showing on frontend

**Solution 1:** Check backend response
```bash
curl http://localhost:3001/api/bosses
```

**Solution 2:** Verify migration ran
```sql
SELECT COUNT(*) FROM bosses;
-- Should return 4 (sample bosses)
```

**Solution 3:** Check browser console and network tab

### Calendar Events Not Showing

**Problem:** Calendar is empty

**Solution:** Ensure bosses have `nextSpawnAt` set
```bash
# Mark a boss as killed to set spawn time
curl -X POST http://localhost:3001/api/bosses/1/kill \
  -H "Content-Type: application/json" \
  -d '{"password":"naiwan"}'
```

### Auto-Refresh Not Working

**Problem:** Data doesn't update automatically

**Solution 1:** Check if useEffect is running
```typescript
// In app/page.tsx
useEffect(() => {
  fetchBosses();
  const interval = setInterval(fetchBosses, 60000);
  return () => clearInterval(interval);
}, [fetchBosses]);
```

**Solution 2:** Verify no JavaScript errors in console

---

## Performance Issues

### Slow Page Load

**Solutions:**
1. Enable caching in production
2. Optimize images
3. Use Next.js Image component
4. Check database query performance

### High Memory Usage

**Solutions:**
1. Reduce connection pool size
2. Clear browser cache
3. Check for memory leaks in timers
4. Ensure intervals are cleaned up

---

## Getting Help

If you're still having issues:

1. **Check Documentation:**
   - README.md
   - QUICKSTART.md
   - API.md

2. **Search Issues:**
   - GitHub Issues
   - Stack Overflow

3. **Ask for Help:**
   - Open a GitHub issue
   - Provide error messages
   - Include environment details
   - Share relevant code

4. **Debug Tools:**
   - Browser DevTools (F12)
   - Backend logs
   - Database logs
   - Network tab

---

## Common Commands Reference

### Check Status
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check if frontend is running
curl http://localhost:3000

# Check database connection
psql "your_connection_string"
```

### Restart Services
```bash
# Backend
cd backend
# Ctrl+C to stop
npm run dev

# Frontend
cd frontend
# Ctrl+C to stop
npm run dev
```

### Clean Install
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

### Reset Database
```bash
cd backend
# Drop tables in psql, then
npm run migrate
```

---

**Still stuck? Open an issue with:**
- Error message (full text)
- Steps to reproduce
- Environment (OS, Node version, etc.)
- What you've already tried
