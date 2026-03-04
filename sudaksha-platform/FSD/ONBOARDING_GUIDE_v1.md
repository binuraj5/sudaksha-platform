# ANTIGRAVITY ONBOARDING GUIDE
## Complete Project Context & Implementation Instructions

---

## 🎯 PURPOSE OF THIS DOCUMENT

This document helps Antigravity (your coding agent) understand the **ENTIRE SudAssess project** from scratch — what exists, what needs to be built, the architecture, the tech stack, and how all pieces fit together.

**Your goal:** Give Antigravity this document + all the MD files in your FSD folder, and it should be able to:
1. Understand the complete system architecture
2. Know what's already implemented vs what's pending
3. Make changes/additions that fit the existing patterns
4. Never recreate what already exists
5. Follow the established coding standards

---

## PART 1: PROJECT OVERVIEW

### What is SudAssess?

**SudAssess** is a comprehensive multi-tenant assessment platform designed to bridge the gap between academic preparation and industry readiness.

**Three tenant types:**
1. **Corporate** — Companies hiring employees at all experience levels (Junior to Expert)
2. **Institution** — Colleges/universities preparing students for first jobs (Junior/Fresher only)
3. **B2C** — Individual users creating/taking assessments

**Core value proposition:**
- Role-based, competency-driven assessments
- AI-powered question generation
- Multiple assessment types (MCQ, Code, Voice AI, Video AI, Adaptive, Panel)
- Gap analysis and career advisory
- Multi-level hierarchical access control

---

## PART 2: TECH STACK

### Frontend
```
Framework:     Next.js 14+ (App Router)
Language:      TypeScript
UI Library:    React 18+
Styling:       Tailwind CSS
Components:    Shadcn/ui (Button, Card, Dialog, Badge, Input, Select, etc.)
State:         React hooks (useState, useEffect, useContext)
Forms:         React Hook Form (where applicable)
```

### Backend
```
Framework:     Next.js API Routes (app/api/)
Language:      TypeScript
ORM:           Prisma
Database:      PostgreSQL
Auth:          NextAuth.js (or similar - check existing implementation)
File Storage:  S3-compatible (for uploads, audio, video)
```

### AI/ML Services
```
LLM:           OpenAI GPT-4 (question generation, evaluation)
Voice:         Whisper API (transcription) + ElevenLabs/OpenAI TTS
Video:         OpenCV + MediaPipe (Python FastAPI service)
Code:          Piston API or Docker-based execution (Python FastAPI service)
```

### Python Backend (for specific features)
```
Framework:     FastAPI
Purpose:       Voice interview, Video interview, Code execution
Deployment:    Separate container (Docker Compose)
Communication: HTTP calls from Next.js to FastAPI
```

### Deployment
```
Next.js:       Vercel / Docker
Python:        Docker container
Database:      PostgreSQL (managed service or Docker)
Storage:       S3 / Cloudflare R2 / Azure Blob
```

---

## PART 3: PROJECT STRUCTURE

### Directory Layout (Next.js App Router)

```
project-root/
├── app/
│   ├── api/                              # API routes
│   │   ├── admin/                        # SuperAdmin APIs
│   │   │   ├── roles/route.ts
│   │   │   ├── competencies/route.ts
│   │   │   └── ...
│   │   ├── assessments/
│   │   │   ├── admin/
│   │   │   │   ├── models/route.ts
│   │   │   │   ├── components/route.ts
│   │   │   │   └── ...
│   │   │   ├── adaptive/
│   │   │   ├── library/
│   │   │   └── ...
│   │   └── auth/
│   │       └── me/route.ts               # Current user endpoint
│   │
│   ├── assessments/
│   │   ├── admin/                        # SuperAdmin pages
│   │   │   ├── roles/
│   │   │   │   └── page.tsx              # /assessments/admin/roles
│   │   │   ├── competencies/
│   │   │   │   └── page.tsx              # /assessments/admin/competencies
│   │   │   ├── models/
│   │   │   │   ├── page.tsx              # List of assessment models
│   │   │   │   ├── create/page.tsx       # Create model wizard
│   │   │   │   └── build/page.tsx        # Build components
│   │   │   └── ...
│   │   │
│   │   └── clients/
│   │       └── [clientId]/               # Tenant-specific pages
│   │           ├── roles/page.tsx        # Client roles (should match admin UI)
│   │           ├── competencies/page.tsx # Client competencies
│   │           ├── assessments/page.tsx
│   │           └── ...
│   │
│   └── (other app routes)
│
├── components/
│   ├── ui/                               # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── assessments/                      # Assessment-specific components
│   │   ├── AssessmentBuilderWizard.tsx
│   │   ├── ComponentBuildingView.tsx
│   │   ├── ModelCompetencySelector.tsx
│   │   ├── AIGenerateQuestions.tsx
│   │   ├── QuestionForm.tsx
│   │   ├── BulkUploadQuestions.tsx
│   │   ├── VoiceComponentBuilder.tsx    # (if exists)
│   │   ├── VideoComponentBuilder.tsx    # (if exists)
│   │   └── ...
│   │
│   ├── roles/                            # Role management components
│   │   ├── RolesPageContent.tsx         # (to be created - shared component)
│   │   ├── RoleCard.tsx
│   │   ├── CreateRoleDialog.tsx
│   │   └── ...
│   │
│   └── competencies/                     # Competency management components
│       ├── CompetenciesPageContent.tsx  # (to be created)
│       └── ...
│
├── lib/
│   ├── permissions/
│   │   └── role-competency-permissions.ts  # Permission utility (to be created)
│   ├── assessment/
│   │   ├── component-suggester.ts          # Suggests components per competency
│   │   ├── adaptive-engine.ts              # Adaptive AI logic (if exists)
│   │   └── question-generator.ts           # AI question generation
│   ├── python-api.ts                       # Helper for calling Python backend
│   ├── prisma.ts                           # Prisma client singleton
│   └── auth.ts                             # getCurrentUser, etc.
│
├── hooks/
│   ├── usePermissions.ts                   # (to be created)
│   ├── useCurrentUser.ts                   # (check if exists)
│   └── ...
│
├── prisma/
│   ├── schema.prisma                       # Database schema
│   └── migrations/                         # Migration history
│
├── python-backend/                         # Python FastAPI service
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── voice.py
│   │   │   ├── video.py
│   │   │   └── code.py
│   │   └── ...
│   ├── requirements.txt
│   └── Dockerfile
│
├── public/                                 # Static assets
├── .env                                    # Environment variables
├── docker-compose.yml                      # Docker config
├── package.json
├── tsconfig.json
└── README.md
```

---

## PART 4: DATABASE SCHEMA OVERVIEW

### Core Entities

```prisma
// Users & Authentication
model User {
  id           String
  email        String
  role         String    // UserRole enum
  tenantId     String
  departmentId String?
  teamId       String?
  // ... other fields
}

model Tenant {
  id           String
  name         String
  type         String    // CORPORATE | INSTITUTION | B2C
  // ... other fields
}

// Roles & Competencies (Master Data)
model Role {
  id              String
  name            String
  description     String
  scope           String    // GLOBAL | ORGANIZATION | DEPARTMENT | TEAM
  tenantId        String?
  departmentId    String?
  teamId          String?
  createdByUserId String?
  allowedLevels   String[]  // [JUNIOR, MIDDLE, SENIOR, EXPERT]
  globalSubmitStatus String?
  isActive        Boolean
  // ... competencies, indicators
}

model Competency {
  id              String
  name            String
  category        String
  scope           String
  tenantId        String?
  allowedLevels   String[]
  // ... indicators
}

model Indicator {
  id            String
  competencyId  String
  text          String
  targetLevel   String    // JUNIOR | MIDDLE | SENIOR | EXPERT
  // ... assessment criteria
}

// Assessment Models
model AssessmentModel {
  id                  String
  tenantId            String
  name                String
  roleId              String
  targetLevel         String
  visibility          String    // PRIVATE | ORGANIZATION | GLOBAL
  completionPercentage Int
  // ... components
}

model AssessmentModelComponent {
  id                  String
  assessmentModelId   String
  competencyId        String
  componentType       String    // MCQ | SITUATIONAL | ESSAY | VOICE | VIDEO | CODE | ADAPTIVE_AI | PANEL
  status              String
  completionPercentage Int
  isFromLibrary       Boolean
  config              Json      // Component-specific config
  // ... questions
}

model ComponentQuestion {
  id           String
  componentId  String
  questionText String
  questionType String
  options      Json
  correctAnswer String
  // ... metadata
}

// Adaptive AI
model AdaptiveSession {
  id                    String
  assessmentSubmissionId String
  componentId           String
  currentAbility        Decimal   // 1-10 scale
  questionsAsked        Int
  questionsCorrect      Int
  status                String
  finalScore            Decimal
  abilityEstimate       Decimal
  // ... config
}

model AdaptiveQuestion {
  id              String
  sessionId       String
  questionText    String
  difficulty      Decimal
  candidateAnswer String?
  isCorrect       Boolean?
  // ... metadata
}

// Panel Interviews
model Panel { ... }
model PanelMember { ... }
model PanelInterview { ... }
model PanelEvaluation { ... }

// Component Library
model ComponentLibrary {
  id           String
  tenantId     String
  competencyId String
  componentType String
  questions    Json
  config       Json
  visibility   String
  usageCount   Int
}

// Global Approvals
model GlobalApprovalRequest {
  id             String
  entityType     String    // ROLE | COMPETENCY
  entityId       String
  tenantId       String
  submittedBy    String
  status         String    // PENDING | APPROVED | REJECTED
  reviewedBy     String?
  entitySnapshot Json
}
```

---

## PART 5: KEY ARCHITECTURAL PATTERNS

### 1. Role-Model Architecture (CRITICAL)

**Principle:** Roles are MASTER data. Assessment models are USER SNAPSHOTS.

```
WRONG:
User creates assessment → modifies role → affects all other users ❌

RIGHT:
User creates assessment → selects subset of role competencies → model-specific weights → role unchanged ✓
```

**Implementation:**
- Role has competencies with default weights
- Model creation: user selects which competencies to include
- Model stores `competencyWeights: { [competencyId]: weight }`
- Role is NEVER modified during model creation

### 2. Polymorphic Multi-Tenancy

**Principle:** Same codebase serves Corporate, Institution, and B2C.

```
NOT three separate apps.
ONE app with dynamic behaviour based on tenant.type.
```

**Implementation:**
- UI components read `tenantType` from user context
- Institution users: automatically filter to `allowedLevels: ["JUNIOR"]`
- Corporate users: see all levels
- Same pages, same APIs, different data scope

### 3. Scope-Based Visibility (Row-Level Security)

**Principle:** Users see data based on their position in the hierarchy.

```
SuperAdmin       → sees EVERYTHING
Tenant Admin     → sees GLOBAL + own ORGANIZATION
Department Head  → sees GLOBAL + ORGANIZATION + own DEPARTMENT + teams in dept
Team Leader      → sees GLOBAL + ORGANIZATION + own DEPARTMENT + own TEAM
```

**Implementation:**
- Every Role/Competency has: `scope`, `tenantId`, `departmentId`, `teamId`
- API uses `buildVisibilityFilter(user)` to construct Prisma WHERE clause
- Same endpoint returns different data based on who calls it

### 4. Component-Based Assessment Model

**Principle:** Assessments are built from reusable components.

```
Assessment Model = collection of components
Component = set of questions testing one competency using one method

Example:
Leadership Competency
├── MCQ Component (10 questions)
├── Situational Component (5 scenarios)
└── Adaptive AI Component (8-15 runtime questions)
```

**Implementation:**
- Component types: MCQ, Situational, Essay, Voice, Video, Code, Adaptive AI, Panel
- Each component targets one competency
- ComponentSuggester recommends types based on competency category
- Components can be static (pre-built) or dynamic (runtime AI)

### 5. Adaptive AI (Hidden from Candidate)

**Principle:** Questions adapt in real-time but candidate sees normal assessment.

```
Behind the scenes:
Question 1: Difficulty 7/10 → Answered correctly
Question 2: Difficulty 7.5/10 → Answered correctly
Question 3: Difficulty 8/10 → Answered incorrectly
Question 4: Difficulty 7.5/10 → ...

Candidate sees:
Question 1 of ~12
Question 2 of ~12
Question 3 of ~12
[looks like regular MCQ]
```

**Implementation:**
- AdaptiveSession tracks `currentAbility` (1-10 scale)
- After each answer, recalculate difficulty for next question
- Generate questions on-the-fly via GPT-4
- Stop when confident (8-15 questions)
- Convert ability (7.8/10) → score (78/100)

---

## PART 6: CRITICAL RULES FOR ANTIGRAVITY

### ✅ ALWAYS DO

1. **Audit before coding** — read existing files, check what components exist
2. **Reuse existing components** — never recreate Button, Card, Dialog, etc.
3. **Follow the permission utility** — all permission logic goes in `lib/permissions/role-competency-permissions.ts`
4. **Apply RLS to all queries** — every API that touches roles/competencies MUST use `buildVisibilityFilter`
5. **Test with multiple user types** — SuperAdmin, Corporate Admin, HOD, Institution Admin
6. **Preserve backward compatibility** — add to existing APIs, don't replace
7. **Use TypeScript strictly** — no `any` unless absolutely necessary
8. **Follow existing patterns** — if MCQ has a builder, Adaptive AI should too
9. **Keep components pure** — UI components accept props, don't fetch data directly
10. **Document your changes** — add comments explaining WHY, not just WHAT

### ❌ NEVER DO

1. **Never modify roles during model creation** — role = master, model = snapshot
2. **Never create duplicate components** — check `components/ui/` first
3. **Never hardcode tenant IDs or user IDs** — always derive from context
4. **Never skip permission checks** — every API must verify `canModify`, `canCreate`, etc.
5. **Never create separate pages for corporate vs institution** — use polymorphic components
6. **Never remove fields from existing Prisma models** — only add
7. **Never break existing API response shapes** — only add new fields
8. **Never expose SuperAdmin-only data to tenants** — use RLS filters
9. **Never store sensitive data in localStorage** — use secure cookies/sessions
10. **Never use direct SQL** — always use Prisma

---

## PART 7: IMPLEMENTATION DOCUMENTS IN YOUR FSD FOLDER

Here's what each document covers. Read them in this order:

### 1. MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md
**Purpose:** Complete overview of the assessment engine
**What it covers:**
- All 9 component types (MCQ, Essay, Situational, Voice, Video, Code, Adaptive AI, Panel)
- Component suggestion logic
- Database schema for assessments
- Complete user workflows (admin creating, candidate taking, admin reviewing)
- API endpoints
- 4-week implementation timeline

**When to use:** Starting from scratch or getting big-picture understanding

---

### 2. ROLE_COMPETENCY_MANAGEMENT_SYSTEM.md
**Purpose:** Hierarchical role/competency management with RLS
**What it covers:**
- Scope-based visibility (Global, Organization, Department, Team)
- Permission utility (single source of truth)
- Global approval workflow
- Institution vs Corporate differences (Junior-only vs all levels)
- Database schema additions (scope, tenantId, allowedLevels, etc.)

**When to use:** Building or modifying roles/competencies pages

---

### 3. ROLES_COMPETENCIES_RLS_POLYMORPHIC.md
**Purpose:** Extend SuperAdmin UI to all tenant users with same components
**What it covers:**
- Extracting shared components from admin pages
- Applying permission-based rendering
- Conditional tabs, buttons, badges
- API RLS filters
- Institution banner and level locks

**When to use:** Making client pages look like admin pages

---

### 4. CURSOR_ROLE_MODEL_ARCHITECTURE_FIX.md
**Purpose:** Fix the critical role-model separation bug
**What it covers:**
- Why roles must not be modified during model creation
- ModelCompetencySelector component
- competencyWeights parameter
- Step-by-step fix for existing wizard

**When to use:** FIRST PRIORITY — fix this before anything else

---

### 5. CURSOR_ASSESSMENT_BUILDER_PROMPT.md
**Purpose:** Original assessment builder wizard specification
**What it covers:**
- Wizard steps (Role & Level → Competencies → Components → Build)
- Component suggestion engine
- AI generation, manual entry, bulk upload, library
- Component library system
- Publishing and visibility

**When to use:** Understanding the original vision for model creation

---

### 6. M9-5_ADAPTIVE_AI_COMPONENT_IMPLEMENTATION.md
**Purpose:** Adaptive AI as a component type
**What it covers:**
- Adaptive configuration UI
- Runtime question generation
- Difficulty calculation algorithm
- Scoring integration (ability → percentage)
- Save to component library

**When to use:** Implementing adaptive assessments

---

### 7. RESPONSE_TO_CODING_AGENT.md
**Purpose:** Clarifications on Voice, Video, Code, Panel features
**What it covers:**
- Voice interview: conversational AI + evaluation (Versant-style)
- Video interview: recording + AI analysis (facial, tone, content)
- Code testing: Monaco editor + Python execution + HackerRank integration
- Panel interview: scheduling + evaluation + aggregation
- Python backend architecture (FastAPI in Docker)

**When to use:** Implementing advanced assessment types

---

### 8. CURSOR_REUSE_COMPONENTS_INSTRUCTION.md
**Purpose:** Critical rules for not recreating what exists
**What it covers:**
- Audit commands to run first
- Reuse checklist
- Extension patterns (not replacement)
- File organization
- Safe implementation checklist

**When to use:** BEFORE starting any feature — mandatory reading

---

### 9. INTEGRATED_ASSESSMENT_ENGINE.md
**Purpose:** Quick reference architecture summary
**What it covers:**
- Data flow (Role → Competencies → Level → Components)
- Component types table
- Suggestion logic
- Reusable components list
- Implementation checklist

**When to use:** Quick lookups during development

---

### 10. IMPLEMENTATION_SUMMARY_RESPONSE_TO_AGENT.md
**Purpose:** Status of what's already done
**What it covers:**
- Which features are complete
- Which files were created/modified
- Python backend setup status
- Next steps

**When to use:** Understanding what exists vs what's pending

---

### 11. Other Action Plans (QUESTIONS_PAGE, ROLE_MODEL_ARCHITECTURE, etc.)
**Purpose:** Specific bug fixes and improvements
**When to use:** When working on those specific pages/issues

---

## PART 8: HOW TO ONBOARD ANTIGRAVITY

### Step 1: Give Antigravity This Master Document

```
@ANTIGRAVITY_ONBOARDING_GUIDE.md

Read this entire document first. It explains the project architecture, 
tech stack, database schema, key patterns, and critical rules.

After reading, confirm you understand:
1. The three tenant types (Corporate, Institution, B2C)
2. Role-model architecture (roles = master, models = snapshots)
3. Scope-based RLS (Global → Org → Dept → Team)
4. The 9 component types
5. The "reuse, don't recreate" principle

Then move to Step 2.
```

### Step 2: Point Antigravity to All FSD Documents

```
Read these documents IN ORDER:

CRITICAL (read first):
1. CURSOR_REUSE_COMPONENTS_INSTRUCTION.md
2. CURSOR_ROLE_MODEL_ARCHITECTURE_FIX.md
3. ROLES_COMPETENCIES_RLS_POLYMORPHIC.md

ARCHITECTURE (read for big picture):
4. MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md
5. ROLE_COMPETENCY_MANAGEMENT_SYSTEM.md
6. INTEGRATED_ASSESSMENT_ENGINE.md

FEATURES (read when implementing):
7. M9-5_ADAPTIVE_AI_COMPONENT_IMPLEMENTATION.md
8. RESPONSE_TO_CODING_AGENT.md
9. CURSOR_ASSESSMENT_BUILDER_PROMPT.md

STATUS (read to know what exists):
10. IMPLEMENTATION_SUMMARY_RESPONSE_TO_AGENT.md

After reading all documents, run the audit commands from 
CURSOR_REUSE_COMPONENTS_INSTRUCTION.md and report what exists 
in the codebase.
```

### Step 3: Give Antigravity a Specific Task

```
Now implement: [SPECIFIC FEATURE]

For example:
"Extend the /assessments/clients/[clientId]/roles page to match 
the /assessments/admin/roles page using the polymorphic pattern 
from ROLES_COMPETENCIES_RLS_POLYMORPHIC.md"

Follow the implementation order exactly as specified in the document.
Report back after each phase.
```

---

## PART 9: QUICK REFERENCE — USER ROLES & PERMISSIONS

```
┌──────────────────────┬────────────┬─────────────┬────────────┬────────────┐
│ USER ROLE            │ SEES       │ CAN CREATE  │ CAN EDIT   │ LEVELS     │
├──────────────────────┼────────────┼─────────────┼────────────┼────────────┤
│ SUPER_ADMIN          │ Everything │ Global      │ Everything │ All        │
│ TENANT_ADMIN         │ Global+Org │ Org         │ Own org    │ All (Corp) │
│ DEPARTMENT_HEAD      │ Global+    │ Dept        │ Own dept   │ All (Corp) │
│                      │ Org+Dept   │             │            │            │
│ TEAM_LEADER          │ Global+Org │ Team        │ Own team   │ All (Corp) │
│                      │ +Dept+Team │             │            │            │
│ INSTITUTION_ADMIN    │ Global*+Org│ Org         │ Own org    │ Junior*    │
│ DEPT_HEAD_INST       │ Global*+   │ Dept        │ Own dept   │ Junior*    │
│                      │ Org+Dept   │             │            │            │
│ CLASS_TEACHER        │ Global*+Org│ Class (Team)│ Own class  │ Junior*    │
│                      │ +Dept+Class│             │            │            │
└──────────────────────┴────────────┴─────────────┴────────────┴────────────┘

* = Filtered to Junior/Fresher level only
```

---

## PART 10: COMMON ANTIGRAVITY COMMANDS

### When starting a new feature:
```
1. Read: [relevant document from FSD]
2. Audit: Run commands from CURSOR_REUSE_COMPONENTS_INSTRUCTION.md
3. Report: What exists vs what needs to be created
4. Plan: List files to create/modify
5. Implement: Follow the document's implementation order
6. Test: Use the testing checklist from the document
```

### When debugging an issue:
```
1. Read: IMPLEMENTATION_SUMMARY_RESPONSE_TO_AGENT.md (what's done)
2. Check: Relevant action plan document (e.g., QUESTIONS_PAGE_ACTION_PLAN.md)
3. Audit: Current state of the files mentioned
4. Fix: Apply changes without breaking existing functionality
5. Verify: Test the specific scenario from the action plan
```

### When adding a new component type:
```
1. Read: MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md (Part 2)
2. Follow: The pattern of existing component types
3. Add to: ComponentSuggester, ComponentType enum, database
4. Create: Builder UI, taking UI, scoring logic
5. Test: End-to-end from create to take to score
```

---

## PART 11: TESTING MATRIX FOR ANTIGRAVITY

Before marking any feature complete, verify against this matrix:

### User Types to Test
- [ ] Super Admin
- [ ] Corporate Admin (Tenant Admin)
- [ ] Corporate HOD (Department Head)
- [ ] Corporate Team Leader
- [ ] Institution Admin
- [ ] Institution Department Head
- [ ] Class Teacher

### Scenarios to Test
- [ ] Create role/competency at their scope level
- [ ] View roles/competencies (see correct scoped data)
- [ ] Edit own roles (allowed) vs edit global roles (blocked)
- [ ] Delete own roles (allowed) vs delete others (blocked)
- [ ] Submit for global review (non-SuperAdmin)
- [ ] Approve global requests (SuperAdmin only)
- [ ] Institution users see Junior only
- [ ] Corporate users see all levels
- [ ] Scope badges display correctly
- [ ] Permission-based buttons show/hide correctly

---

## PART 12: FINAL CHECKLIST FOR ANTIGRAVITY

Before considering a task complete:

### Code Quality
- [ ] TypeScript strict mode — no `any` types
- [ ] All imports resolve correctly
- [ ] No console.errors in production code
- [ ] Error handling for all API calls
- [ ] Loading states for async operations
- [ ] Proper null checks everywhere

### Functionality
- [ ] Feature works for all relevant user roles
- [ ] RLS filters applied to all queries
- [ ] Permissions checked server-side AND client-side
- [ ] Backward compatibility maintained
- [ ] Existing tests still pass

### UI/UX
- [ ] Matches existing design system
- [ ] Mobile responsive
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] Loading indicators present
- [ ] Error messages user-friendly
- [ ] Institution banner shown when appropriate

### Documentation
- [ ] Code comments explain WHY, not just WHAT
- [ ] Complex logic has explanatory comments
- [ ] API changes documented
- [ ] Database changes in migration

---

**END OF ANTIGRAVITY ONBOARDING GUIDE**

---

## 🚀 HOW TO USE THIS WITH ANTIGRAVITY

Copy this command and give it to Antigravity:

```
@ANTIGRAVITY_ONBOARDING_GUIDE.md

This is your complete onboarding document for the SudAssess project.

STEP 1: Read this entire document (all 12 parts).

STEP 2: Read these documents in order:
1. CURSOR_REUSE_COMPONENTS_INSTRUCTION.md (mandatory first read)
2. CURSOR_ROLE_MODEL_ARCHITECTURE_FIX.md (critical architecture)
3. ROLES_COMPETENCIES_RLS_POLYMORPHIC.md (current priority)
4. MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md (complete overview)
5. All other documents in the FSD folder

STEP 3: Run audit commands from CURSOR_REUSE_COMPONENTS_INSTRUCTION.md 
and report what exists in the codebase.

STEP 4: Wait for my specific task assignment.

Confirm when you've completed Steps 1-3 and are ready for a task.
```

Then give Antigravity specific tasks referencing the relevant document:

```
Task: Implement the polymorphic roles/competencies pages.
Document: ROLES_COMPETENCIES_RLS_POLYMORPHIC.md
Follow the 10-step implementation order exactly.
Report back after each step.
```
