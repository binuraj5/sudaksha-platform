# IDE AGENT TASK PROMPT — SudakshaNWS Assessment Platform
**Project:** SudakshaNWS (Next.js + Supabase + RLS)
**Scope:** Assessment creation flows, competency-based assessment, component library with hierarchy-based RLS, error logging, system sanctity preservation

---

## CONTEXT & ARCHITECTURE

This is a multi-tenant SaaS education/training platform for Sudaksha Education Pvt. Ltd. built with:
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Row Level Security)
- **Auth:** Supabase Auth with role-based claims
- **Key routes:**
  - `/assessments/admin/models/create` — Tenant Admin assessment model creation
  - `/assessments/org/[orgSlug]/assessments/new` — Org-level assessment creation (e.g., `tnz-ict`)
- **Org hierarchy:** Tenant Admin → Department Head → Team Leader → Individual Employee
- **RLS pattern:** Polymorphic, role-based, hierarchy-aware (org → dept → team → individual)

---

## STEP 0 — READ FIRST

Before touching any code:

1. **Read the entire `/FSD` folder** (Functional Specification Documents). Understand the intended behavior for:
   - Assessment creation flow (3 paths: Role-based, Competency-based, Component-based)
   - Component Library structure and hierarchy
   - RLS policies for each actor

2. **Check Git log for last 36 hours:**
   ```bash
   git log --since="36 hours ago" --oneline --all
   git diff HEAD~10 HEAD --stat
   ```

3. **Read existing assessment creation pages:**
   - `app/assessments/admin/models/create/page.tsx`
   - `app/assessments/org/[orgSlug]/assessments/new/page.tsx`
   - All related components in `components/assessments/`

4. **Check Supabase migrations:**
   ```bash
   ls -la supabase/migrations/ | tail -20
   ```

5. **Read current RLS policies:**
   ```sql
   -- Run in Supabase SQL editor or via CLI:
   SELECT schemaname, tablename, policyname, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

---

## STEP 1 — ERROR LOGGING (DO THIS BEFORE ANY FIXES)

Create or update the file `SYSTEM_ERROR_LOG.md` in the project root with this structure:

```markdown
# SudakshaNWS System Error & Rectification Log

## Log Period: Last 36 Hours
_Auto-generated: [current date]_

### Errors Found

| # | Error | File/Location | Severity | Status |
|---|-------|---------------|----------|--------|
| 1 | [error description] | [file:line] | HIGH/MED/LOW | OPEN/FIXED |

### Rectifications Applied

| # | Fix Description | Files Changed | Date |
|---|-----------------|---------------|------|
| 1 | [what was fixed] | [files] | [date] |

### Ongoing Issues
- [any issues deferred]

### New Errors (append here continuously)
```

**Populate this log by:**
- Checking browser console errors in existing pages
- Running `npm run build` and capturing TypeScript/lint errors
- Checking Supabase logs for RLS failures (HTTP 403/42501 errors)
- Reviewing recent git commits for incomplete fixes

---

## STEP 2 — ASSESSMENT CREATION ENTRY POINT

### 2A. Assessment Type Selector (First Screen)

Both creation routes (`/admin/models/create` AND `/org/[orgSlug]/assessments/new`) must show a **3-option selector screen** BEFORE any form:

```
┌─────────────────────────────────────────────────────────┐
│           How would you like to create this assessment?  │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  📋 Role    │  │ 🎯 Competency│  │ 🧩 Components  │  │
│  │   Based     │  │    Based     │  │    Library     │  │
│  │             │  │              │  │                │  │
│  │ Select a    │  │ Choose one   │  │ Pick from pre- │  │
│  │ role, auto- │  │ or more      │  │ built question │  │
│  │ load its    │  │ competencies │  │ components in  │  │
│  │ competency  │  │ directly,    │  │ your library   │  │
│  │ framework   │  │ role-agnostic│  │ (org/dept/team)│  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**RLS-aware visibility:**
- All 3 options visible to: Tenant Admin, Dept Head, Team Leader
- Individual Employee: Cannot create assessments (hide page, redirect)
- The available roles/competencies/components fetched must be scoped to the user's org/dept/team

**Implementation:**
```typescript
// components/assessments/AssessmentTypeSelector.tsx
type AssessmentCreationType = 'role' | 'competency' | 'component';

interface AssessmentTypeSelectorProps {
  onSelect: (type: AssessmentCreationType) => void;
  userRole: 'tenant_admin' | 'dept_head' | 'team_leader';
  orgSlug: string;
}
```

State management: Use URL param `?mode=role|competency|component` so browser back button works correctly.

---

## STEP 3 — ROLE-BASED FLOW (VERIFY & FIX EXISTING)

The role-based creation is "almost ready and working." Do the following:

1. **Test it end-to-end** — create an assessment from a role, verify competencies load, verify questions generate
2. **Check RLS** — ensure a Dept Head can only see roles in their department, Team Leader only in their team
3. **Fix any broken states** (loading spinners stuck, empty dropdowns, TypeScript errors)
4. **Log all fixes** in `SYSTEM_ERROR_LOG.md`

Do NOT rebuild this — only fix what's broken.

---

## STEP 4 — COMPETENCY-BASED FLOW (CREATE NEW)

### 4A. Database — Verify/Create Tables

Check if these tables exist. Create via migration if missing:

```sql
-- Assessment competency mapping (role-agnostic)
CREATE TABLE IF NOT EXISTS assessment_competency_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) DEFAULT 100.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, competency_id)
);

-- Ensure competencies table has org_id, dept_id, team_id for hierarchy
ALTER TABLE competencies 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS dept_id UUID REFERENCES departments(id),
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id),
  ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;
```

### 4B. RLS Policies for Competencies

```sql
-- Users can see: global competencies + their org's + their dept's + their team's
CREATE POLICY "competencies_select_hierarchy" ON competencies
FOR SELECT USING (
  is_global = TRUE
  OR org_id IN (SELECT org_id FROM user_org_memberships WHERE user_id = auth.uid())
  OR dept_id IN (SELECT dept_id FROM user_dept_memberships WHERE user_id = auth.uid())
  OR team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid())
);

-- Only Tenant Admin can create global competencies
-- Dept Head can create dept-level competencies for their dept
-- Team Leader can create team-level competencies for their team
CREATE POLICY "competencies_insert_role_based" ON competencies
FOR INSERT WITH CHECK (
  CASE 
    WHEN is_global = TRUE THEN get_user_role(auth.uid()) = 'tenant_admin'
    WHEN dept_id IS NOT NULL THEN get_user_role(auth.uid()) IN ('tenant_admin', 'dept_head')
      AND dept_id IN (SELECT dept_id FROM user_dept_memberships WHERE user_id = auth.uid())
    WHEN team_id IS NOT NULL THEN get_user_role(auth.uid()) IN ('tenant_admin', 'dept_head', 'team_leader')
      AND team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid())
    ELSE FALSE
  END
);
```

### 4C. Competency Selector Component

```typescript
// components/assessments/CompetencyBasedAssessmentForm.tsx

/*
UI Flow:
1. Multi-select competency picker (searchable, grouped by: Global / Org / Dept / Team)
2. For each selected competency, show its behavioral indicators/sub-competencies
3. User sets weight per competency (optional, default equal weight)
4. Assessment settings (title, description, time limit, scoring method)
5. Question generation: 
   - Auto-generate from competency behavioral indicators
   - OR manually add questions mapped to competency indicators

Key features:
- Competencies fetched via RPC: get_accessible_competencies(user_id)
- Grouped display: Global | [Org Name] | [Dept Name] | [Team Name]
- Multi-select with weight assignment
- Real-time preview of selected competency framework
- Validation: at least 1 competency selected before proceeding
*/
```

**API/Server Action:**
```typescript
// app/actions/assessments/competency-based.ts

export async function getAccessibleCompetencies(orgSlug: string) {
  const supabase = createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // RLS handles filtering automatically
  const { data, error } = await supabase
    .from('competencies')
    .select(`
      id, name, description, is_global,
      org_id, dept_id, team_id,
      behavioral_indicators(id, name, description, proficiency_level),
      organizations(name),
      departments(name),
      teams(name)
    `)
    .order('is_global', { ascending: false })
    .order('name');
    
  return { data, error };
}

export async function createCompetencyBasedAssessment(formData: {
  title: string;
  description: string;
  orgSlug: string;
  competencyIds: string[];
  competencyWeights: Record<string, number>;
  settings: AssessmentSettings;
}) {
  // 1. Create assessment record with type = 'competency_based'
  // 2. Create assessment_competency_mappings records
  // 3. Auto-generate question sections per competency
  // 4. Return assessment id for redirect
}
```

### 4D. Competency-Based Assessment Form Page

Wire into the existing creation page:

```typescript
// In /assessments/org/[orgSlug]/assessments/new/page.tsx
// After type selection, render:

{selectedType === 'competency' && (
  <CompetencyBasedAssessmentForm 
    orgSlug={orgSlug}
    userRole={userRole}
    onSuccess={(assessmentId) => router.push(`/assessments/org/${orgSlug}/assessments/${assessmentId}`)}
  />
)}
```

---

## STEP 5 — COMPONENT LIBRARY FLOW (CREATE NEW)

### 5A. Component Library Concept

A **Component** is a reusable question block/section that can be:
- A set of questions for a specific skill/topic
- A standardized psychometric scale
- A custom question bank

### 5B. Database

```sql
-- Assessment Components Library
CREATE TABLE IF NOT EXISTS assessment_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  dept_id UUID REFERENCES departments(id),
  team_id UUID REFERENCES teams(id),
  is_global BOOLEAN DEFAULT FALSE,        -- Tenant Admin global components
  name VARCHAR(255) NOT NULL,
  description TEXT,
  component_type VARCHAR(50),             -- 'question_bank' | 'scale' | 'custom'
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_component_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES assessment_components(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50),              -- 'mcq' | 'rating' | 'text' | 'boolean'
  options JSONB,
  correct_answer JSONB,
  scoring_rubric JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment to Component mapping
CREATE TABLE IF NOT EXISTS assessment_component_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES assessment_components(id),
  order_index INTEGER DEFAULT 0,
  UNIQUE(assessment_id, component_id)
);
```

### 5C. RLS for Component Library

```sql
-- Hierarchy: Global (Tenant Admin) → Org → Dept → Team
-- Tenant Admin sees: ALL components
-- Dept Head sees: global + their org + their dept + sub-teams
-- Team Leader sees: global + their org + their dept + their team
-- Employee: No access to component library

CREATE POLICY "components_select_hierarchy" ON assessment_components
FOR SELECT USING (
  -- Tenant admin sees everything
  get_user_role(auth.uid()) = 'tenant_admin'
  OR (
    -- Others see global + their hierarchy
    is_global = TRUE
    OR org_id IN (SELECT org_id FROM user_org_memberships WHERE user_id = auth.uid())
    OR dept_id IN (
      SELECT dept_id FROM user_dept_memberships WHERE user_id = auth.uid()
      UNION
      -- Dept head sees sub-team components too
      SELECT d.id FROM departments d 
      WHERE d.parent_dept_id IN (
        SELECT dept_id FROM user_dept_memberships WHERE user_id = auth.uid()
      )
    )
    OR team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid())
  )
);

-- Create permissions: only admin/dept_head/team_leader
CREATE POLICY "components_insert_role_based" ON assessment_components
FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) IN ('tenant_admin', 'dept_head', 'team_leader')
  AND (
    CASE get_user_role(auth.uid())
      WHEN 'tenant_admin' THEN TRUE  -- can create at any level
      WHEN 'dept_head' THEN is_global = FALSE  -- cannot create global
        AND (dept_id IN (SELECT dept_id FROM user_dept_memberships WHERE user_id = auth.uid())
             OR org_id IN (SELECT org_id FROM user_org_memberships WHERE user_id = auth.uid()))
      WHEN 'team_leader' THEN is_global = FALSE AND dept_id IS NULL
        AND team_id IN (SELECT team_id FROM user_team_memberships WHERE user_id = auth.uid())
    END
  )
);
```

### 5D. Component Library Browser UI

```typescript
// components/assessments/ComponentLibraryBrowser.tsx

/*
UI:
- Left sidebar: Filter by level (Global / Org / Dept / Team), Type, Tags
- Main area: Grid/list of component cards showing:
  - Component name, description
  - Badge: GLOBAL | ORG | DEPT | TEAM
  - Question count
  - Add to Assessment button (+ drag to reorder)
- Selected components panel (right or bottom)
- Preview drawer: click component to see its questions

The "Add to Assessment" CTA creates an assessment_component_usage record.
*/
```

---

## STEP 6 — POLYMORPHIC RLS HELPER FUNCTIONS

Ensure these Postgres functions exist (create if missing):

```sql
-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's org IDs
CREATE OR REPLACE FUNCTION get_user_org_ids(user_id UUID)
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(org_id) FROM user_org_memberships WHERE user_id = $1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's dept IDs
CREATE OR REPLACE FUNCTION get_user_dept_ids(user_id UUID)
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(dept_id) FROM user_dept_memberships WHERE user_id = $1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's team IDs
CREATE OR REPLACE FUNCTION get_user_team_ids(user_id UUID)
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(team_id) FROM user_team_memberships WHERE user_id = $1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user can access an org
CREATE OR REPLACE FUNCTION user_can_access_org(user_id UUID, target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_org_memberships 
    WHERE user_id = $1 AND org_id = $2
  ) OR get_user_role($1) = 'tenant_admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## STEP 7 — SYSTEM INTEGRITY CHECKS

After all changes, verify:

### 7A. No Regressions
```bash
# TypeScript check
npx tsc --noEmit

# Build check  
npm run build

# Lint
npm run lint
```

### 7B. RLS Verification Script
Create `scripts/verify-rls.sql`:
```sql
-- Test as tenant admin
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"[tenant_admin_user_id]","role":"authenticated"}';
SELECT COUNT(*) as "Admin sees competencies" FROM competencies;
SELECT COUNT(*) as "Admin sees components" FROM assessment_components;

-- Test as dept head
SET LOCAL request.jwt.claims TO '{"sub":"[dept_head_user_id]","role":"authenticated"}';
SELECT COUNT(*) as "Dept Head sees competencies" FROM competencies;

-- Verify employee cannot create assessments  
-- (insert should fail with RLS violation)
```

### 7C. Route Guards
Ensure middleware or page-level auth checks:
```typescript
// In all assessment creation pages:
const allowedRoles = ['tenant_admin', 'dept_head', 'team_leader'];
if (!allowedRoles.includes(userRole)) {
  redirect('/dashboard?error=insufficient_permissions');
}
```

---

## STEP 8 — UPDATE ERROR LOG

After all fixes, update `SYSTEM_ERROR_LOG.md`:

```markdown
## Session: [Current Date] — Assessment Platform Enhancement

### Changes Made
1. Added AssessmentTypeSelector component (3-path selection)
2. Created CompetencyBasedAssessmentForm component
3. Created ComponentLibraryBrowser component  
4. Added DB migrations: assessment_competency_mappings, assessment_components, assessment_component_questions, assessment_component_usage
5. Added/updated RLS policies for competencies and components hierarchy
6. Added polymorphic RLS helper functions
7. Fixed [list any bugs found in role-based flow]

### New Tables
- assessment_competency_mappings
- assessment_components  
- assessment_component_questions
- assessment_component_usage

### New RLS Policies
- competencies_select_hierarchy
- competencies_insert_role_based
- components_select_hierarchy
- components_insert_role_based

### Files Modified
- app/assessments/admin/models/create/page.tsx
- app/assessments/org/[orgSlug]/assessments/new/page.tsx
- components/assessments/AssessmentTypeSelector.tsx (NEW)
- components/assessments/CompetencyBasedAssessmentForm.tsx (NEW)
- components/assessments/ComponentLibraryBrowser.tsx (NEW)
- app/actions/assessments/competency-based.ts (NEW)
- app/actions/assessments/component-library.ts (NEW)
- supabase/migrations/[timestamp]_assessment_competency_components.sql (NEW)
```

---

## CRITICAL CONSTRAINTS

1. **DO NOT** break the existing role-based assessment flow — only fix bugs, don't refactor working code
2. **DO NOT** remove any existing RLS policies — only ADD or AMEND
3. **DO NOT** change existing table schemas without migration files
4. **DO NOT** change auth flow or session management
5. All new Supabase queries must go through the server-side client (never expose service_role key to client)
6. All new components must be TypeScript with proper type definitions
7. Log EVERY error found and EVERY fix applied to `SYSTEM_ERROR_LOG.md`
8. All migrations must be idempotent (use `IF NOT EXISTS`, `IF NOT EXISTS` etc.)
9. Test each flow (Role → Competency → Component) before marking complete
10. Ensure the `orgSlug` from the URL is validated against the user's accessible orgs via RLS

---

## DELIVERABLES CHECKLIST

- [ ] `SYSTEM_ERROR_LOG.md` created/updated with all errors and fixes
- [ ] AssessmentTypeSelector component working on both creation routes
- [ ] Role-based flow: verified working, all bugs fixed
- [ ] Competency-based flow: fully functional, RLS enforced
- [ ] Component library flow: UI + DB + RLS implemented
- [ ] All migrations created and applied
- [ ] `npm run build` passes with no errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] RLS tested for all 3 actor levels (Tenant Admin, Dept Head, Team Leader)
- [ ] Individual Employee blocked from creation routes
- [ ] Previous assessment functionality unaffected

---

*Generated for SudakshaNWS by Sudaksha Education Pvt. Ltd.*
*Platform: Next.js + Supabase | Pattern: Polymorphic RLS + Hierarchy-based access*
