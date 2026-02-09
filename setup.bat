@echo off
REM Guild Boss Timer - Quick Setup Script (Windows)
REM This script automates the initial setup process

echo.
echo =======================================
echo Guild Boss Timer - Quick Setup
echo =======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Step 1: Backend Setup
echo =======================================
echo Step 1: Setting up backend...
echo =======================================
cd backend

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo ! Please edit backend\.env with your database credentials
    echo.
) else (
    echo .env file already exists
)

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install backend dependencies
    pause
    exit /b 1
)

echo Backend setup complete!
echo.

REM Step 2: Frontend Setup
echo =======================================
echo Step 2: Setting up frontend...
echo =======================================
cd ..\frontend

if not exist ".env.local" (
    echo Creating .env.local file...
    copy .env.local.example .env.local
    echo .env.local created with default values
) else (
    echo .env.local file already exists
)

echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Frontend setup complete!
echo.

REM Back to root
cd ..

REM Final instructions
echo.
echo =======================================
echo Setup Complete!
echo =======================================
echo.
echo Next steps:
echo.
echo 1. Configure your database:
echo    - Edit backend\.env
echo    - Set DATABASE_URL to your PostgreSQL connection string
echo.
echo 2. Run database migration:
echo    cd backend
echo    npm run build
echo    npm run migrate
echo.
echo 3. Start the backend:
echo    cd backend
echo    npm run dev
echo.
echo 4. Start the frontend (in new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 5. Open http://localhost:3000 in your browser
echo.
echo Default password: naiwan
echo.
echo For more help, see QUICKSTART.md
echo.
pause
