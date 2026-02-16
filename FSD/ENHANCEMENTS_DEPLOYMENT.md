# Sudaksha Enhancements – Deployment Guide

This document describes the migrations and changes introduced by the FSD Enhancement Specification v3 (Phases 1–4).

## Migration Order

Run migrations in this order (oldest first). Prisma will apply them in timestamp order when you run `npx prisma migrate deploy`.

1. **20260205000000_add_member_enrollment_employee_ids**  
   - Adds `enrollmentNumber` and `employeeId` to `Member` (Enhancement #4).

2. **20260205000001_add_member_has_graduated**  
   - Adds `hasGraduated` and `graduationDate` to `Member` (Enhancement #2).

3. **20260205000002_add_approval_history**  
   - Creates `ApprovalHistory` table for role/competency approval audit (Enhancement #1 / Phase 3).

4. **20260205000003_add_recommendation_tables**  
   - Creates `RecommendationRule` and `RecommendationUsage` (Enhancement #5 / Phase 4).

## Deploy Steps

1. **Backup** your database before running migrations.

2. **Apply migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Regenerate Prisma client** (if not done automatically)
   ```bash
   npx prisma generate
   ```

4. **Restart** the application.

## Implemented Features

- **Phase 1 (done earlier):** Unique IDs (enrollment_number, employee_id), Role Matrix nav label.
- **Phase 2:** Student level restrictions (has_graduated, graduation_date), level validation in assignment engine, target-audience and level UI on assessment create.
- **Phase 3:** ApprovalHistory table for future approval workflow.
- **Phase 4:** RecommendationRule/RecommendationUsage tables, assessment recommendations API, RecommendationCard on assessment create.

## Optional: Seed Recommendation Rules

To add DB-driven recommendation rules (Enhancement #5), insert into `RecommendationRule` with `category = 'ASSESSMENT'`, `triggerContext` (JSONB), `recommendationText`, `rationale`, `autoApplyValues` (JSONB). The UI currently uses built-in rules when no DB rules exist.
