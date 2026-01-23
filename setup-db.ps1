# Quick Database Setup Script for Windows
# This script pushes the database schema to PostgreSQL

Write-Host "🔍 Checking database connection..." -ForegroundColor Cyan

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "⚠️  DATABASE_URL not set in environment. Using default..." -ForegroundColor Yellow
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/petchip"
}

Write-Host "📦 Current DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Green

Write-Host "`n🚀 Pushing database schema..." -ForegroundColor Cyan
Set-Location -Path "packages\db"
bun run db:push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Database schema pushed successfully!" -ForegroundColor Green
    Write-Host "`nTo verify, you can:" -ForegroundColor Cyan
    Write-Host "  1. Run: bun run --filter=@repo/db db:studio" -ForegroundColor White
    Write-Host "  2. Or use a PostgreSQL client to connect" -ForegroundColor White
} else {
    Write-Host "`n❌ Failed to push database schema" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL is running (port 5432)" -ForegroundColor White
    Write-Host "  2. Database 'petchip' exists" -ForegroundColor White
    Write-Host "  3. Credentials are correct in .env" -ForegroundColor White
}
