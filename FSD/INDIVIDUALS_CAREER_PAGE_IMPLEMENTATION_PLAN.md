# Implementation Plan: Individuals Career Page

**URL:** `http://localhost:3000/assessments/individuals/career`

**Goals:**
1. Align Career page UI with other individuals pages (Dashboard, My Details/Profile).
2. Populate the Career page entirely from data already stored in the database (Member, careerFormData, roles, development plan).

---

## 1. Current State (Facts)

### 1.1 Career page today
- **Route:** `app/assessments/individuals/career/page.tsx` re-exports `app/assessments/(portal)/career/page.tsx` (CareerPortalPage).
- **Data:** Fetches `/api/profile` (member) and `/api/career/plan/generate` (plan). Uses `member.currentRole`, `member.aspirationalRole` for Overview; plan for Dev Plan tab.
- **UI:** Uses `container mx-auto py-10`, indigo-900/slate styling, rounded-3xl cards, different from individuals Dashboard/Profile.

### 1.2 Other individuals pages (target UI)
- **Dashboard** (`/assessments/individuals/dashboard`): `min-h-screen bg-gray-50/50 p-6 space-y-8`, `text-3xl font-bold text-gray-900`, Cards with `border-none shadow-md bg-white`, `text-gray-500`/`text-gray-800`, indigo for accents.
- **Profile / My Details** (`/assessments/individuals/profile`): `p-8 max-w-7xl mx-auto space-y-8`, header `text-3xl font-black text-gray-900`, `text-gray-500` subtitle.

### 1.3 Data already in DB (from “My Details” / profile)
| Source | Data |
|--------|------|
| **Member** | id, name, email, phone, bio, currentRoleId, aspirationalRoleId, careerFormData (JSON), developmentPlan (JSON), orgUnitId, etc. |
| **careerFormData** (Member.careerFormData) | responsibilities, techCompetencies, behavCompetencies, aspirationalTech, aspirationalBehav, learningPreferences, selfAssessment |
| **Role** (currentRole / aspirationalRole) | id, name, description, competencies → RoleCompetency → Competency (name, category) |
| **developmentPlan** (Member.developmentPlan) | Same structure returned by `/api/career/plan/generate` (gaps, actions, aspirationalRoleName, generatedAt) |

### 1.4 API behaviour
- **GET /api/profile:** Returns member with `include: { currentRole: true, aspirationalRole: true, orgUnit, reportingManager }`.  
  **Gap:** `currentRole: true` / `aspirationalRole: true` do **not** load `Role.competencies` (RoleCompetency + Competency). The career Overview needs role competencies for badges and gap %.
- **GET /api/career/plan/generate:** Returns `{ plan: member.developmentPlan }`. Plan is already stored on Member; no extra tables.

---

## 2. Implementation Plan

### Phase 1: Enrich profile API for career (single source of truth)

**File:** `app/api/profile/route.ts`

- In **GET**, change `include` so current and aspirational roles include competencies:
  - `currentRole: { include: { competencies: { include: { competency: true } } } }`
  - `aspirationalRole: { include: { competencies: { include: { competency: true } } } }`
- Keep returning the full member (including existing `careerFormData`, `developmentPlan` if needed). No new endpoints required for career data.

**Outcome:** One call to `/api/profile` gives member + roles + role competencies. Career page can use this for Overview and for any “My Details” summary.

---

### Phase 2: Dedicated individuals career page (no portal re-export)

**File:** `app/assessments/individuals/career/page.tsx`

- **Stop** re-exporting `(portal)/career/page.tsx`.
- Implement a **client component** (or server + client split) that:
  - Uses the **same layout and styling** as Dashboard/Profile:
    - Wrapper: `p-6` or `p-8 max-w-7xl mx-auto space-y-8` (match profile), with `bg-gray-50/50` if desired to match dashboard.
    - Page title: `text-3xl font-bold text-gray-900`, subtitle `text-gray-500 mt-1`.
    - Cards: `Card` with `border-none shadow-md bg-white`, same spacing and typography as dashboard (e.g. `text-gray-700`, `text-gray-500`).
    - Buttons/links: indigo for primary (e.g. `text-indigo-600`, `bg-indigo-600`) to match dashboard.
  - **Data loading:**
    - **Primary:** `GET /api/profile` → full member (with enriched currentRole/aspirationalRole and competencies).
    - **Plan:** `GET /api/career/plan/generate` → `{ plan }` (from member.developmentPlan). Optionally use `member.developmentPlan` from profile response if we add it to profile GET later.
  - **No duplicate “Profile” form:** Replace the current “Profile” tab with either:
    - A short **read-only summary** of My Details (name, email, phone, bio, current role, aspirational role, responsibilities snippet, learning preferences) from `member` + `member.careerFormData`, plus a link: **“Edit in My Details”** → `/assessments/individuals/profile`, or
    - Only a single CTA: **“Edit My Details”** → `/assessments/individuals/profile`, and keep Overview/Plan/Hierarchy as the main content.

**Outcome:** Career page looks and feels like Dashboard and Profile; all displayed data comes from DB via profile (and plan) API.

---

### Phase 3: Populate Overview from member data

**In the new career page component:**

- **Current role card:** Use `member.currentRole` (name, description). Competencies: `member.currentRole.competencies?.map(rc => rc.competency.name)` (after Phase 1).
- **Aspirational role card:** Use `member.aspirationalRole` (name, description). Competencies: same pattern.
- **Gap %:** Compute from lengths: e.g. `currentCount / aspirationalCount` (or proper set intersection if needed). Use only after Phase 1 (competencies loaded).
- **Fallbacks:** “Unassigned” / “Not set” when `currentRoleId` / `aspirationalRoleId` are null; “Set in My Details” or link to `/assessments/individuals/profile`.

**Outcome:** Overview tab is fully populated from member + roles already stored (no mock data).

---

### Phase 4: Dev Plan tab from member.developmentPlan / API

- **Data:** Keep using `GET /api/career/plan/generate` for `plan` (or add `developmentPlan` to profile GET and use that).
- **UI:** Reuse the same plan layout (gaps, actions, progress) but with individuals styling: same Card style, same gray/indigo palette, same spacing as dashboard.
- **Empty state:** If no plan, show “Build My Roadmap” (or “Auto-Generate Plan”) that calls `POST /api/career/plan/generate`, and message: “Set aspirational role in My Details if needed.”

**Outcome:** Dev Plan tab populated from DB (member.developmentPlan) with UI consistent with other individuals pages.

---

### Phase 5: Hierarchy tab and Profile tab cleanup

- **Hierarchy:** Keep “Coming soon” or link to org view; no DB change. Style the placeholder card like other individuals cards.
- **Profile tab:** Remove `CareerProfileForm` to avoid duplication. Replace with read-only summary from `member` + `member.careerFormData` and “Edit in My Details” link, or only the link.

**Outcome:** No duplicate editing; single source of truth is My Details (profile) page.

---

### Phase 6: Optional – Include developmentPlan in profile GET

- In `app/api/profile/route.ts` GET, add `developmentPlan: true` to the member select (or keep as-is and let career page keep calling `GET /api/career/plan/generate`).
- If included, career page can use `member.developmentPlan` and avoid a second request for plan.

**Outcome:** Fewer requests and simpler career page logic if desired.

---

## 3. File and API summary

| Item | Action |
|------|--------|
| `app/api/profile/route.ts` | Enrich GET: include role competencies for currentRole and aspirationalRole. Optionally include developmentPlan. |
| `app/assessments/individuals/career/page.tsx` | Replace re-export with dedicated client page: same UI as Dashboard/Profile; fetch profile (+ plan); render Overview, Plan, Hierarchy; Profile tab = summary + “Edit in My Details”. |
| `app/assessments/(portal)/career/page.tsx` | No change (or keep for portal route). Individuals route no longer uses it. |
| DB / migrations | None. All data already exists (Member, Role, RoleCompetency, Competency, careerFormData, developmentPlan). |

---

## 4. Data flow (after implementation)

1. User opens **My Details** → saves profile → data in **Member** + **Member.careerFormData**.
2. User opens **Career** → page calls **GET /api/profile** → gets member + currentRole (with competencies) + aspirationalRole (with competencies) + careerFormData.
3. Career page renders **Overview** (current role, aspirational role, gap %) and **Plan** from **GET /api/career/plan/generate** (or member.developmentPlan).
4. “Edit in My Details” → **Profile** page; no duplicate forms on Career.

---

## 5. Checklist

- [x] Phase 1: Profile API includes role competencies (and optionally developmentPlan).
- [x] Phase 2: Individuals career page is a dedicated page with Dashboard/Profile-style UI.
- [x] Phase 3: Overview populated from member + roles (no empty/mock data).
- [x] Phase 4: Dev Plan tab uses plan from API/DB with same UI style.
- [x] Phase 5: Hierarchy placeholder and Profile tab replaced with summary + link.
- [x] Phase 6 (optional): developmentPlan in profile GET (career page uses it to avoid second request).

This plan uses only existing tables and existing “My Details” data to populate the Career page and aligns its UI with the rest of the individuals section.
