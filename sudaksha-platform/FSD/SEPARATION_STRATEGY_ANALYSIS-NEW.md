# SEPARATION STRATEGY: WEBSITE vs ASSESSMENT PORTAL
## Analysis & Recommendation for Multi-Domain Architecture

---

## 🎯 YOUR VISION

```
Current (Monolith):
localhost:3000/*                    → Everything in one app

Proposed (Decoupled Ecosystem):
1. sudaksha.com (+ /admin)          → Core website & CMS (Completely standalone, separate DB & Auth)
2. assessments.sudaksha.com         → Assessment portal (SSO Integrated, Separate DB)
3. lms.sudaksha.com                 → LMS (future) (SSO Integrated, Separate DB)
4. crm.sudaksha.com                 → CRM (future) (SSO Integrated, Separate DB)
```

---

## ✅ RECOMMENDED APPROACH: SEPARATE PROJECTS

**YES, you should separate them!** Here's why:

### **Benefits of Separation:**

1. **✅ Clear Boundaries**
   - Core website = Public facing
   - Assessment portal = Application (authenticated)
   - Different teams can work independently

2. **✅ Independent Deployment**
   - Deploy website updates without touching portal
   - Deploy portal updates without touching website
   - Zero downtime deployments
   - Rollback one without affecting the other

3. **✅ Better Performance**
   - Website: Optimized for SEO, fast loading
   - Portal: Optimized for app performance
   - Smaller bundle sizes for each

4. **✅ Scalability**
   - Scale each independently
   - Website: Read-heavy, CDN cached
   - Portal: Write-heavy, more servers

5. **✅ Security**
   - Website: Public, no sensitive data
   - Portal: Authentication, authorization, data protection
   - Different security policies

6. **✅ Technology Flexibility**
   - Website: Can use static generation, Core tools
   - Portal: Can use real-time features, complex state management
   - Different Next.js configurations

7. **✅ Future-Proof**
   - Easy to add lms.sudaksha.com
   - Easy to add crm.sudaksha.com
   - Microservices architecture ready

---

## 🏗️ RECOMMENDED ARCHITECTURE

```
sudaksha-platform/
├── packages/                       # Shared code
│   ├── db-core/                   # Shared Prisma schema for SSO / Tenant Identity
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   ├── db-assessments/            # Prisma schema for Assessments-specific data
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   ├── types/                     # TypeScript types
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── tenant.ts
│   │   │   └── assessment.ts
│   │   └── package.json
│   ├── ui/                        # Shared UI components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   └── package.json
│   └── sso-auth/                  # SSO Authentication logic for Portals
│       ├── src/
│       │   ├── session.ts
│       │   └── permissions.ts
│       └── package.json
│
├── apps/
│   ├── website/                   # sudaksha.com (Standalone Architecture)
│   │   ├── app/
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── admin/            # Core Website Admin/CMS (Isolated Auth)
│   │   │   ├── about/
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   └── contact/
│   │   ├── prisma/               # Website's own completely isolated database!
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── portal/                    # assessments.sudaksha.com (SSO + Dedicated DB)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── admin/            # Super Admin
│   │   │   ├── org/              # Tenant workspaces
│   │   │   ├── my/               # Personal workspace
│   │   │   └── api/
│   │   ├── public/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── lms/                       # lms.sudaksha.com (future)
│   │   └── (empty for now)
│   │
│   └── crm/                       # crm.sudaksha.com (future)
│       └── (empty for now)
│
├── package.json                   # Root package.json (monorepo)
├── turbo.json                     # Turborepo configuration
└── pnpm-workspace.yaml            # Workspace configuration
```

---

## 🔧 IMPLEMENTATION STRATEGY

### **Option 1: Turborepo (RECOMMENDED)**

**Best for:** Multiple apps sharing code

```bash
# Install Turborepo
npx create-turbo@latest

# Structure:
sudaksha-platform/
├── apps/
│   ├── website/          # Next.js app
│   └── portal/           # Next.js app
├── packages/
│   ├── db-core/          # Single Sign-On / Central User Identity DB
│   ├── db-assessments/   # Assessment-specific database schema
│   ├── ui/               # Shared components
│   └── sso-auth/         # Shared auth logic for portals
└── turbo.json
```

**Benefits:**
- ✅ Shared code via packages
- ✅ Fast builds (caching)
- ✅ Run multiple apps simultaneously
- ✅ Deploy independently
- ✅ Industry standard (Vercel, Netflix use it)

**Setup Time:** 1-2 days

---

### **Option 2: Separate Git Repos**

**Best for:** Complete independence

```
Repo 1: sudaksha-website
Repo 2: sudaksha-assessments
Repo 3: sudaksha-lms (future)
Repo 4: sudaksha-crm (future)
```

**Benefits:**
- ✅ Complete isolation
- ✅ Independent version control
- ✅ Different teams, different repos
- ✅ Simplest to understand

**Drawbacks:**
- ❌ Code duplication (UI components, types)
- ❌ Harder to share auth logic
- ❌ Database schema must be synced manually

**Setup Time:** 1 day

---

### **Option 3: Monorepo with pnpm workspaces**

**Best for:** Lightweight monorepo

```bash
# Structure:
sudaksha-platform/
├── apps/
│   ├── website/
│   └── portal/
├── packages/
│   └── shared/
└── pnpm-workspace.yaml
```

**Benefits:**
- ✅ Shared code
- ✅ Simpler than Turborepo
- ✅ Good enough for most cases

**Setup Time:** 1 day

---

## 📊 COMPARISON TABLE

| Aspect | Monolith (Current) | Turborepo | Separate Repos |
|--------|-------------------|-----------|----------------|
| **Setup Complexity** | ✅ Simple | ⚠️ Medium | ✅ Simple |
| **Code Sharing** | ✅ Easy | ✅ Easy | ❌ Hard |
| **Independent Deploy** | ❌ No | ✅ Yes | ✅ Yes |
| **Build Speed** | ⚠️ Slow | ✅ Fast | ✅ Fast |
| **Team Scalability** | ❌ Poor | ✅ Excellent | ✅ Good |
| **Future Flexibility** | ❌ Poor | ✅ Excellent | ⚠️ Medium |
| **Maintenance** | ✅ Easy | ⚠️ Medium | ❌ Hard |

---

## 🎯 MY RECOMMENDATION

**Use Turborepo (Option 1)** because:

1. ✅ You want multiple domains (website, portal, lms, crm)
2. ✅ You want shared code (auth, database, UI)
3. ✅ You want independent deployments
4. ✅ You're planning to scale (multiple products)
5. ✅ Industry standard, well-documented
6. ✅ Perfect for your vision

---

## 🚀 MIGRATION PLAN (7 Days)

### **Day 1-2: Setup Turborepo Structure**

```bash
# Create new Turborepo
npx create-turbo@latest sudaksha-platform
cd sudaksha-platform

# Structure will be:
apps/
  web/          # Delete this (comes with template)
  docs/         # Delete this
packages/
  ui/           # Keep this
  eslint-config/
  typescript-config/

# Create your apps
mkdir -p apps/website
mkdir -p apps/portal

# Create your packages
mkdir -p packages/db-core
mkdir -p packages/db-assessments
mkdir -p packages/types
mkdir -p packages/sso-auth
```

### **Day 3: Move Website Code**

```bash
# In apps/website/
# Copy from current project:
- Homepage (/)
- About page (/about)
- Pricing page (/pricing)
- Features page (/features)
- Contact page (/contact)
- Core assets

# Focus: Public-facing, SEO-optimized
```

### **Day 4-5: Move Portal Code**

```bash
# In apps/portal/
# Copy from current project:
- Authentication (/login, /register)
- Admin panel (/admin/*)
- Tenant workspaces (/org/*)
- Personal workspace (/my/*)
- All API routes (/api/*)

# Focus: Application logic, authenticated users
```

### **Day 6: Setup Shared Packages**

```bash
# packages/db-core/
- Move User & Tenant prisma schemas here
- This powers SSO and identity across all portals

# packages/db-assessments/
- Move Assessment-specific prisma schemas here
- Only the Assessment portal interacts directly with this

# packages/types/
- Move TypeScript types here
- Export: User, Tenant, Assessment, etc.

# packages/sso-auth/
- Move authentication logic here
- Export: getSession, requireAuth, etc., for the SSO portals

# packages/ui/
- Move shared components here
- Export: Button, Input, Card, etc.
```

### **Day 7: Testing & Deployment**

```bash
# Test locally:
npm run dev          # Runs all apps
npm run dev --filter=website   # Only website
npm run dev --filter=portal    # Only portal

# Deploy:
- Vercel: Deploy each app separately
- Each gets its own domain
```

---

## 🔗 CONNECTING THE APPS

### **Shared Database**

```typescript
// apps/website/prisma/schema.prisma
// Completely independent database for website & its admin panel
datasource db {
  provider = "postgresql"
  url      = env("WEBSITE_DATABASE_URL")
}

// packages/db-core/prisma/schema.prisma
// SSO Database for Portals (Identity, Tenants, Roles)
datasource db {
  provider = "postgresql"
  url      = env("SSO_DATABASE_URL")
}
// Central models
model User { ... }
model Tenant { ... }

// packages/db-assessments/prisma/schema.prisma
// Specific database for Assessment Portal logic
datasource db {
  provider = "postgresql"
  url      = env("ASSESSMENTS_DATABASE_URL")
}
model Assessment { ... }
model Question { ... }
```

**The Core Website is fully isolated. The Portals (Assessments, LMS, CRM) use the shared SSO DB for identity, but maintain separate DBs for domain-specific data.**

### **SSO Authentication (Portals Only)**

```typescript
// packages/sso-auth/src/session.ts
export async function getSession() {
  // SSO session logic
  // Uses db-core schema
}

// Used in portals:
// apps/portal/app/api/auth/[...nextauth]/route.ts
// apps/lms/app/api/auth/[...nextauth]/route.ts
```

### **Cross-App Navigation**

```typescript
// In website (sudaksha.com):
<a href="https://assessments.sudaksha.com/login">
  Get Started
</a>

// In portal (assessments.sudaksha.com):
<a href="https://sudaksha.com">
  Back to Home
</a>
```

### **Shared Session Across Domains**

```typescript
// Use same JWT secret
// Store session token in cookie with domain=.sudaksha.com
// Both subdomains can read it

// next-auth configuration:
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      domain: '.sudaksha.com', // Works for all subdomains
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true
    }
  }
}
```

---

## 🚨 POTENTIAL ISSUES & SOLUTIONS

### **Issue 1: Database Schema Sync**

**Problem:** Both apps need same schema

**Solution:**
```bash
# In packages/db-core/ and packages/db-assessments/
npm run db:push

# This updates database for all apps
```

### **Issue 2: Type Sharing**

**Problem:** Types defined in one app, needed in another

**Solution:**
```typescript
// packages/types/src/user.ts
export type User = {
  id: string;
  email: string;
  role: string;
};

// Import in both apps:
import { User } from '@sudaksha/types';
```

### **Issue 3: Component Duplication**

**Problem:** Same Button in both apps

**Solution:**
```typescript
// packages/ui/src/Button.tsx
export function Button() { ... }

// Import in both apps:
import { Button } from '@sudaksha/ui';
```

### **Issue 4: Environment Variables**

**Problem:** Need different env vars per app

**Solution:**
```bash
# apps/website/.env
NEXT_PUBLIC_SITE_URL=https://sudaksha.com

# apps/portal/.env
NEXT_PUBLIC_SITE_URL=https://assessments.sudaksha.com

# Shared SSO environment
SSO_DATABASE_URL=postgresql://...
SSO_NEXTAUTH_SECRET=...

# Portal unique DB
ASSESSMENTS_DATABASE_URL=postgresql://...
```

---

## 📝 DEPLOYMENT CONFIGURATION

### **Vercel (Recommended)**

```bash
# Deploy website
cd apps/website
vercel --prod
# Set domain: sudaksha.com

# Deploy portal
cd apps/portal
vercel --prod
# Set domain: assessments.sudaksha.com
```

### **DNS Configuration**

```
A Record:
sudaksha.com → Vercel IP

CNAME Record:
assessments.sudaksha.com → cname.vercel-dns.com
lms.sudaksha.com → cname.vercel-dns.com (future)
crm.sudaksha.com → cname.vercel-dns.com (future)
```

---

## ✅ DECISION MATRIX

### **Keep as Monolith IF:**
- ❌ You only ever want one domain
- ❌ Website and portal are tightly coupled
- ❌ Small team, simple requirements
- ❌ Don't plan to add more products

### **Separate into Turborepo IF:**
- ✅ You want multiple domains (you do!)
- ✅ You want independent deployments
- ✅ You plan to scale (lms, crm coming)
- ✅ You want better performance
- ✅ You want to share code cleanly

---

## 🎯 FINAL RECOMMENDATION

**YES, separate them into Turborepo!**

**Why:**
1. ✅ Your vision includes multiple products (lms, crm)
2. ✅ Website and portal have different purposes
3. ✅ Independent deployment is valuable
4. ✅ Better performance for both
5. ✅ Cleaner codebase
6. ✅ Easier to maintain long-term
7. ✅ Standard industry practice

**When to separate:**
- **Now** if you haven't built much yet
- **After current sprint** if mid-development
- **Before going to production** at the latest

**Time investment:**
- Setup: 1-2 days
- Migration: 3-5 days
- Testing: 1-2 days
- **Total: ~7 days**

**Long-term benefit:** Worth 10x the effort!

---

## 🚀 NEXT STEPS

1. **Create Turborepo structure** (Day 1)
2. **Move website code** (Day 2-3)
3. **Move portal code** (Day 4-5)
4. **Setup shared packages** (Day 6)
5. **Test & deploy** (Day 7)

**I can provide the complete migration prompt if you want to proceed!**

Would you like me to create the detailed Turborepo setup and migration guide?
