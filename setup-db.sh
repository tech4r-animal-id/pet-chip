#!/usr/bin/env bash



echo "🔍 Checking database connection..."


if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Using default..."
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/petchip"
fi

echo "📦 Installing dependencies..."
bun install

echo "🚀 Pushing database schema..."
cd packages/db
bun run db:push

echo "✅ Database schema pushed successfully!"
echo ""
echo "To verify, you can:"
echo "  1. Run: bun run --filter=@repo/db db:studio"
echo "  2. Or connect with psql: psql $DATABASE_URL"