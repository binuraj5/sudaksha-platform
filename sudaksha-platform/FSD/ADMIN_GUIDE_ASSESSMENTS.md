# Assessment Admin Guide

Quick guide for creating and managing assessment models and components.

---

## Overview

- **Roles** define competencies (master data).  
- **Assessment models** are built from a role: you choose a subset of competencies and assign weights.  
- **Components** are the actual assessment methods per competency (MCQ, Voice, Code, Adaptive, Panel, etc.).  
- **Questions** live inside components (static questions or, for Adaptive/Voice/Video, runtime-generated or configured).

Creating a model does **not** change the role; the model is a snapshot of your choices.

---

## Creating an assessment model

1. **Go to assessment admin**  
   Typically: **Assessments** → **Models** (or `/assessments/admin/models`).

2. **Create a new model**  
   - Name and description.  
   - Select **Role** and **Target level** (e.g. Senior).  
   - **Competency selection:** Choose which competencies to include and set **weights** (e.g. Leadership 30%, Communication 25%). Total should be 100%.  
   - Continue to **component selection** or **build** step.

3. **Add components per competency**  
   For each competency you can add one or more components. Suggested types (e.g. MCQ, Adaptive AI, Voice, Panel) are shown; you can pick multiple.  
   Then **build** each component (see below).

4. **Build each component**  
   - **MCQ / Situational / Essay:** Use **AI Generate**, **Manual**, or **Bulk upload** to add questions; save.  
   - **Voice / Video:** Configure (e.g. question count, max duration, competency/level); save. No static questions needed.  
   - **Code:** Use the code problem builder (language, test cases, etc.); save.  
   - **Adaptive AI:** Set min/max questions, starting difficulty, allowed types; save. One placeholder question is created for the runner.  
   - **Panel:** Select or create a **panel** (name, description, duration); set competency and target level; save. One placeholder question is created.

5. **Publish or save as draft**  
   When all components are built, **Publish** the model (or keep as **Draft**) so it can be assigned or taken.

---

## Key URLs and APIs

- **Models list:** `/assessments/admin/models`  
- **Model builder (components):** `/assessments/admin/models/[modelId]/builder`  
- **Panels:** `/api/assessments/panels` (GET/POST); panel members and schedule under `/api/assessments/panels/[panelId]/...`  
- **Runner (candidate):** Started from the assessment start/component start flow (project or member assessment).

---

## Component types summary

| Type        | Build method        | Runner behavior                                      |
|------------|---------------------|------------------------------------------------------|
| MCQ        | AI / Manual / Bulk  | Static questions, submit per section                 |
| Situational| AI / Manual / Bulk  | Same as MCQ                                         |
| Essay      | AI / Manual / Bulk  | Long-form text, submit per section                  |
| Voice      | Config only         | AI voice interview; record → transcribe → evaluate  |
| Video      | Config only         | Record per question → upload → analyze               |
| Code       | Problem builder     | Monaco editor, run tests, submit                    |
| Adaptive AI| Config only         | Runtime MCQ, difficulty adapts; one placeholder Q   |
| Panel      | Select/create panel | “Scheduled separately” + optional Schedule + Continue |

---

## Panel interviews

- **Panels** are created in **Panels** (or via `/api/assessments/panels`). Add **panel members** (users/roles).  
- When building a **Panel** component, choose a panel and set duration/competency/level.  
- **Scheduling:** Candidates can **Schedule** from the runner (B2C/Member flow); or admins create **Panel interviews** via `/api/assessments/panels/schedule`.  
- **Evaluation:** Panelists submit scores/feedback via `/api/assessments/panel-interviews/[id]/evaluate`. Submitted evaluations are **aggregated** automatically; the stored panel response score is updated so the section score reflects panel results.

---

## Deployment and run

See **FSD/DEPLOYMENT_AND_RUN_GUIDE.md** for local run, env vars, and production checklist.
