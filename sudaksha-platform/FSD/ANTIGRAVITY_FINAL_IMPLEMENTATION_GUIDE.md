# ANTIGRAVITY - FINAL IMPLEMENTATION GUIDE
## Complete Execution Plan for SudAssess Platform

**Target:** All 125 requirements implemented  
**Timeline:** 8 weeks (prioritized)  
**Approach:** Polymorphic, mobile-first, SEO-ready, modular

---

## 🎯 EXECUTIVE SUMMARY

### What You Have Now
✅ 36% Fully Implemented  
⚠️ 44% Partially Implemented  
Total: **80% backend ready**, 20% frontend missing

### What Needs Building
❌ Employee/Student Career Portal (30 requirements) - **CRITICAL**  
❌ Department/Team Dedicated Pages (8 requirements) - **HIGH**  
❌ Homepage & Pricing (6 requirements) - **HIGH**  
❌ Survey Module (4 requirements) - **MEDIUM**  
❌ AI Features (4 requirements) - **LOW**

---

## 📊 REQUIREMENTS BREAKDOWN

### Total: 125 Requirements

| Category | Count | Status |
|----------|-------|--------|
| **Repetitive (Polymorphic)** | 75 (60%) | ✅ Implement once, reuse |
| **Unique Features** | 50 (40%) | ❌ Need implementation |

### Repetitive Patterns

**Pattern 1: User Management (Reuse for all roles)**
- M1 (Corporate Admin) = Base implementation
- M2 (Dept Head) = M1 + scoped permissions
- M3 (Team Lead) = M1 + scoped permissions
- M5 (Institution Admin) = M1 + label changes
- M6 (Inst Dept Head) = M2 + label changes
- M7 (Class Teacher) = M3 + label changes

**Pattern 2: End-User Experience**
- M4 (Employee) = Base implementation
- M8 (Student) = M4 + curriculum feature + labels
- M15 (Individual B2C) = M4 - org features + self-service

**Pattern 3: Entity Management**
- Departments, Teams, Projects, Employees = Same CRUD logic
- Configuration-driven labels and fields

---

## 🗂️ REFERENCE DOCUMENTS

### Use These Documents

1. **COMPLETE_REQUIREMENTS_TABLE.md**
   - All 125 requirements in tabular format
   - Polymorphic mappings
   - Implementation priorities

2. **PRICING_AND_HOMEPAGE_SPEC.md**
   - Complete pricing model
   - Homepage design
   - Checkout flow
   - Billing database schema

3. **PRIORITIZED_ACTION_PLAN.md**
   - 4-week execution plan
   - Week-by-week deliverables
   - File structures

4. **REFINED_COMPETENCY_SYSTEM_LOGIC.md**
   - Assessment engine architecture
   - Role/Competency system
   - Dynamic indicator selection

5. **EXECUTIVE_SUMMARY_AND_QUICK_GUIDE.md**
   - High-level overview
   - Quick reference

---

## 🚀 8-WEEK IMPLEMENTATION PLAN

### **WEEK 1-2: Employee/Student Career Portal** 🔴 CRITICAL

**Goal:** Implement M4-2 through M4-9, mirror for M8, M15

**Files to Create:**
```
app/assessments/
├─ profile/
│  ├─ page.tsx (9-section career form)
│  └─ layout.tsx
├─ career/
│  ├─ page.tsx (career dashboard)
│  ├─ current-role/page.tsx
│  ├─ previous-roles/page.tsx
│  ├─ aspirational-role/page.tsx
│  └─ layout.tsx
└─ hierarchy/
   └─ page.tsx (org chart)

components/
├─ Profile/
│  ├─ ProfileForm.tsx (9 sections A-I)
│  ├─ ProfileSection.tsx
│  └─ ProfileSummary.tsx
├─ Career/
│  ├─ RoleSelector.tsx
│  ├─ RoleCard.tsx
│  ├─ GapAnalysis.tsx
│  ├─ GapChart.tsx
│  ├─ CompetencyManager.tsx
│  └─ DevelopmentPlan.tsx
└─ Hierarchy/
   ├─ OrgChart.tsx
   ├─ OrgNode.tsx
   └─ TeamInfo.tsx

app/api/
├─ profile/route.ts
├─ career/
│  ├─ roles/route.ts
│  ├─ competencies/route.ts
│  └─ gap-analysis/route.ts
└─ hierarchy/route.ts
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE - WEEK 1-2 EXECUTION]

Implement Employee/Student Career Portal with the following requirements:

REFERENCE DOCUMENTS:
- COMPLETE_REQUIREMENTS_TABLE.md (M4-2 through M4-9)
- PRIORITIZED_ACTION_PLAN.md (Week 1 details)
- COMPLETE_IMPLEMENTATION_PROMPT.txt (Part 4: Employee Self-Service Forms)

TASKS:
1. Create app/assessments/profile/page.tsx
   - 9-section career form (A: Employee Info, B: Responsibilities, C: Technical Competencies, D: Behavioral, E: Aspirational Role, F: Aspirational Technical, G: Aspirational Behavioral, H: Learning Preferences, I: Self-Assessment)
   - Form validation
   - Auto-save on section change
   - Progress indicator

2. Create app/assessments/career/page.tsx
   - My Current Role management (add/edit/delete)
   - My Previous Roles tracking
   - My Aspirational Role selection
   - Gap calculation (High/Medium/Low) with color coding
   - Self-assign competencies

3. Create app/assessments/hierarchy/page.tsx
   - Organization chart visualization
   - Show: Company → Department → Team → Employee
   - Display manager and team lead info

4. Create components/Career/GapAnalysis.tsx
   - Compare current vs aspirational role competencies
   - Calculate proficiency gaps:
     * HIGH: 0-40% proficiency (red)
     * MEDIUM: 41-70% proficiency (yellow)
     * LOW: 71-100% proficiency (green)
   - Display top 5 priority gaps
   - Recommend assessments to close gaps

5. Create API endpoints:
   - GET /api/profile
   - PATCH /api/profile
   - GET /api/career/roles (current, previous, aspirational)
   - POST /api/career/roles
   - GET /api/career/gap-analysis

DATABASE:
Use existing models:
- members table (profile data)
- roles table (career roles)
- competencies table (skills)
- organization_units table (hierarchy)

Add new columns to members table:
- currentRoleId (FK to roles)
- aspirationalRoleId (FK to roles)
- previousRoles (JSONB array)
- careerFormData (JSONB for 9 sections)

REUSABILITY:
- Same components work for Employees (M4), Students (M8), and B2C Users (M15)
- Use tenant context to show/hide org hierarchy
- Dynamic labels based on user type

SUCCESS CRITERIA:
✓ Employee can fill 9-section career form
✓ Can manage current/previous/aspirational roles
✓ Gap analysis shows color-coded competency gaps
✓ Can self-assign competencies
✓ Same components work for students and B2C users

Execute autonomously. Report progress daily.
```

---

### **WEEK 3-4: Department/Team Pages & Homepage** 🟡 HIGH

**Goal:** Implement M1-4, M1-7 dedicated pages + Homepage + Pricing

**Files to Create:**
```
app/clients/[clientId]/
├─ departments/
│  ├─ page.tsx (list)
│  ├─ [deptId]/
│  │  ├─ page.tsx (dashboard)
│  │  ├─ teams/page.tsx
│  │  ├─ employees/page.tsx
│  │  └─ analytics/page.tsx
│  └─ create/page.tsx
├─ teams/
│  ├─ page.tsx (list)
│  ├─ [teamId]/
│  │  ├─ page.tsx (dashboard)
│  │  ├─ members/page.tsx
│  │  └─ analytics/page.tsx
│  └─ create/page.tsx
└─ roles/
   ├─ page.tsx (list: Global + Tenant)
   ├─ request/page.tsx
   └─ my-requests/page.tsx

app/(marketing)/
├─ page.tsx (homepage)
├─ features/page.tsx
├─ pricing/page.tsx
└─ about/page.tsx

components/marketing/
├─ Hero.tsx
├─ FeatureGrid.tsx
├─ PricingCards.tsx
├─ PricingCalculator.tsx
├─ Testimonials.tsx
└─ Footer.tsx
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE - WEEK 3-4 EXECUTION]

PART A: Department & Team Management Pages

REFERENCE: COMPLETE_REQUIREMENTS_TABLE.md (M1-4, M1-7)

TASKS:
1. Create app/clients/[clientId]/departments/page.tsx
   - List all departments with stats
   - Search and filters
   - Create department button
   - Department cards (grid view)
   - Each card shows: Name, HoD, Teams count, Employees count, Projects count

2. Create app/clients/[clientId]/departments/[deptId]/page.tsx
   - Department dashboard
   - KPI cards (Teams, Employees, Projects, Avg Performance)
   - Team list
   - Employee list
   - Performance charts
   - Actions: Edit, Delete, View Analytics

3. Create app/clients/[clientId]/teams/page.tsx
   - Similar to departments
   - Filter by department
   - Team cards with Team Lead info

4. Create app/clients/[clientId]/teams/[teamId]/page.tsx
   - Team dashboard
   - Member list
   - Add/remove members
   - Assign assessments
   - Team performance metrics

5. Integrate existing dialogs:
   - CreateDepartmentDialog.tsx
   - CreateTeamDialog.tsx
   - Keep these, link from pages

PART B: Homepage & Pricing

REFERENCE: PRICING_AND_HOMEPAGE_SPEC.md

TASKS:
1. Create app/(marketing)/page.tsx
   - Hero section with CTA
   - Features preview (6 cards)
   - Pricing teaser (3 plans)
   - Social proof / testimonials
   - Final CTA
   - Footer

2. Create app/(marketing)/pricing/page.tsx
   - Pricing table (Starter, Growth, Business, Enterprise)
   - Add-on features with checkboxes
   - Billing period selector (Monthly, Quarterly, Semi-Annual, Annual)
   - Discount calculations
   - Total price calculation
   - "Start Free Trial" buttons
   - Feature comparison table

3. Create components/marketing/PricingCalculator.tsx
   - Interactive pricing calculator
   - User count slider
   - Feature checkboxes
   - Billing period toggle
   - Real-time price update
   - Formula:
     BASE × SCALE_MULTIPLIER × FEATURE_MULTIPLIER × DURATION_DISCOUNT

4. SEO Optimization:
   - Add metadata to all pages
   - OpenGraph tags
   - Structured data (Schema.org)
   - Sitemap.xml generation

SUCCESS CRITERIA:
✓ Departments have dedicated management pages
✓ Teams have dedicated management pages
✓ Homepage loads in <1s
✓ Pricing calculator works correctly
✓ All pages are mobile-responsive
✓ SEO score >90 on Lighthouse

Execute autonomously. Report when complete.
```

---

### **WEEK 5-6: Dynamic Labels, RBAC, Survey Module** 🟡 MEDIUM

**Goal:** Implement institution-specific UI, granular permissions, survey system

**Files to Create:**
```
lib/
├─ tenant-labels.ts (label configuration)
├─ permissions/
│  ├─ check-scope.ts
│  ├─ rbac-middleware.ts
│  └─ permission-gates.tsx
└─ rls-policies.sql

hooks/
├─ useTenantLabels.ts
└─ usePermissions.ts

app/clients/[clientId]/surveys/
├─ page.tsx (list)
├─ create/page.tsx (wizard)
├─ [surveyId]/
│  ├─ page.tsx (results)
│  ├─ questions/page.tsx
│  └─ edit/page.tsx
└─ templates/page.tsx

app/clients/[clientId]/curriculum/
├─ page.tsx (for institutions only)
├─ [programId]/page.tsx
└─ topics/[topicId]/page.tsx
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE - WEEK 5-6 EXECUTION]

PART A: Dynamic Label System

TASKS:
1. Create lib/tenant-labels.ts
   - Label configuration for CORPORATE, INSTITUTION, SYSTEM
   - Export: { member, memberPlural, orgUnit, subUnit, activity }

2. Create hooks/useTenantLabels.ts
   - React hook to access labels
   - Automatically detects tenant type
   - Returns appropriate labels

3. Update all components to use dynamic labels
   - Replace hard-coded "Employee" with labels.member
   - Replace "Project" with labels.activity
   - etc.

4. Files to update:
   - app/clients/[clientId]/employees/page.tsx
   - app/clients/[clientId]/projects/page.tsx
   - app/clients/[clientId]/teams/page.tsx
   - All navigation components
   - Dashboard cards

PART B: Granular RBAC

REFERENCE: PRIORITIZED_ACTION_PLAN.md (Week 4)

TASKS:
1. Create prisma/rls-policies.sql
   - Row-Level Security policies for PostgreSQL
   - Department Head: Can only see own department data
   - Team Lead: Can only see own team data

2. Create lib/permissions/check-scope.ts
   - Middleware to enforce scope
   - Query filters based on user role and scope

3. Update API routes with permission checks
   - Add scope filtering to all queries
   - Example: Department Head can only query `WHERE orgUnitId = user.managedOrgUnitId`

PART C: Survey Module

REFERENCE: COMPLETE_REQUIREMENTS_TABLE.md (M16-M19)

TASKS:
1. Create survey database tables:
   - surveys
   - survey_questions
   - survey_assignments
   - survey_responses

2. Create app/clients/[clientId]/surveys/create/page.tsx
   - 5-step wizard:
     * Basic Info (name, description, purpose)
     * Add Questions (manual, from question bank, bulk upload)
     * Scoring Configuration (optional)
     * Settings (anonymous, time limit, dates)
     * Personalization (branding, emails)

3. Create survey response interface
   - One question per screen on mobile
   - Progress indicator
   - Auto-save responses
   - Submit & thank you page

4. Create survey results dashboard
   - Response rate
   - Score distribution
   - Question-by-question analysis
   - Department/Team breakdown
   - Export to PDF/Excel/CSV

PART D: Curriculum Hierarchy (Institution-specific)

REFERENCE: COMPLETE_REQUIREMENTS_TABLE.md (M8-11)

TASKS:
1. Create curriculum_nodes table
   - Hierarchy: Program → Department → Subject → Topic
   - Use ltree for efficient queries

2. Create app/clients/[clientId]/curriculum/page.tsx
   - Tree view of curriculum
   - Add/edit/delete nodes
   - Link assessments to topics

3. Show in institution tenants only
   - Feature flag: tenant.features.hasCurriculum
   - Hide from corporate tenants

SUCCESS CRITERIA:
✓ Labels change based on tenant type (Corporate vs Institution)
✓ Department Heads can only see their department
✓ Team Leads can only see their team
✓ Survey creation wizard works
✓ Survey responses collected and analyzed
✓ Curriculum hierarchy working for institutions

Execute autonomously. Report when complete.
```

---

### **WEEK 7-8: Billing Integration & Polish** 🟢 FINAL

**Goal:** Implement Stripe checkout, feature gates, usage dashboard, final polish

**Files to Create:**
```
app/api/
├─ checkout/
│  ├─ create-session/route.ts
│  └─ webhook/route.ts
├─ subscriptions/
│  ├─ route.ts
│  ├─ activate/route.ts
│  └─ cancel/route.ts
└─ usage/
   └─ track/route.ts

app/(admin)/admin/
├─ usage-analytics/page.tsx
└─ billing/page.tsx

lib/
├─ stripe.ts
├─ feature-gates.ts
└─ usage-tracker.ts

middleware.ts (enhance with feature checks)
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE - WEEK 7-8 EXECUTION]

PART A: Stripe Integration

REFERENCE: PRICING_AND_HOMEPAGE_SPEC.md

TASKS:
1. Create subscription database tables (see PRICING_AND_HOMEPAGE_SPEC.md):
   - subscriptions
   - invoices
   - usage_records
   - feature_activations

2. Create app/api/checkout/create-session/route.ts
   - Accept: { planType, features[], billingPeriod, userCount }
   - Calculate total price
   - Create Stripe Checkout Session
   - Return: { sessionId, checkoutUrl }

3. Create app/api/checkout/webhook/route.ts
   - Handle Stripe webhooks:
     * checkout.session.completed → Activate subscription
     * invoice.payment_succeeded → Record payment
     * invoice.payment_failed → Send notification
     * customer.subscription.deleted → Cancel subscription
   - Verify webhook signature
   - Update database
   - Send confirmation emails

4. Create subscription activation logic:
   - Update tenant.features with selected features
   - Create feature_activation records
   - Set expiration dates
   - Send welcome email

PART B: Feature Gates

TASKS:
1. Create lib/feature-gates.ts
   - hasFeatureAccess(tenantId, featureKey): Promise<boolean>
   - Check feature_activations table
   - Verify not expired

2. Update middleware.ts
   - Check feature access before allowing action
   - Return 403 if feature not active

3. Add UI gates:
   - Show "Upgrade" button for locked features
   - Disable buttons for unavailable features
   - Display upgrade modal

PART C: Usage Tracking

TASKS:
1. Create lib/usage-tracker.ts
   - trackUsage(tenantId, resourceType, quantity)
   - Insert into usage_records table
   - Check if over limit
   - Send warning emails at 80%, 100%, 120%

2. Track usage for:
   - Assessments taken
   - Code tests run
   - AI voice interviews
   - Survey responses

3. Create app/(admin)/admin/usage-analytics/page.tsx
   - List all tenants
   - Show: Plan, Users, Features, Assessments Used, Revenue
   - Filters: Date range, Tenant type, Plan
   - Charts: MRR trend, Assessment volume, Feature adoption
   - Export to CSV

PART D: Final Polish

TASKS:
1. Mobile responsiveness
   - Test all pages on mobile
   - Fix any layout issues
   - Optimize touch targets (min 44px)

2. Performance optimization
   - Lazy load heavy components
   - Image optimization (WebP, lazy loading)
   - Code splitting
   - Database query optimization (indexes)

3. SEO final checks
   - All public pages have metadata
   - Sitemap.xml generated
   - Robots.txt configured
   - Structured data added
   - Lighthouse score >90

4. Testing
   - Unit tests for critical functions
   - Integration tests for API routes
   - E2E tests for key user flows:
     * Login → Dashboard → Create Assessment → Assign → Take → View Results
     * Signup → Select Plan → Checkout → Features Active

5. Documentation
   - Update README.md
   - API documentation (Swagger/OpenAPI)
   - User guides (Admin, Employee)

SUCCESS CRITERIA:
✓ Stripe checkout works end-to-end
✓ Features activate after payment
✓ Feature gates prevent access to unpaid features
✓ Usage tracked and displayed in admin dashboard
✓ All pages mobile-responsive
✓ Lighthouse score >90
✓ All critical tests passing

Execute autonomously. Report when complete.
```

---

## 📋 VALIDATION CHECKLIST

### After Each Week

- [ ] All files created as specified
- [ ] All API endpoints tested
- [ ] All UI components rendered correctly
- [ ] Mobile-responsive verified
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse score >90 (for public pages)
- [ ] Demo video recorded

### Final Acceptance

- [ ] All 125 requirements implemented
- [ ] Employee career portal works for Employees, Students, B2C
- [ ] Department & Team pages functional
- [ ] Homepage & Pricing pages live
- [ ] Dynamic labels work (Corporate vs Institution)
- [ ] Granular RBAC enforced (Dept Head, Team Lead scopes)
- [ ] Survey module complete
- [ ] Stripe checkout functional (but disabled for pilot)
- [ ] Feature gates in place (but all enabled for pilot)
- [ ] Usage tracking background job running
- [ ] Super Admin usage dashboard operational
- [ ] All tests passing
- [ ] Documentation complete

---

## 🎯 KEY REMINDERS

### Polymorphic Implementation

**DO:**
- ✅ Use same tables (members, activities, organization_units)
- ✅ Use configuration for labels
- ✅ Use permission-based UI rendering
- ✅ Test once, works everywhere

**DON'T:**
- ❌ Create separate tables for Employee vs Student
- ❌ Hard-code labels
- ❌ Duplicate components
- ❌ Use if/else for tenant types (use config instead)

### Mobile-First

**DO:**
- ✅ Design for mobile first, scale up
- ✅ Touch targets 44x44px minimum
- ✅ Test on real devices
- ✅ Progressive web app features

**DON'T:**
- ❌ Assume desktop-first
- ❌ Small touch targets
- ❌ Horizontal scrolling on mobile

### SEO

**DO:**
- ✅ Server-side render (Next.js App Router)
- ✅ Semantic HTML
- ✅ Meta tags on every page
- ✅ Fast loading (<2s)

**DON'T:**
- ❌ Client-side only rendering
- ❌ Missing meta tags
- ❌ Slow page loads

### Performance

**DO:**
- ✅ Database indexes on frequently queried columns
- ✅ Caching (Redis for hot data)
- ✅ Code splitting
- ✅ Lazy loading

**DON'T:**
- ❌ N+1 query problems
- ❌ Large bundle sizes
- ❌ Unoptimized images

---

## 🚀 START IMPLEMENTATION NOW

### Immediate Next Steps

1. **Read All Reference Documents**
   - COMPLETE_REQUIREMENTS_TABLE.md
   - PRICING_AND_HOMEPAGE_SPEC.md
   - PRIORITIZED_ACTION_PLAN.md

2. **Set Up Development Environment**
   ```bash
   git checkout -b feature/complete-implementation
   npm install
   npx prisma generate
   ```

3. **Begin Week 1 Tasks**
   - Copy Week 1-2 prompt to AntiGravity
   - Monitor progress
   - Review code daily

4. **Maintain Momentum**
   - Commit daily
   - Demo weekly
   - Adjust plan as needed

---

## 📞 SUPPORT

If you encounter blockers:
1. Review reference documents
2. Check existing codebase for patterns
3. Ask clarifying questions with context
4. Share error messages and logs

---

**LET'S BUILD AN AMAZING PLATFORM! 🎉**

Execute autonomously, iterate quickly, deliver excellence.

---

END OF ANTIGRAVITY IMPLEMENTATION GUIDE
