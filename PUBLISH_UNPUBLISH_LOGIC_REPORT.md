# Publish/Unpublish Logic – Implementation Report

## Summary

The logic for locking published models and requiring unpublish-before-edit has been implemented across APIs and UI.

---

## 1. Logic Implemented

### Published models are locked
- When a model has `status === "PUBLISHED"`, no one can add, modify, or delete components or questions.
- All component/question mutation APIs return **403** with a clear message when the model is published.

### Unpublish → Edit → Publish workflow
1. **Unpublish** – Sets model status to `DRAFT`, clears publish metadata.
2. **Edit** – Add/modify/delete components and questions (only when status is `DRAFT`).
3. **Publish** – Publish again; version is bumped (e.g. 1.0.0 → 1.0.1).

### Hierarchy-based permissions
- **Super Admin** – Can unpublish and edit any model.
- **Org Admin / Dept Head / Team Lead** – Can unpublish and edit models in their organization hierarchy (tenant/client match).
- **Employees, Students, B2C** – Cannot unpublish or edit.

---

## 2. Files Created/Modified

### New files
| File | Purpose |
|------|---------|
| `lib/assessments/model-edit-permission.ts` | `canUnpublishModel()`, `canEditModelComponents()`, `bumpVersion()` |
| `app/api/assessments/admin/models/[modelId]/unpublish/route.ts` | POST unpublish API |
| `PUBLISH_UNPUBLISH_LOGIC_REPORT.md` | This report |

### Modified files

| File | Changes |
|------|---------|
| `app/api/assessments/admin/models/[modelId]/publish/route.ts` | Version bump on publish |
| `app/api/assessments/admin/models/[modelId]/components/route.ts` | Edit check before POST (add component) |
| `app/api/assessments/admin/models/[modelId]/components/[componentId]/route.ts` | Edit check before PATCH/DELETE |
| `app/api/assessments/admin/models/[modelId]/components/[componentId]/questions/route.ts` | Edit check before POST (add question) |
| `app/api/assessments/admin/models/[modelId]/components/[componentId]/questions/[questionId]/route.ts` | Edit check before PATCH/DELETE |
| `app/api/assessments/admin/models/[modelId]/components/[componentId]/questions/ai-generate/route.ts` | Edit check before AI generate |
| `app/api/assessments/admin/models/[modelId]/components/[componentId]/use-library/route.ts` | Edit check before use-library |
| `app/assessments/admin/models/page.tsx` | Unpublish menu item and handler |
| `app/assessments/admin/models/[modelId]/questions/page.tsx` | Published banner, Unpublish button, disabled Manual/Bulk/AI tabs, read-only question list |
| `components/assessments/QuestionList.tsx` | `readOnly` prop to hide Edit/Delete/Duplicate |

---

## 3. API Behavior

### Unpublish API
```
POST /api/assessments/admin/models/[modelId]/unpublish
```
- Requires auth.
- Checks `canUnpublishModel()` (Super Admin or hierarchy).
- Returns 403 if model is not published or user cannot unpublish.
- Sets `status: "DRAFT"` and clears publish-related fields.

### Component/Question mutation APIs
When the model is published, these return **403** with:
> "Model is published. Unpublish it first to make changes, then publish as the next version."

Protected endpoints:
- POST `/api/assessments/admin/models/[modelId]/components` (add component)
- PATCH/DELETE `/api/assessments/admin/models/[modelId]/components/[componentId]`
- POST `/api/assessments/admin/models/[modelId]/components/[componentId]/questions`
- PATCH/DELETE `/api/assessments/admin/models/[modelId]/components/[componentId]/questions/[questionId]`
- POST `/api/assessments/admin/models/[modelId]/components/[componentId]/questions/ai-generate`
- POST `/api/assessments/admin/models/[modelId]/components/[componentId]/use-library`

---

## 4. UI Behavior

### Assessment Models list (`/assessments/admin/models`)
- **Unpublish** in dropdown – Shown only when model is published; disabled when model is not published.
- **Publish** – Disabled when model is already published.

### Model Questions page (`/assessments/admin/models/[modelId]/questions`)
- **Published banner** – Shown when model is published, with Unpublish button.
- **Manual, Bulk, AI tabs** – Disabled when published.
- **Add button** – Hidden when published.
- **Save to Library** – Hidden when published.
- **Question list** – Edit/Delete/Duplicate hidden when published (`readOnly`).

---

## 5. Versioning

- On each publish, the model `version` is incremented (patch): `1.0.0` → `1.0.1`.
- Implemented in `bumpVersion()` in `lib/assessments/model-edit-permission.ts`.

---

## 6. Testing Checklist

| Test | Expected |
|------|----------|
| Publish a draft model | Status → PUBLISHED, version bumps |
| Unpublish a published model | Status → DRAFT |
| Add component to published model (API) | 403 with unpublish message |
| Add question to published model (API) | 403 with unpublish message |
| Unpublish, add component, publish | Success; new version |
| Published model questions page | Banner, disabled tabs, no edit/delete |
| Unpublish from questions page | Model becomes draft, edit controls enabled |
| Super Admin unpublish any model | Success |
| Non-admin (Employee) access to admin | Blocked by layout (Super Admin only) |

---

## 7. Notes

- The assessment admin layout currently restricts access to **Super Admin** only.
- Hierarchy checks (`canUnpublishModel`, `canEditModelComponents`) are in place for Org Admin, Dept Head, Team Lead when that access is enabled.
- Employees, Students, and B2C users do not reach these admin APIs; they are blocked earlier in the flow.
