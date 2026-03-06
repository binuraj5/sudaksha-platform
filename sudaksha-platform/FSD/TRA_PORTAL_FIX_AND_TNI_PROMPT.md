# TRA PORTAL — SKILL GAP ANALYSIS, TNI & RESULTS IMPLEMENTATION
## Claude Code Agent Prompt — SudakshaNWS / SudAssess Portal

---

## ⚠️ MANDATORY PRE-READ — DO NOT SKIP

Before writing, changing, or creating a single line of code, read these files **in full**:

1. `MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md` — assessment engine architecture, IRT logic, component/model structure
2. `ROLES_COMPETENCIES_RLS_POLYMORPHIC.md` — role hierarchy, RLS policies, polymorphic tenancy rules
3. `CURSOR_REUSE_COMPONENTS_INSTRUCTION.md` — component reuse rules, do not duplicate UI

Then run:
```bash
git log --since="7 days ago" --oneline --all
npm run build 2>&1 | head -60
```

Read the output of both. Understand what has changed recently and what is currently broken before touching anything.

---

## SCOPE — READ THIS CAREFULLY

You are fixing **exactly 6 things** in priority order. Nothing else.

- ❌ No new features beyond what is listed
- ❌ No design changes, no UI redesigns, no colour changes
- ❌ No refactoring of working code
- ❌ No dependency upgrades
- ❌ No "while I'm here" improvements
- ✅ Fix only what is listed below
- ✅ Document every single change in `SYSTEM_ERROR_LOG.md`

If you encounter something broken that is NOT on this list — log it in `SYSTEM_ERROR_LOG.md` under "Deferred Issues" and leave it alone.

---

## CONTEXT — WHAT THIS DELIVERS

The Tanzania Revenue Authority (TRA) ICT Department is Sudaksha's active client. This week, TRA staff will:

1. Log in to the portal
2. Select their current role
3. Complete a self-assessment (rating their own proficiency against each competency)
4. Sudaksha admin will view all results and export them
5. Sudaksha will produce a Skill Gap Analysis report and a Training Needs Index (TNI) for TRA

Every fix below directly enables this workflow. Nothing on this list is optional.

---

## DELIVERABLE OVERVIEW

The portal must produce data that feeds these TRA report sections:

| Report Section | Portal Requirement |
|---|---|
| Individual Skill Gap Profile | Per-employee: competency scores + gap scores + priority flags |
| Departmental Gap Summary | Aggregate across all ICT staff: average gap per competency, ranked |
| Training Needs Index (TNI) | Competency gap → training programme → priority → cohort size |
| CSV Export | Downloadable file for offline analysis and report compilation |

---

## GAP CALCULATION LOGIC — UNDERSTAND THIS FIRST

This is the core computation that underpins items 3, 4, and 5. Implement it exactly.

```
Gap Score = Required Level (from competency framework, set by admin for the role)
            MINUS
            Self-Assessment Score (submitted by the employee)

Priority Flag:
  Gap Score ≥ 2  → HIGH   (critical gap, immediate training needed)
  Gap Score = 1  → MEDIUM (developing gap, training recommended)
  Gap Score = 0  → NONE   (at required level)
  Gap Score < 0  → EXCEEDS (above required level — flag as strength)

Scale: 0–4  (maps to JUNIOR=0, DEVELOPING=1, PROFICIENT=2, ADVANCED=3, EXPERT=4)
       OR 1–5 if that is what the existing schema uses — match whatever is already in the DB
```

**Do not invent a new scale.** Read the existing `competency_levels` or equivalent table/enum in the schema and use whatever scale is already defined. The formula above applies regardless of the exact scale values.

---

## THE 6 FIXES — IN PRIORITY ORDER

---

### FIX 1 (P0 — CRITICAL): Verify Full Employee Workflow End-to-End

**What it is:** The complete flow from a new employee logging in to viewing their competency scores must work without any errors, crashes, or data loss.

**The flow to verify:**
```
Employee logs in
  → Lands on dashboard or onboarding screen
  → Selects / confirms their current role (from the role list defined by admin)
  → Is presented with their assigned assessment
  → Completes all sections of the self-assessment
  → Submits the assessment
  → Lands on a results/scores page showing their competency scores
```

**How to verify:**
1. Create a test employee user in the TRA tenant
2. Assign them a role that has a competency framework attached
3. Walk through the entire flow above as that user
4. At every step, check: does the UI render? Are there console errors? Is data being saved?

**What to fix:**
- Any step in the above flow that crashes, redirects incorrectly, shows a blank page, or loses data
- Focus on the path: `onboarding → role selection → assessment start → section completion → submission → results view`
- Check that `assessment_responses` (or equivalent table) is being written to the DB at each section save point
- Check that after submission, the employee's scores are readable from the DB

**Acceptance criterion:** A test employee user can complete the entire flow above from login to results page without any error. Scores are visible in the DB and on-screen.

---

### FIX 2 (P0 — CRITICAL): Fix Multi-Section Assessment Resume Bug

**What it is:** When an employee exits mid-assessment (browser close, refresh, session timeout) and returns, they must resume exactly where they left off. No responses should be lost.

**The known bug:** Completing Section 1 and then navigating away causes progress loss when returning to Section 2 (ADAPTIVE_AI component). This is documented in the existing bug log.

**Root cause area to investigate:**
- Assessment session state is not being persisted to the DB between sections
- The resume logic is either missing or reads stale state
- Section 2 start logic does not check for existing partial progress

**What to build/fix:**

**A. Session persistence on section completion:**
```typescript
// On completing each section, immediately write state to DB:
// - current_section_index
// - completed_sections: string[] (list of completed section IDs)
// - responses: all answers submitted so far
// - last_saved_at: timestamp
// This record must exist in the DB before the user moves to the next section
```

**B. Resume API:**
```
GET /api/assessments/[assignmentId]/resume
Response: {
  canResume: boolean,
  resumeFromSection: number,         // 0-indexed section to resume at
  completedSections: string[],       // sections already done
  savedResponses: Record<string, any> // existing answers to pre-populate
}
```

**C. Assessment runner resume logic:**
```typescript
// On mounting the assessment runner:
// 1. Call the resume API
// 2. If canResume = true, jump to resumeFromSection
// 3. Pre-populate any savedResponses for the current section
// 4. Do NOT restart from Section 1 if Sections 1+ are already complete
```

**D. Smart retry — only retry the failed section:**
- If Section 1 is complete and Section 2 failed to start, resume at Section 2
- Never re-run a completed section unless explicitly requested

**Acceptance criterion:**
1. Employee completes Section 1, closes browser
2. Employee reopens browser, navigates to their assessment
3. Assessment opens at Section 2 (not Section 1)
4. Section 1 responses are preserved and visible in the DB
5. Employee completes Section 2 and submits
6. Final scores reflect responses from both sections

---

### FIX 3 (P1 — HIGH): Verify and Fix Gap Score Calculation Display

**What it is:** Every employee's results view must show the gap calculation clearly. This is the core output Sudaksha needs to compile the TRA report.

**Required display per competency row:**

| Competency Name | Required Level | Self-Assessment Score | Gap Score | Priority |
|---|---|---|---|---|
| Network Security | 3 (ADVANCED) | 2 (PROFICIENT) | 1 | MEDIUM |
| TCP/IP Protocols | 3 (ADVANCED) | 1 (DEVELOPING) | 2 | HIGH |
| Documentation | 2 (PROFICIENT) | 3 (ADVANCED) | -1 | EXCEEDS |

**Where this must appear:**
- Employee results page (employee sees their own gap profile)
- Admin results view (built in Fix 4)

**Steps:**
1. Check if gap score is currently being calculated anywhere in the codebase. Search for: `gap`, `gapScore`, `required_level`, `gap_score` in the results/scoring files
2. If it exists but displays incorrectly — fix the calculation
3. If it does not exist — add the calculation:

```typescript
// Gap score calculation function
function calculateGap(requiredLevel: number, selfAssessmentScore: number) {
  const gap = requiredLevel - selfAssessmentScore
  const priority =
    gap >= 2 ? 'HIGH' :
    gap === 1 ? 'MEDIUM' :
    gap === 0 ? 'NONE' :
    'EXCEEDS'
  return { gap, priority }
}
```

4. Add this calculation to the results query/API — it should be computed server-side and returned in the results API response, not calculated in the browser

**Database:** The gap score does NOT need to be stored as a column — it is derived. Compute it on query from `required_level` (on the competency/role framework) and `self_assessment_score` (on the response record).

**Acceptance criterion:** Employee results page shows a table with all competencies, required level, self-assessment score, gap score, and priority flag. Numbers are correct (verified manually against the formula).

---

### FIX 4 (P1 — HIGH): Build Admin Results View

**What it is:** TenantAdmin and DepartmentHead must be able to see all employee assessment results in one place, filterable by department and role.

**Route:**
```
/assessments/admin/results           (TenantAdmin — sees all departments)
/assessments/org/[slug]/results      (DepartmentHead — sees their department only)
```

If these routes already exist in some form, verify and fix them. If they do not exist, create them.

**Page layout:**

```
HEADER: "Assessment Results — TRA ICT Department"
        Subtitle: "X employees assessed | Assessment: [name] | Last updated: [date]"

FILTERS ROW:
  [Department dropdown]  [Role dropdown]  [Priority filter: ALL / HIGH / MEDIUM / NONE]  [Search by name]

RESULTS TABLE:
  Columns:
    Employee Name | Role | Department | Assessment Status | Overall Gap Score | Priority | Actions

  Row expand (click employee name):
    → Shows competency-level breakdown:
      Competency | Required | Score | Gap | Priority

SUMMARY PANEL (above table or sidebar):
  Total assessed: X
  With HIGH priority gaps: X
  With MEDIUM priority gaps: X
  At or above required level: X
  Top 3 skill gaps (by frequency): [competency], [competency], [competency]
```

**Data requirements:**
- Query all employees in the tenant (filtered by dept/role if selected)
- For each employee: their assessment completion status and their gap scores
- For the summary panel: aggregate counts and top gaps by frequency

**RLS rules — critical:**
- TenantAdmin: sees ALL employees in their tenant. No cross-tenant data ever.
- DepartmentHead: sees ONLY employees in their department. Enforced at RLS level AND at query level.
- Neither role can see employees from other tenants.
- Read the existing RLS policies before writing any query. Do not bypass RLS.

**Acceptance criterion:** TenantAdmin logs in, navigates to results, sees all assessed employees, can filter by department and role, can click an employee to see their competency-level gap breakdown.

---

### FIX 5 (P2 — MEDIUM): Add CSV Export of Results

**What it is:** From the admin results view (Fix 4), the admin can download all results as a CSV file.

**Route:**
```
GET /api/assessments/export/csv?tenantId=[id]&departmentId=[optional]&roleId=[optional]
```

**CSV columns — exactly these, in this order:**

```
Employee Name, Employee ID, Department, Role, Assessment Name, Assessment Date,
Competency Name, Competency Category, Required Level, Self-Assessment Score,
Gap Score, Priority
```

**One row per competency per employee.** If an employee has 8 competencies assessed, they produce 8 rows in the CSV.

**Example rows:**
```csv
Employee Name,Employee ID,Department,Role,Assessment Name,Assessment Date,Competency Name,Competency Category,Required Level,Self-Assessment Score,Gap Score,Priority
John Mwangi,TRA-001,Network Operations,Network Administrator,TRA ICT Skill Gap Assessment,2025-03-10,Network Security,Technical,3,1,2,HIGH
John Mwangi,TRA-001,Network Operations,Network Administrator,TRA ICT Skill Gap Assessment,2025-03-10,TCP/IP Protocols,Technical,3,2,1,MEDIUM
John Mwangi,TRA-001,Network Operations,Network Administrator,TRA ICT Skill Gap Assessment,2025-03-10,Communication,Behavioural,2,3,-1,EXCEEDS
```

**Implementation:**
```typescript
// API route: /api/assessments/export/csv/route.ts
// 1. Verify caller is TenantAdmin or DepartmentHead (RLS check)
// 2. Query all employee results with gap calculations
// 3. Flatten to one row per competency per employee
// 4. Build CSV string using a simple join (no library needed for basic CSV)
// 5. Return with headers:
//    Content-Type: text/csv
//    Content-Disposition: attachment; filename="TRA_ICT_Skill_Gap_[date].csv"
```

**Download button:** Add a "Download CSV" button to the admin results view (Fix 4). On click, it calls the export API and triggers browser download.

**Acceptance criterion:** Admin clicks "Download CSV", browser downloads a file, file opens in Excel with correct columns, one row per competency per employee, gap scores and priorities correct.

---

### FIX 6 (P3 — LOWER PRIORITY, BUILD IF TIME ALLOWS): TNI Auto-Generation Page

**What it is:** A page that automatically aggregates all gap data into a Training Needs Index — grouped by competency gap, ranked by priority × cohort size.

**This fix is lower priority than 1–5. Only build it after all of 1–5 are working and verified.**

**Route:**
```
/assessments/admin/tni               (TenantAdmin)
/assessments/org/[slug]/tni          (DepartmentHead)
```

**TNI Logic — implement exactly:**

```typescript
// Step 1: Get all employee gap scores (from Fix 3 data)
// Step 2: Group by competency
// Step 3: For each competency group, calculate:
//   - averageGap: mean gap score across all employees with that competency
//   - affectedCount: number of employees with gap > 0
//   - highPriorityCount: employees with gap ≥ 2
//   - tniScore: averageGap × affectedCount  (higher = more urgent)
// Step 4: Sort by tniScore descending — highest priority at top
// Step 5: For each competency in the sorted list, map to a training programme recommendation
```

**TNI Table Display:**

| Rank | Competency | Category | Avg Gap | Affected | High Priority | TNI Score | Recommended Training | Duration | Mode |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Network Security | Technical | 2.4 | 8 | 6 | 19.2 | Network Security Fundamentals | 3 days | Classroom |
| 2 | Leadership | Behavioural | 1.8 | 10 | 4 | 18.0 | Leadership Essentials | 2 days | Blended |

**Training Programme Mapping:**
For now, use a static lookup table mapping competency names to training programme recommendations. Seed it with the TRA ICT competency list. This will be made dynamic (AI-driven) in a later release.

```typescript
// /lib/training-recommendations.ts
export const trainingProgrammeMap: Record<string, {
  programme: string,
  duration: string,
  mode: 'Classroom' | 'Online' | 'Blended',
  provider: string,
  expectedOutcome: string
}> = {
  'Network Security': {
    programme: 'Network Security Fundamentals & Advanced Threat Management',
    duration: '3 days',
    mode: 'Classroom',
    provider: 'Sudaksha',
    expectedOutcome: 'Ability to identify, prevent, and respond to network threats'
  },
  'TCP/IP Protocols': {
    programme: 'Networking Fundamentals — TCP/IP & Routing',
    duration: '2 days',
    mode: 'Blended',
    provider: 'Sudaksha',
    expectedOutcome: 'Proficiency in TCP/IP configuration and troubleshooting'
  },
  'Database Design': {
    programme: 'Database Architecture & Design Principles',
    duration: '3 days',
    mode: 'Classroom',
    provider: 'Sudaksha',
    expectedOutcome: 'Ability to design normalised, performant database schemas'
  },
  'SQL/NoSQL': {
    programme: 'Advanced SQL & NoSQL Database Management',
    duration: '4 days',
    mode: 'Blended',
    provider: 'Sudaksha',
    expectedOutcome: 'Proficiency in writing complex queries and managing NoSQL stores'
  },
  'Cybersecurity Operations': {
    programme: 'Cybersecurity Operations Centre (SOC) Fundamentals',
    duration: '5 days',
    mode: 'Classroom',
    provider: 'Sudaksha',
    expectedOutcome: 'Ability to operate security monitoring tools and respond to incidents'
  },
  'Cloud Architecture': {
    programme: 'Cloud Solutions Architecture — AWS/Azure Fundamentals',
    duration: '4 days',
    mode: 'Online',
    provider: 'Sudaksha',
    expectedOutcome: 'Ability to design and deploy cloud-based solutions'
  },
  'Project Management': {
    programme: 'IT Project Management Essentials',
    duration: '3 days',
    mode: 'Classroom',
    provider: 'Sudaksha',
    expectedOutcome: 'Ability to plan, execute, and close IT projects on time and on budget'
  },
  'Communication': {
    programme: 'Professional Communication for ICT Professionals',
    duration: '2 days',
    mode: 'Blended',
    provider: 'Sudaksha',
    expectedOutcome: 'Clear written and verbal communication in technical and stakeholder contexts'
  },
  'Leadership': {
    programme: 'Technical Leadership & Team Management',
    duration: '2 days',
    mode: 'Blended',
    provider: 'Sudaksha',
    expectedOutcome: 'Ability to lead technical teams, set direction, and manage performance'
  },
  // Add more as needed — fallback for unmapped competencies:
  'DEFAULT': {
    programme: 'Competency Development Programme (customised)',
    duration: 'TBD',
    mode: 'Blended',
    provider: 'Sudaksha',
    expectedOutcome: 'Targeted skill development for identified gap'
  }
}
```

**PDF/Print export:** Add a "Print TNI Report" button. On click, use `window.print()` with a print-optimised CSS class. The TNI table must print cleanly on A4 paper. No PDF library needed.

**Acceptance criterion:** Admin navigates to TNI page. All competency gaps are aggregated and ranked by TNI score. Training programme is shown for each row. Print button produces a printable page.

---

## DATABASE — WHAT TO CHECK BEFORE WRITING ANY QUERY

Before writing any new database query or migration, do this:

```bash
# Check current schema
cat prisma/schema.prisma | grep -A 20 "model Assessment"
cat prisma/schema.prisma | grep -A 20 "model Competency"
cat prisma/schema.prisma | grep -A 10 "model User"
cat prisma/schema.prisma | grep -A 10 "model Role"

# Check existing migrations
ls -la supabase/migrations/ | tail -10

# Check existing RLS policies
# Run in Supabase SQL editor:
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Key fields to locate in the schema:**
- Where is `required_level` stored? (It should be on the role-competency mapping, not on the response)
- Where is the employee's self-assessment score stored? (Should be on the assessment response record)
- Is there a `gap_score` column? (There should not be — it is derived)
- What is the foreign key chain from `User` → `Role` → `Competency` → `RequiredLevel`?

Map this out before writing any query. Write it as a comment at the top of any new file you create.

---

## SYSTEM_ERROR_LOG.md — MANDATORY

Create or update this file at the project root. Every change you make goes here.

```markdown
# SudakshaNWS System Error & Rectification Log
## TRA Delivery Sprint — [Date]

---

### Changes Made

| # | What Was Changed | File(s) | Why | Date |
|---|---|---|---|---|
| 1 | [description] | [file:line] | [reason] | [date] |

---

### Bugs Found (Fixed)

| # | Bug Description | Root Cause | Fix Applied | File(s) |
|---|---|---|---|---|

---

### Bugs Found (Deferred — Do Not Fix Now)

| # | Bug Description | Why Deferred |
|---|---|---|

---

### Database Changes

| # | Migration Name | What It Does | Reversible? |
|---|---|---|---|

---

### Verification Status

| Fix # | Description | Status | Tested By | Notes |
|---|---|---|---|---|
| 1 | Full employee workflow | [ ] TODO / [x] DONE | | |
| 2 | Multi-section resume bug | [ ] TODO / [x] DONE | | |
| 3 | Gap score calculation | [ ] TODO / [x] DONE | | |
| 4 | Admin results view | [ ] TODO / [x] DONE | | |
| 5 | CSV export | [ ] TODO / [x] DONE | | |
| 6 | TNI auto-generation | [ ] TODO / [x] DONE | | |
```

---

## FINAL VERIFICATION CHECKLIST

Do not consider this prompt complete until every item below is checked:

```
EMPLOYEE WORKFLOW (Fix 1)
[ ] Test employee can log in
[ ] Test employee can select / confirm their role
[ ] Test employee can see their assigned assessment
[ ] Test employee can complete all sections and submit
[ ] Test employee can view their competency scores after submission
[ ] No console errors at any step
[ ] Responses written to DB at each save point (verify in Supabase)

RESUME BUG (Fix 2)
[ ] Employee completes Section 1, closes browser
[ ] Employee reopens, navigates to assessment
[ ] Assessment opens at Section 2 (NOT Section 1)
[ ] Section 1 responses still in DB
[ ] Employee completes Section 2, submits
[ ] Final scores include both section responses

GAP SCORES (Fix 3)
[ ] Employee results page shows: Competency | Required | Score | Gap | Priority
[ ] Gap = Required minus Score (verify 3 examples manually)
[ ] HIGH flag when gap ≥ 2
[ ] MEDIUM flag when gap = 1
[ ] EXCEEDS flag when gap < 0
[ ] NONE flag when gap = 0

ADMIN VIEW (Fix 4)
[ ] TenantAdmin can navigate to results page
[ ] All employees in tenant are shown
[ ] Department filter works
[ ] Role filter works
[ ] Click employee → see competency breakdown
[ ] DepartmentHead sees ONLY their department (not others)
[ ] No cross-tenant data visible

CSV EXPORT (Fix 5)
[ ] Download CSV button present on admin results page
[ ] CSV downloads when clicked
[ ] CSV opens correctly in Excel
[ ] Columns in correct order: Employee Name, Employee ID, Department, Role, Assessment Name, Assessment Date, Competency Name, Competency Category, Required Level, Self-Assessment Score, Gap Score, Priority
[ ] One row per competency per employee
[ ] Gap scores and priorities match what is shown on screen

TNI PAGE (Fix 6 — if built)
[ ] TNI page accessible to TenantAdmin
[ ] Competencies ranked by TNI Score (averageGap × affectedCount)
[ ] Training programme shown per competency
[ ] Print button works

GENERAL
[ ] npm run build passes with zero TypeScript errors
[ ] No new console errors introduced
[ ] SYSTEM_ERROR_LOG.md is up to date with all changes
[ ] No files modified outside apps/portal (website, newwebsite untouched)
```

---

## CONTEXT REFERENCE — TRA ICT COMPETENCY FRAMEWORK

If the competency framework is not yet loaded in the portal, use this as the seed data. These are the competencies assessed for TRA ICT staff, based on earlier engagement work.

**Technical Competencies (score out of 4):**
- Network Infrastructure & Architecture
- Router / Switch Configuration
- Network Security & Threat Management
- TCP/IP Protocols & Routing
- VPN & Remote Access Management
- SQL / NoSQL Database Management
- Database Design & Normalisation
- Performance Tuning & Optimisation
- Backup, Recovery & Business Continuity
- Cybersecurity Operations (SOC)
- Threat Analysis & Incident Response
- Penetration Testing & Vulnerability Assessment
- Firewall & IDS/IPS Management
- Cloud Architecture (AWS / Azure)
- Cloud Migration & Deployment
- Systems Administration (Linux / Windows Server)
- IT Project Management
- Business Analysis & Requirements

**Behavioural Competencies (score out of 4):**
- Communication (written and verbal)
- Problem Solving & Critical Thinking
- Leadership & Team Management
- Stakeholder Management
- Time Management & Prioritisation
- Documentation & Reporting
- Collaboration & Teamwork
- Continuous Learning & Adaptability

**Required Levels by Role (use as default if not yet configured):**

| Competency | Network Admin | DBA | Cybersecurity Specialist | Cloud Architect | IT Manager |
|---|---|---|---|---|---|
| Network Infrastructure | 3 | 1 | 2 | 2 | 2 |
| Network Security | 3 | 1 | 4 | 2 | 2 |
| SQL/NoSQL | 1 | 4 | 1 | 1 | 1 |
| Database Design | 1 | 4 | 1 | 1 | 1 |
| Cybersecurity Operations | 2 | 1 | 4 | 2 | 2 |
| Cloud Architecture | 1 | 1 | 2 | 4 | 2 |
| Communication | 2 | 2 | 2 | 2 | 3 |
| Leadership | 1 | 1 | 1 | 1 | 4 |
| Problem Solving | 3 | 3 | 3 | 3 | 3 |
| Documentation | 2 | 3 | 3 | 2 | 2 |

*(Load full framework from the TRA engagement documentation if available in the project)*

---

*End of Prompt*
*TRA Portal Fix & TNI Implementation — Claude Code Agent*
*Sudaksha Education (P) Ltd — Confidential*
*Version 1.0 — March 2025*
