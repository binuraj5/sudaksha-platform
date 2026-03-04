# ANTIGRAVITY IMPLEMENTATION AUDIT PROMPT
## Check What's Implemented vs What Needs Implementation

**Purpose:** This prompt instructs AntiGravity to audit the entire codebase against all 6 implementation documents and create a comprehensive implementation status report.

---

## 🎯 MASTER AUDIT PROMPT FOR ANTIGRAVITY

```
[AUTONOMOUS AUDIT MODE]

You are performing a COMPREHENSIVE AUDIT of the SudAssess platform codebase.

OBJECTIVE: Compare the existing codebase against all 125 requirements defined in Documents 1-6, identify what's implemented, what's partially implemented, and what needs to be built.

---
AUDIT PROCESS:
---

STEP 1: READ ALL IMPLEMENTATION DOCUMENTS

Read these documents in order:
1. MASTER_IMPLEMENTATION_GUIDE.md - Overall roadmap
2. DOC1_CORPORATE_MODULE.md - Requirements M1-M4 (47 reqs)
3. DOC2_INSTITUTION_MODULE.md - Requirements M5-M8 (43 reqs)
4. DOC3_ASSESSMENT_MODULE.md - Requirements M9 (11 reqs)
5. DOC4_SUPER_ADMIN_MODULE.md - Requirements M11-M14 (5 reqs)
6. DOC5_B2C_MODULE.md - Requirements M15 (15 reqs)
7. DOC6_SURVEY_MODULE.md - Requirements M16-M19 (4 reqs)

Total: 125 requirements

STEP 2: AUDIT THE CODEBASE

For EACH requirement, check:

A. FILE EXISTENCE
   - Does the required file exist?
   - Are all component files present?
   - Are API routes created?

B. FUNCTIONALITY COMPLETENESS
   - Is the feature fully functional?
   - Are all sub-features implemented?
   - Does it match the specification?

C. DATABASE SCHEMA
   - Are required tables created?
   - Are all columns present?
   - Are indexes in place?
   - Are relations correct?

D. UI/UX QUALITY
   - Does the UI exist?
   - Is it mobile-responsive?
   - Are all states handled (loading, error, empty)?
   - Are forms validated?

E. BUSINESS LOGIC
   - Are all business rules implemented?
   - Are validations correct?
   - Are permissions enforced?

STEP 3: CATEGORIZE EACH REQUIREMENT

Mark each of 125 requirements as:

✅ FULLY IMPLEMENTED
   - All files exist
   - Feature is fully functional
   - Matches specification exactly
   - No bugs or issues
   - Mobile responsive
   - All edge cases handled

⚠️ PARTIALLY IMPLEMENTED
   - Some files exist
   - Basic functionality works
   - Missing sub-features
   - Needs enhancement
   - Missing mobile optimization
   - Business rules incomplete

🚧 IN PROGRESS
   - Files exist but incomplete
   - Feature not yet functional
   - Work clearly started
   - Needs completion

❌ NOT IMPLEMENTED
   - No files exist
   - Feature completely missing
   - No work started

STEP 4: CREATE COMPREHENSIVE AUDIT REPORT

Generate a detailed report with this structure:

═══════════════════════════════════════════════════
SUDASSESS PLATFORM - IMPLEMENTATION AUDIT REPORT
Generated: [Current Date]
Total Requirements: 125
═══════════════════════════════════════════════════

EXECUTIVE SUMMARY
─────────────────────────────────────────────────
✅ Fully Implemented:     XX (XX%)
⚠️ Partially Implemented: XX (XX%)
🚧 In Progress:           XX (XX%)
❌ Not Implemented:       XX (XX%)

Overall Completion: XX%

CRITICAL GAPS (Highest Priority):
1. [Requirement ID] - [Brief description] - Impact: HIGH
2. [Requirement ID] - [Brief description] - Impact: HIGH
3. ...

═══════════════════════════════════════════════════
DOCUMENT 1: CORPORATE MODULE (M1-M4)
═══════════════════════════════════════════════════

M1: Corporate Admin Login
Status: [✅/⚠️/🚧/❌]
Files Checked:
  - app/(auth)/login/page.tsx [✅/❌]
  - app/api/auth/[...nextauth]/route.ts [✅/❌]
  - lib/auth-config.ts [✅/❌]
Findings:
  - [What's working]
  - [What's missing]
  - [What needs improvement]
Action Required:
  - [Specific tasks to complete this]

M1-1: Menu Items
Status: [✅/⚠️/🚧/❌]
Files Checked:
  - lib/navigation-config.ts [✅/❌]
  - components/Navigation/Sidebar.tsx [✅/❌]
  - components/Navigation/MobileNav.tsx [✅/❌]
Findings:
  - [Detailed findings]
Action Required:
  - [Specific tasks]

[... Continue for ALL 47 M1-M4 requirements ...]

═══════════════════════════════════════════════════
DOCUMENT 2: INSTITUTION MODULE (M5-M8)
═══════════════════════════════════════════════════

Dynamic Label System
Status: [✅/⚠️/🚧/❌]
Files Checked:
  - lib/tenant-labels.ts [✅/❌]
  - hooks/useTenantLabels.ts [✅/❌]
Findings:
  - [Findings]
Action Required:
  - [Tasks]

M8-11: Curriculum Hierarchy
Status: [✅/⚠️/🚧/❌]
Files Checked:
  - Database: curriculum_nodes table [✅/❌]
  - app/clients/[clientId]/curriculum/page.tsx [✅/❌]
  - components/Curriculum/CurriculumTree.tsx [✅/❌]
Findings:
  - [Findings]
Action Required:
  - [Tasks]

[... Continue for ALL 43 M5-M8 requirements ...]

═══════════════════════════════════════════════════
DOCUMENT 3: ASSESSMENT MODULE (M9)
═══════════════════════════════════════════════════

M9-1: Role & Competency Based Assessment
Status: [✅/⚠️/🚧/❌]
Files Checked:
  - Database: assessment_models, assessment_components, component_questions [✅/❌]
  - app/assessments/admin/models/create/page.tsx [✅/❌]
  - lib/assessment/indicator-selection.ts [✅/❌]
Findings:
  - Smart indicator selection algorithm: [Present/Missing]
  - Assessment wizard: [Complete/Incomplete]
  - [Other findings]
Action Required:
  - [Tasks]

M9-1-3: Question Management
Status: [✅/⚠️/🚧/❌]
Files Checked:
  - components/Assessments/QuestionForm.tsx [✅/❌]
  - components/Assessments/BulkUploadQuestions.tsx [✅/❌]
Findings:
  - Manual entry: [Working/Missing]
  - Bulk upload: [Working/Missing]
  - Question types: [List which work, which don't]
Action Required:
  - [Tasks]

M9-1-4: AI Question Generation
Status: [✅/⚠️/🚧/❌]
Files Checked:
  - lib/ai/question-generator.ts [✅/❌]
  - OpenAI integration: [Present/Missing]
Findings:
  - [Findings]
Action Required:
  - [Tasks]

[... Continue for ALL 11 M9 requirements ...]

═══════════════════════════════════════════════════
DOCUMENT 4: SUPER ADMIN MODULE (M11-M14)
═══════════════════════════════════════════════════

[... Audit M11-M14 ...]

═══════════════════════════════════════════════════
DOCUMENT 5: B2C MODULE (M15)
═══════════════════════════════════════════════════

[... Audit M15 ...]

═══════════════════════════════════════════════════
DOCUMENT 6: SURVEY MODULE (M16-M19)
═══════════════════════════════════════════════════

[... Audit M16-M19 ...]

═══════════════════════════════════════════════════
CROSS-CUTTING CONCERNS
═══════════════════════════════════════════════════

Polymorphic Architecture:
  - Dynamic labels: [✅/⚠️/❌]
  - Shared tables: [✅/⚠️/❌]
  - Tenant type detection: [✅/⚠️/❌]

Mobile-First Design:
  - Responsive breakpoints: [✅/⚠️/❌]
  - Touch targets (44px min): [✅/⚠️/❌]
  - Mobile navigation: [✅/⚠️/❌]
  - Progressive Web App: [✅/⚠️/❌]

SEO Optimization:
  - Meta tags: [✅/⚠️/❌]
  - Server-side rendering: [✅/⚠️/❌]
  - Sitemap.xml: [✅/⚠️/❌]
  - Structured data: [✅/⚠️/❌]

Performance:
  - Page load time: [Measurement]
  - API response time: [Measurement]
  - Database queries: [Optimized/Needs work]
  - Lighthouse score: [Score]

Security:
  - Authentication: [✅/⚠️/❌]
  - Authorization: [✅/⚠️/❌]
  - RBAC enforcement: [✅/⚠️/❌]
  - Data validation: [✅/⚠️/❌]
  - SQL injection prevention: [✅/⚠️/❌]

═══════════════════════════════════════════════════
PRIORITIZED ACTION PLAN
═══════════════════════════════════════════════════

WEEK 1 (CRITICAL - Must Do Now):
Priority: P0 - Blocking issues
1. [Requirement ID]: [Task] - Files: [list] - Time: [estimate]
2. [Requirement ID]: [Task] - Files: [list] - Time: [estimate]
...

WEEK 2 (HIGH PRIORITY):
Priority: P1 - Important features
1. [Requirement ID]: [Task] - Files: [list] - Time: [estimate]
...

WEEK 3-4 (MEDIUM PRIORITY):
Priority: P2 - Nice to have
1. [Requirement ID]: [Task] - Files: [list] - Time: [estimate]
...

WEEK 5+ (LOW PRIORITY):
Priority: P3 - Future enhancements
1. [Requirement ID]: [Task] - Files: [list] - Time: [estimate]
...

═══════════════════════════════════════════════════
DETAILED FILE INVENTORY
═══════════════════════════════════════════════════

EXISTING FILES:
app/
  ├─ (auth)/
  │  └─ login/page.tsx [✅] - Functional: [Yes/Partial/No]
  ├─ clients/[clientId]/
  │  ├─ dashboard/page.tsx [✅] - Functional: [Yes/Partial/No]
  │  ├─ employees/page.tsx [⚠️] - Issues: [List]
  │  └─ ...
  └─ ...

components/
  ├─ Navigation/
  │  ├─ Sidebar.tsx [✅/⚠️/❌]
  │  └─ MobileNav.tsx [✅/⚠️/❌]
  └─ ...

MISSING FILES:
app/
  ├─ assessments/
  │  ├─ profile/page.tsx [❌ MISSING - Required for M4-2]
  │  └─ career/page.tsx [❌ MISSING - Required for M4-5]
  └─ ...

═══════════════════════════════════════════════════
DATABASE AUDIT
═══════════════════════════════════════════════════

EXISTING TABLES:
✅ tenants
✅ users
✅ members
✅ roles
✅ competencies
⚠️ assessment_models (missing columns: [list])
❌ curriculum_nodes (MISSING - Required for M8-11)
❌ surveys (MISSING - Required for M16)

MISSING INDEXES:
- [table].[column] - Impact: [Performance/Functionality]

MISSING RELATIONS:
- [relation description] - Impact: [list]

═══════════════════════════════════════════════════
RECOMMENDATIONS
═══════════════════════════════════════════════════

ARCHITECTURAL:
1. [Recommendation]
2. [Recommendation]

PERFORMANCE:
1. [Recommendation]
2. [Recommendation]

SECURITY:
1. [Recommendation]
2. [Recommendation]

UX/UI:
1. [Recommendation]
2. [Recommendation]

═══════════════════════════════════════════════════
END OF AUDIT REPORT
═══════════════════════════════════════════════════

STEP 5: GENERATE IMPLEMENTATION SCRIPTS

For each NOT IMPLEMENTED or PARTIALLY IMPLEMENTED requirement, generate:

A. AntiGravity prompt to complete it
B. Estimated time to complete
C. Dependencies (what must be done first)
D. Priority (P0/P1/P2/P3)

Format:
───────────────────────────────────────────────────
REQUIREMENT: M4-2 - My Profile (9-section career form)
STATUS: ❌ NOT IMPLEMENTED
PRIORITY: P0 (CRITICAL)
TIME: 1 day
DEPENDENCIES: None
FILES TO CREATE:
  - app/assessments/profile/page.tsx
  - components/Profile/ProfileForm.tsx
  - app/api/profile/route.ts
───────────────────────────────────────────────────
ANTIGRAVITY PROMPT:
[Copy the exact prompt from DOC1_CORPORATE_MODULE.md for M4-2]
───────────────────────────────────────────────────

STEP 6: SAVE AUDIT REPORT

Save the complete audit report to:
/mnt/user-data/outputs/IMPLEMENTATION_AUDIT_REPORT_[DATE].md

STEP 7: CREATE QUICK REFERENCE

Create a one-page summary:

┌─────────────────────────────────────────────┐
│ SUDASSESS IMPLEMENTATION STATUS             │
├─────────────────────────────────────────────┤
│ Overall: XX% Complete                       │
│                                             │
│ ✅ Fully Done:     XX (XX%)                 │
│ ⚠️ Partially Done: XX (XX%)                 │
│ 🚧 In Progress:    XX (XX%)                 │
│ ❌ Not Started:    XX (XX%)                 │
│                                             │
│ TOP 5 PRIORITIES:                           │
│ 1. [Requirement] - [Why critical]           │
│ 2. [Requirement] - [Why critical]           │
│ 3. [Requirement] - [Why critical]           │
│ 4. [Requirement] - [Why critical]           │
│ 5. [Requirement] - [Why critical]           │
│                                             │
│ ESTIMATED TIME TO 100%: XX weeks            │
└─────────────────────────────────────────────┘

---
EXECUTION INSTRUCTIONS:
---

1. START: Begin with Document 1, check every M1-M4 requirement
2. DOCUMENT: For each requirement, note exact status and findings
3. BE SPECIFIC: Don't say "needs work" - say exactly what's missing
4. BE THOROUGH: Check all files, all features, all edge cases
5. BE HONEST: Don't mark partial work as complete
6. PRIORITIZE: Mark truly critical gaps as P0
7. ESTIMATE: Give realistic time estimates
8. GENERATE: Create specific prompts to fix gaps

Execute this audit autonomously and comprehensively.

Report format: Plain text markdown, well-formatted, easy to read.

BEGIN AUDIT NOW.
```

---

## 📋 ADDITIONAL AUDIT INSTRUCTIONS

### What to Look For

**For Each Feature:**
- Does the file exist?
- Does the feature work end-to-end?
- Are all sub-features present?
- Is it mobile-responsive?
- Are errors handled?
- Is it accessible?
- Does it match the spec?

**Common Issues to Flag:**
- Hardcoded values (should be config)
- Missing validations
- No error handling
- Not mobile-responsive
- Missing permissions checks
- Database queries not optimized
- No loading states
- No empty states

### Priority Guidelines

**P0 (CRITICAL):**
- Blocks other features
- Breaks core functionality
- Affects all users
- Security vulnerability
- Data integrity issue

**P1 (HIGH):**
- Important feature missing
- Affects many users
- Needed for pilot
- Performance issue
- UX problem

**P2 (MEDIUM):**
- Nice to have
- Affects some users
- Enhancement
- Polish item

**P3 (LOW):**
- Future feature
- Minimal impact
- Can be deferred

---

## 🎯 OUTPUT FORMAT

The audit should produce:

1. **Main Report:** Comprehensive audit (as specified above)
2. **Quick Summary:** One-page status overview
3. **Action Scripts:** Individual prompts for each gap
4. **Priority Queue:** Ordered list of what to do next

---

## ✅ SUCCESS CRITERIA

Audit is complete when:
- All 125 requirements checked
- Status assigned to each
- Findings documented
- Action plan created
- Reports saved to /mnt/user-data/outputs/

---

END OF AUDIT PROMPT
