# Phase 3: Adaptive AI – Completion Report (M9-5 + Master Doc)

**Date:** February 15, 2026  
**Status:** Complete

---

## Summary

Adaptive AI component is implemented per **M9-5_ADAPTIVE_AI_COMPONENT_IMPLEMENTATION.md** and **MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md**: configuration UI, engine, runtime question generation, scoring (linear 7.5/10 = 75/100), and runner integration. The candidate sees a normal assessment (no “adaptive” branding).

---

## Completed Items

### 1. Adaptive Engine (`lib/assessment/adaptive-engine.ts`)

- **AdaptiveEngine** class:
  - `calculateNextDifficulty()` – adjusts difficulty from recent performance (accuracy ≥0.75 → harder, ≤0.4 → easier)
  - `shouldContinue()` – min/max questions and stopping (MAX_QUESTIONS, HIGH_CONFIDENCE, BOTH)
  - `calculateFinalScore()` – **linear conversion**: ability 1–10 → score 0–100 (e.g. 7.5/10 = 75/100)
  - `getBaselineAbility(targetLevel)` – JUNIOR 3, MIDDLE 5, SENIOR 7, EXPERT 9
  - `estimateRemainingQuestions()` – for UI
- Uses **AdaptiveConfig** from AdaptiveConfigForm (min_questions, max_questions, starting_difficulty, allowed_question_types, stopping_criteria, etc.).

### 2. Adaptive Question Generator (`lib/assessment/adaptive-question-generator.ts`)

- **generateAdaptiveQuestion()** – builds prompt from competency, difficulty, previous questions, indicators; calls OpenAI; creates **AdaptiveQuestion** in DB; returns question for runner.
- Supports MCQ and scenario-style; fallback question if AI fails.
- Uses existing Prisma **AdaptiveSession** and **AdaptiveQuestion** models.

### 3. API Routes

- **POST /api/assessments/adaptive/start**
  - Body: `{ assessmentId, componentId }` (assessmentId = MemberAssessment.id for B2C).
  - Resolves member, MemberAssessment, component (ADAPTIVE_AI / ADAPTIVE_QUESTIONNAIRE), config.
  - Creates **AdaptiveSession** (memberAssessmentId, componentId, memberId, competencyId, config, initialAbility from target level).
  - Generates first question via **generateAdaptiveQuestion**.
  - Returns: sessionId, initialAbility, targetLevel, config, firstQuestion.

- **POST /api/assessments/adaptive/answer** (existing, now backed by real engine/generator)
  - Body: `{ sessionId, questionId, answer, timeTaken }`.
  - Evaluates answer, updates AdaptiveQuestion and AdaptiveSession (questionsAsked, questionsCorrect).
  - Uses **AdaptiveEngine** for shouldContinue and next difficulty.
  - Generates next question via **generateAdaptiveQuestion** when continuing.
  - Returns: wasCorrect, explanation, correctAnswer, nextQuestion, shouldContinue, estimatedRemaining.

- **POST /api/assessments/adaptive/complete**
  - Body: `{ sessionId }`.
  - Marks session COMPLETED, computes final score via **AdaptiveEngine.calculateFinalScore()** (linear conversion).
  - Updates session finalScore, abilityEstimate.
  - Returns: sessionId, finalScore, abilityEstimate, accuracy, questionsAsked, questionsCorrect.

### 4. Runner Integration

- **Runner start API** (`/api/assessments/runner/[id]/component/[componentId]/start`):
  - Detects ADAPTIVE_AI / ADAPTIVE_QUESTIONNAIRE (config.min_questions or component.config).
  - Returns: `useAdaptiveInterview: true`, `adaptiveAssessmentId`, `adaptiveComponentId`, `adaptiveQuestionId` (placeholder question id).
- **AdaptiveConfigForm** – on save, PATCHes component config and creates **one placeholder question** via bulk-json (so runner has a questionId to attach the final score to).
- **Complete API** – `scoreResponse` handles `type: "ADAPTIVE_INTERVIEW"` using `finalScore` for points (linear scale).

### 5. AdaptiveRunner UI (`components/assessments/AdaptiveRunner.tsx`)

- On mount: **POST /api/assessments/adaptive/start** with assessmentId, componentId.
- Renders first question (MCQ/radio); no “adaptive” or “AI” wording (M9-5 requirement).
- On submit: **POST /api/assessments/adaptive/answer**; if `shouldContinue`, shows next question; else **POST /api/assessments/adaptive/complete**, then **POST /api/assessments/runner/response** with `responseData: { type: "ADAPTIVE_INTERVIEW", finalScore, abilityEstimate, ... }`, then `onComplete()`.

### 6. AssessmentRunner

- When `useAdaptiveInterview` and adaptive ids + `adaptiveQuestionId` present, renders **AdaptiveRunner** instead of question list (same pattern as Voice/Video).

---

## Requirements Met (M9-5 + Master)

- Per-component adaptive: ADAPTIVE_AI is a selectable component type.
- Admin-chosen question types: config.allowed_question_types (MCQ, SITUATIONAL, etc.).
- Mixed components: same competency can have static + adaptive.
- Config in component.config; placeholder question for scoring.
- **Linear conversion scoring**: 7.5/10 ability → 75/100 (in engine and complete route).
- **Hidden from candidate**: UI is generic “answer the question” / “Submit & Next”.
- Backend: Next.js API routes (no Python for adaptive).

---

## Files Created/Updated

| File | Action |
|------|--------|
| `lib/assessment/adaptive-engine.ts` | Created |
| `lib/assessment/adaptive-question-generator.ts` | Created |
| `app/api/assessments/adaptive/start/route.ts` | Created |
| `app/api/assessments/adaptive/complete/route.ts` | Created |
| `app/api/assessments/adaptive/answer/route.ts` | Existing (uses engine + generator) |
| `app/api/assessments/runner/.../start/route.ts` | Modified – isAdaptiveAI, useAdaptiveInterview, adaptive* ids |
| `app/api/assessments/runner/.../complete/route.ts` | Modified – ADAPTIVE_INTERVIEW scoring |
| `components/assessments/AdaptiveConfigForm.tsx` | Modified – bulk-json placeholder question on save |
| `components/assessments/AdaptiveRunner.tsx` | Created |
| `components/assessments/AssessmentRunner.tsx` | Modified – AdaptiveRunner branch |

---

## Prerequisites

- **OPENAI_API_KEY** for adaptive question generation (gpt-4o-mini).
- **MemberAssessment** B2C flow (adaptive/start uses memberAssessmentId); ProjectUserAssessment path can be added later if needed.

---

## Next: Phase 3 Day 4–5 (Panel Interview)

- Panel creation UI
- Scheduling interface
- Calendar integration
- Evaluation forms
- Aggregated results
