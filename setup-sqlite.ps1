# Setup SQLite Database for Sudaksha NWS
Write-Host "🚀 Setting up SQLite database for Sudaksha NWS..." -ForegroundColor Green

# Backup current .env file
if (Test-Path ".env") {
    Copy-Item ".env" ".env.backup" -Force
    Write-Host "✅ Backed up current .env file" -ForegroundColor Yellow
}

# Use SQLite configuration
Copy-Item ".env.sqlite" ".env" -Force
Copy-Item "prisma\schema-sqlite.prisma" "prisma\schema.prisma" -Force

Write-Host "✅ Updated configuration to use SQLite" -ForegroundColor Yellow

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

# Create database and run migrations
Write-Host "🗄️ Creating SQLite database..." -ForegroundColor Blue
npx prisma db push

# Seed the database
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Blue
npx prisma db seed

Write-Host "✅ SQLite setup completed!" -ForegroundColor Green
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart your Next.js development server" -ForegroundColor White
Write-Host "   2. Navigate to /admin/courses to see the seeded courses" -ForegroundColor White
Write-Host "   3. Try creating a new course" -ForegroundColor White
