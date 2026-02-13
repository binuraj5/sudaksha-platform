# 🚀 Sudaksha NWS - Quick Start Guide

## Prerequisites

- Node.js 18+ (check with `node --version`)
- PowerShell (Windows) or Terminal (macOS/Linux)
- PostgreSQL database (local or cloud)

## ⚡ Fast Setup (2 minutes)

### Step 1: Database Setup

**Option A: Supabase (Recommended - Free PostgreSQL)**

1. Visit [supabase.com](https://supabase.com)
2. Create free account → New project
3. Wait for setup (2-3 minutes)
4. Go to **Project Settings → Database → Connection string**
5. Copy the full connection string

**Option B: Local PostgreSQL**

1. Install PostgreSQL from [postgresql.org](https://postgresql.org)
2. Create database: `createdb sudaksha_nws`
3. Use connection string: `postgresql://postgres:yourpassword@localhost:5432/sudaksha_nws`

### Step 2: Run Setup Script

```powershell
# In PowerShell, navigate to project directory
cd C:\Users\Administrator\Documents\GitHub\SudakshaNWS

# Run the automated setup
.\setup-database.ps1
```

The script will:
- ✅ Set your DATABASE_URL
- ✅ Generate Prisma client
- ✅ Run database migrations
- ✅ Seed with sample data

### Step 3: Start Development Server

```bash
npm run dev
```

## 📱 Access Your Application

- **Homepage**: http://localhost:3000
- **Course Listings**: http://localhost:3000/courses
- **Admin Dashboard**: http://localhost:3000/admin
- **Course Creation**: http://localhost:3000/admin/courses/new
- **Prisma Studio**: `npm run db:studio`

## 🔧 Manual Setup (If Script Fails)

If the automated script doesn't work:

```powershell
# Set environment variable manually
$env:DATABASE_URL="your-postgresql-connection-string"

# Then run these commands
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## 🐛 Troubleshooting

### "PrismaClient initialization error"
- Ensure DATABASE_URL is set in your PowerShell session
- Run: `$env:DATABASE_URL="your-connection-string"`

### "Can't reach database server"
- Check if PostgreSQL is running (local setup)
- Verify connection string format
- Test with: `npm run db:studio`

### Build errors
```bash
# Clear cache and rebuild
npm run build
```

## 📚 Features Included

- ✅ **Smart Course Filtering**: 3-level hierarchical filters (IT/Non-IT → Industry → Level)
- ✅ **Dual Course Creation**: Manual forms + AI-powered generation
- ✅ **Admin Dashboard**: Metrics, course management, batch tracking
- ✅ **Database-Driven**: PostgreSQL with Prisma ORM
- ✅ **Sample Data**: Pre-loaded courses, trainers, and batches
- ✅ **Responsive Design**: Mobile-optimized interface

## 🎯 What You Can Do Now

1. **Browse Courses**: Visit `/courses` to see smart filtering in action
2. **Create Courses**: Use `/admin/courses/new` for manual or AI course creation
3. **Manage Content**: Access `/admin` for dashboard and course management
4. **Test AI Features**: Try the AI course builder with OpenAI integration

## 🔗 API Endpoints

- `GET /api/courses` - List courses with filtering
- `GET /api/finishing-school` - Finishing school programs
- `POST /api/admin/courses` - Create new courses
- AI Service: `POST http://localhost:8000/generate-course`

---

**Need help?** Check the setup logs for error messages, or refer to `DATABASE_SETUP.md` for detailed instructions.
