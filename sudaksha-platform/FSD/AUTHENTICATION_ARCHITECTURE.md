# SUDASSESS - AUTHENTICATION & ROUTING ARCHITECTURE
## Modern Multi-Tenant Authentication System

**Objective:** Implement a clean, secure, international-standard authentication system that supports multiple tenant types with clear URL structures.

---

## 🎯 RECOMMENDED AUTHENTICATION ARCHITECTURE

### **Design Philosophy: Industry Best Practices**

We will use a **hybrid approach** combining:
1. **Workspace-based routing** (like Slack, Notion, Figma)
2. **Role-based access control** (RBAC)
3. **Single sign-on ready** (SSO-compatible)
4. **Clear separation of concerns**

---

## 🌐 URL STRUCTURE (FINAL DESIGN)

### **Public Routes (No Authentication)**

```
/                                    → Landing page (public homepage)
/features                            → Features page
/pricing                             → Pricing page
/about                               → About page
/contact                             → Contact page

/register                            → Registration type selection
  ├─ ?type=corporate                 → Corporate registration flow
  ├─ ?type=institution               → Institution registration flow
  └─ ?type=individual                → Individual registration flow

/login                               → Universal login page (auto-detects user type)
/forgot-password                     → Password reset
/verify-email?token=XXX              → Email verification
```

### **Sudaksha Super Admin Routes**

```
/admin                               → Super Admin portal
/admin/login                         → Super Admin login (separate, secure)
/admin/dashboard                     → Super Admin dashboard
/admin/tenants                       → Manage all tenants
/admin/approvals                     → Approval queue
/admin/usage-analytics               → Usage & billing
/admin/institutions                  → Institution management
/admin/competencies                  → Global competency management
```

### **Tenant Admin Routes (Corporate/Institution)**

```
/org/[slug]                          → Tenant workspace (e.g., /org/acme-corp)
/org/[slug]/dashboard                → Tenant dashboard
/org/[slug]/employees                → Employees (Corporate) / Students (Institution)
/org/[slug]/departments              → Departments
/org/[slug]/teams                    → Teams (Corporate) / Classes (Institution)
/org/[slug]/projects                 → Projects (Corporate) / Courses (Institution)
/org/[slug]/assessments              → Assessment management
/org/[slug]/surveys                  → Survey management
/org/[slug]/reports                  → Reports
/org/[slug]/settings                 → Organization settings

/org/[slug]/settings/invite          → Invite users
/org/[slug]/settings/members         → Manage members
/org/[slug]/settings/billing         → Billing (post-pilot)
```

### **End-User Routes (Employees/Students/Individuals)**

```
/my                                  → Personal workspace (all users)
/my/dashboard                        → Personal dashboard
/my/profile                          → My Profile (9-section career form)
/my/career                           → My Career (current/aspirational roles)
/my/hierarchy                        → My Hierarchy (org chart - not for B2C)
/my/assessments                      → My Assessments
/my/results                          → Assessment results
/my/surveys                          → My Surveys
/my/development                      → Development plan
/my/settings                         → Personal settings
```

### **Assessment Taking Routes**

```
/take/[assessmentId]                 → Take assessment
/take/[assessmentId]/question/[n]    → Individual question (for mobile)
/take/[assessmentId]/submit          → Submit assessment
/take/[assessmentId]/results         → View results
```

### **Survey Taking Routes**

```
/survey/[surveyId]/take              → Take survey
/survey/[surveyId]/thank-you         → Thank you page
```

---

## 🔐 AUTHENTICATION FLOW

### **1. Universal Login Flow (RECOMMENDED)**

**Single Login Page for All Users:**

```
URL: /login

┌──────────────────────────────────────────────┐
│ Welcome to SudAssess                         │
├──────────────────────────────────────────────┤
│                                              │
│ Email: [_______________________________]     │
│                                              │
│ Password: [_______________________________]  │
│                                              │
│ ☐ Remember me                                │
│                                              │
│ [Sign In]                                    │
│                                              │
│ [Forgot password?]                           │
│                                              │
│ Don't have an account? [Sign up]            │
└──────────────────────────────────────────────┘

AUTHENTICATION LOGIC:
1. User enters email + password
2. System checks database for user
3. Retrieves user role and tenant (if any)
4. Authenticates via NextAuth
5. Redirects based on role:
   - SUPER_ADMIN → /admin/dashboard
   - TENANT_ADMIN → /org/[slug]/dashboard
   - DEPARTMENT_HEAD → /org/[slug]/dashboard (scoped)
   - TEAM_LEAD → /org/[slug]/dashboard (scoped)
   - EMPLOYEE → /my/dashboard
   - STUDENT → /my/dashboard
   - INDIVIDUAL → /my/dashboard
```

**Why Single Login Page?**
- ✅ Better UX (users don't need to remember different URLs)
- ✅ Standard practice (Gmail, Microsoft, AWS all use single login)
- ✅ SSO-compatible
- ✅ Easier to maintain
- ✅ Professional appearance

---

### **2. Registration Flows (Type-Specific)**

#### **A. Corporate Registration**

```
URL: /register?type=corporate

FLOW:
1. Landing Page → Click "Get Started for Organizations"
2. → /register?type=corporate
3. → Corporate Registration Form:
   ┌──────────────────────────────────────────┐
   │ Create Your Corporate Account            │
   ├──────────────────────────────────────────┤
   │ Company Name: [_____________________]    │
   │ Company Email: [____________________]    │
   │ Your Name: [________________________]    │
   │ Your Email: [_______________________]    │
   │ Password: [_________________________]    │
   │ Phone: [____________________________]    │
   │                                          │
   │ Industry: [IT Services ▼]               │
   │ Company Size: [11-50 employees ▼]       │
   │                                          │
   │ ☐ I agree to Terms of Service           │
   │                                          │
   │ [Create Account]                         │
   └──────────────────────────────────────────┘

4. On submit:
   - Create tenant (type: CORPORATE)
   - Generate unique slug (e.g., acme-corp)
   - Create admin user
   - Link user to tenant as TENANT_ADMIN
   - Send verification email
   - → /verify-email (pending verification)

5. After email verification:
   - → /login
   - After login → /org/[slug]/dashboard
   - Show onboarding wizard
```

#### **B. Institution Registration**

```
URL: /register?type=institution

FLOW:
1. Landing Page → Click "Register Your Institution"
2. → /register?type=institution
3. → Institution Registration Form:
   ┌──────────────────────────────────────────┐
   │ Create Your Institution Account          │
   ├──────────────────────────────────────────┤
   │ Institution Name: [_________________]    │
   │ Institution Email: [________________]    │
   │ Your Name: [________________________]    │
   │ Your Email: [_______________________]    │
   │ Password: [_________________________]    │
   │ Phone: [____________________________]    │
   │                                          │
   │ Institution Type: [University ▼]        │
   │ Student Count: [500-1000 ▼]             │
   │                                          │
   │ ☐ I agree to Terms of Service           │
   │                                          │
   │ [Create Account]                         │
   └──────────────────────────────────────────┘

4-5. Same flow as Corporate
```

#### **C. Individual Registration (B2C)**

```
URL: /register?type=individual

FLOW:
1. Landing Page → Click "Start Assessing Yourself"
2. → /register?type=individual
3. → Individual Registration Form:
   ┌──────────────────────────────────────────┐
   │ Create Your Personal Account             │
   ├──────────────────────────────────────────┤
   │ Full Name: [________________________]    │
   │ Email: [____________________________]    │
   │ Password: [_________________________]    │
   │                                          │
   │ Current Role (optional):                 │
   │ [Select role... ▼]                       │
   │                                          │
   │ I am: ○ Employed  ○ Student  ○ Other    │
   │                                          │
   │ ☐ I agree to Terms of Service           │
   │                                          │
   │ [Create Free Account]                    │
   └──────────────────────────────────────────┘

4. On submit:
   - Create user (no tenant, type: INDIVIDUAL)
   - Send verification email
   - → /verify-email

5. After verification:
   - → /login
   - After login → /my/dashboard
   - Show personal onboarding
```

---

### **3. Super Admin Authentication**

```
URL: /admin/login

SEPARATE LOGIN PAGE (More Secure):
┌──────────────────────────────────────────────┐
│ 🔐 Sudaksha Admin Portal                     │
├──────────────────────────────────────────────┤
│                                              │
│ Admin Email: [_________________________]     │
│                                              │
│ Password: [_____________________________]    │
│                                              │
│ [Sign In with 2FA]                           │
│                                              │
│ This is a restricted area for Sudaksha      │
│ administrators only.                         │
└──────────────────────────────────────────────┘

SECURITY:
- Separate database table: admin_users
- 2FA mandatory (TOTP)
- IP whitelist (optional)
- Session timeout: 30 minutes
- Audit log all actions
- Cannot be created via public registration
```

---

### **4. Employee/Student Invitation Flow**

When a Corporate Admin or Institution Admin adds an employee/student:

```
ADMIN ACTION:
/org/[slug]/employees → Click "Add Employee"

SYSTEM ACTIONS:
1. Create member record (status: PENDING)
2. Generate invitation token (expires in 7 days)
3. Send invitation email:
   
   Subject: "You've been invited to join [Company Name] on SudAssess"
   
   Body:
   Hi [Name],
   
   You've been invited to join [Company Name]'s assessment platform.
   
   Your employee ID: EMP001
   Your email: john@company.com
   
   To get started:
   1. Click the link below
   2. Set your password
   3. Complete your profile
   
   [Accept Invitation] → Links to: /invite/[token]
   
   This link expires in 7 days.

EMPLOYEE CLICKS LINK:
→ /invite/[token]

┌──────────────────────────────────────────────┐
│ Welcome to [Company Name]                    │
├──────────────────────────────────────────────┤
│ Complete Your Registration                   │
│                                              │
│ Name: John Doe (pre-filled, editable)       │
│ Email: john@company.com (read-only)         │
│ Employee ID: EMP001 (read-only)             │
│                                              │
│ Create Password: [__________________]        │
│ Confirm Password: [_________________]        │
│                                              │
│ [Complete Registration]                      │
└──────────────────────────────────────────────┘

AFTER COMPLETION:
- User status: PENDING → ACTIVE
- → /login
- After login → /my/dashboard (first-time onboarding)
```

---

## 👥 USER ROLE & PERMISSION MATRIX

### **Role Hierarchy**

```
SUPER_ADMIN (Sudaksha Team)
  └─ Global access to all tenants
  
TENANT_ADMIN (Corporate Admin / Institution Admin)
  ├─ DEPARTMENT_HEAD (Reports to Tenant Admin)
  │  └─ TEAM_LEAD (Corporate) / CLASS_TEACHER (Institution)
  │     └─ EMPLOYEE (Corporate) / STUDENT (Institution)
  
INDIVIDUAL (B2C User)
  └─ No organizational hierarchy
```

### **Personal Dashboard Access**

| Role | Has /my/* Pages? | Reason |
|------|------------------|--------|
| SUPER_ADMIN | ✅ Yes | Can also be assessed |
| TENANT_ADMIN | ✅ Yes | Is also an employee |
| DEPARTMENT_HEAD | ✅ Yes | Is also an employee |
| TEAM_LEAD | ✅ Yes | Is also an employee |
| EMPLOYEE | ✅ Yes | Core user |
| CLASS_TEACHER | ❌ No | Not a student |
| STUDENT | ✅ Yes | Core user |
| INDIVIDUAL | ✅ Yes | Core user |

**IMPORTANT RULE:**
- Corporate: All roles (Admin, Dept Head, Team Lead, Employee) are employees → All get /my/* pages
- Institution: Admin, Dept Head, Class Teacher are NOT students → No /my/* pages
- Institution: Only Students get /my/* pages

---

## 🔧 IMPLEMENTATION STRUCTURE

### **Database Schema Updates**

```sql
-- Users table (extends existing)
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'TENANT';
-- Values: SUPER_ADMIN | TENANT | INDIVIDUAL

-- For tenant users
ALTER TABLE members ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP;
ALTER TABLE members ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMP;
ALTER TABLE members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING';
-- Status: PENDING | ACTIVE | INACTIVE | RESIGNED

-- Tenants table (add slug)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
-- Slug: Used in URLs, e.g., "acme-corp", "mit-university"
```

### **NextAuth Configuration**

```typescript
// lib/auth-config.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isAdmin: { label: "Is Admin", type: "hidden" } // For /admin/login
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Check if this is admin login
        if (credentials.isAdmin === 'true') {
          // Super Admin login (separate table)
          const admin = await prisma.adminUser.findUnique({
            where: { email: credentials.email }
          });
          
          if (!admin || !admin.isActive) return null;
          
          const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);
          if (!isValid) return null;
          
          // Require 2FA
          if (!credentials.twoFactorCode) {
            throw new Error('2FA_REQUIRED');
          }
          
          // Verify 2FA
          const isValid2FA = await verify2FA(admin.id, credentials.twoFactorCode);
          if (!isValid2FA) return null;
          
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            userType: 'SUPER_ADMIN',
            role: 'SUPER_ADMIN',
            tenantId: null,
            tenantSlug: null
          };
        }
        
        // Regular user login
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            tenant: true,
            member: {
              include: {
                orgUnit: true
              }
            }
          }
        });
        
        if (!user) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        
        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        
        // Determine user type and redirect
        let userType = 'TENANT';
        let tenantSlug = null;
        let role = user.role;
        
        if (user.tenant) {
          userType = 'TENANT';
          tenantSlug = user.tenant.slug;
        } else {
          userType = 'INDIVIDUAL';
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType,
          role,
          tenantId: user.tenantId,
          tenantSlug,
          memberId: user.member?.id,
          permissions: user.permissions || []
        };
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.memberId = user.memberId;
        token.permissions = user.permissions;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.userType = token.userType;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tenantSlug = token.tenantSlug;
        session.user.memberId = token.memberId;
        session.user.permissions = token.permissions;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Custom redirect logic based on user type
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    verifyRequest: '/verify-email',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  }
};
```

### **Middleware for Route Protection**

```typescript
// middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Super Admin routes
    if (path.startsWith('/admin')) {
      if (token?.userType !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
    
    // Tenant routes
    if (path.startsWith('/org/')) {
      if (token?.userType !== 'TENANT') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      
      // Check if user has access to this specific tenant
      const slug = path.split('/')[2];
      if (token?.tenantSlug !== slug) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      
      // Check role-specific access
      const isAdmin = ['SUPER_ADMIN', 'TENANT_ADMIN'].includes(token?.role);
      const isDeptHead = token?.role === 'DEPARTMENT_HEAD';
      const isTeamLead = token?.role === 'TEAM_LEAD';
      
      // Department Heads cannot access certain pages
      if (path.includes('/settings') && !isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
    
    // Personal routes
    if (path.startsWith('/my')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      
      // Check if user should have access to /my pages
      const hasPersonalAccess = shouldHavePersonalAccess(token);
      if (!hasPersonalAccess) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

function shouldHavePersonalAccess(token: any): boolean {
  // Corporate: All roles get personal pages (they're all employees)
  if (token?.tenant?.type === 'CORPORATE') {
    return true;
  }
  
  // Institution: Only students get personal pages
  if (token?.tenant?.type === 'INSTITUTION') {
    return token?.role === 'STUDENT';
  }
  
  // B2C: Always get personal pages
  if (token?.userType === 'INDIVIDUAL') {
    return true;
  }
  
  // Super Admin: Yes (can be assessed)
  if (token?.userType === 'SUPER_ADMIN') {
    return true;
  }
  
  return false;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/org/:path*',
    '/my/:path*',
    '/take/:path*'
  ]
};
```

---

