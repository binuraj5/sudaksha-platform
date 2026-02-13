# Sudaksha NWS Database Setup Script
# Run this script to set up your database environment

Write-Host "🚀 Sudaksha NWS Database Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if DATABASE_URL is already set
if ($env:DATABASE_URL) {
    Write-Host "✅ DATABASE_URL is already set: $($env:DATABASE_URL -replace ':[^:]+@', ':***@')" -ForegroundColor Green
    $continue = Read-Host "Do you want to change it? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Using existing DATABASE_URL. Proceeding with setup..." -ForegroundColor Yellow
    } else {
        $env:DATABASE_URL = $null
    }
}

# If DATABASE_URL is not set, prompt for it
if (-not $env:DATABASE_URL) {
    Write-Host ""
    Write-Host "📋 DATABASE SETUP OPTIONS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Supabase (Recommended - Free & Easy):" -ForegroundColor Green
    Write-Host "1. Go to https://supabase.com" -ForegroundColor White
    Write-Host "2. Create free account → New project" -ForegroundColor White
    Write-Host "3. Wait for project setup (2-3 minutes)" -ForegroundColor White
    Write-Host "4. Go to Project Settings → Database → Connection string" -ForegroundColor White
    Write-Host "5. Copy the full connection string" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2 - Local PostgreSQL:" -ForegroundColor Green
    Write-Host "1. Install PostgreSQL from https://postgresql.org" -ForegroundColor White
    Write-Host "2. Create database: createdb sudaksha_nws" -ForegroundColor White
    Write-Host "3. Use: postgresql://postgres:yourpassword@localhost:5432/sudaksha_nws" -ForegroundColor White
    Write-Host ""

    $dbUrl = Read-Host "Enter your PostgreSQL connection string"
    if (-not $dbUrl -or -not $dbUrl.StartsWith("postgresql://")) {
        Write-Host "❌ Invalid connection string. Must start with 'postgresql://'" -ForegroundColor Red
        exit 1
    }

    $env:DATABASE_URL = $dbUrl
    Write-Host "✅ DATABASE_URL set successfully" -ForegroundColor Green
}

# Test the connection and run setup
Write-Host ""
Write-Host "🔧 Running database setup..." -ForegroundColor Yellow

try {
    Write-Host "1. Generating Prisma client..." -ForegroundColor White
    & npm run db:generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }

    Write-Host "2. Running migrations..." -ForegroundColor White
    & npm run db:migrate
    if ($LASTEXITCODE -ne 0) { throw "Migration failed" }

    Write-Host "3. Seeding database..." -ForegroundColor White
    & npm run db:seed
    if ($LASTEXITCODE -ne 0) { throw "Seeding failed" }

    Write-Host ""
    Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 You can now run:" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 Visit:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3000 - Homepage" -ForegroundColor White
    Write-Host "   http://localhost:3000/courses - Course listings" -ForegroundColor White
    Write-Host "   http://localhost:3000/admin - Admin dashboard" -ForegroundColor White
    Write-Host "   http://localhost:3000/admin/courses/new - Course creation" -ForegroundColor White

} catch {
    Write-Host ""
    Write-Host "❌ Database setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check your DATABASE_URL is correct" -ForegroundColor White
    Write-Host "2. Ensure PostgreSQL is running (if using local)" -ForegroundColor White
    Write-Host "3. Verify database permissions" -ForegroundColor White
    Write-Host "4. Check network connectivity (if using cloud DB)" -ForegroundColor White
    exit 1
}

# Reminder about environment variables
Write-Host ""
Write-Host "⚠️  REMEMBER:" -ForegroundColor Yellow
Write-Host "Environment variables are session-specific." -ForegroundColor White
Write-Host "If you open a new PowerShell window, run:" -ForegroundColor White
Write-Host '$env:DATABASE_URL="' + $env:DATABASE_URL + '"' -ForegroundColor Cyan
