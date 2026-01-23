# Database Setup Guide

## The Issue
Your database tables haven't been created yet. When you tried to login/register, the API couldn't find the `users` table.

## Quick Fix

### Option 1: Using the PowerShell Script (Recommended)
```powershell
cd d:\UNV\pet-chip
.\setup-db.ps1
```

### Option 2: Manual Steps

1. **Ensure PostgreSQL is running** on port 5432
   - If using Docker Desktop, start it first
   - Or if you have PostgreSQL installed locally, make sure it's running

2. **Create the database** (if it doesn't exist):
   ```powershell
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE petchip;
   \q
   ```

3. **Create .env file** (if you haven't):
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Push the schema**:
   ```powershell
   cd d:\UNV\pet-chip
   bun run --filter=@repo/db db:push
   ```

### Option 3: Using Docker (If Available)

If you have Docker installed:

1. Start Docker Desktop

2. Run:
   ```powershell
   cd d:\UNV\pet-chip
   docker compose up -d
   ```

3. Then push schema:
   ```powershell
   bun run --filter=@repo/db db:push
   ```

## Common Issues

### "connection refused"
- PostgreSQL isn't running
- Wrong port (should be 5432)

### "authentication failed"  
- Wrong credentials in .env
- Database user doesn't exist

### "database does not exist"
- Need to create the `petchip` database first
- Run: `CREATE DATABASE petchip;` in psql

## Verify It Worked

After pushing the schema, you can verify:

```powershell
# Open Drizzle Studio to view tables
bun run --filter=@repo/db db:studio
```

Then navigate to http://localhost:4983 to see your tables in a nice UI.

## What Gets Created

The schema push creates these tables:
- `users` - User accounts
- `administrative_areas` - Regions/districts
- `holdings` - Farms and households
- `animals` - Animal registry
- `chips` - Microchip tracking
- `vaccinations` - Vaccination records
- `animal_movements` - Transfer tracking
- `animal_health_records` - Health records
- `ownership_history` - Ownership audit trail
- `alerts` - Lost/found alerts

## Next Steps

Once the database is set up:
1. Restart your dev server: `npm run dev`
2. Try registering a user via the API
3. Check the swagger docs: http://localhost:3002/swagger
