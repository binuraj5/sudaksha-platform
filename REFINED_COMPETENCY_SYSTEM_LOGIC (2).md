# REFINED MODULAR COMPETENCY SYSTEM - COMPLETE LOGIC
## Role → Competencies → Assessment Model Flow

Version: 3.0 - Advanced Modular Architecture
Date: January 30, 2026

================================================================================
## SYSTEM OVERVIEW - THE COMPLETE FLOW
================================================================================

```
STEP 1: DEFINE ROLE
    ↓
    Role Details (title, description, level, department)
    ↓
STEP 2: GENERATE/SELECT COMPETENCIES FOR ROLE
    ↓
    Option A: AI Generate Competencies (with level-wise indicators)
    Option B: Select from Existing Library
    ↓
    Competencies created with ALL 4 levels of indicators
    ↓
STEP 3: SAVE TO LIBRARY
    ↓
    Competencies saved as INDEPENDENT entities
    Indicators saved with LEVEL metadata
    ↓
STEP 4: LINK TO ROLE
    ↓
    RoleCompetency mapping created
    (role + competency + required level + weight)
    ↓
STEP 5: CREATE ASSESSMENT MODEL
    ↓
    Select Role + Target Level
    ↓
    System DYNAMICALLY selects indicators based on:
    - Role's required level per competency
    - Target assessee level
    ↓
STEP 6: ASSIGN TO ASSESSEE
    ↓
    Assessment uses ONLY relevant indicators
    ↓
STEP 7: EVALUATION
    ↓
    Results mapped back to competencies with gaps identified
```

================================================================================
## PART 1: ENHANCED DATABASE SCHEMA
================================================================================

```prisma
// ============================================================================
// LAYER 1: ROLE DEFINITION
// ============================================================================

model Role {
  id                    String              @id @default(cuid())
  name                  String              @unique
  code                  String              @unique  // e.g., "JR_JAVA_DEV"
  description           String              @db.Text
  
  // Role Context
  overallLevel          ProficiencyLevel    // The level this role represents
  department            String?
  industry              Industry[]
  
  // Job Description (Optional rich data)
  keyResponsibilities   String?             @db.Text
  requiredExperience    String?
  educationRequired     String?
  
  // Competency Associations
  competencies          RoleCompetency[]
  
  // Assessment Models generated from this role
  assessmentModels      AssessmentModel[]
  
  // Users assigned to this role
  users                 User[]
  
  // Metadata
  isActive              Boolean             @default(true)
  createdBy             String
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}

enum ProficiencyLevel {
  JUNIOR
  MIDDLE
  SENIOR
  EXPERT
}

enum Industry {
  INFORMATION_TECHNOLOGY
  HEALTHCARE
  FINANCE
  MANUFACTURING
  EDUCATION
  GENERIC
}

// ============================================================================
// LAYER 2: COMPETENCY LIBRARY (INDEPENDENT)
// ============================================================================

model Competency {
  id                    String              @id @default(cuid())
  name                  String              @unique
  description           String              @db.Text
  category              CompetencyCategory
  
  // Where this competency applies
  industries            Industry[]
  
  // CRITICAL: All indicators stored here with LEVEL metadata
  indicators            CompetencyIndicator[]
  
  // Usage tracking
  roleLinks             RoleCompetency[]
  assessmentComponents  CompetencyComponentMapping[]
  
  // Metadata
  createdBy             String
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  // Statistics
  usageCount            Int                 @default(0)
  lastUsedAt            DateTime?
}

enum CompetencyCategory {
  TECHNICAL
  BEHAVIORAL
  COGNITIVE
  DOMAIN_SPECIFIC
}

// ============================================================================
// LAYER 3: LEVEL-WISE INDICATORS (THE KEY TO MODULARITY)
// ============================================================================

model CompetencyIndicator {
  id                    String              @id @default(cuid())
  competencyId          String
  competency            Competency          @relation(fields: [competencyId], references: [id], onDelete: Cascade)
  
  // THE CRITICAL METADATA
  level                 ProficiencyLevel    // JUNIOR, MIDDLE, SENIOR, EXPERT
  type                  IndicatorType       // POSITIVE, NEGATIVE
  
  // The actual indicator text
  text                  String              @db.Text
  
  // Ordering within level+type
  order                 Int                 @default(0)
  
  // Optional: Weightage for scoring
  weight                Float               @default(1.0)
  
  // Metadata
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  // Indexes for fast querying
  @@index([competencyId, level, type])
  @@index([competencyId, level])
}

enum IndicatorType {
  POSITIVE              // What success looks like
  NEGATIVE              // What failure looks like / red flags
}

// ============================================================================
// LAYER 4: ROLE-COMPETENCY MAPPING
// ============================================================================

model RoleCompetency {
  id                    String              @id @default(cuid())
  
  roleId                String
  role                  Role                @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  competencyId          String
  competency            Competency          @relation(fields: [competencyId], references: [id], onDelete: Cascade)
  
  // CRITICAL: What level is required for THIS role
  requiredLevel         ProficiencyLevel
  
  // Importance of this competency for the role
  weight                Float               @default(1.0)  // Percentage (0-1)
  isCritical            Boolean             @default(false)
  
  // Ordering in role (for display)
  order                 Int                 @default(0)
  
  // Metadata
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@unique([roleId, competencyId])
  @@index([roleId])
}

// ============================================================================
// LAYER 5: ASSESSMENT MODEL (DYNAMIC COMPOSITION)
// ============================================================================

model AssessmentModel {
  id                    String              @id @default(cuid())
  name                  String
  slug                  String              @unique
  description           String              @db.Text
  
  // SOURCE: Role-based or Custom
  sourceType            ModelSourceType     @default(ROLE_BASED)
  
  // If role-based, link to role
  roleId                String?
  role                  Role?               @relation(fields: [roleId], references: [id])
  
  // TARGET: What level is this model assessing for?
  targetLevel           ProficiencyLevel
  
  // Assessment Configuration
  totalDuration         Int                 // Total time in minutes
  passingCriteria       Float               @default(0.6)  // 60%
  
  // Visibility
  visibility            ModelVisibility     @default(PUBLIC)
  clientId              String?
  client                Client?             @relation(fields: [clientId], references: [id])
  
  // Components (generated from role competencies)
  components            AssessmentModelComponent[]
  
  // Assignments
  userAssignments       UserAssessmentModel[]
  projectAssignments    ProjectAssessmentModel[]
  
  // Metadata
  version               String              @default("1.0.0")
  isActive              Boolean             @default(true)
  isPublished           Boolean             @default(false)
  
  createdBy             String
  createdByType         CreatorType         @default(SYSTEM)
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}

enum ModelSourceType {
  ROLE_BASED            // Generated from a role
  CUSTOM                // Manually created
  HYBRID                // Mix of both
}

enum ModelVisibility {
  PUBLIC
  PRIVATE
  SYSTEM
}

enum CreatorType {
  SYSTEM
  CLIENT_ADMIN
  AI_GENERATED
}

// ============================================================================
// LAYER 6: ASSESSMENT COMPONENTS (COMPETENCY-SPECIFIC)
// ============================================================================

model AssessmentComponent {
  id                    String              @id @default(cuid())
  name                  String
  slug                  String              @unique
  description           String              @db.Text
  
  // LINK TO SOURCE COMPETENCY
  sourceCompetencyId    String?
  sourceCompetency      Competency?         @relation(fields: [sourceCompetencyId], references: [id])
  
  // Component Configuration
  category              ComponentCategory
  duration              Int                 // Duration in minutes
  difficultyLevel       DifficultyLevel
  
  // Questions (can be generated from indicators)
  questions             ComponentQuestion[]
  
  // CRITICAL: Which indicators are used in this component
  // This is determined at MODEL creation time based on target level
  linkedIndicators      ComponentIndicatorLink[]
  
  // Usage
  modelComponents       AssessmentModelComponent[]
  competencyMappings    CompetencyComponentMapping[]
  
  // Metadata
  isActive              Boolean             @default(true)
  isPublished           Boolean             @default(false)
  version               String              @default("1.0.0")
  
  createdBy             String
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}

// ============================================================================
// LAYER 7: DYNAMIC INDICATOR LINKING (THE MAGIC)
// ============================================================================

model ComponentIndicatorLink {
  id                    String              @id @default(cuid())
  
  componentId           String
  component             AssessmentComponent @relation(fields: [componentId], references: [id], onDelete: Cascade)
  
  indicatorId           String
  indicator             CompetencyIndicator @relation(fields: [indicatorId], references: [id], onDelete: Cascade)
  
  // Context: Why this indicator was selected
  selectionReason       String?             // "Target level match", "Gap assessment", etc.
  
  // How this indicator is used
  usageType             IndicatorUsageType
  
  // Metadata
  createdAt             DateTime            @default(now())
  
  @@unique([componentId, indicatorId])
  @@index([componentId])
}

enum IndicatorUsageType {
  ASSESSMENT_CRITERIA   // Direct assessment
  COACHING_HINT         // Guidance during assessment
  FEEDBACK_ELEMENT      // Post-assessment feedback
}

// ============================================================================
// LAYER 8: COMPETENCY-COMPONENT MAPPING
// ============================================================================

model CompetencyComponentMapping {
  id                    String              @id @default(cuid())
  
  competencyId          String
  competency            Competency          @relation(fields: [competencyId], references: [id], onDelete: Cascade)
  
  componentId           String
  component             AssessmentComponent @relation(fields: [componentId], references: [id], onDelete: Cascade)
  
  // How well this component assesses the competency
  relevanceScore        Float               @default(1.0)  // 0-1 scale
  
  // Which level(s) this component targets
  targetLevels          ProficiencyLevel[]
  
  createdAt             DateTime            @default(now())
  
  @@unique([competencyId, componentId])
}

// ============================================================================
// ADDITIONAL ENUMS
// ============================================================================

enum ComponentCategory {
  TECHNICAL
  BEHAVIORAL
  DOMAIN_SPECIFIC
  COGNITIVE
  SITUATIONAL
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
```

================================================================================
## PART 2: THE COMPLETE USER FLOW - STEP BY STEP
================================================================================

### FLOW 1: CREATE ROLE WITH AI-GENERATED COMPETENCIES

**Step 1: Define Role**

```
Navigate to: /assessments/admin/roles

Click: [+ Add Role]

┌─────────────────────────────────────────────────────────────┐
│ CREATE ROLE                                  Step 1 of 3     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Role Information                                             │
│                                                               │
│ Role Title: *                                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Junior Java Full Stack Developer                       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Role Code: * (auto-generated)                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ JR_JAVA_FULLSTACK                           [Edit]    │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Overall Proficiency Level: *                                 │
│ ○ Junior  ○ Middle  ○ Senior  ○ Expert                      │
│                                                               │
│ Department: (optional)                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Engineering                                            │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Industry Relevance: (select multiple)                        │
│ ☑ Information Technology  ☐ Finance  ☐ Healthcare          │
│ ☐ Manufacturing  ☐ Generic                                  │
│                                                               │
│ Description: *                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Entry-level full stack developer working with Java,   │   │
│ │ Spring Boot, React, and PostgreSQL. Responsible for   │   │
│ │ developing features, fixing bugs, and learning from   │   │
│ │ senior developers.                                     │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Key Responsibilities: (optional)                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ • Develop and maintain web applications                │   │
│ │ • Write unit and integration tests                     │   │
│ │ • Participate in code reviews                          │   │
│ │ • Debug and fix production issues                      │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Required Experience: (optional)                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 0-2 years of software development experience           │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│              [Cancel]              [Next: Add Competencies]  │
└─────────────────────────────────────────────────────────────┘
```

**Step 2: Add Competencies (The Critical Choice)**

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE ROLE                                  Step 2 of 3     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Role: Junior Java Full Stack Developer                       │
│                                                               │
│ Add Competencies to Role                                     │
│                                                               │
│ Choose how to add competencies:                              │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  🤖 AI GENERATE COMPETENCIES (Recommended)              │ │
│ │                                                          │ │
│ │  Let AI analyze the role and generate complete         │ │
│ │  competencies with level-wise positive and negative     │ │
│ │  behavioral indicators for ALL levels                   │ │
│ │  (Junior, Middle, Senior, Expert)                       │ │
│ │                                                          │ │
│ │  ✓ Saves time                                           │ │
│ │  ✓ Comprehensive coverage                               │ │
│ │  ✓ Best practice indicators                             │ │
│ │  ✓ Automatically saved to library                       │ │
│ │                                                          │ │
│ │  [✨ Generate Competencies with AI]                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│                          OR                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  📚 SELECT FROM EXISTING LIBRARY                        │ │
│ │                                                          │ │
│ │  Choose competencies that already exist in the library │ │
│ │                                                          │ │
│ │  [Browse Competency Library →]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│                          OR                                   │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  ✍️  CREATE MANUALLY                                     │ │
│ │                                                          │ │
│ │  Create competencies from scratch                       │ │
│ │                                                          │ │
│ │  [+ Add Competency Manually]                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│              [← Back]                         [Skip for now] │
└─────────────────────────────────────────────────────────────┘
```

**Step 2A: AI Generation Dialog (WHEN USER CLICKS "AI GENERATE")**

```
┌─────────────────────────────────────────────────────────────┐
│ AI GENERATE COMPETENCIES FOR ROLE                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ The AI will analyze your role and generate comprehensive    │
│ competencies with indicators for ALL proficiency levels.     │
│                                                               │
│ Role Being Analyzed:                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Title: Junior Java Full Stack Developer                 │ │
│ │ Level: Junior                                            │ │
│ │ Department: Engineering                                  │ │
│ │ Description: Entry-level full stack developer...        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Additional Context (optional but recommended):               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Focus on Spring Boot backend development, React        │   │
│ │ frontend, PostgreSQL databases, REST APIs, and basic   │   │
│ │ DevOps practices. Include soft skills like teamwork    │   │
│ │ and communication.                                      │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Generation Settings:                                         │
│                                                               │
│ Number of Competencies to Generate: [5] (3-10)              │
│                                                               │
│ Include Competency Types:                                    │
│ ☑ Technical Competencies                                    │
│ ☑ Behavioral Competencies                                   │
│ ☑ Domain-Specific Competencies                              │
│                                                               │
│ Indicators per Level: [5-7] (recommended)                   │
│                                                               │
│ 💡 What will be generated:                                  │
│  • 5 competencies relevant to the role                      │
│  • Each competency will have:                               │
│    - Description                                             │
│    - 5-7 positive indicators for Junior level               │
│    - 5-7 negative indicators for Junior level               │
│    - 5-7 positive indicators for Middle level               │
│    - 5-7 negative indicators for Middle level               │
│    - 5-7 positive indicators for Senior level               │
│    - 5-7 negative indicators for Senior level               │
│    - 5-7 positive indicators for Expert level               │
│    - 5-7 negative indicators for Expert level               │
│  • Total: ~200-280 indicators across all competencies       │
│                                                               │
│ ⚡ Estimated time: 30-60 seconds                             │
│                                                               │
│         [Cancel]              [✨ Generate Competencies]     │
└─────────────────────────────────────────────────────────────┘
```

**Step 2B: AI Generation Progress**

```
┌─────────────────────────────────────────────────────────────┐
│ GENERATING COMPETENCIES...                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [████████████████████████████████████░░░░░░░] 85%          │
│                                                               │
│  ✓ Analyzing role requirements                              │
│  ✓ Identifying key competencies                             │
│  ✓ Generating competency descriptions                       │
│  ⏳ Generating level-wise indicators...                      │
│    • Junior level indicators (complete)                      │
│    • Middle level indicators (complete)                      │
│    • Senior level indicators (in progress)                   │
│    • Expert level indicators (pending)                       │
│                                                               │
│  Please wait while AI creates comprehensive competencies     │
│  with behavioral indicators for all proficiency levels...    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Step 2C: Review Generated Competencies**

```
┌─────────────────────────────────────────────────────────────┐
│ REVIEW GENERATED COMPETENCIES                Step 2 of 3     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ✓ Successfully generated 5 competencies with 240 indicators │
│                                                               │
│ Review each competency and edit as needed before saving:    │
│                                                               │
│ ▼ COMPETENCY 1: Core Java Programming                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Category: TECHNICAL                                      │ │
│ │                                                           │ │
│ │ Description:                                             │ │
│ │ Ability to write, understand, debug, and optimize Java  │ │
│ │ code using core language constructs and object-oriented │ │
│ │ principles.                                              │ │
│ │                                                           │ │
│ │ Required Level for This Role: ●●○○○ Junior              │ │
│ │ Weight: ████████████████░░░░ 30%                        │ │
│ │ Critical: ☑ Yes                                          │ │
│ │                                                           │ │
│ │ Indicators Generated:                                    │ │
│ │ • Junior:  6 positive, 6 negative                        │ │
│ │ • Middle:  6 positive, 6 negative                        │ │
│ │ • Senior:  6 positive, 6 negative                        │ │
│ │ • Expert:  6 positive, 6 negative                        │ │
│ │                                                           │ │
│ │ [View All Indicators] [Edit Competency] [Remove]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ▼ COMPETENCY 2: Backend Frameworks (Spring Boot)            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Category: TECHNICAL                                      │ │
│ │ Required Level: ●●○○○ Junior                            │ │
│ │ Weight: ████████████░░░░░░░░ 25%                        │ │
│ │ Indicators: 24 total (6 per level × 4 levels)           │ │
│ │ [View Details] [Edit] [Remove]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ▼ COMPETENCY 3: Frontend Technologies                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Category: TECHNICAL                                      │ │
│ │ Required Level: ●●○○○ Junior                            │ │
│ │ Weight: ████████████░░░░░░░░ 20%                        │ │
│ │ [View Details] [Edit] [Remove]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ▼ COMPETENCY 4: Database & Persistence                      │
│ ▼ COMPETENCY 5: Professional & Engineering Discipline       │
│                                                               │
│ [+ Generate More Competencies]  [+ Add from Library]        │
│                                                               │
│ Total Weight: 100% ✓                                         │
│                                                               │
│   [← Back]  [Edit All]  [Save Competencies & Continue →]   │
└─────────────────────────────────────────────────────────────┘
```

**Step 2D: View Indicator Details (EXPAND VIEW)**

```
┌─────────────────────────────────────────────────────────────┐
│ COMPETENCY: Core Java Programming                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ▼ JUNIOR LEVEL INDICATORS                    [Collapse ▲]   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │ ✓ POSITIVE INDICATORS (What Success Looks Like)          │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │ 1. Writes syntactically correct Java code   [Edit]│   │ │
│ │ │ 2. Understands OOP basics (class, object,   [Edit]│   │ │
│ │ │    inheritance, polymorphism)                     │   │ │
│ │ │ 3. Uses collections (List, Set, Map)        [Edit]│   │ │
│ │ │    appropriately                                  │   │ │
│ │ │ 4. Handles basic exceptions with try-catch  [Edit]│   │ │
│ │ │ 5. Follows basic coding standards and       [Edit]│   │ │
│ │ │    naming conventions                             │   │ │
│ │ │ 6. Writes simple unit tests                 [Edit]│   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ │ [+ Add Positive Indicator]                                │ │
│ │                                                           │ │
│ │ ✗ NEGATIVE INDICATORS (Red Flags / Areas of Concern)     │ │
│ │ ┌───────────────────────────────────────────────────┐   │ │
│ │ │ 1. Writes repetitive or redundant code      [Edit]│   │ │
│ │ │ 2. Misuses inheritance or abstraction       [Edit]│   │ │
│ │ │ 3. Limited understanding of JVM basics      [Edit]│   │ │
│ │ │ 4. Frequent runtime errors and null pointer [Edit]│   │ │
│ │ │    exceptions                                     │   │ │
│ │ │ 5. Relies heavily on others to debug simple [Edit]│   │ │
│ │ │    issues                                         │   │ │
│ │ │ 6. Poor variable naming and code readability [Edit]│   │ │
│ │ └───────────────────────────────────────────────────┘   │ │
│ │ [+ Add Negative Indicator]                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ▶ MIDDLE LEVEL INDICATORS                    [Expand ▼]     │
│ ▶ SENIOR LEVEL INDICATORS                    [Expand ▼]     │
│ ▶ EXPERT LEVEL INDICATORS                    [Expand ▼]     │
│                                                               │
│ Total Indicators: 24 (6 per level × 4 levels)               │
│                                                               │
│                    [Save Changes]  [Cancel]                  │
└─────────────────────────────────────────────────────────────┘
```

**Step 3: Save & Confirm**

```
┌─────────────────────────────────────────────────────────────┐
│ SAVE COMPETENCIES                            Step 3 of 3     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Ready to save? Here's what will happen:                      │
│                                                               │
│ ✓ SAVE TO COMPETENCY LIBRARY                                │
│   All 5 competencies will be saved as INDEPENDENT entities  │
│   in the Competency Library with all 4 levels of indicators │
│                                                               │
│ ✓ LINK TO ROLE                                               │
│   Competencies will be linked to "Junior Java Full Stack    │
│   Developer" role with specified levels and weights          │
│                                                               │
│ ✓ READY FOR REUSE                                            │
│   These competencies can now be used in other roles and      │
│   assessment models                                          │
│                                                               │
│ Summary:                                                     │
│ • 5 Competencies                                             │
│ • 240 Total Indicators (across all levels)                  │
│ • Mapped to: Junior Java Full Stack Developer (Junior)      │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ What would you like to do next?                          │ │
│ │                                                           │ │
│ │ ○ Save and finish                                        │ │
│ │ ● Save and create assessment model                       │ │
│ │ ○ Save and add more competencies                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│              [← Back]                [Save & Continue →]     │
└─────────────────────────────────────────────────────────────┘
```

================================================================================
## PART 3: CREATE ASSESSMENT MODEL FROM ROLE
================================================================================

### FLOW 2: CREATING LEVEL-AWARE ASSESSMENT MODEL

**Trigger**: After saving role, OR from Assessment Models page

**Step 1: Select Source Role**

```
Navigate to: /assessments/admin/models

Click: [+ Create Assessment Model]

┌─────────────────────────────────────────────────────────────┐
│ CREATE ASSESSMENT MODEL                      Step 1 of 4     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Source Configuration                                         │
│                                                               │
│ How would you like to create this assessment model?          │
│                                                               │
│ ○ Based on Role (Recommended)                                │
│   Generate assessment from a role's competencies             │
│                                                               │
│ ○ Custom (Manual Selection)                                  │
│   Manually select competencies and components                │
│                                                               │
│ ────────────────────────────────────────────────────────────│
│                                                               │
│ Select Role: *                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Search roles...]                               [×]   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Available Roles:                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ● Junior Java Full Stack Developer (Junior)             │ │
│ │   5 competencies • Created today                        │ │
│ │                                                          │ │
│ │ ○ Senior Backend Engineer (Senior)                      │ │
│ │   8 competencies • Created 2 days ago                   │ │
│ │                                                          │ │
│ │ ○ Data Analyst (Middle)                                 │ │
│ │   6 competencies • Created 1 week ago                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│              [Cancel]                [Next: Configure Model] │
└─────────────────────────────────────────────────────────────┘
```

**Step 2: Define Target Level (THE CRITICAL STEP)**

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE ASSESSMENT MODEL                      Step 2 of 4     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Selected Role: Junior Java Full Stack Developer              │
│ Role Level: Junior                                           │
│                                                               │
│ Assessment Model Configuration                               │
│                                                               │
│ Model Name: *                                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Junior Java Full Stack Developer Assessment            │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Description:                                                 │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Comprehensive assessment for Junior Java Full Stack   │   │
│ │ Developer position covering technical and behavioral   │   │
│ │ competencies at junior level.                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                               │
│ 🎯 TARGET ASSESSEE LEVEL (CRITICAL) *                       │
│                                                               │
│ What level are you assessing candidates for?                │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ● Assessing FOR Junior Level                            │ │
│ │   (Hiring/evaluating junior candidates)                 │ │
│ │                                                          │ │
│ │   Uses: Junior-level positive & negative indicators     │ │
│ │   Purpose: Evaluate if candidate meets junior standards │ │
│ │                                                          │ │
│ │ ○ Assessing Junior FOR Middle Promotion                 │ │
│ │   (Junior wanting to move to Middle)                    │ │
│ │                                                          │ │
│ │   Uses: Junior negatives + Middle positives             │ │
│ │   Purpose: Identify gaps and readiness for promotion    │ │
│ │                                                          │ │
│ │ ○ Assessing Middle FOR Senior Promotion                 │ │
│ │   (Middle wanting to move to Senior)                    │ │
│ │                                                          │ │
│ │   Uses: Middle negatives + Senior positives             │ │
│ │   Purpose: Evaluate senior-level readiness              │ │
│ │                                                          │ │
│ │ ○ Custom Level Configuration                            │ │
│ │   (Advanced: Specify per competency)                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ 💡 The system will automatically select relevant indicators │
│    based on your choice above                                │
│                                                               │
│ Passing Criteria: [70]% (minimum score to pass)             │
│                                                               │
│              [← Back]              [Next: Review Components] │
└─────────────────────────────────────────────────────────────┘
```

**Step 3: Review Auto-Generated Components**

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE ASSESSMENT MODEL                      Step 3 of 4     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Model: Junior Java Full Stack Developer Assessment           │
│ Target Level: Junior (Assessing FOR Junior Level)            │
│                                                               │
│ Auto-Generated Assessment Components                         │
│                                                               │
│ ℹ️  Based on role competencies and target level, we've      │
│    automatically generated 5 assessment components           │
│                                                               │
│ ▼ COMPONENT 1: Core Java Programming Assessment             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Source: Core Java Programming (Competency)               │ │
│ │ Duration: 30 minutes                                     │ │
│ │ Difficulty: Intermediate                                 │ │
│ │ Weight: 30%                                              │ │
│ │                                                          │ │
│ │ Linked Indicators (Auto-Selected):                      │ │
│ │ ✓ 6 Junior-level POSITIVE indicators                    │ │
│ │ ✗ 6 Junior-level NEGATIVE indicators                    │ │
│ │                                                          │ │
│ │ Questions: 10 (to be generated)                         │ │
│ │ • 5 MCQ based on positive indicators                    │ │
│ │ • 3 Scenario-based on negative indicators               │ │
│ │ • 2 Coding challenges                                   │ │
│ │                                                          │ │
│ │ [View Linked Indicators] [Edit Component] [Remove]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ▼ COMPONENT 2: Spring Boot Framework Assessment             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Duration: 25 minutes | Weight: 25%                       │ │
│ │ Indicators: 12 Junior-level (6 pos + 6 neg)             │ │
│ │ Questions: 8 to be generated                            │ │
│ │ [View Details] [Edit] [Remove]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ▼ COMPONENT 3: Frontend Technologies Assessment             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Duration: 20 minutes | Weight: 20%                       │ │
│ │ [View Details] [Edit] [Remove]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ▶ COMPONENT 4: Database & Persistence Assessment            │
│ ▶ COMPONENT 5: Professional Behavior Assessment             │
│                                                               │
│ Total Duration: 120 minutes                                  │
│ Total Components: 5                                          │
│ Total Questions: 42 (to be generated)                        │
│ Total Indicators Used: 60 (all Junior-level)                │
│                                                               │
│ ☑ Auto-generate questions from indicators                   │
│                                                               │
│     [← Back]  [Generate Questions]  [Save & Finish →]       │
└─────────────────────────────────────────────────────────────┘
```

**Step 3A: View Linked Indicators (Expand)**

```
┌─────────────────────────────────────────────────────────────┐
│ COMPONENT: Core Java Programming Assessment                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Source Competency: Core Java Programming                     │
│ Target Level: Junior                                         │
│ Selection Logic: Assessing FOR Junior Level                  │
│                                                               │
│ LINKED INDICATORS (Auto-Selected from Library)               │
│                                                               │
│ ✓ POSITIVE INDICATORS (6 total)                             │
│ These indicators define what success looks like at Junior    │
│ level and will be used to create assessment questions        │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. ✓ Writes syntactically correct Java code             │ │
│ │    Usage: Assessment Criteria                            │ │
│ │    → Will generate: Coding challenge question            │ │
│ │                                                          │ │
│ │ 2. ✓ Understands OOP basics (class, object,             │ │
│ │       inheritance, polymorphism)                         │ │
│ │    Usage: Assessment Criteria                            │ │
│ │    → Will generate: MCQ question on OOP concepts         │ │
│ │                                                          │ │
│ │ 3. ✓ Uses collections (List, Set, Map) appropriately    │ │
│ │    Usage: Assessment Criteria                            │ │
│ │    → Will generate: Scenario-based question              │ │
│ │                                                          │ │
│ │ 4. ✓ Handles basic exceptions with try-catch            │ │
│ │    Usage: Assessment Criteria + Feedback Element         │ │
│ │    → Will generate: Code completion question             │ │
│ │                                                          │ │
│ │ 5. ✓ Follows basic coding standards                     │ │
│ │    Usage: Assessment Criteria                            │ │
│ │                                                          │ │
│ │ 6. ✓ Writes simple unit tests                           │ │
│ │    Usage: Assessment Criteria                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ✗ NEGATIVE INDICATORS (6 total)                             │
│ These indicators define red flags and will be used for       │
│ scenario-based questions and feedback                        │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. ✗ Writes repetitive or redundant code                │ │
│ │    Usage: Assessment Criteria (reverse scoring)          │ │
│ │    → Will generate: Code review scenario                 │ │
│ │                                                          │ │
│ │ 2. ✗ Misuses inheritance or abstraction                 │ │
│ │    Usage: Assessment Criteria                            │ │
│ │    → Will generate: "What's wrong?" question             │ │
│ │                                                          │ │
│ │ 3. ✗ Limited understanding of JVM basics                │ │
│ │    Usage: Feedback Element                               │ │
│ │                                                          │ │
│ │ 4. ✗ Frequent runtime errors                            │ │
│ │    Usage: Assessment Criteria                            │ │
│ │    → Will generate: Debugging scenario                   │ │
│ │                                                          │ │
│ │ 5. ✗ Relies heavily on others to debug                  │ │
│ │    Usage: Coaching Hint + Feedback                       │ │
│ │                                                          │ │
│ │ 6. ✗ Poor code readability                              │ │
│ │    Usage: Assessment Criteria                            │ │
│ │    → Will generate: Refactoring question                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ 💡 Why these indicators were selected:                      │
│    Target is "Junior" level, so we're using ONLY Junior-    │
│    level indicators (both positive and negative) to assess  │
│    if candidate meets junior standards.                     │
│                                                               │
│                              [Close]                         │
└─────────────────────────────────────────────────────────────┘
```

**Step 4: Generate Questions & Finalize**

```
┌─────────────────────────────────────────────────────────────┐
│ CREATE ASSESSMENT MODEL                      Step 4 of 4     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Generate Questions from Indicators                           │
│                                                               │
│ We'll now generate questions based on the linked indicators │
│ for each assessment component.                               │
│                                                               │
│ Progress:                                                    │
│                                                               │
│ [████████████████████████████████░░░░░░░] 80%               │
│                                                               │
│ ✓ Component 1: Core Java Programming (10 questions)         │
│ ✓ Component 2: Spring Boot Framework (8 questions)          │
│ ✓ Component 3: Frontend Technologies (7 questions)          │
│ ⏳ Component 4: Database & Persistence (0/8 questions)       │
│ ⏳ Component 5: Professional Behavior (0/9 questions)        │
│                                                               │
│ Generating question 34 of 42...                             │
│                                                               │
│ This may take 2-3 minutes. Please wait...                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Step 4B: Success & Review**

```
┌─────────────────────────────────────────────────────────────┐
│ ASSESSMENT MODEL CREATED SUCCESSFULLY! ✓                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Junior Java Full Stack Developer Assessment                  │
│                                                               │
│ Summary:                                                     │
│ • Source Role: Junior Java Full Stack Developer (Junior)    │
│ • Target Level: Junior (Assessing FOR Junior Level)         │
│ • Total Duration: 120 minutes                                │
│ • Components: 5                                              │
│ • Total Questions: 42                                        │
│ • Indicators Used: 60 (all from Junior level)               │
│ • Passing Criteria: 70%                                      │
│                                                               │
│ Component Breakdown:                                         │
│ 1. Core Java Programming (30 min, 10 questions)             │
│ 2. Spring Boot Framework (25 min, 8 questions)              │
│ 3. Frontend Technologies (20 min, 7 questions)              │
│ 4. Database & Persistence (25 min, 8 questions)             │
│ 5. Professional Behavior (20 min, 9 questions)              │
│                                                               │
│ What would you like to do?                                   │
│                                                               │
│ [Preview Assessment]  [Edit Questions]  [Publish Now]        │
│                                                               │
│ [Save as Draft]  [Assign to Users]  [Back to Models]        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

================================================================================
## PART 4: THE SMART INDICATOR SELECTION ALGORITHM
================================================================================

### ALGORITHM: Dynamic Indicator Selection

```typescript
/**
 * THE CORE LOGIC: Select relevant indicators based on assessment context
 */

interface IndicatorSelectionContext {
  role: Role;
  targetLevel: ProficiencyLevel;
  assessmentScenario: 'HIRING' | 'PROMOTION' | 'SKILL_GAP' | 'CUSTOM';
  assesseeCurrentLevel?: ProficiencyLevel;
}

interface SelectedIndicators {
  competencyId: string;
  competencyName: string;
  indicators: {
    positive: CompetencyIndicator[];
    negative: CompetencyIndicator[];
  };
  selectionReason: string;
}

/**
 * Main selection function
 */
function selectRelevantIndicators(
  competency: Competency,
  context: IndicatorSelectionContext
): SelectedIndicators {
  
  let positiveIndicators: CompetencyIndicator[] = [];
  let negativeIndicators: CompetencyIndicator[] = [];
  let selectionReason: string = '';
  
  switch (context.assessmentScenario) {
    
    case 'HIRING':
      // Assessing candidate FOR a specific level
      // Use: ALL indicators (positive + negative) from target level
      
      positiveIndicators = competency.indicators.filter(ind => 
        ind.level === context.targetLevel && 
        ind.type === 'POSITIVE'
      );
      
      negativeIndicators = competency.indicators.filter(ind => 
        ind.level === context.targetLevel && 
        ind.type === 'NEGATIVE'
      );
      
      selectionReason = `Hiring assessment for ${context.targetLevel} level. ` +
        `Using ${context.targetLevel}-level indicators to evaluate if candidate ` +
        `meets the standards for this level.`;
      break;
    
    case 'PROMOTION':
      // Assessing current employee for promotion to next level
      // Use: Current level NEGATIVES (gaps) + Target level POSITIVES (goals)
      
      if (!context.assesseeCurrentLevel) {
        throw new Error('Current level required for promotion assessment');
      }
      
      // Get current level negatives (what's holding them back)
      negativeIndicators = competency.indicators.filter(ind => 
        ind.level === context.assesseeCurrentLevel && 
        ind.type === 'NEGATIVE'
      );
      
      // Get target level positives (what they need to demonstrate)
      positiveIndicators = competency.indicators.filter(ind => 
        ind.level === context.targetLevel && 
        ind.type === 'POSITIVE'
      );
      
      selectionReason = `Promotion assessment from ${context.assesseeCurrentLevel} ` +
        `to ${context.targetLevel}. Using ${context.assesseeCurrentLevel}-level ` +
        `negative indicators to identify gaps, and ${context.targetLevel}-level ` +
        `positive indicators to evaluate readiness.`;
      break;
    
    case 'SKILL_GAP':
      // Comprehensive skill gap analysis
      // Use: Current level NEGATIVES + Target level POSITIVES + NEGATIVES
      
      if (!context.assesseeCurrentLevel) {
        throw new Error('Current level required for skill gap assessment');
      }
      
      // Current level negatives (current weaknesses)
      const currentNegatives = competency.indicators.filter(ind => 
        ind.level === context.assesseeCurrentLevel && 
        ind.type === 'NEGATIVE'
      );
      
      // Target level positives (goals to achieve)
      const targetPositives = competency.indicators.filter(ind => 
        ind.level === context.targetLevel && 
        ind.type === 'POSITIVE'
      );
      
      // Target level negatives (pitfalls to avoid)
      const targetNegatives = competency.indicators.filter(ind => 
        ind.level === context.targetLevel && 
        ind.type === 'NEGATIVE'
      );
      
      positiveIndicators = targetPositives;
      negativeIndicators = [...currentNegatives, ...targetNegatives];
      
      selectionReason = `Skill gap analysis from ${context.assesseeCurrentLevel} ` +
        `to ${context.targetLevel}. Using comprehensive indicator set to identify ` +
        `current weaknesses and target-level requirements.`;
      break;
    
    case 'CUSTOM':
      // Allow custom configuration
      // This would be handled by admin selecting specific levels per competency
      
      const roleCompetency = context.role.competencies.find(
        rc => rc.competencyId === competency.id
      );
      
      if (roleCompetency) {
        positiveIndicators = competency.indicators.filter(ind => 
          ind.level === roleCompetency.requiredLevel && 
          ind.type === 'POSITIVE'
        );
        
        negativeIndicators = competency.indicators.filter(ind => 
          ind.level === roleCompetency.requiredLevel && 
          ind.type === 'NEGATIVE'
        );
      }
      
      selectionReason = `Custom configuration based on role requirements.`;
      break;
  }
  
  return {
    competencyId: competency.id,
    competencyName: competency.name,
    indicators: {
      positive: positiveIndicators.sort((a, b) => a.order - b.order),
      negative: negativeIndicators.sort((a, b) => a.order - b.order)
    },
    selectionReason
  };
}

/**
 * Generate assessment component with selected indicators
 */
async function createAssessmentComponentFromCompetency(
  competency: Competency,
  context: IndicatorSelectionContext,
  roleCompetency: RoleCompetency
): Promise<AssessmentComponent> {
  
  // Step 1: Select relevant indicators
  const selectedIndicators = selectRelevantIndicators(competency, context);
  
  // Step 2: Create assessment component
  const component = await prisma.assessmentComponent.create({
    data: {
      name: `${competency.name} Assessment`,
      slug: generateSlug(`${competency.name} assessment`),
      description: `Assessment for ${competency.name} competency at ${context.targetLevel} level`,
      sourceCompetencyId: competency.id,
      category: competency.category,
      duration: calculateDuration(selectedIndicators),
      difficultyLevel: mapLevelToDifficulty(context.targetLevel),
      isActive: true,
      version: '1.0.0',
      createdBy: context.createdBy
    }
  });
  
  // Step 3: Link indicators to component
  const indicatorLinks = [
    ...selectedIndicators.indicators.positive.map(ind => ({
      componentId: component.id,
      indicatorId: ind.id,
      selectionReason: selectedIndicators.selectionReason,
      usageType: 'ASSESSMENT_CRITERIA' as const
    })),
    ...selectedIndicators.indicators.negative.map(ind => ({
      componentId: component.id,
      indicatorId: ind.id,
      selectionReason: selectedIndicators.selectionReason,
      usageType: 'ASSESSMENT_CRITERIA' as const
    }))
  ];
  
  await prisma.componentIndicatorLink.createMany({
    data: indicatorLinks
  });
  
  // Step 4: Generate questions from indicators
  await generateQuestionsFromIndicators(
    component.id, 
    selectedIndicators.indicators
  );
  
  // Step 5: Create competency-component mapping
  await prisma.competencyComponentMapping.create({
    data: {
      competencyId: competency.id,
      componentId: component.id,
      relevanceScore: 1.0,
      targetLevels: [context.targetLevel]
    }
  });
  
  return component;
}

/**
 * Helper: Calculate component duration based on indicator count
 */
function calculateDuration(selected: SelectedIndicators): number {
  const totalIndicators = 
    selected.indicators.positive.length + 
    selected.indicators.negative.length;
  
  // Approximate 2-3 minutes per indicator
  return Math.ceil(totalIndicators * 2.5);
}

/**
 * Helper: Map proficiency level to difficulty
 */
function mapLevelToDifficulty(level: ProficiencyLevel): DifficultyLevel {
  const mapping = {
    JUNIOR: 'BEGINNER',
    MIDDLE: 'INTERMEDIATE',
    SENIOR: 'ADVANCED',
    EXPERT: 'EXPERT'
  };
  
  return mapping[level] as DifficultyLevel;
}
```

================================================================================
## PART 5: COMPLETE API IMPLEMENTATION
================================================================================

### API 1: Generate Competencies for Role

```typescript
// app/api/assessments/admin/roles/[roleId]/generate-competencies/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { OpenAI } from 'openai';

export async function POST(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const body = await request.json();
    const { 
      numberOfCompetencies = 5, 
      additionalContext = '',
      includeTypes = ['TECHNICAL', 'BEHAVIORAL']
    } = body;
    
    // Get role details
    const role = await prisma.role.findUnique({
      where: { id: params.roleId }
    });
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Construct AI prompt
    const prompt = `Generate ${numberOfCompetencies} competencies for the following role:

Role: ${role.name}
Level: ${role.overallLevel}
Department: ${role.department || 'Not specified'}
Description: ${role.description}
Key Responsibilities: ${role.keyResponsibilities || 'Not specified'}
Additional Context: ${additionalContext}

For EACH competency, provide:
1. Competency name
2. Description
3. Category (${includeTypes.join(', ')})
4. For EACH of the 4 proficiency levels (JUNIOR, MIDDLE, SENIOR, EXPERT):
   - 5-7 POSITIVE behavioral indicators (what success looks like)
   - 5-7 NEGATIVE behavioral indicators (red flags/concerns)

Format positive indicators as observable, measurable behaviors.
Format negative indicators as warning signs or gaps.

Return in JSON format:
{
  "competencies": [
    {
      "name": "string",
      "description": "string",
      "category": "TECHNICAL|BEHAVIORAL|DOMAIN_SPECIFIC",
      "levels": {
        "JUNIOR": {
          "positive": ["indicator1", "indicator2", ...],
          "negative": ["indicator1", "indicator2", ...]
        },
        "MIDDLE": { ... },
        "SENIOR": { ... },
        "EXPERT": { ... }
      }
    }
  ]
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert in competency modeling and organizational psychology. Generate comprehensive, measurable behavioral indicators for professional competencies across all proficiency levels."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });
    
    const generated = JSON.parse(completion.choices[0].message.content);
    
    // Save competencies and indicators to database
    const savedCompetencies = await Promise.all(
      generated.competencies.map(async (comp: any) => {
        
        // Create competency
        const competency = await prisma.competency.create({
          data: {
            name: comp.name,
            description: comp.description,
            category: comp.category,
            industries: role.industry || [],
            createdBy: 'AI_SYSTEM'
          }
        });
        
        // Create indicators for all levels
        const indicatorPromises = [];
        
        for (const level of ['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT']) {
          const levelData = comp.levels[level];
          
          // Create positive indicators
          levelData.positive.forEach((text: string, index: number) => {
            indicatorPromises.push(
              prisma.competencyIndicator.create({
                data: {
                  competencyId: competency.id,
                  level: level as ProficiencyLevel,
                  type: 'POSITIVE',
                  text: text,
                  order: index,
                  weight: 1.0
                }
              })
            );
          });
          
          // Create negative indicators
          levelData.negative.forEach((text: string, index: number) => {
            indicatorPromises.push(
              prisma.competencyIndicator.create({
                data: {
                  competencyId: competency.id,
                  level: level as ProficiencyLevel,
                  type: 'NEGATIVE',
                  text: text,
                  order: index,
                  weight: 1.0
                }
              })
            );
          });
        }
        
        await Promise.all(indicatorPromises);
        
        // Link competency to role
        await prisma.roleCompetency.create({
          data: {
            roleId: params.roleId,
            competencyId: competency.id,
            requiredLevel: role.overallLevel,
            weight: 1.0 / numberOfCompetencies, // Equal weight
            isCritical: comp.category === 'TECHNICAL',
            order: generated.competencies.indexOf(comp)
          }
        });
        
        // Reload with indicators
        return await prisma.competency.findUnique({
          where: { id: competency.id },
          include: {
            indicators: {
              orderBy: [
                { level: 'asc' },
                { type: 'asc' },
                { order: 'asc' }
              ]
            }
          }
        });
      })
    );
    
    return NextResponse.json({
      success: true,
      competencies: savedCompetencies,
      summary: {
        totalCompetencies: savedCompetencies.length,
        totalIndicators: savedCompetencies.reduce(
          (sum, comp) => sum + comp.indicators.length, 
          0
        )
      }
    });
    
  } catch (error) {
    console.error('Generate competencies error:', error);
    return NextResponse.json(
      { error: 'Failed to generate competencies', details: error.message },
      { status: 500 }
    );
  }
}
```

### API 2: Create Assessment Model from Role

```typescript
// app/api/assessments/admin/models/create-from-role/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      roleId,
      targetLevel,
      assessmentScenario = 'HIRING',
      assesseeCurrentLevel,
      modelName,
      modelDescription,
      passingCriteria = 0.7,
      autoGenerateQuestions = true
    } = body;
    
    // Get role with competencies and indicators
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        competencies: {
          include: {
            competency: {
              include: {
                indicators: {
                  orderBy: [
                    { level: 'asc' },
                    { type: 'asc' },
                    { order: 'asc' }
                  ]
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Create assessment model
    const model = await prisma.assessmentModel.create({
      data: {
        name: modelName || `${role.name} Assessment`,
        slug: generateSlug(modelName || `${role.name} assessment`),
        description: modelDescription || `Comprehensive assessment for ${role.name} role`,
        sourceType: 'ROLE_BASED',
        roleId: role.id,
        targetLevel: targetLevel,
        totalDuration: 0, // Will be calculated
        passingCriteria: passingCriteria,
        visibility: 'SYSTEM',
        isActive: true,
        version: '1.0.0',
        createdBy: 'SYSTEM',
        createdByType: 'AI_GENERATED'
      }
    });
    
    // Create assessment components for each competency
    const components = await Promise.all(
      role.competencies.map(async (roleComp, index) => {
        
        const context: IndicatorSelectionContext = {
          role,
          targetLevel: targetLevel as ProficiencyLevel,
          assessmentScenario: assessmentScenario,
          assesseeCurrentLevel: assesseeCurrentLevel as ProficiencyLevel
        };
        
        // Select relevant indicators
        const selected = selectRelevantIndicators(
          roleComp.competency,
          context
        );
        
        // Create component
        const component = await prisma.assessmentComponent.create({
          data: {
            name: `${roleComp.competency.name} Assessment`,
            slug: generateSlug(`${roleComp.competency.name} assessment ${model.id}`),
            description: roleComp.competency.description,
            sourceCompetencyId: roleComp.competency.id,
            category: roleComp.competency.category,
            duration: calculateDuration(selected),
            difficultyLevel: mapLevelToDifficulty(targetLevel as ProficiencyLevel),
            isActive: true,
            version: '1.0.0',
            createdBy: 'SYSTEM'
          }
        });
        
        // Link indicators to component
        const allIndicators = [
          ...selected.indicators.positive,
          ...selected.indicators.negative
        ];
        
        await prisma.componentIndicatorLink.createMany({
          data: allIndicators.map(ind => ({
            componentId: component.id,
            indicatorId: ind.id,
            selectionReason: selected.selectionReason,
            usageType: 'ASSESSMENT_CRITERIA'
          }))
        });
        
        // Create competency-component mapping
        await prisma.competencyComponentMapping.create({
          data: {
            competencyId: roleComp.competency.id,
            componentId: component.id,
            relevanceScore: 1.0,
            targetLevels: [targetLevel]
          }
        });
        
        // Link component to model
        await prisma.assessmentModelComponent.create({
          data: {
            modelId: model.id,
            componentId: component.id,
            order: index,
            weightage: roleComp.weight,
            isRequired: roleComp.isCritical,
            isTimed: true,
            customDuration: null
          }
        });
        
        // Generate questions if requested
        if (autoGenerateQuestions) {
          await generateQuestionsFromIndicators(
            component.id,
            selected.indicators
          );
        }
        
        return {
          ...component,
          linkedIndicatorCount: allIndicators.length,
          selectedIndicators: selected
        };
      })
    );
    
    // Update model with total duration
    const totalDuration = components.reduce((sum, c) => sum + c.duration, 0);
    await prisma.assessmentModel.update({
      where: { id: model.id },
      data: { totalDuration }
    });
    
    return NextResponse.json({
      success: true,
      model: {
        ...model,
        totalDuration
      },
      components: components,
      summary: {
        totalComponents: components.length,
        totalDuration: totalDuration,
        totalIndicators: components.reduce((sum, c) => sum + c.linkedIndicatorCount, 0),
        questionsGenerated: autoGenerateQuestions
      }
    });
    
  } catch (error) {
    console.error('Create assessment model error:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment model', details: error.message },
      { status: 500 }
    );
  }
}
```

================================================================================
## PART 6: KEY BENEFITS & SUMMARY
================================================================================

### SYSTEM ADVANTAGES

✅ **True Modularity**
   - Competencies are completely independent
   - One competency, unlimited uses
   - Easy maintenance and updates

✅ **Level Intelligence**
   - All 4 levels stored once
   - Indicators selected dynamically based on context
   - No duplication of content

✅ **Flexible Assessment Creation**
   - Hiring assessments (specific level)
   - Promotion assessments (gap-focused)
   - Skill gap analysis (comprehensive)
   - Custom configurations

✅ **AI-Powered Efficiency**
   - Generate complete role competencies
   - Auto-create level-wise indicators
   - Generate questions from indicators
   - Save hours of manual work

✅ **Reusability at Scale**
   - Same competency across multiple roles
   - Same indicators in different contexts
   - Build once, use everywhere

✅ **Clear Assessment Purpose**
   - Admin explicitly defines target level
   - System shows only relevant indicators
   - No confusion for assessees
   - Focused evaluation

✅ **Progressive Career Paths**
   - Clear Junior → Middle → Senior → Expert progression
   - Gap identification for growth
   - Promotion readiness assessment

================================================================================
## PART 7: IMPLEMENTATION CHECKLIST
================================================================================

### Phase 1: Database (Week 1)
□ Implement complete schema
□ Add indexes for performance
□ Create migration scripts
□ Seed initial data

### Phase 2: Role Management (Week 2)
□ Create role CRUD UI
□ Implement AI competency generation
□ Build competency review interface
□ Add bulk operations

### Phase 3: Competency Library (Week 2-3)
□ Build competency browser
□ Implement search/filter
□ Create indicator management UI
□ Add manual creation forms

### Phase 4: Assessment Model Creation (Week 3-4)
□ Implement target level selection
□ Build smart indicator selection algorithm
□ Create component auto-generation
□ Add question generation from indicators

### Phase 5: Testing & Refinement (Week 5)
□ Unit tests for indicator selection
□ Integration tests for full flow
□ Performance optimization
□ UI/UX polish

================================================================================
END OF REFINED MODULAR COMPETENCY SYSTEM LOGIC
================================================================================

This system provides complete modularity while maintaining intelligence
in how indicators are selected and used based on assessment context.
