# Database Setup Guide

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running locally or remotely.
   - **Local Installation**: Install PostgreSQL from https://www.postgresql.org/
   - **Cloud Options**: Use services like Supabase, Neon, or AWS RDS

2. **Database Connection String**: You'll need a connection URL in the format:
   ```
   postgresql://username:password@localhost:5432/database_name?schema=public
   ```

## Setup Steps

### 1. Create Environment File

Since `.env` files are blocked by globalignore, you need to set environment variables directly in your system or create the file manually:

**Option A: System Environment Variables**
```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://username:password@localhost:5432/sudaksha_nws?schema=public"
$env:OPENAI_API_KEY="your_openai_api_key_here"
```

**Option B: Create .env.local manually**
Create a file named `.env.local` in the project root with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sudaksha_nws?schema=public"
OPENAI_API_KEY="your_openai_api_key_here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. Database Setup

**Using Local PostgreSQL:**
1. Create a database named `sudaksha_nws`
2. Update the DATABASE_URL with your PostgreSQL credentials

**Using Supabase (Recommended for Development):**
1. Go to https://supabase.com
2. Create a new project
3. Get your connection string from Project Settings > Database
4. Update DATABASE_URL in your environment

### 3. Run Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### 4. Verify Setup

```bash
# Check if database connection works
npm run db:studio
```

This should open Prisma Studio in your browser, showing your database tables.

## Common Issues

### "Can't reach database server"
- Check if PostgreSQL is running
- Verify DATABASE_URL format
- Ensure database exists

### "Authentication failed"
- Check username/password in DATABASE_URL
- Ensure user has permissions on the database

### "Database does not exist"
- Create the database: `createdb sudaksha_nws`
- Or update DATABASE_URL to point to existing database

## Example DATABASE_URL Formats

**Local PostgreSQL:**
```
postgresql://postgres:mypassword@localhost:5432/sudaksha_nws?schema=public
```

**Supabase:**
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres?schema=public
```

**Neon:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

## Next Steps

After database setup:
1. Run `npm run dev` to start the development server
2. Visit `/admin` to access the admin dashboard
3. Visit `/courses` to see the course listings
4. Visit `/admin/courses/new` to create new courses
