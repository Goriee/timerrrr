# Quick Start - MySQL Migration Complete ✅

## What Changed

Your Guild Boss Timer backend has been successfully converted from PostgreSQL to MySQL to work with your Aiven MySQL database.

## Files Modified

### Backend Changes
1. **package.json** - Changed from `pg` to `mysql2`
2. **src/db.ts** - Rewrote connection to use MySQL with SSL support
3. **src/migrate.ts** - Converted SQL schema to MySQL syntax
4. **src/index.ts** - Updated all API routes to use MySQL query syntax
5. **.env.example** - Updated with your MySQL credentials

### Documentation Added
1. **SSL_SETUP.md** - Complete SSL certificate configuration guide
2. **DEPLOYMENT.md** - New deployment guide for Render + MySQL
3. **README.md** - Updated to reflect MySQL instead of PostgreSQL

## Your Database Configuration

```env
DB_HOST=mysql-example.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=admin_password
DB_NAME=defaultdb
```

## Next Steps

### 1. Get SSL Certificate from Aiven

**This is REQUIRED - your connection will fail without it!**

1. Log in to https://console.aiven.io
2. Go to your MySQL service
3. Click "Download CA cert" in the Connection Information section
4. Save the file

### 2. Local Testing

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your SSL certificate
# Option 1: Paste certificate content
DB_CA_CERT="-----BEGIN CERTIFICATE-----
[paste certificate here]
-----END CERTIFICATE-----"

# Option 2: Use file path
DB_CA_CERT_PATH=./ca-certificate.crt

# Run migration
npm run build
npm run migrate

# Start server
npm run dev
```

### 3. Deploy to Render

Follow the detailed steps in [DEPLOYMENT.md](DEPLOYMENT.md), but here's the quick version:

**A. Create Web Service on Render**
- Connect your GitHub repo
- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`

**B. Add Environment Variables in Render**

Go to Environment tab and add:

```
DB_HOST=mysql-example.aivencloud.com
DB_PORT=18081
DB_USER=avnadmin
DB_PASSWORD=admin_password
DB_NAME=defaultdb
DB_CA_CERT=[paste full certificate here]
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**C. Deploy**
- Click "Create Web Service"
- Wait for deployment
- Go to Shell tab and run: `npm run migrate`

### 4. Deploy Frontend to Vercel

```bash
cd frontend
npm install
```

Then deploy via Vercel dashboard:
- Import from GitHub
- Root directory: `frontend`
- Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`

## Key Changes in MySQL vs PostgreSQL

### Query Syntax
- ❌ PostgreSQL: `$1, $2, $3` placeholders
- ✅ MySQL: `?` placeholders

### Result Format
- ❌ PostgreSQL: `result.rows`
- ✅ MySQL: `const [rows] = await query()`

### Data Types
- ❌ PostgreSQL: `SERIAL`, `TIMESTAMP WITH TIME ZONE`
- ✅ MySQL: `AUTO_INCREMENT`, `DATETIME`

### Reserved Words
- ❌ PostgreSQL: `key` (allowed)
- ✅ MySQL: `` `key` `` (must use backticks)

## Testing Checklist

After deployment, verify:

- [ ] Health check: `https://your-api.onrender.com/health`
- [ ] Database connected (check Render logs)
- [ ] Frontend loads boss list
- [ ] Can edit boss with password "naiwan"
- [ ] Live timers count down
- [ ] Calendar view works
- [ ] Mark boss as killed works

## Troubleshooting

### "Cannot connect to database"
→ Check SSL certificate is properly set in `DB_CA_CERT`

### "SSL connection error"
→ Download fresh CA cert from Aiven and paste full content

### "Access denied for user"
→ Double-check DB_USER and DB_PASSWORD match Aiven

### CORS errors
→ Set `FRONTEND_URL` in Render to match your Vercel URL

## Getting Help

1. Check [SSL_SETUP.md](backend/SSL_SETUP.md) for certificate issues
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment guide
3. Check Render logs for backend errors
4. Check browser console for frontend errors

## Database Schema

Your database will have these tables after migration:

**bosses** - Stores boss information and respawn times
- `id`, `name`, `attack_type`, `level`, `respawn_hours`
- `location`, `last_kill_at`, `next_spawn_at`, `is_scheduled`

**settings** - Stores configuration (like admin password)
- `id`, `key`, `value`

**Default password**: naiwan (change this in production!)

## Summary

✅ Backend converted to MySQL
✅ SSL support added for Aiven
✅ All queries updated to MySQL syntax
✅ Documentation updated
✅ Ready to deploy to Render

**Your database credentials are already configured in the examples - just add your SSL certificate and you're good to go!**
