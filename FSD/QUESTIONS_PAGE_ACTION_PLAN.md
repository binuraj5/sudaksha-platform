# Questions Page - Plan of Action

## Summary of Issues

1. **"Component not found"** when using AI Generate
2. **Tabs UI** – Not aligned with universal/admin design; needs consistency
3. **Tab forms** – Manual, Bulk, AI forms should match other pages
4. **Per-competency question count** – User should define number of questions per competency (CURSOR_ASSESSMENT_BUILDER_PROMPT)
5. **AI component reference** – Competencies page has AIGenerateIndicatorsDialog; questions page needs similar pattern

---

## 1. Fix "Component not found" Error

### Root Cause Analysis
- **Model-scoped API**: `/api/assessments/admin/models/[modelId]/components/[componentId]/questions/ai-generate`
  - Uses `findFirst({ where: { id: componentId, modelId } })` – returns 404 if component not found
- **Possible causes**:
  - `modelId` or `componentId` mismatch (e.g. stale state, wrong IDs)
  - Component created via different flow (from-role vs from-wizard) with different `modelId`
  - Next.js dynamic route param resolution

### Fix Strategy
1. **Add fallback**: In `AIGenerateQuestions`, if model-scoped API returns 404, retry with component-level API (`/api/assessments/admin/components/[componentId]/questions/ai-generate`)
2. **Relax model-scoped API**: In ai-generate route, if component not found with modelId check, try `findUnique({ where: { id: componentId } })` and verify `component.modelId === modelId` before returning – return clearer error if mismatch
3. **Ensure modelId is passed**: Verify questions page passes `modelId` to `AIGenerateQuestions` (it does: `modelId={modelId}`)

---

## 2. Tabs UI – Align with Universal Design

### Current State
- Questions page uses custom TabsList styling
- AIGenerateQuestions uses heavy indigo/gray custom styling (rounded-3xl, shadow-2xl, etc.)
- Inconsistent with admin pages (competencies, roles, models)

### Target (from competencies, roles, models pages)
- **TabsList**: `bg-white border p-1 rounded-xl` or `bg-muted/50 border border-border rounded-lg`
- **TabsTrigger**: `data-[state=active]:bg-white` or `data-[state=active]:bg-card`, consistent padding
- **Cards**: `bg-white rounded-xl border shadow-sm` or `bg-card border shadow-sm`
- **Fonts**: `font-sans` (Lato), semantic colors (`text-foreground`, `text-muted-foreground`, `bg-card`)

### Actions
1. Update Questions page TabsList/TabsTrigger to match competencies page pattern
2. Refactor `AIGenerateQuestions` to use admin-style Card, Label, Button (remove indigo-600, rounded-3xl, shadow-2xl)
3. Use `primary`, `muted`, `card`, `border` tokens instead of indigo/slate

---

## 3. Tab Forms – Match Other Pages

### Manual (QuestionForm)
- **Current**: Uses Card with custom styling
- **Target**: Match competencies detail page form style – `Card` with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`; `Label`, `Input`, `Select` from ui; `rounded-lg border`

### Bulk (BulkUploadQuestions)
- **Current**: Uses dropzone, custom step UI
- **Target**: Use same Card/Label/Button pattern; ensure it uses model-scoped or component-level bulk API consistently

### AI (AIGenerateQuestions)
- **Current**: Heavy custom styling, config step + preview step
- **Target**: Simplify to match AIGenerateIndicatorsDialog pattern – Dialog or inline Card with Parameters (count, difficulty, types), Generate button, Preview with Accept/Save

---

## 4. Per-Competency Question Count (CURSOR_ASSESSMENT_BUILDER_PROMPT)

### Spec (from CURSOR_ASSESSMENT_BUILDER_PROMPT)
- User should be able to **define number of questions per competency**
- AI generation should support **count** per component
- ComponentBuildingView shows "estimatedQuestions" per component type

### Current State
- Questions page: One component selected at a time; AI generates for that component only
- Count is global (e.g. 5) in AIGenerateQuestions, not per-competency
- No "generate for all competencies" flow

### Required Changes
1. **Per-component count**: AIGenerateQuestions already has `count` state – ensure it's prominent and works
2. **Batch generate for all**: Add optional "Generate for all competencies" flow:
   - Show list of components with count input per component
   - On "Generate All", call AI for each component with its count
   - Aggregate results or save per component
3. **UI**: Add a section above the competency list: "Generate questions for each competency" with count inputs per competency, then "Generate All" button

---

## 5. AI Component Reference (Competencies Page)

### AIGenerateIndicatorsDialog Pattern
- Dialog with trigger button
- Parameters: name, category (from competency)
- Generate → Preview → Save
- Uses `/api/admin/competencies/ai-generate`
- Clean Card-based layout

### Apply to AIGenerateQuestions
- Use similar structure: Parameters card (count, difficulty, types, context) → Generate → Preview (ScrollArea with question cards) → Accept & Save
- Reuse `Label`, `Input`, `Button`, `Card`, `Badge` from ui
- Remove custom indigo/slate colors; use `primary`, `muted`, `foreground`

---

## Implementation Order

| # | Task | Priority | Effort |
|---|------|----------|--------|
| 1 | Fix "Component not found" – add fallback to component-level API in AIGenerateQuestions | HIGH | 0.5h |
| 2 | Fix AI generate API – ensure component lookup works (add logging, relax check if needed) | HIGH | 0.5h |
| 3 | Refactor AIGenerateQuestions UI – match admin/competencies style | HIGH | 1h |
| 4 | Align Questions page Tabs with competencies/roles style | MEDIUM | 0.5h |
| 5 | Align QuestionForm, BulkUploadQuestions styling with admin forms | MEDIUM | 0.5h |
| 6 | Add per-competency count UI – "Generate for all" with count per component | MEDIUM | 1.5h |

---

## Files to Modify

1. `components/assessments/AIGenerateQuestions.tsx` – Fallback API, UI refactor
2. `app/assessments/admin/models/[modelId]/questions/page.tsx` – Tabs styling, optional batch generate UI
3. `app/api/assessments/admin/models/[modelId]/components/[componentId]/questions/ai-generate/route.ts` – Debug/improve component lookup
4. `components/assessments/QuestionForm.tsx` – Minor styling alignment
5. `components/assessments/BulkUploadQuestions.tsx` – Minor styling alignment

---

## Verification Checklist

- [ ] AI Generate works for selected component (no "Component not found")
- [ ] Tabs look consistent with competencies/roles/models pages
- [ ] Manual form matches admin form style
- [ ] Bulk upload form matches admin form style
- [ ] AI form matches AIGenerateIndicatorsDialog style
- [ ] User can set question count per generation
- [ ] (Optional) User can generate for multiple competencies with per-competency counts
