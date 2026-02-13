# Role-Model Architecture Fix – Plan of Action

## Documents Reviewed

1. **CURSOR_ROLE_MODEL_ARCHITECTURE_FIX.md** – Architecture fix spec (role = master, model = snapshot)
2. **CURSOR_ASSESSMENT_BUILDER_PROMPT.md** – Original builder wizard spec

---

## Current State vs Target

### ✅ Already Implemented (Correct)

| Area | Status | Notes |
|------|--------|-------|
| Role = master (read-only in create flow) | ✅ | Create page uses ModelCompetencySelector; no role modification |
| ModelCompetencySelector component | ✅ | Checkboxes + weights, model-scoped |
| from-role API | ✅ | Uses competencyWeights; creates only selected competencies |
| Create page flow | ✅ | Step 1: Role & level → Step 2: Competencies → Step 3: Create |
| RoleCompetencyManager removed | ✅ | Deleted |
| RoleSelector removed | ✅ | Deleted |
| View role link | ✅ | ModelCompetencySelector has "View role →" |
| Build page with competencyIds | ✅ | Create page passes competencyIds when navigating to wizard |
| Builder page modelId fix | ✅ | Duplicate modelId removed |

### ❌ Gaps (Need Fix)

| # | Gap | Impact | Doc Reference |
|---|-----|--------|---------------|
| 1 | **Role page "Component Wizard" bypasses competency selection** | User lands on build with ALL competencies; no subset selection | Architecture Fix § Change 3 |
| 2 | **AssessmentBuilderWizard missing SELECT_COMPETENCIES step** | Wizard has 3 steps (Overview → Components → Build); spec requires 4 (Overview → **Select Competencies** → Components → Build) | Architecture Fix § Change 3 |
| 3 | **from-wizard does not accept competencyWeights** | Uses role weights; user-set weights from create page are lost | Architecture Fix § Change 5 |
| 4 | **Weights not passed from create to build** | When user goes Create → Component Wizard, weights from step 2 are not passed | Architecture Fix § Data Flow |
| 5 | **Role page Trash2 button not wired** | Remove-from-role action has no onClick | Role page |

---

## Plan of Action

### Phase 1: Add Competency Selection to Wizard (Entry from Role Page)

**Goal:** When user opens Component Wizard from the role page (no `competencyIds` in URL), show competency selection first.

**Files to modify:**

1. **`app/assessments/admin/models/build/page.tsx`**
   - Pass `hasPreSelectedCompetencies: boolean` (true when competencyIds in URL)
   - Pass `roleCompetencies` (full list) when we need competency selection

2. **`components/assessments/AssessmentBuilderWizard.tsx`**
   - Add optional prop: `preSelectedCompetencyIds?: string[] | null`
   - Add optional prop: `competencyWeights?: Record<string, number> | null`
   - Add step: `SELECT_COMPETENCIES`
   - When `preSelectedCompetencyIds` is null/empty: show SELECT_COMPETENCIES first (use ModelCompetencySelector)
   - When `preSelectedCompetencyIds` is provided: skip SELECT_COMPETENCIES, go straight to COMPONENTS
   - Flow: `OVERVIEW` → `SELECT_COMPETENCIES` (conditional) → `COMPONENTS` → `BUILD`

3. **`app/assessments/admin/models/build/page.tsx`**
   - Fetch full role competencies (with mapping structure for ModelCompetencySelector)
   - When `competencyIds` is absent: pass `preSelectedCompetencyIds: null`, `roleCompetencies` for selector
   - When `competencyIds` is present: pass `preSelectedCompetencyIds`, optionally `competencyWeights` from URL

---

### Phase 2: Role Page – Route Through Competency Selection

**Option A (Recommended):** Change role page "Component Wizard" link to go to create page with role pre-selected:

```tsx
// Role page: Link to create with role pre-selected
<Link href={`/assessments/admin/models/create?roleId=${id}&level=SENIOR`}>
    <Button>Component Wizard</Button>
</Link>
```

Then create page detects `roleId` in URL, pre-selects role, and user continues from step 2 (competencies). "Component Wizard" button navigates to build with competencyIds + weights.

**Option B:** Keep role page linking to build, but add SELECT_COMPETENCIES step inside the wizard when competencyIds is missing.

**Recommendation:** Option A – single source of truth (create page) for competency selection. Role page "Component Wizard" = "Create assessment from this role" → create page.

---

### Phase 3: Pass Weights to from-wizard

**Files to modify:**

1. **`app/assessments/admin/models/create/page.tsx`**
   - In `goToComponentWizard`, pass weights in URL: `competencyWeights=id1:30,id2:25,...` or use `sessionStorage` for complex data

2. **`app/assessments/admin/models/build/page.tsx`**
   - Parse `competencyWeights` from URL (e.g. `weights` search param as JSON)
   - Pass to AssessmentBuilderWizard

3. **`components/assessments/AssessmentBuilderWizard.tsx`**
   - Accept `competencyWeights?: Record<string, number>`
   - Pass to from-wizard API when creating model

4. **`app/api/assessments/admin/models/from-wizard/route.ts`**
   - Accept optional `competencyWeights` in body
   - Use `competencyWeights[id]` when present, else `rc.weight`

---

### Phase 4: from-wizard API – Use competencyWeights

**File:** `app/api/assessments/admin/models/from-wizard/route.ts`

**Changes:**
- Accept `competencyWeights?: Record<string, number>` in request body
- For each component, use `competencyWeights?.[competencyId] ?? rc?.weight ?? 1`
- Validate: if competencyWeights provided, ensure all component competencyIds have weights

---

### Phase 5: Role Page Trash2 – Wire Remove Action

**File:** `app/assessments/admin/roles/[id]/page.tsx`

**Current:** Trash2 button has no onClick.

**Options:**
- Extract competency row into a client component with delete handler
- Use server action for delete
- Add `RoleCompetencyRow` client component that calls `DELETE /api/admin/roles/[id]/competencies/[mappingId]`

**Note:** PATCH/DELETE APIs for role competencies exist; need to wire the UI.

---

## Implementation Order

| Step | Task | Est. Time |
|------|------|-----------|
| 1 | Phase 2 Option A: Role page → create page with roleId pre-select | 30 min |
| 2 | Phase 3: Pass weights from create to build (URL param or sessionStorage) | 45 min |
| 3 | Phase 4: from-wizard accept and use competencyWeights | 30 min |
| 4 | Phase 1 (fallback): Add SELECT_COMPETENCIES to wizard when entry has no competencyIds | 1 hr |
| 5 | Phase 5: Wire Trash2 on role page for remove competency | 45 min |

---

## Success Criteria (from Architecture Fix Doc)

- [x] Role stays unchanged when creating models
- [x] User can select subset of role competencies
- [x] User can set model-specific weights
- [x] Weights must sum to 100%
- [x] Two users can create different models from same role
- [x] Role page is the ONLY place to modify role competencies
- [x] Create flow shows "View Role Competencies" link
- [x] API accepts competencyWeights and uses only selected competencies
- [ ] **Component Wizard from role page** goes through competency selection (Phase 2)
- [ ] **Weights flow to from-wizard** when using Component Wizard path (Phase 3–4)
- [ ] **Role page Trash2** removes competency from role (Phase 5)

---

## File Path Reference

| Doc Says | Actual Path |
|----------|-------------|
| `components/assessment/` | `components/assessments/` |
| `RoleSelector` | Removed – create page has inline flow |
| `RoleCompetencyManager` | Removed – ModelCompetencySelector used |
