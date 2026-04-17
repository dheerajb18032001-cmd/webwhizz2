@echo off
REM Backend startup script for Windows CMD/Batch

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════╗
echo ║   Starting Whizz Backend Server                ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Check if running from correct directory
if not exist "backend\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo ✅ Node.js %NODE_VER% detected

echo.
echo 📦 Installing dependencies...
cd backend
call npm install

if errorlevel 1 (
    echo ❌ Installation failed
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo Starting backend server...
echo 📍 Port: 5000
echo 🌐 URL: http://localhost:5000
echo.

REM Run backend
if "%NODE_ENV%"=="production" (
    call npm start
) else (
    call npm run dev
)

pause
