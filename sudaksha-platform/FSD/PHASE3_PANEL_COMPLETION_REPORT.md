# Phase 3: Panel Interview – Completion Report

## Implemented

### PanelRunner (candidate UI)
- **Path:** `components/assessments/PanelRunner.tsx`
- Shows "Panel interview – scheduled separately" with competency, target level, and duration.
- **Continue** button: POSTs to `/api/assessments/runner/response` with `responseData: { type: "PANEL_INTERVIEW", panelId, scheduledSeparately: true, competencyName, targetLevel, durationMinutes }`, then calls `onComplete()`.

### AssessmentRunner integration
- Runner state includes `usePanelInterview`, `panelConfig`, `panelQuestionId` (from start API).
- When set, runner renders `PanelRunner` with `onComplete={handleNextSection}`.
- Header: section name, timer, same layout as Voice/Video/Adaptive.

### Complete API scoring
- In `scoreResponse`, `type === "PANEL_INTERVIEW"` uses `responseData.finalScore` (0–100) to compute `pointsAwarded`. Until panel evaluations are aggregated and written back to the response, score is 0.

### Existing panel flow (unchanged)
- Panel APIs: GET/POST panels, PATCH panel, panel members, schedule, evaluate.
- `PanelComponentBuilder`: select/create panel, save config + placeholder question.
- Start API already returns `usePanelInterview`, `panelConfig`, `panelQuestionId` for PANEL components with `panelId`.

## Panel score aggregation (implemented)
- **`lib/assessment/panel-aggregation.ts`:** `aggregatePanelScoreAndUpdateResponse(panelInterviewId)` loads the panel interview (with evaluations and memberAssessment → member), computes aggregate score from evaluations’ `scores` (average of numeric values per evaluation, then across evaluations, 0–100), finds the candidate’s `UserAssessmentComponent` and the `ComponentQuestionResponse` with `type: "PANEL_INTERVIEW"`, updates `responseData.finalScore`, and recalculates the component’s score/percentage.
- **Evaluate API:** After creating a `PanelEvaluation`, calls `aggregatePanelScoreAndUpdateResponse(panelInterviewId)` in the background (fire-and-forget). Each new evaluation submission refreshes the stored panel score.
- **B2C only:** Aggregation resolves the candidate via `MemberAssessment` → `Member` → `User` (by email) → `UserAssessmentModel` → `UserAssessmentComponent`. Org flow (ProjectUserAssessment) not wired for panel yet.

## Optional follow-ups
- **Schedule CTA in PanelRunner:** Optional "Schedule" button that calls `/api/assessments/panels/schedule` and shows confirmation (if product spec requires it).
- **Org flow:** If panel is used with ProjectUserAssessment, add resolution path in aggregation (projectUserAssessmentId + componentId → UserAssessmentComponent).
