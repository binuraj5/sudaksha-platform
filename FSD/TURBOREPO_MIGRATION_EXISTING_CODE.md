# TURBOREPO MIGRATION - EXISTING CODEBASE
## Move Existing Website & Portal to Turborepo (3 Days)

**Current State:** You already have website and portal code  
**Goal:** Organize into Turborepo structure  
**Time:** 3 days (not 7!)

---

## 🎯 WHAT WE'RE DOING

**Simple:** Copy existing code into Turborepo structure, update imports, done!

```
CURRENT:
your-project/
├── app/
│   ├── (Core)/         → Website pages
│   ├── assessments/         → Portal pages
│   ├── admin/               → Portal admin
│   └── api/                 → Portal API

NEW:
sudaksha-platform/
├── apps/
│   ├── website/             → Move (Core) pages here (Independent DB/Auth)
│   └── portal/              → Move assessments/* + admin/* here (SSO + Dedicated DB)
└── packages/
    ├── db-core/             → Extract Prisma for Identity/SSO
    ├── db-assessments/      → Prisma for Assessment logic
    ├── types/               → Extract types
    ├── sso-auth/            → Extract portal SSO auth
    └── ui/                  → Extract components
```

---

## 📋 PRE-MIGRATION CHECKLIST

Before starting:
- [ ] **Backup your code** (zip current project)
- [ ] **Commit to git** (so you can rollback)
- [ ] **Note environment variables** (you'll need them)
- [ ] **Identify what goes where:**
  - Core pages → Website app
  - Assessment/admin pages → Portal app
  - Shared code → Packages

---

## 🚀 DAY 1: SETUP TURBOREPO & COPY CODE

### **AntiGravity Prompt - Day 1:**

```
[DAY 1 - SETUP & COPY EXISTING CODE]

CONTEXT: We have an EXISTING Next.js app with website and portal mixed together.
We need to separate them into Turborepo structure.

OBJECTIVE: Create Turborepo structure and copy existing code into appropriate locations.

STEP 1: CREATE TURBOREPO (Outside Current Project)
────────────────────────────────────────────────────

# Go to parent directory
cd ..

# Create new Turborepo
npx create-turbo@latest sudaksha-platform

When prompted:
? Package manager: pnpm
? Include example apps: No

cd sudaksha-platform

STEP 2: CLEAN UP AND CREATE STRUCTURE
────────────────────────────────────────────────────

# Remove any example apps
rm -rf apps/*

# Create our app directories
mkdir -p apps/website
mkdir -p apps/portal

# Create package directories
mkdir -p packages/db-core
mkdir -p packages/db-assessments
mkdir -p packages/types
mkdir -p packages/sso-auth
# packages/ui already exists from template

STEP 3: COPY EXISTING CODE TO PORTAL
────────────────────────────────────────────────────

IMPORTANT: Copy from your CURRENT project to apps/portal/

# Copy these directories/files from your current project:
# [Replace /path/to/current/project with your actual path]

# 1. Copy the entire app directory
cp -r /path/to/current/project/app apps/portal/

# 2. Copy public assets
cp -r /path/to/current/project/public apps/portal/

# 3. Copy components
cp -r /path/to/current/project/components apps/portal/

# 4. Copy lib directory
cp -r /path/to/current/project/lib apps/portal/

# 5. Copy config files
cp /path/to/current/project/next.config.js apps/portal/
cp /path/to/current/project/tailwind.config.ts apps/portal/
cp /path/to/current/project/tsconfig.json apps/portal/
cp /path/to/current/project/postcss.config.js apps/portal/

# 6. Copy styles
cp -r /path/to/current/project/styles apps/portal/ 2>/dev/null || true
cp /path/to/current/project/globals.css apps/portal/app/ 2>/dev/null || true

# 7. Copy any other directories (middleware, utils, etc.)
cp /path/to/current/project/middleware.ts apps/portal/ 2>/dev/null || true

STEP 4: IDENTIFY MARKETING PAGES (For Website)
────────────────────────────────────────────────────

Look at apps/portal/app/ and identify Core pages:

Common patterns:
- app/page.tsx (homepage)
- app/(Core)/* (Core layout group)
- app/about/*
- app/features/*
- app/pricing/*
- app/contact/*
- app/blog/*

List all directories that are PUBLIC MARKETING pages (not authenticated).

STEP 5: MOVE MARKETING PAGES TO WEBSITE
────────────────────────────────────────────────────

# Initialize website app
cd apps/website
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
cd ../..

# Now move Core pages from portal to website:

# If you have (Core) route group:
mv apps/portal/app/\(Core\)/* apps/website/app/

# Or if Core pages are at root:
# Move each Core page individually:
mv apps/portal/app/page.tsx apps/website/app/ 2>/dev/null || true
mv apps/portal/app/about apps/website/app/ 2>/dev/null || true
mv apps/portal/app/features apps/website/app/ 2>/dev/null || true
mv apps/portal/app/pricing apps/website/app/ 2>/dev/null || true
mv apps/portal/app/contact apps/website/app/ 2>/dev/null || true

# Copy public assets needed by website
cp -r apps/portal/public/images apps/website/public/ 2>/dev/null || true
cp -r apps/portal/public/logos apps/website/public/ 2>/dev/null || true

STEP 6: WHAT SHOULD REMAIN IN PORTAL
────────────────────────────────────────────────────

After moving Core pages, apps/portal/app/ should contain:

✓ (auth)/ - Login, Register pages
✓ admin/ - Super Admin dashboard
✓ assessments/ or clients/ or org/ - Tenant workspaces
✓ my/ - Personal workspace
✓ api/ - All API routes
✓ take/ - Assessment taking
✓ survey/ - Survey taking

If you see any Core-related pages still in portal, move them to website.

STEP 7: VERIFY STRUCTURE
────────────────────────────────────────────────────

Check structure:

apps/website/app/
├── page.tsx                  # Homepage
├── about/
├── pricing/
├── features/
└── layout.tsx

apps/portal/app/
├── (auth)/
│   ├── login/
│   └── register/
├── admin/
├── org/ (or clients/ or assessments/)
├── my/
├── api/
└── layout.tsx

SUCCESS CRITERIA:
✓ Turborepo created
✓ Existing code copied to apps/portal/
✓ Core pages identified
✓ Core pages moved to apps/website/
✓ Portal contains only app/auth logic

Report completion and list which pages went to website vs portal.
```

---

## 🔧 DAY 2: EXTRACT SHARED PACKAGES & FIX IMPORTS

### **AntiGravity Prompt - Day 2:**

```
[DAY 2 - EXTRACT SHARED CODE & FIX IMPORTS]

OBJECTIVE: Extract shared code into packages and update imports

STEP 1: EXTRACT DATABASE PACKAGES
────────────────────────────────────────────────────

# Create db-core package
File: packages/db-core/package.json

{
  "name": "@sudaksha/db-core",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0"
  },
  "devDependencies": {
    "prisma": "^5.7.0"
  }
}

# Create db-assessments package
File: packages/db-assessments/package.json

{
  "name": "@sudaksha/db-assessments",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0"
  },
  "devDependencies": {
    "prisma": "^5.7.0"
  }
}

# Copy Prisma schema from portal and split:
# Move Identity/Tenant models to db-core
# Move Assessment/Question models to db-assessments

# Create index file for db-core
File: packages/db-core/src/index.ts

import { PrismaClient } from '@prisma/client';

const globalForPrismaCore = globalThis as unknown as {
  prismaCore: PrismaClient | undefined;
};

export const prismaCore =
  globalForPrismaCore.prismaCore ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaCore.prismaCore = prismaCore;
}

export * from '@prisma/client';

# Create index file for db-assessments (similar)

# Generate Prisma clients
cd packages/db-core && pnpm install && pnpm db:generate && cd ../..
cd packages/db-assessments && pnpm install && pnpm db:generate && cd ../..

STEP 2: EXTRACT TYPES PACKAGE
────────────────────────────────────────────────────

File: packages/types/package.json

{
  "name": "@sudaksha/types",
  "version": "1.0.0",
  "main": "./src/index.ts"
}

# Copy type files from portal if they exist:
# Look for: apps/portal/types/* or apps/portal/lib/types/*

# Create basic types:
File: packages/types/src/index.ts

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'DEPARTMENT_HEAD'
  | 'TEAM_LEAD'
  | 'EMPLOYEE'
  | 'STUDENT'
  | 'INDIVIDUAL';

export type TenantType = 'CORPORATE' | 'INSTITUTION' | 'SYSTEM';

// Add other types from your project

STEP 3: EXTRACT SSO AUTH PACKAGE
────────────────────────────────────────────────────

File: packages/sso-auth/package.json

{
  "name": "@sudaksha/sso-auth",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "dependencies": {
    "next-auth": "^4.24.0",
    "@sudaksha/db-core": "workspace:*"
  }
}

# Copy auth config from portal:
# Find: apps/portal/lib/auth.ts or apps/portal/lib/auth-config.ts

# Copy to: packages/sso-auth/src/config.ts

# Create index:
File: packages/sso-auth/src/index.ts

export * from './config';
export * from 'next-auth';

STEP 4: EXTRACT UI COMPONENTS (Optional)
────────────────────────────────────────────────────

# If you have shared UI components:
# Copy from apps/portal/components/ui/* to packages/ui/src/

STEP 5: UPDATE PORTAL PACKAGE.JSON
────────────────────────────────────────────────────

File: apps/portal/package.json

{
  "name": "@sudaksha/portal",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@sudaksha/db-core": "workspace:*",
    "@sudaksha/db-assessments": "workspace:*",
    "@sudaksha/types": "workspace:*",
    "@sudaksha/sso-auth": "workspace:*",
    "next-auth": "^4.24.0"
    // ... keep all other dependencies from your original package.json
  }
}

STEP 6: UPDATE WEBSITE PACKAGE.JSON
────────────────────────────────────────────────────

File: apps/website/package.json

{
  "name": "@sudaksha/website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
    // Minimal dependencies - website is mostly static
  }
}

STEP 7: UPDATE IMPORTS IN PORTAL
────────────────────────────────────────────────────

Search and replace in apps/portal/:

# Prisma imports:
FROM: import { prisma } from '@/lib/prisma'
FROM: import { prisma } from '../lib/prisma'
FROM: import { prisma } from '../../lib/prisma'
TO: import { prismaCore } from '@sudaksha/db-core'
AND: import { prismaAssessments } from '@sudaksha/db-assessments'

# Type imports:
FROM: import type { User } from '@/types'
FROM: import type { User } from '@/lib/types'
TO: import type { User } from '@sudaksha/types'

# Auth imports:
FROM: import { authOptions } from '@/lib/auth'
FROM: import { authOptions } from '@/lib/auth-config'
TO: import { authOptions } from '@sudaksha/sso-auth'

Use find and replace across entire apps/portal/ directory.

STEP 8: UPDATE NEXT CONFIG FOR PORTAL
────────────────────────────────────────────────────

File: apps/portal/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@sudaksha/database',
    '@sudaksha/types',
    '@sudaksha/auth'
  ],
  // ... keep other config from your original
};

module.exports = nextConfig;

STEP 9: INSTALL DEPENDENCIES
────────────────────────────────────────────────────

# From root:
pnpm install

# This installs dependencies for all apps and packages

STEP 10: TEST PORTAL BUILD
────────────────────────────────────────────────────

cd apps/portal
pnpm build

Fix any import errors that appear.

Common fixes needed:
- Update relative imports to use @ alias
- Update package imports to use workspace packages
- Fix any missing dependencies

SUCCESS CRITERIA:
✓ Database package created with Prisma
✓ Types package created
✓ Auth package created
✓ Portal package.json updated with workspace dependencies
✓ All imports updated
✓ Portal builds without errors

Report completion and list any remaining import errors.
```

---

## ✅ DAY 3: TEST & FINALIZE

### **AntiGravity Prompt - Day 3:**

```
[DAY 3 - TESTING & FINALIZATION]

OBJECTIVE: Test both apps, fix issues, finalize migration

STEP 1: COPY ENVIRONMENT VARIABLES
────────────────────────────────────────────────────

# Copy from your current project's .env to apps/portal/.env:

File: apps/portal/.env

DATABASE_URL="..." (copy from current project)
NEXTAUTH_URL=http://localhost:3001 (note port change!)
NEXTAUTH_SECRET="..." (copy from current project)
// ... all other env vars

File: apps/website/.env (if needed)

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PORTAL_URL=http://localhost:3001

STEP 2: UPDATE PORTAL LINKS IN WEBSITE
────────────────────────────────────────────────────

In apps/website/, find all links to portal and update:

FROM: /assessments/login
TO: http://localhost:3001/login

FROM: /register
TO: http://localhost:3001/register

In production, use:
FROM: /assessments/login
TO: https://assessments.sudaksha.com/login

STEP 3: UPDATE WEBSITE LINKS IN PORTAL
────────────────────────────────────────────────────

In apps/portal/, find "back to home" or logo links:

FROM: /
TO: http://localhost:3000

In production:
TO: https://sudaksha.com

STEP 4: FIX ADMIN LOGIN ROUTE (If Needed)
────────────────────────────────────────────────────

Check if apps/portal/app/admin/login exists.
If not, check if it's at apps/portal/app/assessments/admin/login

Move it to: apps/portal/app/admin/login

STEP 5: REMOVE DUPLICATE LAYOUTS
────────────────────────────────────────────────────

Check apps/portal/app/layout.tsx:
- Remove any Core-specific navigation
- Keep only portal navigation

Check apps/website/app/layout.tsx:
- Keep Core navigation
- Remove any portal-specific navigation

STEP 6: TEST PORTAL LOCALLY
────────────────────────────────────────────────────

cd apps/portal
pnpm dev

Visit: http://localhost:3001

Test:
✓ Login page loads (/login)
✓ Can log in
✓ Dashboard accessible
✓ Admin panel accessible (/admin)
✓ All features work
✓ No console errors

Fix any issues found.

STEP 7: TEST WEBSITE LOCALLY
────────────────────────────────────────────────────

cd apps/website
pnpm dev

Visit: http://localhost:3000

Test:
✓ Homepage loads
✓ All Core pages load
✓ Links to portal work
✓ No console errors

Fix any issues found.

STEP 8: TEST BOTH APPS TOGETHER
────────────────────────────────────────────────────

From root:
pnpm dev

This runs both apps:
- Website: http://localhost:3000
- Portal: http://localhost:3001

Test:
1. Go to website (localhost:3000)
2. Click "Get Started" or "Login"
3. Should go to portal (localhost:3001)
4. Complete login
5. Use portal features
6. Click "Home" or logo
7. Should go to website (localhost:3000)

STEP 9: UPDATE ROOT PACKAGE.JSON SCRIPTS
────────────────────────────────────────────────────

File: package.json (root)

{
  "scripts": {
    "dev": "turbo run dev",
    "dev:website": "turbo run dev --filter=@sudaksha/website",
    "dev:portal": "turbo run dev --filter=@sudaksha/portal",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "db:generate": "cd packages/database && pnpm db:generate",
    "db:push": "cd packages/database && pnpm db:push",
    "db:studio": "cd packages/database && pnpm db:studio"
  }
}

STEP 10: CREATE README
────────────────────────────────────────────────────

File: README.md (root)

# SudAssess Platform

Monorepo for SudAssess multi-domain platform.

## Apps

- `apps/website` - Core website (sudaksha.com)
- `apps/portal` - Assessment portal (assessments.sudaksha.com)

## Packages

- `packages/database` - Shared Prisma schema
- `packages/types` - Shared TypeScript types
- `packages/auth` - Shared authentication
- `packages/ui` - Shared UI components

## Development

```bash
# Run both apps
pnpm dev

# Run website only
pnpm dev:website

# Run portal only
pnpm dev:portal

# Database commands
pnpm db:generate
pnpm db:push
pnpm db:studio
```

## URLs

- Website: http://localhost:3000
- Portal: http://localhost:3001

STEP 11: COMMIT TO GIT
────────────────────────────────────────────────────

git add .
git commit -m "Migrate to Turborepo monorepo structure"

STEP 12: CLEANUP (Optional)
────────────────────────────────────────────────────

After verifying everything works:

# You can archive your old project:
cd /path/to/old/project
cd ..
mv old-project old-project-backup

# Keep it for reference until you're 100% sure migration is complete

SUCCESS CRITERIA:
✓ Both apps run on different ports
✓ Portal works (login, dashboard, features)
✓ Website works (all pages load)
✓ Cross-app navigation works
✓ Database connection works
✓ No build errors
✓ Code committed to git
✓ README created

MIGRATION COMPLETE! 🎉

Report final status and any remaining issues.
```

---

## ✅ FINAL CHECKLIST

After 3 days, verify:

### **Structure**
- [ ] Turborepo created
- [ ] Core pages in apps/website/
- [ ] Portal pages in apps/portal/
- [ ] Shared code in packages/

### **Functionality**
- [ ] Website runs on port 3000
- [ ] Portal runs on port 3001
- [ ] Login works
- [ ] Dashboard works
- [ ] All features work
- [ ] Database connection works

### **Code Quality**
- [ ] No build errors
- [ ] No TypeScript errors
- [ ] Imports updated correctly
- [ ] Environment variables set

### **Documentation**
- [ ] README created
- [ ] Code committed to git
- [ ] Old project backed up

---

## 🎯 SIMPLIFIED FLOW

```
Day 1:
1. Create Turborepo
2. Copy entire current project to apps/portal/
3. Move Core pages to apps/website/

Day 2:
1. Extract shared code to packages/
2. Update imports in portal
3. Fix build errors

Day 3:
1. Test both apps
2. Fix any issues
3. Commit and celebrate!
```

---

## 🚀 START NOW

**Copy this to your AI agent:**

```
I have an existing Next.js project with website and portal mixed together.
I need to migrate it to Turborepo structure.

Please read: TURBOREPO_MIGRATION_GUIDE.md

Start with "DAY 1 - SETUP & COPY EXISTING CODE" section.

Key points:
- My current project is at: [YOUR_PROJECT_PATH]
- Core pages are in: [SPECIFY LOCATION]
- Portal pages are in: [SPECIFY LOCATION]
- Don't create from scratch, just copy and reorganize existing code

Execute Day 1 now.
```

**This is much faster since you're not building from scratch - just reorganizing!** 🎉
