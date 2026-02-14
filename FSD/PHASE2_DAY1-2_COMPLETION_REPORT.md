# Phase 2, Day 1–2: Voice Interview – Completion Report

**Date:** February 15, 2026  
**Status:** Complete

---

## Summary

Phase 2 Day 1–2 (Voice Interview) is implemented. Voice components now save config to `component.config`, and candidates take AI-powered voice interviews via the Python backend.

---

## Completed Items

### 1. VoiceComponentBuilder – Config to component.config

- **File:** `components/assessments/VoiceComponentBuilder.tsx`
- Saves config via `PATCH /api/assessments/admin/models/[modelId]/components/[componentId]`
- Config: `{ questionCount, maxDurationPerQuestion, competencyName, targetLevel }`
- Still creates a placeholder question via bulk-json for runner compatibility
- Added `modelId` and `initialConfig` props; `ComponentBuildingView` passes them

### 2. Next.js API Proxy Routes for Python Voice

- **Files:**
  - `app/api/voice/transcribe/route.ts` – proxies FormData with audio
  - `app/api/voice/start-interview/route.ts` – proxies start-interview
  - `app/api/voice/respond/route.ts` – proxies respond
  - `app/api/voice/evaluate/route.ts` – proxies evaluate
- All routes require auth via `getApiSession()`
- Use `lib/python-api.ts` to call Python backend (`PYTHON_API_URL`)

### 3. VoiceInterviewRunner Component

- **File:** `components/assessments/VoiceInterviewRunner.tsx`
- Flow:
  1. `POST /api/voice/start-interview` → first question
  2. Show question → user records → `POST /api/voice/transcribe`
  3. `POST /api/voice/respond` → follow-up or completion
  4. Repeat until `questionCount` or `is_complete`
  5. `POST /api/voice/evaluate` → scores
  6. Save via `POST /api/assessments/runner/response`
  7. Call `onComplete()` → move to next section

### 4. Runner Start API & AssessmentRunner

- **Start API** (`app/api/assessments/runner/[id]/component/[componentId]/start/route.ts`):
  - Detects VOICE component via `componentType === "VOICE"`
  - Reads config from `component.config` or first question metadata (legacy)
  - Returns `useVoiceInterview`, `voiceConfig`, `voiceQuestionId`
- **AssessmentRunner** (`components/assessments/AssessmentRunner.tsx`):
  - When `useVoiceInterview`, renders `VoiceInterviewRunner` instead of question list
  - Passes `userComponentId`, `questionId`, `voiceConfig`, `sectionName`, `onComplete`

### 5. Voice Scoring in Complete API

- **File:** `app/api/assessments/runner/[id]/component/[componentId]/complete/route.ts`
- `scoreResponse` handles `VOICE_RESPONSE` and `type: "VOICE_INTERVIEW"`
- Uses `overall_score` (0–100) to compute `pointsAwarded`

---

## Prerequisites

1. **Python backend** running at `PYTHON_API_URL` (default: `http://localhost:8000`)
2. **OPENAI_API_KEY** set in Python backend for Whisper and GPT
3. **PYTHON_API_URL** in `.env` for Next.js server

---

## Files Changed/Created

| File | Action |
|------|--------|
| `components/assessments/VoiceComponentBuilder.tsx` | Modified – PATCH config, modelId, initialConfig |
| `components/assessments/ComponentBuildingView.tsx` | Modified – pass modelId, initialConfig to Voice |
| `app/api/voice/transcribe/route.ts` | Created |
| `app/api/voice/start-interview/route.ts` | Created |
| `app/api/voice/respond/route.ts` | Created |
| `app/api/voice/evaluate/route.ts` | Created |
| `components/assessments/VoiceInterviewRunner.tsx` | Created |
| `app/api/assessments/runner/.../start/route.ts` | Modified – voice detection, voiceConfig |
| `app/api/assessments/runner/.../complete/route.ts` | Modified – VOICE scoring |
| `components/assessments/AssessmentRunner.tsx` | Modified – VoiceInterviewRunner integration |

---

## Next: Phase 2 Day 3–4 (Video Interview)

- Video recording UI
- Video upload to Python
- Video analysis (OpenCV, MediaPipe)
- Evaluation interface
