# DOCUMENT 3: ASSESSMENT MODULE REQUIREMENTS
## Implementation Guide for Assessment Engine (M9)

**Module Group:** Assessment Engine  
**Total Requirements:** 11  
**User Roles:** All (Assessment creation for admins, taking for all users)  
**Priority:** CRITICAL  
**Implementation Order:** 2 of 6 (Do this AFTER Document 1)

---

## 🎯 OVERVIEW

This document covers the **core assessment engine** - the heart of the SudAssess platform. This is what makes the platform valuable.

**Key Features:**
- Role & Competency-based assessment creation
- Dynamic indicator selection by level
- AI-powered question generation
- Multiple question types (MCQ, Code, Scenario, Voice, Video)
- Smart assessment assignment
- Results tracking and analytics

**Polymorphic Architecture:**
- Same assessment engine for Corporate, Institution, and B2C
- Same question types work across all tenant types
- Configuration-driven assessment models

---

## 📊 REQUIREMENT SUMMARY

| ID | Requirement | Priority | Complexity | Time |
|----|-------------|----------|------------|------|
| M9 | Assessment Methods | CRITICAL | Medium | 1 day |
| M9-1 | Role/Competency Based | CRITICAL | High | 3 days |
| M9-1-1 | Assign to Role | CRITICAL | Low | 0.5 days |
| M9-1-2 | Level Selection | CRITICAL | Medium | 1 day |
| M9-1-3 | Question Management | CRITICAL | High | 2 days |
| M9-1-4 | AI Generation Logic | HIGH | High | 2 days |
| M9-2 | Code Testing | MEDIUM | High | 3 days |
| M9-3 | Scenario-Based | MEDIUM | Medium | 2 days |
| M9-4 | AI Voice Interview | LOW | Very High | 5 days |
| M9-5 | Runtime AI Questions | LOW | High | 3 days |
| M9-6 | AI Video Interview | LOW | Very High | 5 days |
| **TOTAL** | **11 requirements** | | | **~28 days** |

**Implementation Strategy:**
- **Week 1 (Days 1-5):** M9, M9-1, M9-1-1, M9-1-2, M9-1-3 (CRITICAL PATH)
- **Week 2 (Days 6-10):** M9-1-4, M9-2 (Core + Code Testing)
- **Week 3 (Days 11-15):** M9-3 (Scenario-Based)
- **Future (Later):** M9-4, M9-5, M9-6 (AI features - nice to have)

---

## M9: ASSESSMENT METHODS

### M9 - Assessment Methods Overview
**ID:** M9  
**Priority:** CRITICAL  
**Type:** Foundation

**Requirements:**
- Create assessment model
- Modify assessment model
- Delete assessment model
- Multiple source types (Role-based, Competency-based, Custom)
- Template system

**Database Schema:**

```sql
-- Assessment Models
CREATE TABLE assessment_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  created_by UUID REFERENCES users(id),
  
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- AUTO: ASM001
  description TEXT,
  
  source_type VARCHAR(50) NOT NULL, -- ROLE_BASED | COMPETENCY_BASED | CUSTOM | TEMPLATE
  role_id UUID REFERENCES roles(id),
  target_level VARCHAR(20), -- JUNIOR | MIDDLE | SENIOR | EXPERT
  
  duration_minutes INT, -- Time limit
  passing_score INT, -- Percentage required to pass
  max_attempts INT DEFAULT 3,
  randomize_questions BOOLEAN DEFAULT false,
  show_results_immediately BOOLEAN DEFAULT true,
  
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT | PUBLISHED | ARCHIVED
  is_template BOOLEAN DEFAULT false,
  
  metadata JSONB, -- Additional settings
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Assessment Components (Competencies in assessment)
CREATE TABLE assessment_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_model_id UUID REFERENCES assessment_models(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES competencies(id),
  
  weight DECIMAL(5,2) DEFAULT 1.0, -- How much this competency counts
  target_level VARCHAR(20), -- Level to test
  
  indicator_ids UUID[], -- Which indicators to test
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Component Questions
CREATE TABLE component_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES assessment_components(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- MCQ | MULTIPLE_SELECT | TRUE_FALSE | SHORT_ANSWER | ESSAY | CODE | SCENARIO | VOICE | VIDEO
  
  options JSONB, -- For MCQ: [{ text, isCorrect, order }]
  correct_answer TEXT, -- For short answer, true/false
  
  points INT DEFAULT 1,
  time_limit_seconds INT, -- Per question time limit
  
  linked_indicators UUID[], -- Which indicators this tests
  explanation TEXT, -- Why this is the answer
  
  order_index INT,
  
  metadata JSONB, -- Question-specific settings
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assessment_models_tenant ON assessment_models(tenant_id);
CREATE INDEX idx_assessment_models_role ON assessment_models(role_id);
CREATE INDEX idx_assessment_models_status ON assessment_models(status);
CREATE INDEX idx_component_questions_component ON component_questions(component_id);
```

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE]

Implement M9: Assessment Methods Foundation

REQUIREMENTS:

1. Create database tables:
   - assessment_models
   - assessment_components
   - component_questions
   
2. Create Prisma schema models:
   File: prisma/schema.prisma
   Add AssessmentModel, AssessmentComponent, ComponentQuestion models
   
3. Create API endpoints:
   File: app/api/assessments/admin/models/route.ts
   
   GET /api/assessments/admin/models
     - List all assessment models
     - Filter by: status, sourceType, roleId
     - Pagination support
   
   POST /api/assessments/admin/models
     - Create new assessment model
     - Input: { name, sourceType, roleId?, targetLevel?, ... }
     - Generate unique code (ASM001, ASM002, ...)
   
   GET /api/assessments/admin/models/[modelId]
     - Get assessment model with components and questions
   
   PATCH /api/assessments/admin/models/[modelId]
     - Update assessment model
   
   DELETE /api/assessments/admin/models/[modelId]
     - Soft delete (set status = ARCHIVED)

4. Create basic UI components:
   File: app/assessments/admin/models/page.tsx
   - List of assessment models
   - Create button
   - Search and filters
   - Status badges (Draft, Published, Archived)

SUCCESS CRITERIA:
✓ Database tables created
✓ Prisma models defined
✓ API endpoints working
✓ Can create/list assessment models
✓ Unique code generation works

Execute autonomously.
```

---

## M9-1: BASED ON COMPETENCY AND ROLE

### M9-1 - Role & Competency Based Assessment Creation
**ID:** M9-1  
**Priority:** CRITICAL  
**Type:** Assessment Builder

**Requirements:**
- Select role as source
- Select target level
- Auto-populate competencies from role
- Assign weights to competencies
- Smart indicator selection based on level
- Preview indicator list

**The Core Innovation: Smart Indicator Selection**

```typescript
/**
 * CRITICAL ALGORITHM: Select Relevant Indicators
 * 
 * This is what makes the assessment intelligent!
 * 
 * Problem: A role has competencies, each competency has indicators for 4 levels.
 * If we're testing "Junior Java Developer", we should only use Junior-level indicators.
 * 
 * Solution: Filter indicators by target level + include context from lower levels.
 */

interface Indicator {
  id: string;
  competencyId: string;
  level: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';
  type: 'POSITIVE' | 'NEGATIVE';
  text: string;
}

const LEVEL_HIERARCHY = {
  JUNIOR: 1,
  MIDDLE: 2,
  SENIOR: 3,
  EXPERT: 4
};

async function selectRelevantIndicators(
  competencyId: string,
  targetLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT'
): Promise<Indicator[]> {
  // 1. Fetch all indicators for this competency
  const allIndicators = await prisma.competencyIndicator.findMany({
    where: { competencyId }
  });
  
  // 2. Get exact level match (primary indicators)
  const exactLevelIndicators = allIndicators.filter(
    i => i.level === targetLevel
  );
  
  // 3. Get lower level indicators for context (secondary)
  const lowerLevelIndicators = allIndicators.filter(
    i => LEVEL_HIERARCHY[i.level] < LEVEL_HIERARCHY[targetLevel]
  );
  
  // 4. Combine with weights
  return [
    ...exactLevelIndicators.map(i => ({ ...i, weight: 1.0 })),
    ...lowerLevelIndicators.map(i => ({ ...i, weight: 0.3 })) // Less weight
  ];
}

/**
 * Example:
 * 
 * Competency: "Java Programming"
 * Target Level: MIDDLE
 * 
 * Indicators returned:
 * - All MIDDLE level indicators (weight: 1.0)
 * - All JUNIOR level indicators (weight: 0.3) // For context
 * - No SENIOR or EXPERT indicators
 * 
 * Why include lower levels?
 * - Middle developers should know junior concepts
 * - But we weight them less (30% importance)
 * - Primary focus on middle-level skills
 */
```

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE]

Implement M9-1: Role & Competency Based Assessment Creation

REQUIREMENTS:

1. Create Assessment Builder Wizard:
   File: app/assessments/admin/models/create/page.tsx
   
   Multi-step wizard:
   
   STEP 1: Source Selection
   ┌─────────────────────────────────────────┐
   │ How do you want to create assessment?  │
   │                                         │
   │ ○ Based on Role                        │
   │ ○ Based on Competencies                │
   │ ○ Custom (Manual)                      │
   │ ○ From Template                        │
   │                                         │
   │ [Continue →]                           │
   └─────────────────────────────────────────┘
   
   STEP 2: Role & Level Selection (if Role selected)
   ┌─────────────────────────────────────────┐
   │ Select Role:                            │
   │ [Dropdown: All roles] ▼                 │
   │                                         │
   │ Target Level:                           │
   │ ○ Junior  ○ Middle  ○ Senior  ○ Expert │
   │                                         │
   │ [← Back]              [Continue →]     │
   └─────────────────────────────────────────┘
   
   STEP 3: Competency Configuration
   ┌─────────────────────────────────────────┐
   │ Competencies from "Java Developer" role:│
   │                                         │
   │ ┌──────────────────────────────────────┐│
   │ │ ✓ Java Programming        Weight: 30%││
   │ │   [===|=====================]        ││
   │ │   Indicators: 8 selected (MIDDLE)   ││
   │ │                                      ││
   │ │ ✓ Problem Solving         Weight: 25%││
   │ │   [===|=====================]        ││
   │ │   Indicators: 6 selected (MIDDLE)   ││
   │ │                                      ││
   │ │ ✓ Communication           Weight: 20%││
   │ │   [===|=====================]        ││
   │ │   Indicators: 5 selected (MIDDLE)   ││
   │ └──────────────────────────────────────┘│
   │                                         │
   │ [View Indicators] [Adjust Weights]     │
   │ [← Back]              [Continue →]     │
   └─────────────────────────────────────────┘

2. Implement Smart Indicator Selection:
   File: lib/assessment/indicator-selection.ts
   
   Function: selectRelevantIndicators()
   - Takes: competencyId, targetLevel
   - Returns: Filtered indicators
   - Logic:
     * Get all indicators for competency
     * Filter by target level (primary)
     * Include lower level indicators (secondary, 30% weight)
     * Exclude higher level indicators
   
   Example:
   selectRelevantIndicators('comp-java', 'MIDDLE')
   → Returns:
     - All MIDDLE level indicators (weight: 1.0)
     - All JUNIOR level indicators (weight: 0.3)
     - NO SENIOR or EXPERT indicators

3. Create API endpoint:
   File: app/api/assessments/admin/models/from-role/route.ts
   
   POST /api/assessments/admin/models/from-role
   Input:
   {
     roleId: "role-java-dev",
     targetLevel: "MIDDLE",
     name: "Java Developer - Middle Level Assessment",
     competencyWeights: {
       "comp-java": 0.30,
       "comp-problem-solving": 0.25,
       "comp-communication": 0.20
     }
   }
   
   Process:
   1. Fetch role and its competencies
   2. For each competency:
      - Call selectRelevantIndicators()
      - Create assessment_component record
      - Store indicator IDs
   3. Create assessment_model record
   4. Return created model with components

4. Create Indicator Preview Component:
   File: components/Assessments/IndicatorPreview.tsx
   
   Shows:
   - List of indicators to be tested
   - Grouped by competency
   - Color-coded by type (Positive: green, Negative: red)
   - Level indicated
   
   Example display:
   ┌──────────────────────────────────────┐
   │ Java Programming (MIDDLE)            │
   ├──────────────────────────────────────┤
   │ ✓ Writes clean, maintainable code    │
   │ ✓ Applies SOLID principles           │
   │ ✓ Uses design patterns appropriately │
   │ ✗ Inconsistent code quality          │
   │ ✗ Over-complicates simple solutions  │
   │                                      │
   │ From JUNIOR (context):               │
   │ ✓ Understands basic syntax (30%)     │
   │ ✓ Can write simple programs (30%)    │
   └──────────────────────────────────────┘

BUSINESS RULES:
- Must select at least 1 competency
- Total weights should sum to 100%
- Target level required
- Indicators automatically selected (no manual selection needed)
- Can adjust competency weights via slider

DATABASE:
- Creates assessment_model record
- Creates assessment_component for each competency
- Stores indicator_ids array in component
- Stores weights

SUCCESS CRITERIA:
✓ Can create assessment from role
✓ Competencies auto-populate from role
✓ Indicator selection algorithm works
✓ Weights can be adjusted
✓ Preview shows selected indicators
✓ Assessment model created successfully

Execute autonomously.
```

---

## M9-1-1 & M9-1-2: ROLE ASSIGNMENT & LEVEL SELECTION

**These are covered in M9-1 above** - they're part of the role-based creation flow.

---

## M9-1-3: ADD QUESTIONS

### M9-1-3 - Question Management (Manual, Bulk, AI)
**ID:** M9-1-3  
**Priority:** CRITICAL  
**Type:** Question Management

**Requirements:**
- Manual question entry (form)
- Bulk upload via CSV/Excel
- AI question generation
- Question types: MCQ, Multiple Select, True/False, Short Answer, Essay
- Link questions to indicators
- Preview questions

**Question Types Supported:**

```typescript
enum QuestionType {
  MCQ = 'MCQ',                    // Multiple Choice (single answer)
  MULTIPLE_SELECT = 'MULTIPLE_SELECT', // Multiple Choice (multiple answers)
  TRUE_FALSE = 'TRUE_FALSE',       // True/False
  SHORT_ANSWER = 'SHORT_ANSWER',   // Text input (1-2 sentences)
  ESSAY = 'ESSAY',                // Long text (paragraphs)
  CODE = 'CODE',                  // Code challenge (M9-2)
  SCENARIO = 'SCENARIO',          // Scenario-based (M9-3)
  VOICE = 'VOICE',                // Voice interview (M9-4)
  VIDEO = 'VIDEO'                 // Video interview (M9-6)
}
```

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE - CRITICAL]

Implement M9-1-3: Question Management System

REQUIREMENTS:

1. Add Questions to Assessment (Step 4 of wizard):
   File: app/assessments/admin/models/[modelId]/questions/page.tsx
   
   Tabs: [Manual | Bulk Upload | AI Generate]
   
   TAB 1: Manual Entry
   ┌──────────────────────────────────────────────┐
   │ Add Question                                 │
   ├──────────────────────────────────────────────┤
   │ Question Type:                               │
   │ [Multiple Choice ▼]                          │
   │                                              │
   │ Question Text: *                             │
   │ [Rich text editor__________________]         │
   │                                              │
   │ Options: (for MCQ)                           │
   │ ○ [Option 1_______________________] [×]      │
   │ ○ [Option 2_______________________] [×]      │
   │ ○ [Option 3_______________________] [×]      │
   │ ● [Option 4_______________________] [×]      │
   │ [+ Add Option]                               │
   │                                              │
   │ Correct Answer: Option 4                     │
   │                                              │
   │ Points: [5]  Time Limit: [120] seconds      │
   │                                              │
   │ Linked Indicators:                           │
   │ [Select indicators... ▼] (Multi-select)     │
   │                                              │
   │ Explanation (optional):                      │
   │ [Why this is correct_______________]         │
   │                                              │
   │ [Cancel]                     [Add Question]  │
   └──────────────────────────────────────────────┘

2. Create Question Form Component:
   File: components/Assessments/QuestionForm.tsx
   
   Props:
   - componentId: string
   - indicators: Indicator[]
   - onSave: (question) => void
   
   Features:
   - Dynamic form based on question type
   - Rich text editor for question text
   - Option management for MCQ
   - Indicator linking (multi-select)
   - Validation
   - Preview mode

3. Bulk Upload Tab:
   File: components/Assessments/BulkUploadQuestions.tsx
   
   4-Step Process:
   
   STEP 1: Download Template
   ┌──────────────────────────────────────────┐
   │ 1. Download Template                     │
   │                                          │
   │ Download the CSV template with the       │
   │ correct column structure.                │
   │                                          │
   │ [📥 Download Template.csv]               │
   │                                          │
   │ [Next →]                                 │
   └──────────────────────────────────────────┘
   
   STEP 2: Upload File
   ┌──────────────────────────────────────────┐
   │ 2. Upload Your File                      │
   │                                          │
   │ ┌──────────────────────────────────────┐│
   │ │     📁 Drag & Drop CSV/Excel         ││
   │ │        or click to browse            ││
   │ └──────────────────────────────────────┘│
   │                                          │
   │ [Choose File]          [Upload]          │
   └──────────────────────────────────────────┘
   
   STEP 3: Validation & Preview
   ┌──────────────────────────────────────────┐
   │ 3. Review                                │
   │                                          │
   │ ✓ Valid: 45 questions                    │
   │ ✗ Errors: 5 questions                    │
   │                                          │
   │ ┌──────────────────────────────────────┐│
   │ │ Row | Error                          ││
   │ ├──────────────────────────────────────┤│
   │ │ 12  | Missing correct answer         ││
   │ │ 18  | Invalid question type          ││
   │ │ 23  | Options count < 2              ││
   │ └──────────────────────────────────────┘│
   │                                          │
   │ [← Back] [Fix Errors] [Import Valid]    │
   └──────────────────────────────────────────┘
   
   STEP 4: Import
   ┌──────────────────────────────────────────┐
   │ 4. Import Complete                       │
   │                                          │
   │ ✓ Successfully imported 45 questions     │
   │                                          │
   │ [View Questions]        [Add More]       │
   └──────────────────────────────────────────┘

4. CSV Template Structure:
   File: public/templates/questions-template.csv
   
   Columns:
   - question_text (required)
   - question_type (required: MCQ|MULTIPLE_SELECT|TRUE_FALSE|SHORT_ANSWER|ESSAY)
   - option_1, option_2, option_3, option_4, option_5, option_6
   - correct_answer (number for MCQ or text for others)
   - points (number, default: 1)
   - time_limit_seconds (number, optional)
   - indicator_ids (comma-separated UUIDs)
   - explanation (text, optional)
   
   Example rows:
   ```csv
question_text,question_type,option_1,option_2,option_3,option_4,correct_answer,points,time_limit_seconds,indicator_ids,explanation
"What is polymorphism in Java?",MCQ,"Method overloading","Method overriding","Both A and B","None",3,2,120,"ind-123,ind-456","Polymorphism includes both compile-time and runtime"
"Is Java platform independent?",TRUE_FALSE,,,,,true,1,60,"ind-789","Java bytecode runs on JVM"
```

5. Create Bulk Upload API:
   File: app/api/assessments/admin/components/[componentId]/questions/bulk/route.ts
   
   POST /api/assessments/admin/components/[componentId]/questions/bulk
   - Accept: multipart/form-data (CSV or Excel file)
   - Parse file
   - Validate each row:
     * question_text: required, 10-1000 chars
     * question_type: valid enum value
     * For MCQ: at least 2 options, correct_answer within range
     * For TRUE_FALSE: correct_answer must be 'true' or 'false'
     * points: positive integer
     * indicator_ids: valid UUIDs (check they exist)
   - Return:
     {
       valid: Question[],
       invalid: { row: number, errors: string[] }[]
     }
   - If user confirms, insert valid questions

6. Question List Component:
   File: components/Assessments/QuestionList.tsx
   
   Features:
   - List all questions in component
   - Group by indicator
   - Drag & drop reordering
   - Edit inline
   - Delete with confirmation
   - Preview question
   - Duplicate question
   
   Display:
   ┌──────────────────────────────────────────┐
   │ Questions (12)              [+ Add]      │
   ├──────────────────────────────────────────┤
   │ Java Programming (8 questions)           │
   │ ┌────────────────────────────────────────┤
   │ │ 1. ☰ What is polymorphism?      [⋮]  ││
   │ │    MCQ | 2 points | 120s              ││
   │ │    Indicators: Method Overriding      ││
   │ ├────────────────────────────────────────┤
   │ │ 2. ☰ Explain inheritance       [⋮]  ││
   │ │    Essay | 5 points | 300s            ││
   │ └────────────────────────────────────────┘
   │                                          │
   │ Problem Solving (4 questions)            │
   │ ...                                      │
   └──────────────────────────────────────────┘

VALIDATION RULES:
- Question text: 10-1000 characters
- MCQ: 2-6 options, exactly 1 correct
- Multiple Select: 2-6 options, at least 1 correct
- Points: 1-10
- Time limit: 10-600 seconds
- Must link to at least 1 indicator

SUCCESS CRITERIA:
✓ Can add questions manually
✓ All question types work
✓ Can bulk upload via CSV
✓ Validation catches errors
✓ Invalid rows highlighted
✓ Questions display in list
✓ Can reorder questions
✓ Can edit/delete questions

Execute autonomously.
```

---

## M9-1-4: AI QUESTION GENERATION

### M9-1-4 - AI-Powered Question Generation
**ID:** M9-1-4  
**Priority:** HIGH  
**Type:** AI Integration

**Requirements:**
- Generate questions from role + competency + level
- Generate from indicators (positive/negative)
- Multiple question types
- Configurable difficulty
- Preview before adding
- Regenerate individual questions

**The AI Generation Logic:**

```typescript
/**
 * AI Question Generation Prompt Template
 * 
 * This prompt is sent to GPT-4/Claude to generate assessment questions
 */

interface GenerationConfig {
  role: Role;
  competency: Competency;
  level: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';
  indicators: Indicator[];
  count: number; // How many questions to generate
  questionTypes: QuestionType[]; // Which types to generate
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  additionalContext?: string; // User-provided context
}

function buildAIPrompt(config: GenerationConfig): string {
  const { role, competency, level, indicators, count, questionTypes, difficulty } = config;
  
  const positiveIndicators = indicators.filter(i => i.type === 'POSITIVE');
  const negativeIndicators = indicators.filter(i => i.type === 'NEGATIVE');
  
  return `
You are an expert assessment designer creating questions for a professional competency assessment.

CONTEXT:
- Role: ${role.name}
- Competency: ${competency.name}
- Level: ${level}
- Target Difficulty: ${difficulty}

POSITIVE INDICATORS (Skills to test):
${positiveIndicators.map(i => `- ${i.text}`).join('\n')}

NEGATIVE INDICATORS (Anti-patterns to avoid):
${negativeIndicators.map(i => `- ${i.text}`).join('\n')}

TASK:
Generate ${count} assessment questions testing the POSITIVE indicators.
Question types to use: ${questionTypes.join(', ')}

For NEGATIVE indicators, create scenario-based questions where the candidate must identify the problem.

REQUIREMENTS:
1. Each question must test at least one indicator
2. Questions should be clear and unambiguous
3. For MCQ: 4 options, 1 correct answer
4. Include explanation of correct answer
5. Assign appropriate points (1-5)
6. Set time limit (30-300 seconds)

${config.additionalContext ? `ADDITIONAL CONTEXT:\n${config.additionalContext}\n` : ''}

OUTPUT FORMAT (JSON array):
[
  {
    "question_text": "What is the primary benefit of using interfaces in Java?",
    "question_type": "MCQ",
    "options": [
      { "text": "Code reusability", "isCorrect": false },
      { "text": "Abstraction and polymorphism", "isCorrect": true },
      { "text": "Faster execution", "isCorrect": false },
      { "text": "Less memory usage", "isCorrect": false }
    ],
    "points": 2,
    "time_limit_seconds": 120,
    "linked_indicator_ids": ["ind-123"],
    "explanation": "Interfaces provide abstraction and enable polymorphism in Java..."
  }
]

Generate ${count} questions now.
`;
}
```

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE]

Implement M9-1-4: AI Question Generation

REQUIREMENTS:

1. Add AI Generation Tab:
   File: components/Assessments/AIGenerateQuestions.tsx
   
   Interface:
   ┌──────────────────────────────────────────────┐
   │ AI Question Generation                       │
   ├──────────────────────────────────────────────┤
   │ Competency: [Auto-selected from component]  │
   │ Level: [Auto-selected from assessment]      │
   │                                              │
   │ Number of Questions: [10]                    │
   │                                              │
   │ Question Types:                              │
   │ ☑ Multiple Choice                            │
   │ ☑ True/False                                 │
   │ ☐ Short Answer                               │
   │ ☐ Essay                                      │
   │                                              │
   │ Difficulty:                                  │
   │ ○ Easy  ● Medium  ○ Hard                     │
   │                                              │
   │ Additional Context (optional):               │
   │ [e.g., Focus on Java 11 features_____]       │
   │                                              │
   │ [Generate Questions]                         │
   └──────────────────────────────────────────────┘
   
   After generation:
   ┌──────────────────────────────────────────────┐
   │ Generated Questions (10)                     │
   ├──────────────────────────────────────────────┤
   │ ┌──────────────────────────────────────────┐│
   │ │ 1. What is polymorphism in Java?         ││
   │ │    MCQ | 2 points | 120s                 ││
   │ │    Options: A, B, C, D (B correct)       ││
   │ │                                          ││
   │ │    [Edit] [Regenerate] [Remove]          ││
   │ └──────────────────────────────────────────┘│
   │ ┌──────────────────────────────────────────┐│
   │ │ 2. Interfaces enable abstraction         ││
   │ │    TRUE_FALSE | 1 point | 60s            ││
   │ │    Answer: True                          ││
   │ │                                          ││
   │ │    [Edit] [Regenerate] [Remove]          ││
   │ └──────────────────────────────────────────┘│
   │                                              │
   │ [Regenerate All] [Accept All] [Cancel]      │
   └──────────────────────────────────────────────┘

2. Create AI Generation Service:
   File: lib/ai/question-generator.ts
   
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
   });
   
   export async function generateQuestions(
     config: GenerationConfig
   ): Promise<Question[]> {
     const prompt = buildAIPrompt(config);
     
     const response = await openai.chat.completions.create({
       model: 'gpt-4-turbo',
       messages: [
         {
           role: 'system',
           content: 'You are an expert assessment designer. Generate high-quality, pedagogically sound assessment questions.'
         },
         {
           role: 'user',
           content: prompt
         }
       ],
       response_format: { type: 'json_object' },
       temperature: 0.7,
       max_tokens: 3000
     });
     
     const generated = JSON.parse(response.choices[0].message.content);
     return generated.questions;
   }

3. Create API endpoint:
   File: app/api/assessments/admin/components/[componentId]/questions/ai-generate/route.ts
   
   POST /api/assessments/admin/components/[componentId]/questions/ai-generate
   
   Input:
   {
     count: 10,
     questionTypes: ['MCQ', 'TRUE_FALSE'],
     difficulty: 'MEDIUM',
     additionalContext: 'Focus on Java 11 features'
   }
   
   Process:
   1. Fetch component and its competency
   2. Fetch indicators for the competency + level
   3. Build generation config
   4. Call generateQuestions()
   5. Validate generated questions
   6. Return questions (not saved yet)
   
   Output:
   {
     questions: Question[]
   }
   
   Note: Questions are previewed first, saved when user clicks "Accept"

4. Regenerate Single Question:
   File: app/api/assessments/admin/questions/[questionId]/regenerate/route.ts
   
   POST /api/assessments/admin/questions/[questionId]/regenerate
   - Fetch original question context
   - Generate 1 new question with same parameters
   - Return new question
   - User can accept or try again

5. Edit Generated Question:
   File: components/Assessments/QuestionEditDialog.tsx
   - Load question data
   - Allow editing all fields
   - Save changes
   - Inline editing

BUSINESS RULES:
- AI generation requires OpenAI API key
- Max 20 questions per generation
- Generated questions are NOT saved automatically
- User must preview and accept
- Can regenerate individual questions
- Can edit before accepting
- Fallback to manual entry if AI fails

ERROR HANDLING:
- If API key missing: Show error, disable AI generation
- If API fails: Show error, offer retry
- If generated JSON invalid: Parse and show specific errors
- If generation times out: Show progress indicator

COST CONSIDERATIONS:
- Estimate tokens before generation
- Show estimated cost to user (optional)
- Cache common generation patterns
- Rate limit per tenant (e.g., 100 generations/day)

SUCCESS CRITERIA:
✓ Can generate questions via AI
✓ Questions are pedagogically sound
✓ Preview before accepting
✓ Can regenerate individual questions
✓ Can edit before saving
✓ Error handling works
✓ Generation is fast (<30 seconds)

Execute autonomously.
```

---

## M9-2: CODE TEST MODEL

### M9-2 - Code Testing Integration
**ID:** M9-2  
**Priority:** MEDIUM  
**Type:** External Integration

**Requirements:**
- Integrate with code testing platforms (HackerRank, Codility, CoderPad)
- Support multiple programming languages
- Real-time code execution
- Test case validation
- Results webhooks
- Code quality analysis

**Implementation Strategy: Phase 1 - External Platforms**

```typescript
/**
 * Code Testing Flow
 * 
 * We use external platforms initially because:
 * 1. They handle security (sandboxing)
 * 2. They support multiple languages
 * 3. They have mature test runners
 * 4. Reduces development time
 * 
 * Flow:
 * 1. Create code challenge in our system
 * 2. User starts assessment
 * 3. Redirect to external platform (HackerRank/Codility)
 * 4. User completes test
 * 5. Platform sends results via webhook
 * 6. Store results in our system
 * 7. Include in overall assessment score
 */

// Database Schema
interface CodeChallenge {
  id: string;
  componentId: string; // Links to assessment_components
  
  problemStatement: string;
  language: 'JAVA' | 'PYTHON' | 'JAVASCRIPT' | 'TYPESCRIPT' | 'CPP' | 'CSHARP' | 'GO' | 'SQL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMinutes: number;
  
  starterCode?: string; // Initial code template
  testCases: TestCase[]; // Hidden from user
  
  // External platform integration
  externalPlatform: 'HACKERRANK' | 'CODILITY' | 'CODERPAD';
  externalTestId: string; // ID in external platform
  externalTestUrl: string; // URL to redirect to
  
  metadata: {
    topics: string[]; // e.g., ['arrays', 'sorting']
    hints?: string[];
  };
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean; // Some test cases visible, some hidden
  points: number;
}

interface CodeSubmission {
  id: string;
  memberId: string;
  challengeId: string;
  assessmentId: string;
  
  code: string;
  language: string;
  submittedAt: Date;
  
  executionTime: number; // milliseconds
  memoryUsage: number; // KB
  
  testResults: {
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    executionTime: number;
  }[];
  
  score: number; // Percentage (passed tests / total tests)
  qualityMetrics?: {
    complexity: number;
    codeSmells: string[];
    bestPractices: boolean;
  };
  
  feedback: string;
}
```

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE]

Implement M9-2: Code Testing Integration

APPROACH: External Platform Integration (Phase 1)

REQUIREMENTS:

1. Create Code Challenge Creator:
   File: components/Assessments/CodeChallengeForm.tsx
   
   Form:
   ┌──────────────────────────────────────────────┐
   │ Add Code Challenge                           │
   ├──────────────────────────────────────────────┤
   │ Problem Statement: *                         │
   │ [Rich text editor_______________________]    │
   │                                              │
   │ Programming Language: *                      │
   │ [Java ▼]                                     │
   │                                              │
   │ Difficulty:                                  │
   │ ○ Easy  ● Medium  ○ Hard                     │
   │                                              │
   │ Time Limit: [30] minutes                     │
   │                                              │
   │ Starter Code (optional):                     │
   │ [Code editor with syntax highlighting____]   │
   │                                              │
   │ Test Cases:                                  │
   │ ┌──────────────────────────────────────────┐│
   │ │ Test Case 1:                             ││
   │ │ Input: [1, 2, 3, 4, 5]                  ││
   │ │ Expected: 15                             ││
   │ │ ☐ Hidden  Points: [10]                   ││
   │ │ [Remove]                                 ││
   │ └──────────────────────────────────────────┘│
   │ [+ Add Test Case]                            │
   │                                              │
   │ External Platform:                           │
   │ ○ HackerRank  ○ Codility  ○ CoderPad        │
   │                                              │
   │ [Create Challenge]                           │
   └──────────────────────────────────────────────┘

2. Create Database Tables:
   File: prisma/schema.prisma
   
   model CodeChallenge {
     id String @id @default(uuid())
     componentId String
     component AssessmentComponent @relation(fields: [componentId])
     
     problemStatement String @db.Text
     language CodeLanguage
     difficulty CodeDifficulty
     timeLimitMinutes Int
     
     starterCode String? @db.Text
     testCases Json // Array of TestCase objects
     
     externalPlatform CodePlatform
     externalTestId String?
     externalTestUrl String?
     
     metadata Json?
     
     createdAt DateTime @default(now())
   }
   
   model CodeSubmission {
     id String @id @default(uuid())
     memberId String
     member Member @relation(fields: [memberId])
     challengeId String
     challenge CodeChallenge @relation(fields: [challengeId])
     
     code String @db.Text
     language String
     submittedAt DateTime @default(now())
     
     executionTime Float? // milliseconds
     memoryUsage Int? // KB
     testResults Json // Array of test results
     score Int // 0-100
     
     qualityMetrics Json?
     feedback String? @db.Text
   }

3. Integrate External Platform API:
   File: lib/code-testing/hackerrank-client.ts
   
   import axios from 'axios';
   
   const HACKERRANK_API_URL = 'https://api.hackerrank.com/v1';
   const API_KEY = process.env.HACKERRANK_API_KEY;
   
   export async function createHackerRankTest(
     challenge: CodeChallenge
   ): Promise<{ testId: string; testUrl: string }> {
     const response = await axios.post(
       `${HACKERRANK_API_URL}/tests`,
       {
         name: challenge.problemStatement.substring(0, 100),
         duration: challenge.timeLimitMinutes,
         questions: [
           {
             type: 'coding',
             name: 'Challenge',
             problem_statement: challenge.problemStatement,
             starter_code: challenge.starterCode,
             test_cases: challenge.testCases.map(tc => ({
               input: tc.input,
               expected_output: tc.expectedOutput,
               score: tc.points
             }))
           }
        ]
       },
       {
         headers: {
           'Authorization': `Bearer ${API_KEY}`
         }
       }
     );
     
     return {
       testId: response.data.id,
       testUrl: response.data.url
     };
   }
   
   export async function inviteCandidate(
     testId: string,
     candidateEmail: string
   ): Promise<{ inviteUrl: string }> {
     const response = await axios.post(
       `${HACKERRANK_API_URL}/tests/${testId}/candidates`,
       {
         email: candidateEmail,
         full_name: candidateEmail
       },
       {
         headers: {
           'Authorization': `Bearer ${API_KEY}`
         }
       }
     );
     
     return {
       inviteUrl: response.data.url
     };
   }

4. Create Webhook Handler:
   File: app/api/webhooks/code-test-result/route.ts
   
   POST /api/webhooks/code-test-result
   
   Purpose: Receive results from external platform
   
   import { NextRequest } from 'next/server';
   import crypto from 'crypto';
   
   export async function POST(req: NextRequest) {
     // 1. Verify webhook signature
     const signature = req.headers.get('X-HackerRank-Signature');
     const payload = await req.text();
     
     const expectedSignature = crypto
       .createHmac('sha256', process.env.WEBHOOK_SECRET!)
       .update(payload)
       .digest('hex');
     
     if (signature !== expectedSignature) {
       return new Response('Invalid signature', { status: 401 });
     }
     
     // 2. Parse payload
     const data = JSON.parse(payload);
     
     // 3. Extract results
     const {
       test_id,
       candidate_email,
       score,
       time_taken,
       test_results
     } = data;
     
     // 4. Find code challenge and member
     const challenge = await prisma.codeChallenge.findFirst({
       where: { externalTestId: test_id }
     });
     
     const member = await prisma.member.findFirst({
       where: { email: candidate_email }
     });
     
     if (!challenge || !member) {
       return new Response('Not found', { status: 404 });
     }
     
     // 5. Store submission
     await prisma.codeSubmission.create({
       data: {
         memberId: member.id,
         challengeId: challenge.id,
         code: data.code_submitted || '',
         language: challenge.language,
         score: Math.round(score),
         executionTime: time_taken,
         testResults: test_results,
         submittedAt: new Date()
       }
     });
     
     // 6. Update member assessment score
     // (if this is part of an assessment)
     await updateAssessmentScore(member.id, challenge.componentId, score);
     
     // 7. Send notification
     await sendEmail({
       to: member.email,
       subject: 'Code Challenge Completed',
       body: `You scored ${score}% on the code challenge.`
     });
     
     return new Response('OK', { status: 200 });
   }

5. Assessment Taking Flow:
   File: app/assessments/[assessmentId]/take/page.tsx
   
   When user encounters code challenge:
   
   ┌──────────────────────────────────────────────┐
   │ Code Challenge                               │
   ├──────────────────────────────────────────────┤
   │ Problem: Write a function to sum array       │
   │                                              │
   │ Language: Java                               │
   │ Time Limit: 30 minutes                       │
   │ Points: 20                                   │
   │                                              │
   │ You will be redirected to HackerRank to      │
   │ complete this challenge. Your results will   │
   │ be automatically recorded.                   │
   │                                              │
   │ [Start Challenge on HackerRank]              │
   └──────────────────────────────────────────────┘
   
   On click:
   1. Generate auth token for candidate
   2. Redirect to: externalTestUrl + authToken
   3. User completes test on external platform
   4. Platform sends results to our webhook
   5. User returns to assessment (via redirect URL)
   6. See "Challenge Completed" status

6. Code Challenge Management:
   File: app/assessments/admin/code-challenges/page.tsx
   
   List of all code challenges
   - Filter by language, difficulty
   - Test connection to external platform
   - View submission statistics
   - Manage API keys

SUPPORTED PLATFORMS:
1. HackerRank (implement first)
2. Codility (implement second)
3. CoderPad (implement third)

SUPPORTED LANGUAGES (Initial):
- Java
- Python
- JavaScript
- SQL

BUSINESS RULES:
- Code challenges optional in assessment
- Each challenge = one question in assessment
- Score from platform integrated into overall assessment score
- Candidates have limited attempts (configurable)
- Test cases: Some visible (examples), some hidden (actual test)
- Time limit enforced by external platform

SECURITY:
- Webhook signature verification (HMAC)
- API keys stored in env variables
- Candidate authentication via tokens
- Results verified before storing

SUCCESS CRITERIA:
✓ Can create code challenges
✓ Integration with HackerRank works
✓ Redirect flow functional
✓ Webhook receives results correctly
✓ Scores integrated into assessment
✓ Multiple languages supported
✓ Test cases validated

Execute autonomously.
```

---

## M9-3, M9-4, M9-5, M9-6: ADVANCED FEATURES (FUTURE)

**These are LOWER PRIORITY and can be implemented after the core system is stable.**

**M9-3: Scenario-Based Assessments**
- Behavioral scenarios
- Multiple choice with context
- Decision-making questions
- Situation-Judgment Tests (SJTs)

**M9-4: AI Voice Interview**
- Speech-to-text (Whisper API)
- AI interviewer (GPT-4)
- Text-to-speech (ElevenLabs)
- Voice analysis (tone, pace, confidence)
- Real-time conversation

**M9-5: Runtime AI Question Generation**
- Generate questions during assessment taking
- Adaptive difficulty
- Context-aware follow-ups

**M9-6: AI Video Interview**
- Video recording
- Facial expression analysis
- Body language evaluation
- Combined with voice interview

**Note:** Full implementation details for these will be provided when you're ready to implement them (after core system is complete).

---

## 🎯 IMPLEMENTATION SEQUENCE

### Week 1 (Critical Path):
1. **Day 1:** M9 - Assessment Methods Foundation
2. **Day 2-3:** M9-1 - Role & Competency Based
3. **Day 4-5:** M9-1-3 - Question Management (Manual + Bulk)

### Week 2:
4. **Day 6-7:** M9-1-4 - AI Question Generation
5. **Day 8-10:** M9-2 - Code Testing Integration

### Week 3:
6. **Day 11-13:** M9-3 - Scenario-Based Assessments
7. **Day 14-15:** Testing & Polish

### Future (After Core Complete):
- M9-4 - AI Voice Interview
- M9-5 - Runtime AI Questions
- M9-6 - AI Video Interview

---

## ✅ COMPLETION CHECKLIST

### Core Assessment Engine:
- [ ] Assessment model CRUD
- [ ] Component CRUD
- [ ] Question CRUD
- [ ] Role-based assessment creation
- [ ] Smart indicator selection algorithm
- [ ] Assessment wizard (5 steps)

### Question Management:
- [ ] Manual question entry
- [ ] All question types supported
- [ ] Bulk CSV/Excel upload
- [ ] Validation and error handling
- [ ] Question preview and editing

### AI Features:
- [ ] AI question generation
- [ ] OpenAI integration
- [ ] Generation preview
- [ ] Regenerate capability
- [ ] Edit generated questions

### Code Testing:
- [ ] Code challenge creation
- [ ] HackerRank integration
- [ ] Webhook handler
- [ ] Results storage
- [ ] Score integration

### Testing:
- [ ] Create test assessment
- [ ] Generate questions with AI
- [ ] Take assessment end-to-end
- [ ] Verify scoring
- [ ] Mobile responsive

---

## 🔄 REUSABILITY NOTE

The assessment engine is **100% polymorphic:**
- Same engine for Corporate, Institution, B2C
- Same question types work everywhere
- Same scoring logic
- Only context differs (employee vs student)

**Next Document:** Document 2 - Institution Module (M5-M8) - Quick win using this assessment engine!

---

END OF DOCUMENT 3
