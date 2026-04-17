# Backend startup script for Windows PowerShell

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Starting Whizz Backend Server                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running from correct directory
if (-not (Test-Path "backend\package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Write-Host "📍 Port: 5000" -ForegroundColor Cyan
Write-Host "🌐 URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Run based on NODE_ENV
$env:NODE_ENV = if ($env:NODE_ENV) { $env:NODE_ENV } else { "development" }

if ($env:NODE_ENV -eq "production") {
    npm start
} else {
    npm run dev
}
