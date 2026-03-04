# DOCUMENT 6: SURVEY MODULE REQUIREMENTS
## Implementation Guide for Survey Features (M16-M19)

**Module Group:** Survey System  
**Total Requirements:** 4  
**User Roles:** All tenant admins, employees, students  
**Priority:** MEDIUM  
**Implementation Order:** 6 of 6 (Final module)  
**Time Estimate:** 5 days

---

## 🎯 OVERVIEW

This is the **FINAL** implementation document covering the complete survey system.

**Key Features:**
- Survey creation with 8 question types
- Templates (Employee Satisfaction, 360°, Exit Interview, Training, NPS)
- Assignment to target audiences
- Anonymous responses
- Real-time results and analytics
- PDF/Excel/CSV export

**Use Cases:**
- Employee satisfaction surveys
- 360-degree feedback
- Training effectiveness
- Exit interviews
- Course evaluations (institutions)
- Customer feedback (B2C)

---

## 📊 COMPLETE REQUIREMENT BREAKDOWN

| ID | Feature | Components | Time |
|----|---------|------------|------|
| M16 | Survey CRUD | List, Create, Edit, Delete, Templates | 2 days |
| M17 | Add Questions | 8 question types, Bulk upload | 0.5 days |
| M18 | Modify Questions | Edit dialog, Version control | 0.5 days |
| M19 | Delete Questions | Soft delete, Confirmation | 0.5 days |
| + | Assignment | Target selection, Email invites | 1 day |
| + | Response Collection | Taking interface, Auto-save | 0.5 days |
| + | Results & Analytics | Dashboard, Charts, Export | 1 day |
| **TOTAL** | **6 features** | | **~6 days** |

---

[Previous database schema content...]

---

## 🚀 MASTER ANTIGRAVITY PROMPT

**Copy this entire section to AntiGravity to implement the complete Survey Module:**

```
[AUTONOMOUS MODE - SURVEY MODULE COMPLETE IMPLEMENTATION]

You are implementing the FINAL module (Document 6 of 6) for the SudAssess platform.

OBJECTIVE: Build a complete survey system supporting multiple question types, anonymous responses, real-time analytics, and export capabilities.

IMPLEMENTATION ORDER:
Day 1-2: M16 Survey CRUD + Templates
Day 3: M17-M19 Question Management  
Day 4: Assignment & Taking Interface
Day 5: Results & Analytics
Day 6: Export & Polish

---
PHASE 1: DATABASE & MODELS (Day 1 Morning)
---

CREATE DATABASE TABLES:

File: prisma/migrations/XXX_add_survey_system.sql

-- Surveys table
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  purpose VARCHAR(100),
  
  is_anonymous BOOLEAN DEFAULT false,
  allow_multiple_responses BOOLEAN DEFAULT false,
  randomize_questions BOOLEAN DEFAULT false,
  show_progress BOOLEAN DEFAULT true,
  
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  estimated_duration_minutes INT,
  
  scoring_enabled BOOLEAN DEFAULT false,
  passing_score INT,
  
  custom_branding JSONB,
  status VARCHAR(20) DEFAULT 'DRAFT',
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE INDEX idx_surveys_tenant ON surveys(tenant_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_code ON surveys(code);

-- Survey questions
CREATE TABLE survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options JSONB,
  
  is_required BOOLEAN DEFAULT false,
  min_length INT,
  max_length INT,
  
  points INT DEFAULT 0,
  scoring_key JSONB,
  
  display_order INT NOT NULL,
  section VARCHAR(100),
  help_text TEXT,
  
  depends_on UUID REFERENCES survey_questions(id),
  display_condition JSONB,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX idx_survey_questions_order ON survey_questions(survey_id, display_order);

-- Survey assignments
CREATE TABLE survey_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  assigned_by UUID REFERENCES users(id),
  
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  custom_list UUID[],
  
  assigned_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,
  reminder_frequency VARCHAR(20),
  
  total_assigned INT,
  total_started INT DEFAULT 0,
  total_completed INT DEFAULT 0,
  completion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_assigned > 0 
    THEN (total_completed::decimal / total_assigned * 100)
    ELSE 0 END
  ) STORED,
  
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_survey_assignments_survey ON survey_assignments(survey_id);
CREATE INDEX idx_survey_assignments_target ON survey_assignments(target_type, target_id);

-- Survey responses
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES survey_assignments(id),
  member_id UUID REFERENCES members(id),
  
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  time_taken_minutes INT,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS',
  
  answers JSONB NOT NULL,
  total_score INT,
  max_score INT,
  score_percentage DECIMAL(5,2),
  
  response_metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_member ON survey_responses(member_id);
CREATE INDEX idx_survey_responses_status ON survey_responses(status);

UPDATE PRISMA SCHEMA:

File: prisma/schema.prisma

model Survey {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdBy   String   @map("created_by") @db.Uuid
  creator     User     @relation(fields: [createdBy], references: [id])
  
  name        String   @db.VarChar(255)
  code        String   @unique @db.VarChar(50)
  description String?  @db.Text
  purpose     String?  @db.VarChar(100)
  
  isAnonymous              Boolean @default(false) @map("is_anonymous")
  allowMultipleResponses   Boolean @default(false) @map("allow_multiple_responses")
  randomizeQuestions       Boolean @default(false) @map("randomize_questions")
  showProgress             Boolean @default(true) @map("show_progress")
  
  startDate                DateTime? @map("start_date")
  endDate                  DateTime? @map("end_date")
  estimatedDurationMinutes Int?     @map("estimated_duration_minutes")
  
  scoringEnabled Boolean  @default(false) @map("scoring_enabled")
  passingScore   Int?     @map("passing_score")
  
  customBranding Json?   @map("custom_branding")
  status         String   @default("DRAFT") @db.VarChar(20)
  metadata       Json?
  
  questions    SurveyQuestion[]
  assignments  SurveyAssignment[]
  responses    SurveyResponse[]
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  publishedAt DateTime? @map("published_at")
  
  @@index([tenantId])
  @@index([status])
  @@map("surveys")
}

model SurveyQuestion {
  id          String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  surveyId    String  @map("survey_id") @db.Uuid
  survey      Survey  @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  
  questionText String  @map("question_text") @db.Text
  questionType String  @map("question_type") @db.VarChar(50)
  options      Json?
  
  isRequired Boolean @default(false) @map("is_required")
  minLength  Int?    @map("min_length")
  maxLength  Int?    @map("max_length")
  
  points     Int  @default(0)
  scoringKey Json? @map("scoring_key")
  
  displayOrder Int    @map("display_order")
  section      String? @db.VarChar(100)
  helpText     String? @map("help_text") @db.Text
  
  dependsOn        String? @map("depends_on") @db.Uuid
  displayCondition Json?   @map("display_condition")
  metadata         Json?
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([surveyId])
  @@index([surveyId, displayOrder])
  @@map("survey_questions")
}

model SurveyAssignment {
  id         String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  surveyId   String  @map("survey_id") @db.Uuid
  survey     Survey  @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  tenantId   String  @map("tenant_id") @db.Uuid
  tenant     Tenant  @relation(fields: [tenantId], references: [id])
  assignedBy String  @map("assigned_by") @db.Uuid
  assigner   User    @relation(fields: [assignedBy], references: [id])
  
  targetType String  @map("target_type") @db.VarChar(50)
  targetId   String? @map("target_id") @db.Uuid
  customList String[] @map("custom_list") @db.Uuid
  
  assignedAt        DateTime  @default(now()) @map("assigned_at")
  dueDate           DateTime? @map("due_date")
  reminderFrequency String?   @map("reminder_frequency") @db.VarChar(20)
  
  totalAssigned  Int     @map("total_assigned")
  totalStarted   Int     @default(0) @map("total_started")
  totalCompleted Int     @default(0) @map("total_completed")
  completionRate Decimal @default(0) @map("completion_rate") @db.Decimal(5, 2)
  
  metadata  Json?
  responses SurveyResponse[]
  
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([surveyId])
  @@index([targetType, targetId])
  @@map("survey_assignments")
}

model SurveyResponse {
  id           String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  surveyId     String            @map("survey_id") @db.Uuid
  survey       Survey            @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  assignmentId String            @map("assignment_id") @db.Uuid
  assignment   SurveyAssignment  @relation(fields: [assignmentId], references: [id])
  memberId     String?           @map("member_id") @db.Uuid
  member       Member?           @relation(fields: [memberId], references: [id])
  
  startedAt         DateTime  @default(now()) @map("started_at")
  completedAt       DateTime? @map("completed_at")
  timeTakenMinutes  Int?      @map("time_taken_minutes")
  status            String    @default("IN_PROGRESS") @db.VarChar(20)
  
  answers          Json      @db.JsonB
  totalScore       Int?      @map("total_score")
  maxScore         Int?      @map("max_score")
  scorePercentage  Decimal?  @map("score_percentage") @db.Decimal(5, 2)
  
  responseMetadata Json?     @map("response_metadata")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@index([surveyId])
  @@index([memberId])
  @@index([status])
  @@map("survey_responses")
}

RUN MIGRATION:
npx prisma migrate dev --name add_survey_system
npx prisma generate

---
PHASE 2: SURVEY TEMPLATES (Day 1 Afternoon)
---

CREATE TEMPLATE SYSTEM:

File: lib/survey-templates.ts

export const SURVEY_TEMPLATES = {
  EMPLOYEE_SATISFACTION: {
    name: 'Employee Satisfaction Survey',
    description: 'Measure employee engagement and satisfaction levels',
    purpose: 'FEEDBACK',
    estimatedDurationMinutes: 10,
    sections: ['General', 'Work Environment', 'Management', 'Development'],
    questions: [
      {
        section: 'General',
        questionText: 'How satisfied are you with your current role?',
        questionType: 'LIKERT',
        options: [
          { value: 1, label: 'Very Dissatisfied' },
          { value: 2, label: 'Dissatisfied' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Satisfied' },
          { value: 5, label: 'Very Satisfied' }
        ],
        isRequired: true,
        displayOrder: 1
      },
      {
        section: 'General',
        questionText: 'Would you recommend this company to a friend?',
        questionType: 'NPS',
        options: Array.from({ length: 11 }, (_, i) => ({ value: i, label: i.toString() })),
        isRequired: true,
        displayOrder: 2
      },
      {
        section: 'Work Environment',
        questionText: 'I have the tools and resources I need to do my job effectively',
        questionType: 'LIKERT',
        options: [
          { value: 1, label: 'Strongly Disagree' },
          { value: 2, label: 'Disagree' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Agree' },
          { value: 5, label: 'Strongly Agree' }
        ],
        isRequired: true,
        displayOrder: 3
      },
      {
        section: 'Management',
        questionText: 'My manager provides clear feedback and guidance',
        questionType: 'LIKERT',
        options: [
          { value: 1, label: 'Strongly Disagree' },
          { value: 2, label: 'Disagree' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Agree' },
          { value: 5, label: 'Strongly Agree' }
        ],
        isRequired: true,
        displayOrder: 4
      },
      {
        section: 'Development',
        questionText: 'I have opportunities for professional growth',
        questionType: 'LIKERT',
        options: [
          { value: 1, label: 'Strongly Disagree' },
          { value: 2, label: 'Disagree' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Agree' },
          { value: 5, label: 'Strongly Agree' }
        ],
        isRequired: true,
        displayOrder: 5
      },
      {
        section: 'General',
        questionText: 'What do you like most about working here?',
        questionType: 'TEXT_LONG',
        maxLength: 500,
        isRequired: false,
        displayOrder: 6
      },
      {
        section: 'General',
        questionText: 'What suggestions do you have for improvement?',
        questionType: 'TEXT_LONG',
        maxLength: 500,
        isRequired: false,
        displayOrder: 7
      }
    ]
  },
  
  FEEDBACK_360: {
    name: '360° Feedback',
    description: 'Comprehensive feedback from peers, managers, and reports',
    purpose: '360_FEEDBACK',
    estimatedDurationMinutes: 15,
    sections: ['Leadership', 'Communication', 'Teamwork', 'Technical'],
    questions: [
      {
        section: 'Leadership',
        questionText: 'Provides clear direction and vision',
        questionType: 'RATING',
        options: [
          { value: 1, label: '1 Star' },
          { value: 2, label: '2 Stars' },
          { value: 3, label: '3 Stars' },
          { value: 4, label: '4 Stars' },
          { value: 5, label: '5 Stars' }
        ],
        isRequired: true,
        displayOrder: 1
      },
      {
        section: 'Communication',
        questionText: 'Communicates effectively with team members',
        questionType: 'RATING',
        options: [
          { value: 1, label: '1 Star' },
          { value: 2, label: '2 Stars' },
          { value: 3, label: '3 Stars' },
          { value: 4, label: '4 Stars' },
          { value: 5, label: '5 Stars' }
        ],
        isRequired: true,
        displayOrder: 2
      }
      // ... more questions
    ]
  },
  
  EXIT_INTERVIEW: {
    name: 'Exit Interview',
    description: 'Understand reasons for departure and gather feedback',
    purpose: 'EXIT_INTERVIEW',
    estimatedDurationMinutes: 12,
    questions: [
      {
        questionText: 'What is your primary reason for leaving?',
        questionType: 'MULTIPLE_CHOICE',
        options: [
          { value: 'career', label: 'Career advancement opportunities' },
          { value: 'compensation', label: 'Compensation and benefits' },
          { value: 'balance', label: 'Work-life balance' },
          { value: 'management', label: 'Management/Leadership' },
          { value: 'culture', label: 'Company culture' },
          { value: 'location', label: 'Location/Commute' },
          { value: 'other', label: 'Other' }
        ],
        isRequired: true,
        displayOrder: 1
      }
      // ... more questions
    ]
  }
};

---
PHASE 3: UI COMPONENTS (Day 1-2)
---

CREATE SURVEY LIST PAGE:

File: app/clients/[clientId]/surveys/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { SurveyCard } from '@/components/Surveys/SurveyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SurveysPage({ params }) {
  const [surveys, setSurveys] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchSurveys();
  }, [filter, search]);
  
  async function fetchSurveys() {
    const res = await fetch(
      `/api/clients/${params.clientId}/surveys?status=${filter}&search=${search}`
    );
    const data = await res.json();
    setSurveys(data.surveys);
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Surveys</h1>
        <Button onClick={() => router.push(`/clients/${params.clientId}/surveys/create`)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>
      
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="CLOSED">Closed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search surveys..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid gap-4">
        {surveys.map(survey => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            onEdit={() => router.push(`/clients/${params.clientId}/surveys/${survey.id}/edit`)}
            onViewResults={() => router.push(`/clients/${params.clientId}/surveys/${survey.id}/results`)}
            onDelete={() => handleDelete(survey.id)}
          />
        ))}
      </div>
    </div>
  );
}

[... Rest of implementation prompts ...]

---
SUCCESS CRITERIA FOR EACH PHASE:
---

PHASE 1 (Database):
✓ All 4 tables created
✓ Indexes in place
✓ Prisma models generated
✓ No TypeScript errors

PHASE 2 (Templates):
✓ 5 templates defined
✓ Template selection works
✓ Questions pre-populate

PHASE 3-6:
[See individual phase success criteria in prompts above]

---
FINAL DELIVERABLES:
---

1. Survey CRUD system
2. 8 question types working
3. Assignment workflow
4. Taking interface (mobile-optimized)
5. Results dashboard
6. Export in 3 formats
7. Anonymous mode working
8. Email notifications

Execute autonomously. Report progress at end of each day.
```

---

END OF DOCUMENT 6 - SURVEY MODULE
