# Deployment Guide - Render + Vercel + Aiven MySQL

Complete deployment guide for the Guild Boss Timer application.

## 🎯 Architecture Overview

- **Frontend**: Next.js app on Vercel
- **Backend**: Node.js Express API on Render
- **Database**: MySQL on Aiven

## 📋 Prerequisites

Before deploying, ensure you have:
- GitHub account
- Vercel account (free tier)
- Render account (free tier)
- Aiven account with MySQL service created
- Git repository with your code

## 🗄️ Step 1: Set Up Aiven MySQL Database

### 1.1 Create MySQL Service

1. Log in to [Aiven Console](https://console.aiven.io)
2. Click "Create Service"
3. Select **MySQL**
4. Choose your cloud provider and region
5. Select plan (Startup-4 or higher recommended)
6. Name your service (e.g., "guild-boss-timer-db")
7. Click "Create service"
8. Wait 5-10 minutes for provisioning

### 1.2 Get Connection Details

Once your service is running:

1. Go to your MySQL service overview
2. Note these connection details:
   - **Host**: e.g., `mysql-3bc5f3b2-gbox-098a.d.aivencloud.com`
   - **Port**: e.g., `18081`
   - **User**: `avnadmin`
   - **Password**: (shown in console)
   - **Database**: `defaultdb`

### 1.3 Download CA Certificate

1. In your MySQL service overview
2. Scroll to "Connection information"
3. Click **"Download CA cert"**
4. Save the file - you'll need its contents

**IMPORTANT**: The CA certificate content will be used in your environment variables.

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Prepare Your Repository

Ensure your `backend/` folder is in your Git repository and pushed to GitHub.

### 2.2 Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - **Name**: `guild-boss-timer-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

   **Plan:**
   - Select **Free** tier (or paid if needed)

### 2.3 Configure Environment Variables

Click on **"Environment"** tab and add these variables:

```
DB_HOST=mysql-example.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=admin_password
DB_NAME=defaultdb
NODE_ENV=production
PORT=3001
```

**For DB_CA_CERT (SSL Certificate):**

1. Open the CA certificate file you downloaded from Aiven
2. Copy the **entire contents** including:
   ```
   -----BEGIN CERTIFICATE-----
   MIIEQTCCAqmgAwIBAgIUZPz8...
   [all lines of the certificate]
   ...
   -----END CERTIFICATE-----
   ```
3. Add a new environment variable:
   - **Key**: `DB_CA_CERT`
   - **Value**: Paste the entire certificate content

**Important Notes:**
- Make sure to include the BEGIN and END lines
- The certificate may span multiple lines - that's OK
- Don't add extra quotes or escape characters

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for the build to complete (5-10 minutes)
4. Once deployed, note your backend URL (e.g., `https://guild-boss-timer-api.onrender.com`)

### 2.5 Run Database Migration

After the first successful deployment:

1. Go to your service in Render
2. Click on **"Shell"** tab
3. Run the migration:
   ```bash
   npm run migrate
   ```
4. You should see "Migration completed successfully"

**Alternative**: Add migration to build command (not recommended for production):
```
npm install && npm run build && npm run migrate
```

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend

Ensure your `frontend/` folder has `.env.local.example`:

```env
NEXT_PUBLIC_API_URL=https://guild-boss-timer-api.onrender.com
```

### 3.2 Deploy to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:

   **Framework Preset**: Next.js
   
   **Root Directory**: `frontend`
   
   **Build Settings** (auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3.3 Configure Environment Variables

Add environment variable:
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: Your Render backend URL (e.g., `https://guild-boss-timer-api.onrender.com`)

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at `https://your-project.vercel.app`

## 🔗 Step 4: Connect Frontend and Backend

### 4.1 Update Backend CORS

1. Go to Render dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Add/update environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your Vercel URL (e.g., `https://your-project.vercel.app`)
5. Save changes - this will redeploy

### 4.2 Test the Connection

1. Visit your Vercel frontend URL
2. You should see the boss list
3. Try editing a boss (password: **naiwan**)
4. Check if timers update in real-time

## ✅ Step 5: Verify Everything Works

### Health Check

Visit: `https://your-backend.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Database Connection

Check Render logs:
1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"**
4. Look for: `"Database connected successfully"`

### Frontend Functionality

Test these features:
- ✅ Boss list displays
- ✅ Live countdown timers work
- ✅ Calendar view loads
- ✅ Can click "Edit" (password modal appears)
- ✅ Can update boss with password "naiwan"
- ✅ Can mark boss as killed

## 🐛 Troubleshooting

### Backend won't start

**Error**: "Cannot connect to database"

**Solutions**:
1. Verify all `DB_*` environment variables are correct
2. Check that `DB_CA_CERT` includes the full certificate
3. Ensure Aiven MySQL service is running
4. Check Aiven firewall allows connections

**Error**: "Module not found"

**Solutions**:
1. Ensure `package.json` is in backend folder
2. Check build command includes `npm install`
3. Clear Render cache and redeploy

### Frontend can't reach backend

**Error**: "Network Error" or CORS errors

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render URL
2. Check `FRONTEND_URL` in Render matches your Vercel URL
3. Ensure both URLs use HTTPS (not HTTP)
4. Check Render service is running

### Migration fails

**Error**: "Table already exists"

This is OK if you've run migration before. Otherwise:

**Solutions**:
1. Connect to Aiven MySQL using TablePlus/MySQL Workbench
2. Drop existing tables if needed
3. Re-run migration

### SSL Certificate issues

**Error**: "SSL connection error"

**Solutions**:
1. Re-download CA cert from Aiven
2. Copy entire certificate including BEGIN/END lines
3. Paste into Render environment variable without extra formatting
4. Redeploy

## 🔒 Security Checklist

Before going live:

- [ ] Changed admin password from "naiwan"
- [ ] All environment variables use production values
- [ ] SSL certificate is properly configured
- [ ] CORS restricted to your frontend domain only
- [ ] Database credentials are secure
- [ ] No sensitive data in Git repository
- [ ] `.env` files are in `.gitignore`

## 📊 Monitoring

### Render
- Check logs regularly for errors
- Monitor response times
- Set up health check alerts

### Vercel
- Check deployment logs
- Monitor function usage
- Review analytics

### Aiven
- Monitor database metrics
- Check connection count
- Review query performance
- Set up backup schedule

## 💰 Cost Estimate

### Free Tier (Development/Testing)
- **Vercel**: Free (100GB bandwidth)
- **Render**: Free (750 hours/month, sleeps after 15min inactivity)
- **Aiven**: Free trial or $10-40/month depending on plan

### Recommended for Production
- **Vercel**: Free (sufficient for small apps)
- **Render**: $7/month (Starter, no sleep)
- **Aiven**: $40/month (Startup-4, recommended)

**Total**: ~$47/month for always-on production setup

## 🔄 Updating the Application

### Update Backend
1. Push changes to GitHub
2. Render auto-deploys from main branch
3. Monitor logs for successful deployment

### Update Frontend
1. Push changes to GitHub
2. Vercel auto-deploys
3. Check deployment status in Vercel dashboard

### Database Changes
1. Create new migration script
2. Run via Render Shell or include in build
3. Test on staging environment first

## 📝 Custom Domain Setup

### Vercel (Frontend)
1. Go to project settings
2. Click "Domains"
3. Add your domain (e.g., `bosses.yourdomain.com`)
4. Update DNS records as instructed
5. SSL auto-configured by Vercel

### Render (Backend)
1. Go to service settings
2. Click "Custom Domains"
3. Add domain (e.g., `api.yourdomain.com`)
4. Update DNS with provided CNAME
5. SSL auto-configured by Render

Don't forget to update:
- `NEXT_PUBLIC_API_URL` in Vercel
- `FRONTEND_URL` in Render

## 🎉 You're Done!

Your Guild Boss Timer is now live! Share the URL with your guild.

**Need help?** Check the main README or create an issue in your repository.
