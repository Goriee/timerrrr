# Guild Boss Timer & Discord Bot# Guild Boss Timer



A full-stack application and Discord bot for tracking guild boss respawn timers with live countdowns, manual time editing, calendar visualization, and Discord integration.A full-stack application for tracking guild boss respawn timers with live countdowns, manual time editing, and calendar visualization.



## 🚀 Features## 🎮 Features



### Website- **Live Countdown Timers** - Real-time countdown to next boss spawn

- **Live Countdowns**: Real-time timers for next boss spawns.- **Manual Time Editing** - Password-protected admin controls

- **Calendar View**: Monthly/weekly visualization of upcoming spawns.- **Calendar View** - Monthly/weekly visualization using FullCalendar

- **Admin Controls**: Password-protected actions to mark kills or edit times.- **Boss Management** - Track multiple bosses with different respawn times

- **Persistent Login**: Browser-based session persistence.- **Attack Type Filtering** - Filter by melee/magic attack types

- **Auto-Calc**: Bidirectional time calculation (Input Spawn Time -> Auto-calc Time Remaining).- **Location Filtering** - Filter bosses by location

- **Responsive Design** - Mobile-friendly interface

### Discord Bot- **Auto-Refresh** - Automatic sync every minute

- **!bosslist**: Displays a live-updated list of all bosses and their status/timers with relative time (e.g., "45m").- **Visual Alerts** - Color-coded timers (red < 10min, yellow < 1hr)

- **!kill [BossName]**: Marks a boss as killed and auto-schedules the next spawn using Discord timestamps.

- **Timezone Sync**: All times are synced uniformly across Website and Discord (UTC backend).## 🏗️ Tech Stack



## 🛠️ Tech Stack### Frontend

- **Next.js 14** with TypeScript

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, FullCalendar- **App Router** for routing

- **Backend API**: Node.js, Express, MySQL (Aiven)- **Tailwind CSS** for styling

- **Discord Bot**: discord.js v14, Node.js- **FullCalendar** for calendar view

- **Services**: Render (Backend & Bot hosting), Vercel (Frontend hosting), UptimeRobot (Keep-alive)- **Axios** for API calls



## 📂 Project Structure### Backend

- **Node.js** with TypeScript

```bash- **Express** web framework

finaltimer/- **MySQL** (Aiven Database)

├── backend/          # Express API Server- **bcrypt** for password hashing

│   └── src/index.ts

├── frontend/         # Next.js Web App## 📁 Project Structure

│   └── app/page.tsx

└── discord-bot/      # Discord Bot Service```

    ├── src/index.tsfinaltimer/

    └── src/commands.ts├── backend/

```│   ├── src/

│   │   ├── index.ts       # Main server file

## ⚡ Quick Start│   │   ├── db.ts          # Database connection

│   │   ├── migrate.ts     # Database migration

### 1. Database Setup│   │   └── types.ts       # TypeScript types

Create a MySQL database (e.g., Aiven or local) and ensure the `bosses` table is created.│   ├── package.json

│   ├── tsconfig.json

### 2. Environment Variables│   └── .env.example

Create `.env` files in each service directory:│

└── frontend/

**backend/.env** & **discord-bot/.env**    ├── app/

```env    │   ├── page.tsx           # Home page (boss list)

DB_HOST=your-db-host    │   ├── layout.tsx         # Root layout

DB_USER=your-db-user    │   ├── globals.css        # Global styles

DB_PASSWORD=your-db-pass    │   └── calendar/

DB_NAME=defaultdb    │       └── page.tsx       # Calendar view

DB_PORT=3306    ├── components/

# Only for Backend    │   ├── LiveTimer.tsx      # Live countdown component

PORT=3001    │   ├── PasswordModal.tsx  # Password authentication

# Only for Discord Bot    │   └── EditBossModal.tsx  # Boss editing modal

DISCORD_BOT_TOKEN=your-token    ├── lib/

```    │   ├── api.ts             # API client

    │   └── utils.ts           # Utility functions

### 3. Run Locally    ├── types/

    │   └── index.ts           # TypeScript types

**Backend:**    ├── package.json

```bash    ├── tsconfig.json

cd backend    ├── tailwind.config.js

npm install    └── next.config.js

npm run dev```

```

## 🚀 Local Development Setup

**Discord Bot:**

```bash### Prerequisites

cd discord-bot- Node.js 18+ 

npm install- MySQL database (Aiven)

npm run dev- npm or yarn

```

### Backend Setup

**Frontend:**

```bash1. Navigate to backend folder:

cd frontend```bash

npm installcd backend

npm run dev```

```

2. Install dependencies:

## 🤖 Discord Commands```bash

npm install

| Command | Description |```

|---|---|

| `!bosslist` | Shows status of all bosses with relative time remaining. |3. Create `.env` file:

| `!kill [name]` | Marks a boss as killed. Ex: `!kill Viorent`. Case-insensitive. |```bash

cp .env.example .env

## ☁️ Deployment```



- **Backend & Bot**: Deploy as Web Services on Render.4. Update `.env` with your Aiven MySQL credentials:

  - The Project is configured to use UTC (`timezone: 'Z'`) for database connections to ensure consistency.```env

  - The Bot includes a small Express server on port 3000 (or `PORT`) exposing `/health` so it can be hosted as a Web Service.# Server Configuration

- **Frontend**: Deploy to Vercel/Netlify.PORT=3001

  - Configure `NEXT_PUBLIC_API_URL` environment variable if needed (or check `lib/api.ts` for configuration).NODE_ENV=production



## 🛡️ License# Database Configuration (MySQL on Aiven)

DB_HOST=mysql-example.aivencloud.com

This project is open source.DB_PORT=12345

DB_USER=avnadmin
DB_PASSWORD=admin_password
DB_NAME=defaultdb

# SSL Certificate (REQUIRED - see SSL_SETUP.md)
DB_CA_CERT="-----BEGIN CERTIFICATE-----
[your certificate from Aiven]
-----END CERTIFICATE-----"

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Important:** See [SSL_SETUP.md](backend/SSL_SETUP.md) for detailed instructions on obtaining and configuring your SSL certificate.

5. Run database migration:
```bash
npm run build
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🗄️ Database Schema

### Bosses Table
```sql
CREATE TABLE bosses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  attack_type VARCHAR(50) NOT NULL,
  level INT NOT NULL,
  respawn_hours INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  last_kill_at DATETIME,
  next_spawn_at DATETIME,
  is_scheduled BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔐 Authentication

Default admin password: **naiwan**

The password is hashed using bcrypt and stored in the settings table. To change the password, update the hash in the database or modify the migration script.

## 📡 API Endpoints

### GET `/api/bosses`
Returns all bosses

### GET `/api/bosses/:id`
Returns a single boss

### POST `/api/auth/check`
Validates admin password
```json
{
  "password": "naiwan"
}
```

### POST `/api/bosses/:id/update`
Updates boss times (requires password)
```json
{
  "password": "naiwan",
  "updates": {
    "lastKillAt": "2024-01-01T00:00:00Z",
    "nextSpawnAt": "2024-01-01T12:00:00Z",
    "respawnHours": 12
  }
}
```

### POST `/api/bosses/:id/kill`
Marks boss as killed and auto-calculates next spawn (requires password)
```json
{
  "password": "naiwan"
}
```

## 🌐 Deployment

### Backend Deployment (Render)

1. Create account on [Render](https://render.com)

2. Create new Web Service

3. Connect your GitHub repository

4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     DATABASE_URL=your_aiven_database_url
     FRONTEND_URL=https://your-vercel-app.vercel.app
     NODE_ENV=production
     ```

5. Deploy!

### Frontend Deployment (Vercel)

1. Create account on [Vercel](https://vercel.com)

2. Import your GitHub repository

3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** frontend
   - **Environment Variables:**
     ```
     NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
     ```

4. Deploy!

### Database Setup (Aiven)

1. Create account on [Aiven](https://aiven.io)

2. Create PostgreSQL service

3. Get connection URL from Aiven dashboard

4. Update backend `.env` with Aiven DATABASE_URL

5. Run migration on production database

## 🎨 Features Walkthrough

### Boss List View
- See all bosses with live countdowns
- Filter by location, attack type, or status
- Edit button opens password modal
- Kill button marks boss as killed and auto-calculates next spawn

### Calendar View
- Monthly/weekly/daily views
- Color-coded by attack type (red=melee, purple=magic)
- Click event to edit boss times

### Timer Behavior
- Updates every second
- Green: > 1 hour remaining
- Yellow: < 1 hour remaining
- Red: < 10 minutes remaining
- "ALIVE" status when timer reaches zero

### Manual Editing
1. Click "Edit" button
2. Enter password (naiwan)
3. Modify times or respawn hours
4. Click "Auto" to calculate next spawn from last kill
5. Save changes

## 🔧 Development Notes

- Backend runs on port 3001
- Frontend runs on port 3000
- All times stored in UTC
- Client-side times converted to local timezone
- Auto-refresh every 60 seconds
- Password is "naiwan" (hashed with bcrypt)

## 📝 License

MIT

## 👥 Contributing

Pull requests are welcome!

---

**Happy Boss Hunting! 🗡️**
