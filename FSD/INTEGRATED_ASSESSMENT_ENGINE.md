# Integrated Assessment Engine – Architecture & Implementation

## Overview

All assessment models follow: **Role → Competencies → Level**. Once finalized, the user selects components per competency, the system suggests components, and the user builds each component competency-wise before publishing.

---

## 1. Data Flow (Role → Competencies → Level → Components)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Role & Level Selection                                          │
│ - Select Role (from admin roles)                                         │
│ - Select Target Level (JUNIOR | MIDDLE | SENIOR | EXPERT)                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Competency Selection (Model-Scoped)                              │
│ - Select subset of role competencies for THIS model                      │
│ - Set weights per competency (must sum to 100%)                           │
│ - Role is NEVER modified (CURSOR_ROLE_MODEL_ARCHITECTURE_FIX)            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Component Suggestions & Selection                               │
│ - System suggests components per competency (ComponentSuggester)         │
│ - User selects: MCQ, Long Answer, Situational, AI Voice, AI Video,       │
│   Code Test, Adaptive Questionnaire                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Build Each Component (Competency-Wise)                            │
│ - Per competency × component type: build interface                        │
│ - MCQ/Situational/Essay: AI Generate | Manual | Library | Bulk           │
│ - AI Voice: Configure prompts, duration → Python backend                │
│ - AI Video: Configure prompts, duration → Python backend                │
│ - Code Test: Configure problem, test cases → Python backend              │
│ - Adaptive Questionnaire: Configure branching logic                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Publish Model                                                    │
│ - All components built for each competency                               │
│ - Model ready for assignment                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Types (User-Facing vs Internal)

| User Term            | Internal Type           | Build Interface                    | Backend          |
|----------------------|-------------------------|------------------------------------|------------------|
| MCQ                  | MCQ                     | AI Generate, Manual, Library, Bulk | Next.js AI       |
| Long Answer          | ESSAY                   | AI Generate, Manual, Library, Bulk | Next.js AI       |
| Situational          | SITUATIONAL             | AI Generate, Manual, Library, Bulk | Next.js AI       |
| AI Voice             | VOICE                   | Voice config (prompts, duration)   | Python FastAPI   |
| AI Video             | VIDEO                   | Video config (prompts, duration)   | Python FastAPI   |
| Code Test            | CODE                    | Problem + test cases               | Python FastAPI   |
| Adaptive Questionnaire | ADAPTIVE_QUESTIONNAIRE | Branching rules, question pool     | Next.js          |

---

## 3. Component Suggestion Logic (Per Competency × Level)

| Competency Category | Suggested Components (by priority) |
|---------------------|-----------------------------------|
| TECHNICAL           | MCQ (HIGH), CODE (HIGH), SITUATIONAL (MEDIUM) |
| BEHAVIORAL          | MCQ (HIGH), SITUATIONAL (HIGH), VIDEO (MEDIUM/HIGH), VOICE (MEDIUM), PANEL (LOW/HIGH) |
| COGNITIVE           | MCQ (HIGH), ESSAY (HIGH), SITUATIONAL (MEDIUM), VOICE (MEDIUM) |
| DOMAIN_SPECIFIC     | MCQ (HIGH), SITUATIONAL (MEDIUM), ESSAY (MEDIUM) |

**Level-specific:** SENIOR/EXPERT → add ESSAY if not present; VIDEO/PANEL higher priority.

**VOICE** is now suggested for BEHAVIORAL and COGNITIVE (communication/verbal assessment).

---

## 4. Reusable Components (Audit)

### UI (from `components/ui/`)
- Button, Card, Badge, Dialog, Input, Select, Label, Tabs, Progress, Slider
- Use these; do not recreate.

### Assessment (from `components/assessments/`)
- `ModelCompetencySelector` – competency selection + weights
- `ComponentBuildingView` – build table + method selection
- `AIGenerateQuestions` – MCQ/Situational/Essay AI generation
- `QuestionForm` – manual question entry
- `BulkUploadQuestions` – CSV/Excel upload
- `LibraryBrowser` – select from component library
- `IndicatorPreview` – show indicators

### APIs
- `/api/assessments/admin/models` – CRUD
- `/api/assessments/admin/models/[modelId]/components` – components CRUD
- `/api/assessments/admin/models/from-wizard` – create from wizard
- `/api/assessments/admin/components/[id]/questions/bulk-json` – save questions
- `/api/assessments/library` – component library
- Python: `/api/voice/*`, `/api/video/*`, `/api/code/*`

---

## 5. Specialized Build Interfaces (New)

### 5.1 AI Voice Component Builder
- **Input:** competency name, target level, indicators
- **Config:** question count (3–5), max duration per question
- **Storage:** Store config in component metadata; questions generated at runtime by Python
- **Reuse:** `lib/python-api.ts` – `startVoiceInterview`, `processVoiceResponse`, `evaluateVoiceInterview`

### 5.2 AI Video Component Builder
- **Input:** competency name, target level, indicators
- **Config:** question count, max duration, retakes allowed
- **Storage:** Config in metadata; recording/evaluation at runtime
- **Reuse:** Python video router (placeholder; extend as needed)

### 5.3 Code Test Component Builder
- **Input:** competency, target level
- **Config:** problem statement, language, test cases (input/output)
- **Storage:** Store in component questions or metadata
- **Reuse:** `lib/python-api.ts` – `executeCodePython`

### 5.4 Adaptive Questionnaire Builder
- **Input:** competency, indicators
- **Config:** question pool, branching rules (if answer X then next Y)
- **Storage:** Questions + metadata for branching
- **Reuse:** Extend `QuestionForm` / question types

---

## 6. Implementation Checklist

- [x] Role–model separation (no role modification during model creation)
- [x] ModelCompetencySelector with weights
- [x] ComponentSuggester with MCQ, SITUATIONAL, CODE, ESSAY, VIDEO, PANEL
- [x] **Add VOICE to ComponentSuggester** (BEHAVIORAL, COGNITIVE)
- [x] **Add ADAPTIVE_QUESTIONNAIRE** to enum and suggester
- [x] **VoiceComponentBuilder** – config UI for VOICE
- [x] **VideoComponentBuilder** – config UI for VIDEO
- [x] **CodeComponentBuilder** – config UI for CODE
- [x] **AdaptiveQuestionnaireBuilder** – placeholder (uses standard options)
- [x] **ComponentBuildingView** – route to correct builder by component type
- [x] Ensure all component types appear in Add Component dialog

---

## 7. File Changes Summary

| File | Action |
|------|--------|
| `lib/assessment/component-suggester.ts` | Add VOICE to BEHAVIORAL/COGNITIVE; add ADAPTIVE_QUESTIONNAIRE |
| `components/assessments/ComponentBuildingView.tsx` | Route VOICE/VIDEO/CODE/ADAPTIVE to specialized builders |
| `components/assessments/VoiceComponentBuilder.tsx` | NEW – Voice config UI |
| `components/assessments/VideoComponentBuilder.tsx` | NEW – Video config UI |
| `components/assessments/CodeComponentBuilder.tsx` | NEW – Code problem config UI |
| `components/assessments/AdaptiveQuestionnaireBuilder.tsx` | NEW – Adaptive config UI |
| `app/assessments/admin/models/[modelId]/builder/page.tsx` | Ensure VOICE/VIDEO/CODE/ADAPTIVE in suggestions |
