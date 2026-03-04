# CURSOR AI IMPLEMENTATION PROMPT
## Intelligent Assessment Model Builder - Complete Implementation

---

## 🎯 OBJECTIVE

Build an intelligent, guided assessment model builder that:
1. Suggests optimal component types based on competency and level
2. Enables AI-powered question generation for multiple component types
3. Creates a reusable component library
4. Provides iterative, progress-tracked component building
5. Implements smart visibility and publishing controls

---

## 📋 CONTEXT: WHAT ALREADY EXISTS

Based on DOC3_ASSESSMENT_MODULE.md, you have already implemented:

**Database Schema:**
- ✅ `assessment_models` table
- ✅ `assessment_components` table  
- ✅ `component_questions` table
- ✅ `roles` table with competencies
- ✅ `competencies` table with indicators

**API Endpoints:**
- ✅ `/api/assessments/admin/models` (GET, POST, PATCH, DELETE)
- ✅ `/api/assessments/admin/models/[modelId]` (GET, PATCH, DELETE)
- ✅ Basic CRUD operations for models and components

**UI Pages:**
- ✅ `/assessments/admin/models` - Assessment models list
- ✅ `/assessments/admin/roles/[roleId]` - Role detail with competencies
- ✅ `/assessments/admin/competencies` - Competency management

**Current Capabilities:**
- ✅ Create basic assessment models
- ✅ Link roles to models
- ✅ Manage competencies
- ✅ Basic question management

---

## 🚀 WHAT TO BUILD NOW

You need to BUILD ON TOP of the existing implementation to create an intelligent, wizard-like assessment builder.

---

## PHASE 1: DATABASE ENHANCEMENTS

### Task 1.1: Add Component Library Support

**File:** `prisma/schema.prisma`

Add these fields to existing models and create new tables:

```prisma
// Enhance existing assessment_models table
model AssessmentModel {
  // ... existing fields ...
  
  // NEW FIELDS:
  visibility         String   @default("PRIVATE") // PRIVATE | ORGANIZATION | GLOBAL
  publishedToGlobal  Boolean  @default(false)
  globalPublishStatus String?  // PENDING | APPROVED | REJECTED
  globalPublishRequestedBy String?
  globalPublishRequestedAt DateTime?
  globalPublishApprovedBy  String?
  globalPublishApprovedAt  DateTime?
  
  completionPercentage Int @default(0) // 0-100
  
  // Existing relationships maintained
  components         AssessmentComponent[]
}

// Enhance existing assessment_components table
model AssessmentComponent {
  // ... existing fields ...
  
  // NEW FIELDS:
  isFromLibrary      Boolean  @default(false)
  libraryComponentId String?  @db.Uuid
  componentType      String   // MCQ | SITUATIONAL | CODE | ESSAY | VOICE | VIDEO | PANEL
  
  status             String   @default("DRAFT") // DRAFT | IN_PROGRESS | COMPLETE
  completionPercentage Int    @default(0)
  
  estimatedDuration  Int?     // Minutes
  
  // Existing relationships maintained
  questions          ComponentQuestion[]
  
  // NEW: Self-reference for library
  libraryComponent   ComponentLibrary? @relation("ComponentToLibrary", fields: [libraryComponentId], references: [id])
}

// NEW TABLE: Component Library
model ComponentLibrary {
  id                 String   @id @default(uuid()) @db.Uuid
  tenantId           String   @db.Uuid
  createdBy          String   @db.Uuid
  
  name               String
  description        String?  @db.Text
  
  componentType      String   // MCQ | SITUATIONAL | CODE | ESSAY | VOICE | VIDEO | PANEL
  competencyId       String   @db.Uuid
  targetLevel        String   // JUNIOR | MIDDLE | SENIOR | EXPERT
  
  visibility         String   @default("PRIVATE") // PRIVATE | ORGANIZATION | GLOBAL
  
  // Usage tracking
  usageCount         Int      @default(0)
  rating             Decimal? @db.Decimal(3, 2) // Average rating
  
  // Content (stored as JSONB for flexibility)
  questions          Json     // Array of questions
  metadata           Json?    // Additional settings
  
  // Approval for global publishing
  publishedToGlobal  Boolean  @default(false)
  globalPublishApprovedBy String?
  globalPublishApprovedAt DateTime?
  
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  // Relations
  tenant             Tenant   @relation(fields: [tenantId], references: [id])
  creator            User     @relation(fields: [createdBy], references: [id])
  competency         Competency @relation(fields: [competencyId], references: [id])
  
  // Components using this library entry
  usedInComponents   AssessmentComponent[] @relation("ComponentToLibrary")
  
  @@index([tenantId])
  @@index([competencyId])
  @@index([componentType])
  @@index([targetLevel])
  @@index([visibility])
}

// NEW TABLE: Component Suggestions
model ComponentSuggestion {
  id                 String   @id @default(uuid()) @db.Uuid
  
  competencyCategory String   // TECHNICAL | BEHAVIORAL | COMMUNICATION | LEADERSHIP
  targetLevel        String   // JUNIOR | MIDDLE | SENIOR | EXPERT
  
  suggestedType      String   // MCQ | SITUATIONAL | CODE | ESSAY | VOICE | VIDEO
  priority           String   // HIGH | MEDIUM | LOW
  reason             String   // Why this is suggested
  
  createdAt          DateTime @default(now())
  
  @@index([competencyCategory, targetLevel])
}

// NEW TABLE: Global Publish Requests
model GlobalPublishRequest {
  id                 String   @id @default(uuid()) @db.Uuid
  
  entityType         String   // MODEL | COMPONENT
  entityId           String   @db.Uuid
  
  requestedBy        String   @db.Uuid
  requestedAt        DateTime @default(now())
  
  status             String   @default("PENDING") // PENDING | APPROVED | REJECTED
  reviewedBy         String?  @db.Uuid
  reviewedAt         DateTime?
  reviewComments     String?  @db.Text
  
  // Relations
  requester          User     @relation("PublishRequester", fields: [requestedBy], references: [id])
  reviewer           User?    @relation("PublishReviewer", fields: [reviewedBy], references: [id])
  
  @@index([status])
  @@index([entityType, entityId])
}
```

**Action Steps:**
1. Update `prisma/schema.prisma` with above additions
2. Run `npx prisma migrate dev --name add_component_library`
3. Run `npx prisma generate`

---

## PHASE 2: COMPONENT SUGGESTION ENGINE

### Task 2.1: Create Suggestion Algorithm

**File:** `lib/assessment/component-suggester.ts`

```typescript
import { Competency, CompetencyCategory } from '@prisma/client';

interface ComponentSuggestion {
  type: ComponentType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  estimatedQuestions: number;
  estimatedDuration: number; // minutes
}

export enum ComponentType {
  MCQ = 'MCQ',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  SITUATIONAL = 'SITUATIONAL',
  CODE = 'CODE',
  ESSAY = 'ESSAY',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  PANEL = 'PANEL'
}

export class ComponentSuggester {
  /**
   * Generate component suggestions based on competency and level
   */
  static suggestComponents(
    competency: Competency,
    targetLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT'
  ): ComponentSuggestion[] {
    const suggestions: ComponentSuggestion[] = [];
    
    // 1. MCQ - ALWAYS suggested for knowledge verification
    suggestions.push({
      type: ComponentType.MCQ,
      priority: 'HIGH',
      reason: 'Quick knowledge verification and foundational understanding',
      estimatedQuestions: this.getEstimatedQuestionCount('MCQ', targetLevel),
      estimatedDuration: this.getEstimatedDuration('MCQ', targetLevel)
    });
    
    // 2. Competency category-based suggestions
    const category = competency.category as CompetencyCategory;
    
    switch (category) {
      case 'TECHNICAL':
        suggestions.push(
          {
            type: ComponentType.CODE,
            priority: 'HIGH',
            reason: 'Hands-on technical validation - practical coding skills',
            estimatedQuestions: this.getEstimatedQuestionCount('CODE', targetLevel),
            estimatedDuration: this.getEstimatedDuration('CODE', targetLevel)
          },
          {
            type: ComponentType.SITUATIONAL,
            priority: 'MEDIUM',
            reason: 'Technical decision-making and problem-solving scenarios',
            estimatedQuestions: this.getEstimatedQuestionCount('SITUATIONAL', targetLevel),
            estimatedDuration: this.getEstimatedDuration('SITUATIONAL', targetLevel)
          }
        );
        break;
        
      case 'BEHAVIORAL':
      case 'LEADERSHIP':
        suggestions.push(
          {
            type: ComponentType.SITUATIONAL,
            priority: 'HIGH',
            reason: 'Behavioral scenarios and decision-making assessment',
            estimatedQuestions: this.getEstimatedQuestionCount('SITUATIONAL', targetLevel),
            estimatedDuration: this.getEstimatedDuration('SITUATIONAL', targetLevel)
          },
          {
            type: ComponentType.VIDEO,
            priority: targetLevel === 'SENIOR' || targetLevel === 'EXPERT' ? 'HIGH' : 'MEDIUM',
            reason: 'Leadership presence and communication assessment',
            estimatedQuestions: this.getEstimatedQuestionCount('VIDEO', targetLevel),
            estimatedDuration: this.getEstimatedDuration('VIDEO', targetLevel)
          },
          {
            type: ComponentType.PANEL,
            priority: targetLevel === 'SENIOR' || targetLevel === 'EXPERT' ? 'HIGH' : 'LOW',
            reason: 'In-depth evaluation by expert panel',
            estimatedQuestions: 1, // Panel interviews are typically single session
            estimatedDuration: 45
          }
        );
        break;
        
      case 'COMMUNICATION':
        suggestions.push(
          {
            type: ComponentType.ESSAY,
            priority: 'HIGH',
            reason: 'Written communication and articulation skills',
            estimatedQuestions: this.getEstimatedQuestionCount('ESSAY', targetLevel),
            estimatedDuration: this.getEstimatedDuration('ESSAY', targetLevel)
          },
          {
            type: ComponentType.VOICE,
            priority: 'MEDIUM',
            reason: 'Verbal communication and conversational skills',
            estimatedQuestions: this.getEstimatedQuestionCount('VOICE', targetLevel),
            estimatedDuration: this.getEstimatedDuration('VOICE', targetLevel)
          },
          {
            type: ComponentType.VIDEO,
            priority: 'HIGH',
            reason: 'Presentation skills and professional communication',
            estimatedQuestions: this.getEstimatedQuestionCount('VIDEO', targetLevel),
            estimatedDuration: this.getEstimatedDuration('VIDEO', targetLevel)
          }
        );
        break;
        
      default:
        // Generic competency - suggest versatile components
        suggestions.push(
          {
            type: ComponentType.SITUATIONAL,
            priority: 'MEDIUM',
            reason: 'Practical application and judgment assessment',
            estimatedQuestions: this.getEstimatedQuestionCount('SITUATIONAL', targetLevel),
            estimatedDuration: this.getEstimatedDuration('SITUATIONAL', targetLevel)
          },
          {
            type: ComponentType.ESSAY,
            priority: 'MEDIUM',
            reason: 'In-depth understanding and analytical thinking',
            estimatedQuestions: this.getEstimatedQuestionCount('ESSAY', targetLevel),
            estimatedDuration: this.getEstimatedDuration('ESSAY', targetLevel)
          }
        );
    }
    
    // 3. Level-specific additions
    if (targetLevel === 'SENIOR' || targetLevel === 'EXPERT') {
      // For senior levels, add essay if not already present
      if (!suggestions.find(s => s.type === ComponentType.ESSAY)) {
        suggestions.push({
          type: ComponentType.ESSAY,
          priority: 'HIGH',
          reason: 'Strategic thinking and comprehensive analysis for senior roles',
          estimatedQuestions: this.getEstimatedQuestionCount('ESSAY', targetLevel),
          estimatedDuration: this.getEstimatedDuration('ESSAY', targetLevel)
        });
      }
    }
    
    // Sort by priority
    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    return suggestions.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }
  
  private static getEstimatedQuestionCount(
    type: string, 
    level: string
  ): number {
    const baseCount = {
      MCQ: 10,
      MULTIPLE_SELECT: 8,
      SITUATIONAL: 5,
      CODE: 2,
      ESSAY: 2,
      VOICE: 3,
      VIDEO: 2,
      PANEL: 1
    };
    
    // Adjust based on level
    const levelMultiplier = {
      JUNIOR: 0.8,
      MIDDLE: 1.0,
      SENIOR: 1.2,
      EXPERT: 1.5
    };
    
    return Math.round(baseCount[type] * levelMultiplier[level]);
  }
  
  private static getEstimatedDuration(
    type: string,
    level: string
  ): number {
    const baseDuration = {
      MCQ: 15,           // 15 minutes for MCQ
      MULTIPLE_SELECT: 12,
      SITUATIONAL: 20,   // 20 minutes for situational
      CODE: 45,          // 45 minutes for coding
      ESSAY: 30,         // 30 minutes for essays
      VOICE: 15,         // 15 minutes for voice
      VIDEO: 20,         // 20 minutes for video
      PANEL: 45          // 45 minutes for panel
    };
    
    const levelMultiplier = {
      JUNIOR: 0.8,
      MIDDLE: 1.0,
      SENIOR: 1.3,
      EXPERT: 1.5
    };
    
    return Math.round(baseDuration[type] * levelMultiplier[level]);
  }
}
```

### Task 2.2: Seed Suggestion Database (Optional)

**File:** `prisma/seed-suggestions.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedComponentSuggestions() {
  const suggestions = [
    // Technical + Junior
    {
      competencyCategory: 'TECHNICAL',
      targetLevel: 'JUNIOR',
      suggestedType: 'MCQ',
      priority: 'HIGH',
      reason: 'Fundamental knowledge verification'
    },
    {
      competencyCategory: 'TECHNICAL',
      targetLevel: 'JUNIOR',
      suggestedType: 'CODE',
      priority: 'MEDIUM',
      reason: 'Basic coding skill validation'
    },
    // Add more as needed...
  ];
  
  for (const suggestion of suggestions) {
    await prisma.componentSuggestion.create({
      data: suggestion
    });
  }
  
  console.log('✅ Component suggestions seeded');
}

seedComponentSuggestions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## PHASE 3: ASSESSMENT BUILDER WIZARD UI

### Task 3.1: Create Assessment Builder Wizard Component

**File:** `components/assessment/AssessmentBuilderWizard.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ComponentSuggester, ComponentType } from '@/lib/assessment/component-suggester';

interface AssessmentBuilderWizardProps {
  roleId: string;
  roleName: string;
  competencies: Competency[];
  targetLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';
}

interface Competency {
  id: string;
  name: string;
  category: string;
}

interface ComponentSelection {
  competencyId: string;
  suggestedComponents: any[];
  selectedComponents: Set<ComponentType>;
  componentStatus: Map<ComponentType, ComponentBuildStatus>;
}

interface ComponentBuildStatus {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
  progress: number; // 0-100
  componentId?: string;
}

export function AssessmentBuilderWizard({
  roleId,
  roleName,
  competencies,
  targetLevel
}: AssessmentBuilderWizardProps) {
  const router = useRouter();
  const [modelName, setModelName] = useState(`${roleName} - ${targetLevel} Assessment`);
  const [step, setStep] = useState<'OVERVIEW' | 'COMPONENTS' | 'BUILD'>('OVERVIEW');
  
  // Component selections per competency
  const [selections, setSelections] = useState<Map<string, ComponentSelection>>(
    new Map()
  );
  
  // Initialize selections with suggestions
  useEffect(() => {
    const newSelections = new Map<string, ComponentSelection>();
    
    competencies.forEach(comp => {
      const suggestions = ComponentSuggester.suggestComponents(
        comp as any,
        targetLevel
      );
      
      newSelections.set(comp.id, {
        competencyId: comp.id,
        suggestedComponents: suggestions,
        selectedComponents: new Set(),
        componentStatus: new Map()
      });
    });
    
    setSelections(newSelections);
  }, [competencies, targetLevel]);
  
  // Calculate overall progress
  const calculateProgress = (): number => {
    let totalComponents = 0;
    let completedComponents = 0;
    
    selections.forEach(selection => {
      selection.selectedComponents.forEach(componentType => {
        totalComponents++;
        const status = selection.componentStatus.get(componentType);
        if (status?.status === 'COMPLETE') {
          completedComponents++;
        }
      });
    });
    
    return totalComponents > 0 
      ? Math.round((completedComponents / totalComponents) * 100)
      : 0;
  };
  
  // Toggle component selection
  const toggleComponent = (competencyId: string, componentType: ComponentType) => {
    setSelections(prev => {
      const newSelections = new Map(prev);
      const selection = newSelections.get(competencyId);
      
      if (selection) {
        const newSelected = new Set(selection.selectedComponents);
        
        if (newSelected.has(componentType)) {
          newSelected.delete(componentType);
          selection.componentStatus.delete(componentType);
        } else {
          newSelected.add(componentType);
          selection.componentStatus.set(componentType, {
            status: 'NOT_STARTED',
            progress: 0
          });
        }
        
        selection.selectedComponents = newSelected;
        newSelections.set(competencyId, selection);
      }
      
      return newSelections;
    });
  };
  
  // Render overview step
  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Model Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Model Name</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <div className="text-lg font-semibold">{roleName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Level</label>
              <Badge className="text-lg">{targetLevel}</Badge>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Competencies ({competencies.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {competencies.map(comp => (
                <Badge key={comp.id} variant="outline">
                  {comp.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={() => setStep('COMPONENTS')}
            className="w-full"
            size="lg"
          >
            Continue to Component Selection →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render component selection step
  const renderComponentSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Select Assessment Components</h2>
        <Button 
          variant="outline" 
          onClick={() => setStep('OVERVIEW')}
        >
          ← Back
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Competency</th>
                  <th className="text-left p-4 font-semibold">Suggested Components</th>
                  <th className="text-left p-4 font-semibold">Selected Components</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(selections.entries()).map(([compId, selection]) => {
                  const competency = competencies.find(c => c.id === compId);
                  if (!competency) return null;
                  
                  return (
                    <tr key={compId} className="border-b">
                      <td className="p-4">
                        <div className="font-medium">{competency.name}</div>
                        <div className="text-sm text-gray-500">{competency.category}</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {selection.suggestedComponents.map((suggestion, idx) => (
                            <Badge 
                              key={idx}
                              variant={
                                suggestion.priority === 'HIGH' ? 'default' :
                                suggestion.priority === 'MEDIUM' ? 'secondary' :
                                'outline'
                              }
                              className="cursor-pointer hover:opacity-80"
                              onClick={() => toggleComponent(compId, suggestion.type)}
                            >
                              {suggestion.type}
                              <span className="ml-2 text-xs">
                                ({suggestion.estimatedQuestions}Q, {suggestion.estimatedDuration}m)
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {Array.from(selection.selectedComponents).map(type => (
                            <Badge 
                              key={type} 
                              variant="default"
                              className="cursor-pointer"
                              onClick={() => toggleComponent(compId, type)}
                            >
                              ✓ {type}
                            </Badge>
                          ))}
                          {selection.selectedComponents.size === 0 && (
                            <span className="text-sm text-gray-400">
                              Click suggested components to select
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {calculateCompetencyProgress(selection)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Overall Progress</div>
                <div className="text-2xl font-bold">{calculateProgress()}%</div>
              </div>
              <Button 
                onClick={() => setStep('BUILD')}
                size="lg"
                disabled={!hasAnySelection()}
              >
                Start Building Components →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Render component building step
  const renderComponentBuilding = () => (
    <ComponentBuildingView
      selections={selections}
      competencies={competencies}
      targetLevel={targetLevel}
      onBack={() => setStep('COMPONENTS')}
      onComplete={handlePublish}
    />
  );
  
  const calculateCompetencyProgress = (selection: ComponentSelection): number => {
    if (selection.selectedComponents.size === 0) return 0;
    
    let total = 0;
    selection.selectedComponents.forEach(type => {
      const status = selection.componentStatus.get(type);
      total += status?.progress || 0;
    });
    
    return Math.round(total / selection.selectedComponents.size);
  };
  
  const hasAnySelection = (): boolean => {
    return Array.from(selections.values()).some(
      s => s.selectedComponents.size > 0
    );
  };
  
  const handlePublish = async () => {
    // Implementation in next task
    console.log('Publishing assessment model...');
  };
  
  return (
    <div className="container mx-auto py-8">
      {step === 'OVERVIEW' && renderOverview()}
      {step === 'COMPONENTS' && renderComponentSelection()}
      {step === 'BUILD' && renderComponentBuilding()}
    </div>
  );
}

function calculateCompetencyProgress(selection: ComponentSelection): number {
  if (selection.selectedComponents.size === 0) return 0;
  
  let total = 0;
  selection.selectedComponents.forEach(type => {
    const status = selection.componentStatus.get(type);
    if (status?.status === 'COMPLETE') total += 100;
    else if (status?.status === 'IN_PROGRESS') total += status.progress;
  });
  
  return Math.round(total / selection.selectedComponents.size);
}
```

### Task 3.2: Component Building View

**File:** `components/assessment/ComponentBuildingView.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ComponentType } from '@/lib/assessment/component-suggester';

interface ComponentBuildingViewProps {
  selections: Map<string, any>;
  competencies: any[];
  targetLevel: string;
  onBack: () => void;
  onComplete: () => void;
}

export function ComponentBuildingView({
  selections,
  competencies,
  targetLevel,
  onBack,
  onComplete
}: ComponentBuildingViewProps) {
  const [currentBuild, setCurrentBuild] = useState<{
    competencyId: string;
    componentType: ComponentType;
  } | null>(null);
  
  const [buildMethod, setBuildMethod] = useState<
    'AI_GENERATE' | 'MANUAL' | 'USE_EXISTING' | 'BULK_UPLOAD' | null
  >(null);
  
  const startBuilding = (competencyId: string, componentType: ComponentType) => {
    setCurrentBuild({ competencyId, componentType });
    setBuildMethod(null);
  };
  
  const renderBuildDialog = () => {
    if (!currentBuild) return null;
    
    const competency = competencies.find(c => c.id === currentBuild.competencyId);
    
    return (
      <Dialog open={true} onOpenChange={() => setCurrentBuild(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Build {currentBuild.componentType} Component
            </DialogTitle>
            <div className="text-sm text-gray-600">
              Competency: {competency?.name} ({targetLevel} Level)
            </div>
          </DialogHeader>
          
          {!buildMethod ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose how you want to create this component:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:border-blue-500 transition"
                  onClick={() => setBuildMethod('AI_GENERATE')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">🤖</div>
                    <div className="font-semibold">AI Generate</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Let AI create questions based on competency indicators
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:border-blue-500 transition"
                  onClick={() => setBuildMethod('MANUAL')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">✏️</div>
                    <div className="font-semibold">Manual Entry</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Create questions one by one manually
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:border-blue-500 transition"
                  onClick={() => setBuildMethod('USE_EXISTING')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">📚</div>
                    <div className="font-semibold">Use Existing</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Select from component library
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:border-blue-500 transition"
                  onClick={() => setBuildMethod('BULK_UPLOAD')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">📤</div>
                    <div className="font-semibold">Bulk Upload</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Upload questions via CSV/Excel
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            renderBuildMethodContent()
          )}
        </DialogContent>
      </Dialog>
    );
  };
  
  const renderBuildMethodContent = () => {
    switch (buildMethod) {
      case 'AI_GENERATE':
        return <AIGenerationInterface {...currentBuild!} />;
      case 'MANUAL':
        return <ManualEntryInterface {...currentBuild!} />;
      case 'USE_EXISTING':
        return <LibraryBrowserInterface {...currentBuild!} />;
      case 'BULK_UPLOAD':
        return <BulkUploadInterface {...currentBuild!} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Build Components</h2>
        <Button variant="outline" onClick={onBack}>
          ← Back to Selection
        </Button>
      </div>
      
      {/* Component building table */}
      <Card>
        <CardContent className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Competency</th>
                <th className="text-left p-4">Component Type</th>
                <th className="text-left p-4">Build Action</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(selections.entries()).map(([compId, selection]) => {
                const competency = competencies.find(c => c.id === compId);
                if (!competency || selection.selectedComponents.size === 0) return null;
                
                return Array.from(selection.selectedComponents).map((type: ComponentType) => {
                  const status = selection.componentStatus.get(type);
                  
                  return (
                    <tr key={`${compId}-${type}`} className="border-b">
                      <td className="p-4">{competency.name}</td>
                      <td className="p-4">
                        <Badge>{type}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startBuilding(compId, type)}
                          >
                            {status?.status === 'COMPLETE' ? 'View/Edit' : 'Build'}
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        {status?.status === 'COMPLETE' ? (
                          <Badge variant="default">✓ Complete</Badge>
                        ) : status?.status === 'IN_PROGRESS' ? (
                          <Badge variant="secondary">{status.progress}%</Badge>
                        ) : (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      {renderBuildDialog()}
    </div>
  );
}

// Placeholder components for different build methods
function AIGenerationInterface(props: any) {
  return <div>AI Generation Interface - To be implemented in Phase 4</div>;
}

function ManualEntryInterface(props: any) {
  return <div>Manual Entry Interface - To be implemented in Phase 4</div>;
}

function LibraryBrowserInterface(props: any) {
  return <div>Library Browser Interface - To be implemented in Phase 5</div>;
}

function BulkUploadInterface(props: any) {
  return <div>Bulk Upload Interface - To be implemented in Phase 4</div>;
}
```

---

## PHASE 4: AI QUESTION GENERATION

### Task 4.1: Create AI Generation Service

**File:** `lib/assessment/ai-generator.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface GenerationRequest {
  competencyName: string;
  competencyDescription?: string;
  targetLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';
  indicators: string[]; // From smart indicator selection
  componentType: 'MCQ' | 'SITUATIONAL' | 'ESSAY';
  questionCount: number;
}

interface GeneratedQuestion {
  question: string;
  type: string;
  options?: { text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  explanation: string;
  linkedIndicators: string[];
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export class AIQuestionGenerator {
  /**
   * Generate MCQ questions using GPT-4
   */
  static async generateMCQQuestions(
    request: GenerationRequest
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildMCQPrompt(request);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert assessment designer creating high-quality multiple-choice questions for competency-based assessments. Generate questions that accurately measure the specified indicators at the target proficiency level.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return response.questions || [];
  }
  
  /**
   * Generate situational questions using GPT-4
   */
  static async generateSituationalQuestions(
    request: GenerationRequest
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildSituationalPrompt(request);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in situational judgment tests and behavioral assessments. Create realistic workplace scenarios that assess decision-making and problem-solving aligned with specific competency indicators.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });
    
    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return response.questions || [];
  }
  
  /**
   * Generate essay prompts using GPT-4
   */
  static async generateEssayPrompts(
    request: GenerationRequest
  ): Promise<GeneratedQuestion[]> {
    const prompt = this.buildEssayPrompt(request);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in creating essay questions that assess deep understanding and analytical thinking. Create prompts that require candidates to demonstrate comprehensive knowledge and critical thinking aligned with competency indicators.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return response.questions || [];
  }
  
  private static buildMCQPrompt(request: GenerationRequest): string {
    const levelDescriptions = {
      JUNIOR: 'entry-level proficiency, foundational knowledge',
      MIDDLE: 'intermediate proficiency, practical application',
      SENIOR: 'advanced proficiency, strategic thinking',
      EXPERT: 'expert-level proficiency, thought leadership'
    };
    
    return `
Generate ${request.questionCount} multiple-choice questions to assess the following:

Competency: ${request.competencyName}
${request.competencyDescription ? `Description: ${request.competencyDescription}` : ''}
Target Level: ${request.targetLevel} (${levelDescriptions[request.targetLevel]})

Indicators to assess:
${request.indicators.map((ind, i) => `${i + 1}. ${ind}`).join('\n')}

Requirements:
- Each question must have 4 options (A, B, C, D)
- Only ONE correct answer per question
- Questions must be relevant to the ${request.targetLevel} level
- Difficulty distribution: 40% Easy, 40% Medium, 20% Hard
- Each question should test specific indicator(s)
- Provide clear explanations for correct answers
- Assign points based on difficulty (Easy: 1pt, Medium: 2pts, Hard: 3pts)

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here...",
      "type": "MCQ",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ],
      "explanation": "Explanation why B is correct...",
      "linkedIndicators": ["indicator text"],
      "points": 2,
      "difficulty": "MEDIUM"
    }
  ]
}
`;
  }
  
  private static buildSituationalPrompt(request: GenerationRequest): string {
    return `
Generate ${request.questionCount} situational judgment questions to assess the following:

Competency: ${request.competencyName}
Target Level: ${request.targetLevel}

Indicators to assess:
${request.indicators.map((ind, i) => `${i + 1}. ${ind}`).join('\n')}

Requirements:
- Create realistic workplace scenarios
- Each scenario should have a clear situation and decision point
- Provide 4 action options ranked by effectiveness (1-5 scale)
- Include reasoning for each option's effectiveness
- Scenarios must be relevant to ${request.targetLevel} level responsibilities
- Test judgment, decision-making, and problem-solving

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "What would you do first in this situation?",
      "scenario": "Detailed scenario description...",
      "type": "SITUATIONAL",
      "options": [
        { 
          "text": "Action option A", 
          "effectiveness": 5,
          "reasoning": "Why this is most effective..."
        },
        { 
          "text": "Action option B", 
          "effectiveness": 3,
          "reasoning": "Why this is moderately effective..."
        },
        { 
          "text": "Action option C", 
          "effectiveness": 2,
          "reasoning": "Why this is less effective..."
        },
        { 
          "text": "Action option D", 
          "effectiveness": 1,
          "reasoning": "Why this is least effective..."
        }
      ],
      "explanation": "Overall guidance...",
      "linkedIndicators": ["indicator text"],
      "points": 5,
      "difficulty": "MEDIUM"
    }
  ]
}
`;
  }
  
  private static buildEssayPrompt(request: GenerationRequest): string {
    return `
Generate ${request.questionCount} essay prompts to assess the following:

Competency: ${request.competencyName}
Target Level: ${request.targetLevel}

Indicators to assess:
${request.indicators.map((ind, i) => `${i + 1}. ${ind}`).join('\n')}

Requirements:
- Create thought-provoking essay questions
- Questions should require comprehensive analysis
- Appropriate complexity for ${request.targetLevel} level
- Include key points that should be covered
- Word count guidance (min/max)
- Evaluation rubric criteria

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "Essay question prompt...",
      "type": "ESSAY",
      "guidancePrompt": "Additional guidance for candidate...",
      "expectedKeyPoints": [
        "Key point 1 that should be covered",
        "Key point 2 that should be covered"
      ],
      "wordLimit": {
        "min": 300,
        "max": 500
      },
      "rubricCriteria": [
        {
          "name": "Content Quality",
          "description": "Depth and accuracy of ideas",
          "maxPoints": 40
        },
        {
          "name": "Structure",
          "description": "Logical organization",
          "maxPoints": 30
        },
        {
          "name": "Critical Thinking",
          "description": "Analysis and reasoning",
          "maxPoints": 30
        }
      ],
      "explanation": "What makes a strong response...",
      "linkedIndicators": ["indicator text"],
      "points": 10,
      "difficulty": "HARD"
    }
  ]
}
`;
  }
}
```

### Task 4.2: Create AI Generation API Endpoint

**File:** `app/api/assessments/admin/components/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { AIQuestionGenerator } from '@/lib/assessment/ai-generator';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const {
      competencyId,
      targetLevel,
      componentType,
      questionCount
    } = body;
    
    // Fetch competency with indicators
    const competency = await prisma.competency.findUnique({
      where: { id: competencyId },
      include: {
        indicators: {
          where: {
            level: targetLevel
          }
        }
      }
    });
    
    if (!competency) {
      return NextResponse.json(
        { error: 'Competency not found' },
        { status: 404 }
      );
    }
    
    // Prepare generation request
    const generationRequest = {
      competencyName: competency.name,
      competencyDescription: competency.description,
      targetLevel,
      indicators: competency.indicators.map(ind => ind.text),
      componentType,
      questionCount: questionCount || 10
    };
    
    // Generate questions based on type
    let questions;
    switch (componentType) {
      case 'MCQ':
        questions = await AIQuestionGenerator.generateMCQQuestions(generationRequest);
        break;
      case 'SITUATIONAL':
        questions = await AIQuestionGenerator.generateSituationalQuestions(generationRequest);
        break;
      case 'ESSAY':
        questions = await AIQuestionGenerator.generateEssayPrompts(generationRequest);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported component type for AI generation' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        competencyName: competency.name,
        targetLevel,
        componentType,
        generatedCount: questions.length
      }
    });
    
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
```

---

## PHASE 5: COMPONENT LIBRARY

### Task 5.1: Component Library API

**File:** `app/api/assessments/library/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Browse component library
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const competencyId = searchParams.get('competencyId');
    const componentType = searchParams.get('componentType');
    const targetLevel = searchParams.get('targetLevel');
    const visibility = searchParams.get('visibility');
    
    // Build where clause
    const where: any = {
      OR: [
        { visibility: 'GLOBAL', publishedToGlobal: true },
        { visibility: 'ORGANIZATION', tenantId: user.tenantId },
        { visibility: 'PRIVATE', createdBy: user.id }
      ]
    };
    
    if (competencyId) where.competencyId = competencyId;
    if (componentType) where.componentType = componentType;
    if (targetLevel) where.targetLevel = targetLevel;
    
    const components = await prisma.componentLibrary.findMany({
      where,
      include: {
        competency: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json({ components });
    
  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library' },
      { status: 500 }
    );
  }
}

// POST - Save component to library
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const {
      name,
      description,
      componentType,
      competencyId,
      targetLevel,
      visibility,
      questions
    } = body;
    
    const libraryComponent = await prisma.componentLibrary.create({
      data: {
        tenantId: user.tenantId,
        createdBy: user.id,
        name,
        description,
        componentType,
        competencyId,
        targetLevel,
        visibility: visibility || 'PRIVATE',
        questions,
        metadata: {}
      }
    });
    
    return NextResponse.json({
      success: true,
      component: libraryComponent
    });
    
  } catch (error) {
    console.error('Library save error:', error);
    return NextResponse.json(
      { error: 'Failed to save to library' },
      { status: 500 }
    );
  }
}
```

### Task 5.2: Library Browser Component

**File:** `components/assessment/LibraryBrowser.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface LibraryBrowserProps {
  competencyId?: string;
  componentType?: string;
  targetLevel?: string;
  onSelect: (component: any) => void;
}

export function LibraryBrowser({
  competencyId,
  componentType,
  targetLevel,
  onSelect
}: LibraryBrowserProps) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    competencyId: competencyId || '',
    componentType: componentType || '',
    targetLevel: targetLevel || '',
    search: ''
  });
  
  useEffect(() => {
    fetchComponents();
  }, [filters]);
  
  const fetchComponents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.competencyId) params.set('competencyId', filters.competencyId);
      if (filters.componentType) params.set('componentType', filters.componentType);
      if (filters.targetLevel) params.set('targetLevel', filters.targetLevel);
      
      const response = await fetch(`/api/assessments/library?${params}`);
      const data = await response.json();
      setComponents(data.components || []);
    } catch (error) {
      console.error('Failed to fetch components:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredComponents = components.filter((comp: any) =>
    comp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    comp.description?.toLowerCase().includes(filters.search.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="space-y-3">
        <Input
          placeholder="Search components..."
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
        />
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border rounded-md"
            value={filters.targetLevel}
            onChange={(e) => setFilters(f => ({ ...f, targetLevel: e.target.value }))}
          >
            <option value="">All Levels</option>
            <option value="JUNIOR">Junior</option>
            <option value="MIDDLE">Middle</option>
            <option value="SENIOR">Senior</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
      </div>
      
      {/* Results */}
      {loading ? (
        <div className="text-center py-8">Loading components...</div>
      ) : filteredComponents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No components found. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComponents.map((component: any) => (
            <Card key={component.id} className="hover:shadow-md transition">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{component.name}</h4>
                      <Badge variant="outline">{component.componentType}</Badge>
                      <Badge>{component.targetLevel}</Badge>
                    </div>
                    
                    {component.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {component.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By: {component.creator.name}</span>
                      <span>•</span>
                      <span>{component.questions.length} questions</span>
                      <span>•</span>
                      <span>Used {component.usageCount} times</span>
                      {component.visibility === 'GLOBAL' && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary">Global</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Preview */}}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSelect(component)}
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 6: PUBLISHING & VISIBILITY

### Task 6.1: Publishing API

**File:** `app/api/assessments/admin/models/[modelId]/publish/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { visibility } = body; // PRIVATE | ORGANIZATION | GLOBAL
    
    // Fetch model
    const model = await prisma.assessmentModel.findUnique({
      where: { id: params.modelId }
    });
    
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    
    // Check completion
    if (model.completionPercentage < 100) {
      return NextResponse.json(
        { error: 'Cannot publish incomplete model' },
        { status: 400 }
      );
    }
    
    // Handle global publishing
    if (visibility === 'GLOBAL') {
      if (user.role !== 'SUPER_ADMIN') {
        // Create publish request
        await prisma.globalPublishRequest.create({
          data: {
            entityType: 'MODEL',
            entityId: model.id,
            requestedBy: user.id,
            status: 'PENDING'
          }
        });
        
        // Update model status
        await prisma.assessmentModel.update({
          where: { id: model.id },
          data: {
            globalPublishStatus: 'PENDING',
            globalPublishRequestedBy: user.id,
            globalPublishRequestedAt: new Date()
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Global publish request submitted for approval'
        });
      } else {
        // Super admin can publish directly
        await prisma.assessmentModel.update({
          where: { id: model.id },
          data: {
            visibility: 'GLOBAL',
            publishedToGlobal: true,
            globalPublishApprovedBy: user.id,
            globalPublishApprovedAt: new Date(),
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Model published globally'
        });
      }
    }
    
    // Standard publishing (PRIVATE or ORGANIZATION)
    await prisma.assessmentModel.update({
      where: { id: model.id },
      data: {
        visibility,
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Model published with ${visibility.toLowerCase()} visibility`
    });
    
  } catch (error) {
    console.error('Publishing error:', error);
    return NextResponse.json(
      { error: 'Failed to publish model' },
      { status: 500 }
    );
  }
}
```

---

## PHASE 7: INTEGRATION & PAGES

### Task 7.1: Update Assessment Model Creation Page

**File:** `app/assessments/admin/models/create/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RoleSelector } from '@/components/assessment/RoleSelector';

export default async function CreateAssessmentModelPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Fetch available roles for this tenant
  const roles = await prisma.role.findMany({
    where: {
      tenantId: user.tenantId,
      deletedAt: null
    },
    include: {
      roleCompetencies: {
        include: {
          competency: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create Assessment Model</h1>
        <p className="text-gray-600 mb-8">
          Build a comprehensive assessment based on role and competencies
        </p>
        
        <RoleSelector roles={roles} />
      </div>
    </div>
  );
}
```

### Task 7.2: Role Selector Component

**File:** `components/assessment/RoleSelector.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoleSelectorProps {
  roles: any[];
}

export function RoleSelector({ roles }: RoleSelectorProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [targetLevel, setTargetLevel] = useState<string>('');
  
  const handleContinue = () => {
    if (selectedRole && targetLevel) {
      // Navigate to assessment builder wizard
      router.push(
        `/assessments/admin/models/build?roleId=${selectedRole.id}&level=${targetLevel}`
      );
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Role selection */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Select Role</h2>
          
          <div className="grid gap-3">
            {roles.map(role => (
              <div
                key={role.id}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition
                  ${selectedRole?.id === role.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {role.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {role.roleCompetencies.slice(0, 3).map((rc: any) => (
                        <Badge key={rc.id} variant="outline">
                          {rc.competency.name}
                        </Badge>
                      ))}
                      {role.roleCompetencies.length > 3 && (
                        <Badge variant="outline">
                          +{role.roleCompetencies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {selectedRole?.id === role.id && (
                    <div className="text-blue-500">✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedRole && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                Selected: <strong>{selectedRole.name}</strong>
              </div>
              <Button
                size="sm"
                variant="link"
                onClick={() => router.push(`/assessments/admin/roles/${selectedRole.id}`)}
                className="text-blue-600 p-0 h-auto"
              >
                View/Edit Competencies →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Level selection */}
      {selectedRole && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Step 2: Select Target Level</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'].map(level => (
                <div
                  key={level}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition text-center
                    ${targetLevel === level 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setTargetLevel(level)}
                >
                  <div className="font-semibold">{level}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Continue button */}
      {selectedRole && targetLevel && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleContinue}
          >
            Continue to Component Selection →
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Task 7.3: Assessment Builder Page

**File:** `app/assessments/admin/models/build/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AssessmentBuilderWizard } from '@/components/assessment/AssessmentBuilderWizard';

export default async function AssessmentBuilderPage({
  searchParams
}: {
  searchParams: { roleId: string; level: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { roleId, level } = searchParams;
  
  if (!roleId || !level) {
    redirect('/assessments/admin/models/create');
  }
  
  // Fetch role with competencies
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      roleCompetencies: {
        include: {
          competency: {
            include: {
              indicators: {
                where: {
                  level: level as any
                }
              }
            }
          }
        }
      }
    }
  });
  
  if (!role) {
    redirect('/assessments/admin/models/create');
  }
  
  const competencies = role.roleCompetencies.map(rc => rc.competency);
  
  return (
    <AssessmentBuilderWizard
      roleId={role.id}
      roleName={role.name}
      competencies={competencies}
      targetLevel={level as any}
    />
  );
}
```

---

## 🎯 TESTING CHECKLIST

After implementation, test the following workflow:

### Test Case 1: Basic Assessment Creation
1. Navigate to `/assessments/admin/models/create`
2. Select a role (e.g., "Project Manager - IT")
3. Select target level (e.g., "MIDDLE")
4. Verify component suggestions appear for each competency
5. Select components (e.g., MCQ + Situational for Leadership)
6. Click "Build" for each selected component
7. Choose "AI Generate"
8. Verify questions are generated
9. Accept/modify questions
10. Save to component library
11. Complete all components
12. Publish with "Organization" visibility
13. Verify model appears in models list

### Test Case 2: Component Library Usage
1. Create second assessment for same role
2. When building components, choose "Use Existing"
3. Verify library browser shows previously created components
4. Select and use a component
5. Verify it's added to the new assessment

### Test Case 3: Global Publishing
1. Create complete assessment
2. Request global publishing
3. Verify request appears in Super Admin approval queue
4. Login as Super Admin
5. Approve global publishing request
6. Verify model now visible to all tenants

---

## 🚀 NEXT STEPS AFTER BASIC IMPLEMENTATION

Once the above is working, you can enhance with:

1. **Manual Question Entry Interface** - Full form for creating questions manually
2. **Bulk Upload** - CSV/Excel import for questions
3. **Code Testing Integration** - HackerRank/Codility API
4. **Voice Interview** - AI-powered voice assessment
5. **Video Interview** - Video recording and analysis
6. **Panel Interview** - Scheduling and evaluation interface

---

## 📝 IMPLEMENTATION ORDER

Execute in this exact order:

1. **Phase 1** - Database (1 hour)
2. **Phase 2** - Suggestion Engine (2 hours)
3. **Phase 3** - UI Wizard (4 hours)
4. **Phase 4** - AI Generation (3 hours)
5. **Phase 5** - Component Library (3 hours)
6. **Phase 6** - Publishing (2 hours)
7. **Phase 7** - Pages Integration (2 hours)

**Total Estimated Time: 17-20 hours**

---

## ⚠️ IMPORTANT NOTES

1. **Preserve Existing Code**: Do NOT delete or break existing assessment functionality
2. **Incremental Development**: Test each phase before moving to next
3. **Error Handling**: Add try-catch blocks and user-friendly error messages
4. **Loading States**: Show spinners during AI generation and data fetching
5. **Environment Variables**: Add `OPENAI_API_KEY` to `.env`
6. **Type Safety**: Ensure TypeScript types are correct throughout

---

**START IMPLEMENTATION NOW**

Begin with Phase 1 (Database) and proceed sequentially through all phases.
