# MASTER IMPLEMENTATION GUIDE
## Complete Integrated Assessment Engine - All Features

**Version:** 2.0  
**Date:** February 2026  
**Purpose:** Single comprehensive guide for building the complete assessment system

---

## 🎯 EXECUTIVE SUMMARY

This document integrates ALL assessment features into ONE cohesive system:

✅ Role-Model Architecture (roles = master, models = snapshots)  
✅ Complete Component Types (MCQ, Essay, Situational, Voice, Video, Code, Adaptive AI, Panel)  
✅ Intelligent Component Suggestion  
✅ Multiple Build Methods (AI Generate, Manual, Bulk Upload, Library)  
✅ Python Backend Integration (Voice, Video, Code)  
✅ Adaptive AI with Real-time Difficulty  
✅ End-to-End Workflows  

---

# PART 1: ARCHITECTURE & DATA MODEL

## 1.1 Core Concepts

### **Three-Level Hierarchy:**

```
ROLES (Master Data - Admin Managed)
  ↓
ASSESSMENT MODELS (Per-User Snapshots)
  ↓
COMPONENTS (Assessment Methods per Competency)
  ↓
QUESTIONS (Actual Assessment Items)
```

### **Key Principle: Role Immutability**
- **Roles** are master templates with ALL competencies
- Creating a model does NOT modify the role
- Users select SUBSET of competencies for their model
- Each model has its own weights

---

## 1.2 Complete Database Schema

```sql
-- ============================================
-- PART 1: CORE ASSESSMENT STRUCTURE
-- ============================================

-- Existing: assessment_models
-- Add these fields:
ALTER TABLE assessment_models
ADD COLUMN visibility VARCHAR(20) DEFAULT 'PRIVATE',
ADD COLUMN published_to_global BOOLEAN DEFAULT false,
ADD COLUMN completion_percentage INT DEFAULT 0,
ADD COLUMN global_publish_status VARCHAR(20),
ADD COLUMN target_level VARCHAR(20); -- JUNIOR | MIDDLE | SENIOR | EXPERT

-- Existing: assessment_model_components
-- Add these fields:
ALTER TABLE assessment_model_components
ADD COLUMN component_type VARCHAR(50), -- MCQ | SITUATIONAL | ESSAY | VOICE | VIDEO | CODE | ADAPTIVE_AI | PANEL
ADD COLUMN status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT | IN_PROGRESS | COMPLETE
ADD COLUMN completion_percentage INT DEFAULT 0,
ADD COLUMN estimated_duration INT, -- minutes
ADD COLUMN is_from_library BOOLEAN DEFAULT false,
ADD COLUMN library_component_id UUID,
ADD COLUMN config JSONB; -- Component-specific configuration

-- ============================================
-- PART 2: COMPONENT LIBRARY
-- ============================================

CREATE TABLE component_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_by UUID NOT NULL REFERENCES users(id),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  competency_id UUID NOT NULL REFERENCES competencies(id),
  component_type VARCHAR(50) NOT NULL,
  target_level VARCHAR(20) NOT NULL,
  
  -- Content (questions or config)
  questions JSONB, -- For MCQ, SITUATIONAL, ESSAY
  config JSONB, -- For VOICE, VIDEO, CODE, ADAPTIVE_AI
  
  visibility VARCHAR(20) DEFAULT 'PRIVATE',
  usage_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_component_library_competency ON component_library(competency_id);
CREATE INDEX idx_component_library_type ON component_library(component_type);

-- ============================================
-- PART 3: ADAPTIVE AI COMPONENTS
-- ============================================

-- Adaptive Component Library (reusable configs)
CREATE TABLE adaptive_component_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_by UUID NOT NULL REFERENCES users(id),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  competency_id UUID NOT NULL REFERENCES competencies(id),
  target_level VARCHAR(20) NOT NULL,
  
  config JSONB NOT NULL, -- min_questions, max_questions, starting_difficulty, etc.
  visibility VARCHAR(20) DEFAULT 'PRIVATE',
  usage_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adaptive Assessment Runtime Sessions
CREATE TABLE adaptive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_submission_id UUID NOT NULL REFERENCES assessment_submissions(id),
  component_id UUID NOT NULL REFERENCES assessment_model_components(id),
  member_id UUID NOT NULL REFERENCES members(id),
  competency_id UUID NOT NULL REFERENCES competencies(id),
  
  -- Adaptive state
  current_ability DECIMAL(4,2) NOT NULL, -- 1.00 to 10.00
  initial_ability DECIMAL(4,2) NOT NULL,
  target_level VARCHAR(20) NOT NULL,
  
  questions_asked INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS',
  
  config JSONB NOT NULL,
  
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  final_score DECIMAL(5,2), -- 0-100
  ability_estimate DECIMAL(4,2) -- Final ability 1-10
);

-- Runtime Generated Questions
CREATE TABLE adaptive_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES adaptive_sessions(id),
  
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  
  difficulty DECIMAL(4,2) NOT NULL, -- 1.00 to 10.00
  sequence_number INT NOT NULL,
  
  generation_prompt TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  
  candidate_answer TEXT,
  is_correct BOOLEAN,
  time_taken_seconds INT,
  answered_at TIMESTAMP,
  
  points_awarded DECIMAL(5,2),
  max_points DECIMAL(5,2)
);

-- ============================================
-- PART 4: PANEL INTERVIEW
-- ============================================

CREATE TABLE panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE panel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES panels(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(100), -- e.g., "Hiring Manager", "Tech Lead"
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE panel_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_submission_id UUID NOT NULL REFERENCES assessment_submissions(id),
  component_id UUID NOT NULL REFERENCES assessment_model_components(id),
  panel_id UUID NOT NULL REFERENCES panels(id),
  candidate_id UUID NOT NULL REFERENCES members(id),
  
  scheduled_time TIMESTAMP NOT NULL,
  duration_minutes INT NOT NULL,
  meeting_link VARCHAR(500),
  
  status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED | COMPLETED | CANCELLED
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE panel_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_interview_id UUID NOT NULL REFERENCES panel_interviews(id),
  panel_member_id UUID NOT NULL REFERENCES panel_members(id),
  
  scores JSONB NOT NULL, -- {competency_id: score}
  feedback TEXT,
  recommendation VARCHAR(50), -- STRONG_HIRE | HIRE | MAYBE | NO_HIRE
  
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PART 5: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_adaptive_sessions_submission ON adaptive_sessions(assessment_submission_id);
CREATE INDEX idx_adaptive_sessions_status ON adaptive_sessions(status);
CREATE INDEX idx_adaptive_questions_session ON adaptive_questions(session_id);
CREATE INDEX idx_panel_interviews_submission ON panel_interviews(assessment_submission_id);
CREATE INDEX idx_panel_evaluations_interview ON panel_evaluations(panel_interview_id);
```

---

# PART 2: COMPONENT TYPES & SUGGESTION ENGINE

## 2.1 Complete Component Type List

| User-Facing Name | Internal Type | Build Methods | Backend |
|-----------------|---------------|---------------|---------|
| **Multiple Choice** | MCQ | AI Generate, Manual, Bulk Upload, Library | Next.js |
| **Short Answer** | SHORT_ANSWER | AI Generate, Manual, Bulk Upload, Library | Next.js |
| **Essay** | ESSAY | AI Generate, Manual, Bulk Upload, Library | Next.js |
| **Situational Judgment** | SITUATIONAL | AI Generate, Manual, Bulk Upload, Library | Next.js |
| **AI Voice Interview** | VOICE | Configuration UI | Python FastAPI |
| **AI Video Interview** | VIDEO | Configuration UI | Python FastAPI |
| **Code Challenge** | CODE | Problem Builder | Python FastAPI |
| **Adaptive AI Questions** | ADAPTIVE_AI | Configuration UI | Next.js |
| **Panel Interview** | PANEL | Scheduling UI | Next.js |

---

## 2.2 Component Suggester Logic

**File:** `lib/assessment/component-suggester.ts`

```typescript
export enum ComponentType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  SITUATIONAL = 'SITUATIONAL',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  CODE = 'CODE',
  ADAPTIVE_AI = 'ADAPTIVE_AI',
  PANEL = 'PANEL'
}

export interface ComponentSuggestion {
  type: ComponentType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  estimatedQuestions: number;
  estimatedDuration: number; // minutes
  icon: string;
}

export class ComponentSuggester {
  static suggestComponents(
    competency: Competency,
    targetLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT'
  ): ComponentSuggestion[] {
    const suggestions: ComponentSuggestion[] = [];
    const category = competency.category;
    
    // ALWAYS suggest MCQ (universal)
    suggestions.push({
      type: ComponentType.MCQ,
      priority: 'HIGH',
      reason: 'Quick knowledge verification',
      estimatedQuestions: this.getQuestionCount('MCQ', targetLevel),
      estimatedDuration: this.getDuration('MCQ', targetLevel),
      icon: '📝'
    });
    
    // ALWAYS suggest Adaptive AI (intelligent alternative to static MCQ)
    suggestions.push({
      type: ComponentType.ADAPTIVE_AI,
      priority: 'HIGH',
      reason: 'AI adapts difficulty in real-time for precise measurement',
      estimatedQuestions: 12, // average
      estimatedDuration: 20,
      icon: '🤖'
    });
    
    // Category-specific suggestions
    switch (category) {
      case 'TECHNICAL':
        suggestions.push(
          {
            type: ComponentType.CODE,
            priority: 'HIGH',
            reason: 'Hands-on technical validation',
            estimatedQuestions: 2,
            estimatedDuration: 45,
            icon: '💻'
          },
          {
            type: ComponentType.SITUATIONAL,
            priority: 'MEDIUM',
            reason: 'Technical decision-making scenarios',
            estimatedQuestions: 3,
            estimatedDuration: 15,
            icon: '📋'
          }
        );
        break;
        
      case 'BEHAVIORAL':
      case 'LEADERSHIP':
        suggestions.push(
          {
            type: ComponentType.SITUATIONAL,
            priority: 'HIGH',
            reason: 'Behavioral scenarios and judgment',
            estimatedQuestions: 5,
            estimatedDuration: 20,
            icon: '📋'
          },
          {
            type: ComponentType.VIDEO,
            priority: targetLevel === 'SENIOR' || targetLevel === 'EXPERT' ? 'HIGH' : 'MEDIUM',
            reason: 'Assess leadership presence and communication',
            estimatedQuestions: 2,
            estimatedDuration: 15,
            icon: '🎥'
          },
          {
            type: ComponentType.VOICE,
            priority: 'MEDIUM',
            reason: 'Conversational assessment of behavioral competencies',
            estimatedQuestions: 3,
            estimatedDuration: 10,
            icon: '🎙️'
          },
          {
            type: ComponentType.PANEL,
            priority: targetLevel === 'SENIOR' || targetLevel === 'EXPERT' ? 'HIGH' : 'LOW',
            reason: 'Live interview for leadership roles',
            estimatedQuestions: 1,
            estimatedDuration: 45,
            icon: '👥'
          }
        );
        break;
        
      case 'COMMUNICATION':
        suggestions.push(
          {
            type: ComponentType.ESSAY,
            priority: 'HIGH',
            reason: 'Written communication assessment (Versant-style)',
            estimatedQuestions: 2,
            estimatedDuration: 30,
            icon: '📄'
          },
          {
            type: ComponentType.SHORT_ANSWER,
            priority: 'MEDIUM',
            reason: 'Concise written responses',
            estimatedQuestions: 5,
            estimatedDuration: 15,
            icon: '✍️'
          },
          {
            type: ComponentType.VOICE,
            priority: 'HIGH',
            reason: 'Verbal communication fluency (Versant-style)',
            estimatedQuestions: 4,
            estimatedDuration: 12,
            icon: '🎙️'
          },
          {
            type: ComponentType.VIDEO,
            priority: 'MEDIUM',
            reason: 'Presentation and articulation skills',
            estimatedQuestions: 2,
            estimatedDuration: 10,
            icon: '🎥'
          }
        );
        break;
        
      case 'COGNITIVE':
      case 'ANALYTICAL':
        suggestions.push(
          {
            type: ComponentType.ESSAY,
            priority: 'HIGH',
            reason: 'Critical thinking and analysis',
            estimatedQuestions: 2,
            estimatedDuration: 30,
            icon: '📄'
          },
          {
            type: ComponentType.SITUATIONAL,
            priority: 'MEDIUM',
            reason: 'Problem-solving scenarios',
            estimatedQuestions: 4,
            estimatedDuration: 18,
            icon: '📋'
          },
          {
            type: ComponentType.VOICE,
            priority: 'MEDIUM',
            reason: 'Verbal reasoning assessment',
            estimatedQuestions: 3,
            estimatedDuration: 10,
            icon: '🎙️'
          }
        );
        break;
        
      default:
        suggestions.push({
          type: ComponentType.SITUATIONAL,
          priority: 'MEDIUM',
          reason: 'Scenario-based assessment',
          estimatedQuestions: 4,
          estimatedDuration: 18,
          icon: '📋'
        });
    }
    
    // Sort by priority
    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    return suggestions.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }
  
  private static getQuestionCount(type: string, level: string): number {
    const baseCount = {
      MCQ: 10,
      SHORT_ANSWER: 5,
      ESSAY: 2,
      SITUATIONAL: 5,
      CODE: 2,
      VOICE: 3,
      VIDEO: 2,
      ADAPTIVE_AI: 12,
      PANEL: 1
    };
    
    const levelMultiplier = {
      JUNIOR: 0.8,
      MIDDLE: 1.0,
      SENIOR: 1.2,
      EXPERT: 1.5
    };
    
    return Math.round((baseCount[type] || 10) * levelMultiplier[level]);
  }
  
  private static getDuration(type: string, level: string): number {
    const baseDuration = {
      MCQ: 15,
      SHORT_ANSWER: 15,
      ESSAY: 30,
      SITUATIONAL: 20,
      CODE: 45,
      VOICE: 10,
      VIDEO: 15,
      ADAPTIVE_AI: 20,
      PANEL: 45
    };
    
    return Math.round((baseDuration[type] || 20));
  }
}
```

---

# PART 3: USER WORKFLOWS

## 3.1 Admin Workflow: Creating Assessment Model

```
STEP 1: Start Creation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page: /assessments/admin/models/create

[Name Assessment]
Assessment Name: "Senior PM Hiring - Q1 2026"
Description: "Assessment for senior project manager candidates"

[Select Role & Level]
Role: [Project Manager - IT ▼]  ← Dropdown of all roles
Target Level: ○ Junior ○ Middle ● Senior ○ Expert

[Continue to Competency Selection →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: Select Competencies (Model-Scoped)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page: /assessments/admin/models/create (Step 2)

Available Competencies from Role:
(Showing 7 competencies from "Project Manager - IT" role)

☑ Leadership                    Weight: [30]%
☑ Communication                 Weight: [25]%
☑ Problem Solving               Weight: [25]%
☑ Technical Skills              Weight: [20]%
☐ Stakeholder Management        Weight: [--]
☐ Project Planning              Weight: [--]
☐ Risk Management               Weight: [--]

Total Weight: 100% ✓

Note: Selecting/deselecting competencies does NOT modify the role.
This selection is ONLY for this assessment model.

[View Role Details →] (opens role page in new tab)

[Continue to Component Selection →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: Component Selection & Suggestions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page: /assessments/admin/models/build

Competency-by-Competency Component Selection:

┌─────────────────────────────────────────────────┐
│ Leadership (30% of assessment)                  │
├─────────────────────────────────────────────────┤
│ Suggested Components:                           │
│ 🤖 Adaptive AI (HIGH) - Smart difficulty        │
│ 📝 MCQ (HIGH) - Quick knowledge                 │
│ 📋 Situational (HIGH) - Behavioral scenarios    │
│ 🎙️ Voice (MEDIUM) - Conversational             │
│ 🎥 Video (HIGH) - Leadership presence           │
│ 👥 Panel (HIGH) - Live interview                │
│                                                 │
│ Your Selection:                                 │
│ ☑ MCQ (10 questions, ~15 min)                  │
│ ☑ Situational (5 scenarios, ~20 min)           │
│ ☑ Adaptive AI (8-15 questions, ~20 min)        │
│                                                 │
│ [Build These Components →]                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Communication (25% of assessment)               │
├─────────────────────────────────────────────────┤
│ Suggested Components:                           │
│ 📄 Essay (HIGH) - Written communication         │
│ ✍️ Short Answer (MEDIUM) - Concise writing     │
│ 🎙️ Voice (HIGH) - Versant-style fluency        │
│ 🎥 Video (MEDIUM) - Presentation skills         │
│                                                 │
│ Your Selection:                                 │
│ ☑ Essay (2 prompts, ~30 min)                   │
│ ☑ Voice (4 questions, ~12 min)                 │
│                                                 │
│ [Build These Components →]                      │
└─────────────────────────────────────────────────┘

... (repeat for Problem Solving and Technical Skills)

[Save as Draft] [Continue to Build Components →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: Build Each Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page: /assessments/admin/models/build (Component Building)

Building: Leadership - MCQ Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose Build Method:

┌────────────┬────────────┬────────────┬────────────┐
│ AI Generate│ Manual     │ Bulk Upload│ Use Library│
│            │ Entry      │ CSV/Excel  │ Existing   │
│ 🤖         │ ✍️         │ 📊         │ 📚         │
└────────────┴────────────┴────────────┴────────────┘

[Selected: AI Generate]

AI Question Generator:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Number of questions: [10]
Difficulty: ○ Easy ● Medium ○ Hard ○ Mixed
Question types: ☑ MCQ ☐ Multiple Select ☐ True/False

Context for AI:
- Competency: Leadership
- Target Level: Senior
- Indicators (4 selected):
  • "Leads cross-functional teams"
  • "Manages conflict effectively"
  • "Delegates appropriately"
  • "Provides constructive feedback"

[Generate Questions →]

... AI generates 10 questions ...

Preview:
┌─────────────────────────────────────────────────┐
│ Question 1 (Difficulty: Medium)                 │
│ You're leading a cross-functional team with...  │
│ A) Escalate immediately                         │
│ B) Facilitate team discussion                   │
│ C) Make the decision yourself                   │
│ D) Defer to technical lead                      │
│ Correct: B                                      │
│ [Edit] [Delete] [Regenerate]                    │
└─────────────────────────────────────────────────┘
... (9 more questions)

[Accept All & Save] [Regenerate All] [Edit Individual]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Building: Leadership - Adaptive AI Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Configure Adaptive Assessment:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Question Range:
Min Questions: [8]  Max Questions: [15]

Starting Difficulty: ●●●●○ (7/10 - Senior level)
[Slider: Easy 1 ──●─── 10 Very Hard]

Allowed Question Types:
☑ Multiple Choice Questions
☑ Situational Judgment
☐ Short Answer

Adaptation Settings:
☑ Adjust difficulty based on performance
☑ Generate context-aware follow-up questions
☑ Stop early if high confidence reached

☑ Save this configuration to library for reuse

[Save Configuration]

Note: Questions will be generated in real-time during
candidate assessment, adapting to their performance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Building: Communication - Voice Interview Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Configure AI Voice Interview (Versant-style):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Interview Structure:
Number of questions: [4]
Max duration per question: [3] minutes

Interview Style:
● Conversational (natural dialogue)
○ Formal (structured questions)
○ Technical (domain-specific)

Evaluation Criteria:
☑ Content Quality (40%)
☑ Communication Clarity (30%)
☑ Confidence & Fluency (15%)
☑ Professionalism (15%)

AI Voice:
Voice: [Sarah (Professional Female) ▼]
Accent: [American English ▼]
Speech Rate: ● Normal ○ Slow ○ Fast

Follow-up Behavior:
☑ Generate adaptive follow-ups based on answers
☑ Probe deeper if answer is vague
☑ Move on if answer is comprehensive

Sample Question Preview:
"Tell me about a time when you had to communicate
complex information to non-technical stakeholders.
How did you ensure they understood?"

[Save Configuration]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5: Publish Model
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Assessment Model Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Senior PM Hiring - Q1 2026
Role: Project Manager - IT
Level: Senior
Competencies: 4 selected (Leadership, Communication, 
              Problem Solving, Technical Skills)

Components Built:
✓ Leadership (30%): 3 components (~55 min)
✓ Communication (25%): 2 components (~42 min)
✓ Problem Solving (25%): 2 components (~30 min)
✓ Technical Skills (20%): 1 component (45 min)

Total Estimated Time: 172 minutes (~2h 52min)
Completion: 100% ✓

Visibility:
● Private (Only me)
○ Organization (All HR managers)
○ Request Global Publishing (Submit to Sudaksha)

[Save as Draft] [Publish & Make Available →]
```

---

## 3.2 Candidate Workflow: Taking Assessment

```
STEP 1: Invitation & Start
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email Received:

Subject: Assessment Invitation - Senior PM Position

You've been invited to complete an assessment for
Senior Project Manager at TechCorp.

Assessment: Senior PM Hiring - Q1 2026
Time Required: ~2 hours 52 minutes
Deadline: March 31, 2026

[Start Assessment →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: Welcome & Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page: /assessments/take/[token]

Welcome, John Doe!
Senior Project Manager Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This assessment has 4 competencies with 8 total sections:

1. Leadership (~55 min)
   • Multiple choice questions (10 questions)
   • Situational scenarios (5 scenarios)
   • Adaptive assessment (adapts to your level)

2. Communication (~42 min)
   • Essay questions (2 prompts, 300-500 words each)
   • Voice interview (4 questions, AI-powered)

3. Problem Solving (~30 min)
   • Code challenge (1 problem)
   • Adaptive assessment

4. Technical Skills (45 min)
   • Panel interview (scheduled separately)

Total Time: ~2 hours 52 minutes

Tips:
- You can take breaks between competencies
- Some sections adapt to your performance
- Answer honestly - there are no trick questions
- For video/voice sections, ensure good lighting

[Start Assessment →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3A: MCQ Section (Static)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Section: Leadership - Multiple Choice
Progress: Question 1 of 10
Time Remaining: 14:30

You're managing a project that's behind schedule.
Your team is working overtime but morale is dropping.
What's your FIRST action?

○ A) Extend the deadline and reduce scope
● B) Hold a team meeting to understand concerns
○ C) Hire additional contractors
○ D) Report to upper management

[Next Question →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3B: Adaptive AI Section (Looks Static to User)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Section: Leadership - Assessment
Progress: Question 3 of ~12
(Note: "~12" because it adapts)

[Question appears exactly like regular MCQ]

Behind the scenes:
- Question 1: Difficulty 7/10 (Senior) → Answered correctly
- Question 2: Difficulty 7.5/10 → Answered correctly
- Question 3: Difficulty 8/10 (current) → ?
- System will adjust based on response
- Will stop at 8-15 questions when confident

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3C: Voice Interview Section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Section: Communication - Voice Interview

Microphone Check:
┌─────────────────────────────────────────────────┐
│ [Microphone Icon]                               │
│ Testing... Please say "Hello"                   │
│ ████████████░░░░ Volume: Good ✓                │
└─────────────────────────────────────────────────┘

[Audio plays:]
AI: "Hello John. I'm going to ask you a few questions 
about your communication experience. Take your time 
with each answer. Ready?"

[Recording starts automatically]

AI: "Tell me about a time when you had to explain a 
technical problem to non-technical stakeholders."

[John speaks - audio is recorded]
[Real-time transcription appears:]
"Well, in my previous role, there was a situation..."

[After 2 minutes]
AI: "Thank you. Can you tell me specifically how you 
ensured they understood the key points?"

[Follow-up generated based on John's answer]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3D: Code Challenge Section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Section: Problem Solving - Code Challenge

PROBLEM:
Given a list of tasks with dependencies, determine
if all tasks can be completed (detect circular deps).

Input: tasks = [
  {id: 1, depends_on: []},
  {id: 2, depends_on: [1]},
  {id: 3, depends_on: [2]}
]
Output: True

Language: [Python ▼]

[Monaco Code Editor]
def can_complete_all_tasks(tasks):
    # Your code here
    pass


Test Cases (3 visible, 5 hidden):
✓ Test 1: Simple linear dependencies
○ Test 2: Circular dependency (not run yet)
○ Test 3: Multiple chains (not run yet)

[Run Tests] [Submit Solution]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: Assessment Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Assessment Sections Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You've completed:
✓ Leadership (3 sections)
✓ Communication (2 sections)
✓ Problem Solving (2 sections)
⏳ Technical Skills (Panel interview - scheduled)

Panel Interview Details:
Date: Thursday, March 20, 2026
Time: 10:00 AM PST
Duration: 45 minutes
Platform: Zoom

Interviewers:
• John Smith - Engineering Manager
• Sarah Chen - Tech Lead
• Mike Johnson - Senior PM

You'll receive:
- Calendar invite (sent)
- Zoom link (1 hour before)
- Preparation guide (emailed)

Thank you for completing the assessment!
Your responses have been submitted.

[Close]
```

---

## 3.3 Admin Workflow: Reviewing Results

```
Page: /assessments/admin/results/[submissionId]

John Doe - Assessment Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Score: 82/100 (B+)
Performance Level: SENIOR ✓ (matches target)
Completed: March 18, 2026 at 3:45 PM
Time Taken: 2h 48m

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Competency Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Leadership (30% weight): 78/100
   ├── MCQ: 80/100 (8/10 correct)
   ├── Situational: 75/100 (avg effectiveness: 3.8/5)
   └── Adaptive AI: 78/100
       • Ability Estimate: 7.8/10
       • Questions Asked: 12 (of 8-15 range)
       • Accuracy: 75% (9/12 correct)
       • Difficulty Range: 7.0 → 8.5 → 7.5 (adapted)

2. Communication (25% weight): 85/100
   ├── Essay: 82/100
   │   • Content: 35/40 (comprehensive examples)
   │   • Structure: 26/30 (clear organization)
   │   • Critical Thinking: 21/30 (good analysis)
   │   [View Full Essay →]
   │
   └── Voice Interview: 88/100
       • Content Quality: 36/40 (relevant, detailed)
       • Clarity: 27/30 (articulate, well-paced)
       • Confidence: 13/15 (minimal filler words)
       • Professionalism: 12/15 (appropriate tone)
       [Listen to Recording →] [View Transcript →]

3. Problem Solving (25% weight): 80/100
   ├── Code Challenge: 75/100
   │   • Test Cases Passed: 8/10 (2 edge cases failed)
   │   • Code Quality: B (readable, good practices)
   │   • Execution Time: 245ms (efficient)
   │   [View Code Solution →]
   │
   └── Adaptive AI: 85/100
       • Ability Estimate: 8.5/10
       • Questions Asked: 10
       • Accuracy: 80%

4. Technical Skills (20% weight): 87/100
   └── Panel Interview: 87/100
       Panel Consensus: STRONG HIRE (3/3 recommend)
       
       John Smith: 85/100 (Strong Hire)
       "Solid technical depth. Great PM mindset."
       
       Sarah Chen: 90/100 (Strong Hire)
       "Best candidate. Excellent communication."
       
       Mike Johnson: 85/100 (Hire)
       "Would be great addition to team."
       
       [View Detailed Evaluations →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Weighted Final Score:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(78 × 0.30) + (85 × 0.25) + (80 × 0.25) + (87 × 0.20)
= 82/100 (B+)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strengths:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Excellent communication (written & verbal)
✓ Strong technical foundation
✓ Good problem-solving ability
✓ Panel consensus: strong hire

Areas for Development:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠ Could improve on edge case handling (code)
⚠ Delegation strategies could be more specific

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ranking:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#2 out of 8 candidates

1. Alice Johnson - 88/100 (A)
2. John Doe - 82/100 (B+) ← Current
3. Jane Smith - 79/100 (B)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Advance to Final Interview]
[Send Feedback Email]
[Add to Talent Pool]
[Decline Candidate]
[Compare with Others →]
[Export Report PDF]
```

---

# PART 4: API ENDPOINTS

## 4.1 Next.js API Routes

```typescript
// ============================================
// ASSESSMENT MODEL MANAGEMENT
// ============================================

GET    /api/assessments/admin/models
POST   /api/assessments/admin/models
GET    /api/assessments/admin/models/[modelId]
PATCH  /api/assessments/admin/models/[modelId]
DELETE /api/assessments/admin/models/[modelId]

POST   /api/assessments/admin/models/from-role
POST   /api/assessments/admin/models/from-wizard

// ============================================
// COMPONENT MANAGEMENT
// ============================================

GET    /api/assessments/admin/models/[modelId]/components
POST   /api/assessments/admin/models/[modelId]/components
GET    /api/assessments/admin/models/[modelId]/components/[componentId]
PATCH  /api/assessments/admin/models/[modelId]/components/[componentId]
DELETE /api/assessments/admin/models/[modelId]/components/[componentId]

// ============================================
// QUESTION GENERATION & MANAGEMENT
// ============================================

POST   /api/assessments/admin/components/[componentId]/questions/ai-generate
POST   /api/assessments/admin/components/[componentId]/questions/bulk-json
POST   /api/assessments/admin/components/[componentId]/questions/manual

GET    /api/assessments/library/components
POST   /api/assessments/library/components
GET    /api/assessments/library/components/[id]

// ============================================
// ADAPTIVE AI
// ============================================

POST   /api/assessments/adaptive/start
POST   /api/assessments/adaptive/answer
POST   /api/assessments/adaptive/complete

GET    /api/assessments/adaptive/library
POST   /api/assessments/adaptive/library

// ============================================
// PANEL INTERVIEW
// ============================================

GET    /api/assessments/panels
POST   /api/assessments/panels
POST   /api/assessments/panels/[panelId]/schedule
POST   /api/assessments/panels/[panelId]/evaluate

// ============================================
// ASSESSMENT TAKING
// ============================================

GET    /api/assessments/take/[token]
POST   /api/assessments/submissions/[submissionId]/responses
GET    /api/assessments/submissions/[submissionId]/results
```

## 4.2 Python FastAPI Routes

```python
# ============================================
# VOICE INTERVIEW
# ============================================

POST   /api/voice/transcribe
POST   /api/voice/start-interview
POST   /api/voice/respond
POST   /api/voice/evaluate

# ============================================
# VIDEO INTERVIEW
# ============================================

POST   /api/video/upload
POST   /api/video/analyze
POST   /api/video/evaluate

# ============================================
# CODE EXECUTION
# ============================================

POST   /api/code/execute
POST   /api/code/hackerrank/create
POST   /api/code/hackerrank/webhook
```

---

# PART 5: IMPLEMENTATION SEQUENCE

## Phase 1: Foundation (Week 1)

### Day 1-2: Database & Core Architecture
```bash
1. Run database migrations (add all new fields/tables)
2. Fix role-model architecture (CRITICAL)
3. Ensure ModelCompetencySelector works correctly
4. Test: Create model without modifying role
```

### Day 3-4: Component Suggester & Builder UI
```bash
5. Update ComponentSuggester with all 9 component types
6. Create component selection UI
7. Test: Suggestions appear correctly per competency
```

### Day 5: Basic Build Methods
```bash
8. AI Generate (MCQ, Situational, Essay) - already works
9. Manual Entry - already works
10. Bulk Upload - already works
11. Component Library - verify it works
```

## Phase 2: AI-Powered Components (Week 2)

### Day 1-2: Voice Interview
```bash
12. Python FastAPI service setup
13. Voice interview configuration UI
14. Voice interview taking UI
15. Integration with Python backend
```

### Day 3-4: Video Interview
```bash
16. Video recording UI
17. Video upload to Python
18. Video analysis (OpenCV, MediaPipe)
19. Evaluation interface
```

### Day 5: Code Testing
```bash
20. Code problem builder UI
21. Monaco editor integration
22. Python execution service
23. Test case validation
```

## Phase 3: Advanced Features (Week 3)

### Day 1-3: Adaptive AI
```bash
24. Adaptive configuration UI
25. Adaptive engine (difficulty calculation)
26. Runtime question generation
27. Scoring integration
28. Component library support for adaptive configs
```

### Day 4-5: Panel Interview
```bash
29. Panel creation UI
30. Scheduling interface
31. Calendar integration
32. Evaluation forms
33. Aggregated results
```

## Phase 4: Integration & Polish (Week 4)

### Day 1-2: End-to-End Testing
```bash
34. Create complete assessment model
35. Take assessment as candidate
36. Review results as admin
37. Fix bugs found
```

### Day 3-4: UI/UX Polish
```bash
38. Consistent styling across all pages
39. Mobile responsiveness
40. Loading states
41. Error handling
```

### Day 5: Documentation & Handoff
```bash
42. User guide
43. Admin documentation
44. API documentation
45. Deployment guide
```

---

# PART 6: CRITICAL REMINDERS

## 6.1 REUSE, DON'T RECREATE

✅ **USE existing UI components:**
- Button, Card, Badge, Dialog, Input, Select, Label
- Tabs, Progress, Slider, Alert

✅ **USE existing patterns:**
- Authentication (getCurrentUser)
- Database access (prisma)
- API structure (NextRequest, NextResponse)

❌ **DON'T create new:**
- UI components that already exist
- Auth logic
- Database connectors

## 6.2 Role-Model Architecture Rules

✅ **CORRECT:**
- Role = master data (read-only in create flow)
- Model = user snapshot with selected competencies
- Weights are model-specific
- Multiple users, multiple models from same role

❌ **WRONG:**
- Modifying role during model creation
- All competencies always included
- Role weights used for all models

## 6.3 Component Types - Complete List

1. **MCQ** - Multiple Choice (static)
2. **SHORT_ANSWER** - Short text responses (static)
3. **ESSAY** - Long-form writing (static)
4. **SITUATIONAL** - Scenario-based judgment (static)
5. **VOICE** - AI voice interview (Python)
6. **VIDEO** - AI video interview (Python)
7. **CODE** - Code challenges (Python)
8. **ADAPTIVE_AI** - Runtime adaptive questions (Next.js)
9. **PANEL** - Live panel interviews (Next.js)

---

# PART 7: EXAMPLE CODE SNIPPETS

## 7.1 Component Selection UI

```typescript
// components/assessments/ComponentSelector.tsx
export function ComponentSelector({
  competency,
  targetLevel,
  onSelect
}: ComponentSelectorProps) {
  const suggestions = ComponentSuggester.suggestComponents(
    competency,
    targetLevel
  );
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {suggestions.map(suggestion => (
        <Card
          key={suggestion.type}
          className="cursor-pointer hover:border-blue-500"
          onClick={() => onSelect(suggestion.type)}
        >
          <CardContent className="pt-6">
            <div className="text-4xl mb-2">{suggestion.icon}</div>
            <div className="font-semibold">{suggestion.type}</div>
            <Badge variant={
              suggestion.priority === 'HIGH' ? 'default' : 'secondary'
            }>
              {suggestion.priority}
            </Badge>
            <div className="text-sm text-gray-600 mt-2">
              {suggestion.reason}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ~{suggestion.estimatedQuestions}Q, 
              {suggestion.estimatedDuration}min
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 7.2 Adaptive AI Configuration

```typescript
// components/assessments/AdaptiveConfigForm.tsx
export function AdaptiveConfigForm({ onSave }: Props) {
  const [config, setConfig] = useState({
    min_questions: 8,
    max_questions: 15,
    starting_difficulty: 7,
    allowed_types: ['MCQ', 'SITUATIONAL'],
    adaptation_enabled: true
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 Configure Adaptive AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Questions</Label>
            <Input
              type="number"
              value={config.min_questions}
              onChange={e => setConfig({
                ...config,
                min_questions: parseInt(e.target.value)
              })}
            />
          </div>
          <div>
            <Label>Max Questions</Label>
            <Input
              type="number"
              value={config.max_questions}
              onChange={e => setConfig({
                ...config,
                max_questions: parseInt(e.target.value)
              })}
            />
          </div>
        </div>
        
        <div>
          <Label>Starting Difficulty: {config.starting_difficulty}/10</Label>
          <Slider
            value={[config.starting_difficulty]}
            onValueChange={val => setConfig({
              ...config,
              starting_difficulty: val[0]
            })}
            min={1}
            max={10}
            step={1}
          />
        </div>
        
        <Button onClick={() => onSave(config)}>
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 7.3 Voice Interview Setup

```typescript
// components/assessments/VoiceInterviewConfig.tsx
export function VoiceInterviewConfig({ onSave }: Props) {
  const [config, setConfig] = useState({
    question_count: 4,
    max_duration_per_question: 3,
    style: 'CONVERSATIONAL',
    voice: 'Sarah',
    adaptive_followups: true
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>🎙️ Configure Voice Interview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Number of Questions</Label>
          <Input
            type="number"
            value={config.question_count}
            onChange={e => setConfig({
              ...config,
              question_count: parseInt(e.target.value)
            })}
          />
        </div>
        
        <div>
          <Label>Max Duration per Question (minutes)</Label>
          <Input
            type="number"
            value={config.max_duration_per_question}
            onChange={e => setConfig({
              ...config,
              max_duration_per_question: parseInt(e.target.value)
            })}
          />
        </div>
        
        <div>
          <Label>Interview Style</Label>
          <Select
            value={config.style}
            onValueChange={val => setConfig({
              ...config,
              style: val
            })}
          >
            <SelectItem value="CONVERSATIONAL">Conversational</SelectItem>
            <SelectItem value="FORMAL">Formal</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
          </Select>
        </div>
        
        <div>
          <Label>AI Voice</Label>
          <Select
            value={config.voice}
            onValueChange={val => setConfig({
              ...config,
              voice: val
            })}
          >
            <SelectItem value="Sarah">Sarah (Professional Female)</SelectItem>
            <SelectItem value="James">James (Professional Male)</SelectItem>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.adaptive_followups}
            onChange={e => setConfig({
              ...config,
              adaptive_followups: e.target.checked
            })}
          />
          <Label>Generate adaptive follow-up questions</Label>
        </div>
        
        <Button onClick={() => onSave(config)}>
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

# PART 8: TESTING CHECKLIST

## 8.1 Architecture Tests

- [ ] Create model does NOT modify role
- [ ] Can select subset of competencies (4 of 7)
- [ ] Weights are model-specific
- [ ] Multiple users can create different models from same role
- [ ] Role page is only place to modify role

## 8.2 Component Type Tests

- [ ] MCQ: AI generate, manual, bulk upload work
- [ ] Essay: AI generate, manual work
- [ ] Situational: AI generate, manual work
- [ ] Voice: Configuration saves, runtime works
- [ ] Video: Configuration saves, recording works
- [ ] Code: Problem builder works, execution works
- [ ] Adaptive AI: Configuration saves, adapts during test
- [ ] Panel: Scheduling works, evaluation aggregates

## 8.3 Candidate Experience Tests

- [ ] Can take MCQ questions
- [ ] Can take essay questions
- [ ] Voice interview records and transcribes
- [ ] Video interview records and analyzes
- [ ] Code editor works, tests run
- [ ] Adaptive questions adapt difficulty
- [ ] Panel interview can be scheduled
- [ ] All scores calculate correctly

## 8.4 Admin Experience Tests

- [ ] Can create model from role
- [ ] Can select competencies
- [ ] Can choose components
- [ ] Can build components (all methods)
- [ ] Can view candidate results
- [ ] Can see aggregated scores
- [ ] Can compare candidates

---

# PART 9: DEPLOYMENT

## 9.1 Environment Variables

```env
# Next.js
NEXT_PUBLIC_API_URL=https://your-app.com
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# Python Backend
PYTHON_API_URL=http://localhost:8000
ELEVENLABS_API_KEY=...
HACKERRANK_API_KEY=...
```

## 9.2 Docker Compose

```yaml
version: '3.8'

services:
  nextjs:
    build: ./
    ports:
      - "3000:3000"
    environment:
      - PYTHON_API_URL=http://fastapi:8000
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/sudassess
    depends_on:
      - postgres
      - fastapi

  fastapi:
    build: ./python-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/sudassess
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=sudassess
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

# PART 10: SUCCESS CRITERIA

Implementation is complete when:

✅ **Architecture:**
- Role-model separation works correctly
- Roles are never modified during model creation

✅ **All Component Types Work:**
- MCQ, Essay, Short Answer, Situational (static) ✓
- Voice interview (AI-powered) ✓
- Video interview (AI-analyzed) ✓
- Code challenges (execution) ✓
- Adaptive AI (real-time difficulty) ✓
- Panel interviews (scheduling + evaluation) ✓

✅ **Complete Workflows:**
- Admin can create models end-to-end ✓
- Candidates can take assessments ✓
- Results calculate correctly ✓
- All scores aggregate properly ✓

✅ **Integration:**
- Python backend communicates with Next.js ✓
- All APIs work together ✓
- Database handles all data types ✓

---

## 🚀 START IMPLEMENTATION

**Give this entire document to your coding agent with this command:**

```
@MASTER_IMPLEMENTATION_GUIDE.md

This is the MASTER DOCUMENT for the complete assessment engine.

CRITICAL RULES:
1. Follow the implementation sequence (Part 5) exactly
2. REUSE existing components (Part 6.1)
3. Implement all 9 component types (Part 6.3)
4. Follow role-model architecture rules (Part 6.2)
5. Test each phase before moving to next

Start with Phase 1, Day 1: Database & Core Architecture

Report back after completing each day's tasks.

DO NOT skip ahead. DO NOT recreate existing components.

Begin now.
```

---

**END OF MASTER IMPLEMENTATION GUIDE**
