# ADAPTIVE AI COMPONENT - COMPREHENSIVE IMPLEMENTATION GUIDE
## Runtime AI Question Generation as Assessment Component Type

---

## ✅ **CONFIRMED REQUIREMENTS**

Based on your answers:

1. ✅ **Per-Component Adaptive** - Adaptive AI is a selectable component type
2. ✅ **Admin-Chosen Question Types** - Admin selects allowed types (MCQ, Situational, etc.)
3. ✅ **Mixed Components Allowed** - Same competency can have static + adaptive
4. ✅ **Save to Component Library** - Adaptive configs are reusable
5. ✅ **Linear Conversion Scoring** - 7.5/10 ability = 75/100 points
6. ✅ **Hidden from Candidate** - Looks like regular assessment
7. ✅ **Backend: Next.js API Routes** - Faster rendering, simpler deployment

---

## 🎯 **WHAT WE'RE BUILDING**

### **Adaptive AI as Component Type**

**Component Types Available:**
```
Assessment Model Builder > Component Selection
├── MCQ (Multiple Choice) ← Existing
├── Situational Judgment ← Existing
├── Essay / Short Answer ← Existing
├── Code Testing ← Existing
├── Voice Interview ← Existing
├── Video Interview ← Existing
├── Panel Interview ← Existing
└── Adaptive AI ← NEW COMPONENT TYPE
```

### **Example Assessment Model:**

```
Assessment: "Senior Project Manager Evaluation"
Role: Project Manager - IT
Target Level: Senior

Competency 1: Leadership (30% weight)
├── Component: MCQ (10 static questions) - 50% of competency
└── Component: Adaptive AI (8-15 runtime questions) - 50% of competency
    ├── Allowed Types: MCQ, Situational
    ├── Min Questions: 8
    ├── Max Questions: 15
    ├── Starting Difficulty: Medium (5/10)
    └── Adaptation: Enabled

Competency 2: Communication (25% weight)
├── Component: Essay (2 prompts) - 40% of competency
└── Component: Adaptive AI (6-12 runtime questions) - 60% of competency
    ├── Allowed Types: MCQ only
    ├── Min Questions: 6
    ├── Max Questions: 12
    └── Starting Difficulty: Medium (5/10)

Competency 3: Technical Skills (25% weight)
└── Component: Adaptive AI (10-15 runtime questions) - 100% of competency
    ├── Allowed Types: MCQ, Code snippets
    ├── Min Questions: 10
    ├── Max Questions: 15
    └── Starting Difficulty: Hard (7/10)

Competency 4: Problem Solving (20% weight)
├── Component: Situational (5 static scenarios) - 100% of competency
└── (No adaptive component)
```

---

## 📊 **ARCHITECTURE DECISION: NEXT.JS API ROUTES**

### **Why Next.js Instead of Python:**

**Speed & Performance:**
- ✅ No extra network hop (same server)
- ✅ Faster response time (direct database access)
- ✅ Better real-time experience for adaptive flow
- ✅ Simpler deployment (one application)

**Trade-offs:**
- ❌ GPT-4 calls from Next.js (acceptable - OpenAI SDK works well)
- ❌ Less ML tooling than Python (not needed for this feature)

**Decision:** Use Next.js API Routes for Adaptive AI, reserve Python for:
- Voice Interview (Whisper, TTS)
- Video Interview (OpenCV, MediaPipe)
- Code Testing (execution, sandboxing)

---

## 🗄️ **DATABASE SCHEMA**

### **Schema Additions:**

```sql
-- Add adaptive flag to existing assessment_components table
ALTER TABLE assessment_components
ADD COLUMN is_adaptive BOOLEAN DEFAULT false,
ADD COLUMN adaptive_config JSONB,
ADD COLUMN adaptive_library_id UUID REFERENCES adaptive_component_library(id);

-- When is_adaptive = true, adaptive_config contains:
{
  "min_questions": 8,
  "max_questions": 15,
  "starting_difficulty": 5.0,
  "allowed_question_types": ["MCQ", "SITUATIONAL"],
  "difficulty_adaptation_enabled": true,
  "context_aware_followups": true,
  "stopping_criteria": "HIGH_CONFIDENCE"
}

-- New table: Adaptive Component Library (reusable configs)
CREATE TABLE adaptive_component_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_by UUID NOT NULL REFERENCES users(id),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  competency_id UUID NOT NULL REFERENCES competencies(id),
  target_level VARCHAR(20) NOT NULL, -- JUNIOR | MIDDLE | SENIOR | EXPERT
  
  -- Configuration
  config JSONB NOT NULL,
  -- {
  --   "min_questions": 8,
  --   "max_questions": 15,
  --   "starting_difficulty": 5.0,
  --   "allowed_question_types": ["MCQ", "SITUATIONAL"],
  --   ...
  -- }
  
  -- Library metadata
  visibility VARCHAR(20) DEFAULT 'PRIVATE', -- PRIVATE | ORGANIZATION | GLOBAL
  usage_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_level CHECK (target_level IN ('JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT')),
  CONSTRAINT valid_visibility CHECK (visibility IN ('PRIVATE', 'ORGANIZATION', 'GLOBAL'))
);

CREATE INDEX idx_adaptive_library_competency ON adaptive_component_library(competency_id);
CREATE INDEX idx_adaptive_library_tenant ON adaptive_component_library(tenant_id);
CREATE INDEX idx_adaptive_library_visibility ON adaptive_component_library(visibility);

-- Adaptive Assessment Runtime Session
CREATE TABLE adaptive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  assessment_submission_id UUID NOT NULL REFERENCES assessment_submissions(id),
  component_id UUID NOT NULL REFERENCES assessment_components(id),
  member_id UUID NOT NULL REFERENCES members(id),
  competency_id UUID NOT NULL REFERENCES competencies(id),
  
  -- Adaptive state
  current_ability DECIMAL(4,2) NOT NULL, -- 1.00 to 10.00
  initial_ability DECIMAL(4,2) NOT NULL,
  target_level VARCHAR(20) NOT NULL,
  
  -- Session tracking
  questions_asked INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS',
  
  -- Configuration snapshot (from component config)
  config JSONB NOT NULL,
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Final results
  final_score DECIMAL(5,2), -- 0-100
  ability_estimate DECIMAL(4,2), -- Final ability 1-10
  
  CONSTRAINT valid_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED'))
);

CREATE INDEX idx_adaptive_sessions_submission ON adaptive_sessions(assessment_submission_id);
CREATE INDEX idx_adaptive_sessions_member ON adaptive_sessions(member_id);
CREATE INDEX idx_adaptive_sessions_status ON adaptive_sessions(status);

-- Runtime Generated Questions
CREATE TABLE adaptive_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES adaptive_sessions(id),
  
  -- Question content (generated by AI)
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- MCQ | SITUATIONAL | etc.
  options JSONB, -- For MCQ: [{key: 'A', text: '...', isCorrect: bool}]
  correct_answer TEXT,
  explanation TEXT,
  
  -- Adaptive metadata
  difficulty DECIMAL(4,2) NOT NULL, -- 1.00 to 10.00
  sequence_number INT NOT NULL, -- 1, 2, 3...
  
  -- Generation context (for debugging/audit)
  generation_prompt TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  
  -- Candidate response
  candidate_answer TEXT,
  is_correct BOOLEAN,
  time_taken_seconds INT,
  answered_at TIMESTAMP,
  
  -- Score (weighted by difficulty)
  points_awarded DECIMAL(5,2),
  max_points DECIMAL(5,2)
);

CREATE INDEX idx_adaptive_questions_session ON adaptive_questions(session_id);
CREATE INDEX idx_adaptive_questions_sequence ON adaptive_questions(session_id, sequence_number);
```

---

## 🔧 **PHASE 1: COMPONENT SUGGESTER UPDATE**

### **File:** `lib/assessment/component-suggester.ts`

**Add Adaptive AI to Suggestions:**

```typescript
import { Competency, CompetencyCategory } from '@prisma/client';

interface ComponentSuggestion {
  type: ComponentType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  estimatedQuestions: number;
  estimatedDuration: number;
}

export enum ComponentType {
  MCQ = 'MCQ',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  SITUATIONAL = 'SITUATIONAL',
  CODE = 'CODE',
  ESSAY = 'ESSAY',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  PANEL = 'PANEL',
  ADAPTIVE_AI = 'ADAPTIVE_AI' // NEW
}

export class ComponentSuggester {
  static suggestComponents(
    competency: Competency,
    targetLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT'
  ): ComponentSuggestion[] {
    const suggestions: ComponentSuggestion[] = [];
    
    // 1. ALWAYS suggest MCQ
    suggestions.push({
      type: ComponentType.MCQ,
      priority: 'HIGH',
      reason: 'Quick knowledge verification',
      estimatedQuestions: this.getEstimatedQuestionCount('MCQ', targetLevel),
      estimatedDuration: this.getEstimatedDuration('MCQ', targetLevel)
    });
    
    // 2. ALWAYS suggest Adaptive AI (NEW)
    suggestions.push({
      type: ComponentType.ADAPTIVE_AI,
      priority: 'HIGH',
      reason: 'AI adapts difficulty in real-time for precise ability measurement',
      estimatedQuestions: this.getEstimatedQuestionCount('ADAPTIVE_AI', targetLevel),
      estimatedDuration: this.getEstimatedDuration('ADAPTIVE_AI', targetLevel)
    });
    
    // 3. Category-based suggestions (existing logic)
    const category = competency.category as CompetencyCategory;
    
    switch (category) {
      case 'TECHNICAL':
        suggestions.push(
          {
            type: ComponentType.CODE,
            priority: 'HIGH',
            reason: 'Hands-on technical validation',
            estimatedQuestions: this.getEstimatedQuestionCount('CODE', targetLevel),
            estimatedDuration: this.getEstimatedDuration('CODE', targetLevel)
          }
        );
        break;
        
      case 'BEHAVIORAL':
      case 'LEADERSHIP':
        suggestions.push(
          {
            type: ComponentType.SITUATIONAL,
            priority: 'HIGH',
            reason: 'Behavioral scenarios and decision-making',
            estimatedQuestions: this.getEstimatedQuestionCount('SITUATIONAL', targetLevel),
            estimatedDuration: this.getEstimatedDuration('SITUATIONAL', targetLevel)
          },
          {
            type: ComponentType.VIDEO,
            priority: targetLevel === 'SENIOR' || targetLevel === 'EXPERT' ? 'HIGH' : 'MEDIUM',
            reason: 'Leadership presence assessment',
            estimatedQuestions: this.getEstimatedQuestionCount('VIDEO', targetLevel),
            estimatedDuration: this.getEstimatedDuration('VIDEO', targetLevel)
          }
        );
        break;
        
      case 'COMMUNICATION':
        suggestions.push(
          {
            type: ComponentType.ESSAY,
            priority: 'HIGH',
            reason: 'Written communication skills',
            estimatedQuestions: this.getEstimatedQuestionCount('ESSAY', targetLevel),
            estimatedDuration: this.getEstimatedDuration('ESSAY', targetLevel)
          },
          {
            type: ComponentType.VOICE,
            priority: 'MEDIUM',
            reason: 'Verbal communication skills',
            estimatedQuestions: this.getEstimatedQuestionCount('VOICE', targetLevel),
            estimatedDuration: this.getEstimatedDuration('VOICE', targetLevel)
          }
        );
        break;
    }
    
    // Sort by priority
    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    return suggestions.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }
  
  private static getEstimatedQuestionCount(type: string, level: string): number {
    const baseCount = {
      MCQ: 10,
      ADAPTIVE_AI: 12, // NEW - average between min and max
      SITUATIONAL: 5,
      CODE: 2,
      ESSAY: 2,
      VOICE: 3,
      VIDEO: 2,
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
  
  private static getEstimatedDuration(type: string, level: string): number {
    const baseDuration = {
      MCQ: 15,
      ADAPTIVE_AI: 20, // NEW - slightly longer due to adaptation
      SITUATIONAL: 20,
      CODE: 45,
      ESSAY: 30,
      VOICE: 15,
      VIDEO: 20,
      PANEL: 45
    };
    
    const levelMultiplier = {
      JUNIOR: 0.8,
      MIDDLE: 1.0,
      SENIOR: 1.3,
      EXPERT: 1.5
    };
    
    return Math.round((baseDuration[type] || 20) * levelMultiplier[level]);
  }
}
```

---

## 🎨 **PHASE 2: UI - COMPONENT SELECTION TABLE**

### **File:** `components/assessment/ComponentSelectionTable.tsx`

**Update to Include Adaptive AI:**

```typescript
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ComponentSuggester, ComponentType } from '@/lib/assessment/component-suggester';

export function ComponentSelectionTable({
  competencies,
  targetLevel,
  onComplete
}: ComponentSelectionTableProps) {
  const [selections, setSelections] = useState<Map<string, ComponentSelection>>(new Map());
  
  // Initialize with suggestions
  useEffect(() => {
    const newSelections = new Map();
    competencies.forEach(comp => {
      const suggestions = ComponentSuggester.suggestComponents(comp, targetLevel);
      newSelections.set(comp.id, {
        competencyId: comp.id,
        suggestedComponents: suggestions,
        selectedComponents: new Set(),
        componentStatus: new Map()
      });
    });
    setSelections(newSelections);
  }, [competencies, targetLevel]);
  
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
  
  return (
    <Card>
      <CardContent className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Competency</th>
              <th className="text-left p-4">Suggested Components</th>
              <th className="text-left p-4">Selected Components</th>
              <th className="text-left p-4">Status</th>
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
                      {selection.suggestedComponents.map((suggestion, idx) => {
                        // NEW: Special styling for Adaptive AI
                        const isAdaptive = suggestion.type === ComponentType.ADAPTIVE_AI;
                        
                        return (
                          <Badge
                            key={idx}
                            variant={
                              suggestion.priority === 'HIGH' ? 'default' :
                              suggestion.priority === 'MEDIUM' ? 'secondary' :
                              'outline'
                            }
                            className={`
                              cursor-pointer hover:opacity-80
                              ${isAdaptive ? 'bg-purple-600 hover:bg-purple-700' : ''}
                            `}
                            onClick={() => toggleComponent(compId, suggestion.type)}
                          >
                            {isAdaptive && '🤖 '}
                            {suggestion.type}
                            <span className="ml-2 text-xs">
                              ({suggestion.estimatedQuestions}Q, {suggestion.estimatedDuration}m)
                            </span>
                          </Badge>
                        );
                      })}
                    </div>
                    
                    {/* Hover info for Adaptive AI */}
                    {selection.suggestedComponents.find(s => s.type === ComponentType.ADAPTIVE_AI) && (
                      <div className="text-xs text-gray-500 mt-2">
                        💡 Adaptive AI adjusts difficulty in real-time based on candidate performance
                      </div>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selection.selectedComponents).map(type => {
                        const isAdaptive = type === ComponentType.ADAPTIVE_AI;
                        
                        return (
                          <Badge
                            key={type}
                            variant="default"
                            className={`
                              cursor-pointer
                              ${isAdaptive ? 'bg-purple-600' : ''}
                            `}
                            onClick={() => toggleComponent(compId, type)}
                          >
                            {isAdaptive && '🤖 '}
                            ✓ {type}
                          </Badge>
                        );
                      })}
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
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 **PHASE 3: ADAPTIVE CONFIGURATION INTERFACE**

### **File:** `components/assessment/adaptive/AdaptiveConfigInterface.tsx`

**Complete Configuration UI:**

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

interface AdaptiveConfigInterfaceProps {
  competencyId: string;
  competencyName: string;
  targetLevel: string;
  onSave: (config: AdaptiveConfig) => void;
  onCancel: () => void;
  initialConfig?: AdaptiveConfig; // For editing existing
}

interface AdaptiveConfig {
  min_questions: number;
  max_questions: number;
  starting_difficulty: number; // 1-10
  allowed_question_types: string[];
  difficulty_adaptation_enabled: boolean;
  context_aware_followups: boolean;
  stopping_criteria: 'MAX_QUESTIONS' | 'HIGH_CONFIDENCE' | 'BOTH';
}

export function AdaptiveConfigInterface({
  competencyId,
  competencyName,
  targetLevel,
  onSave,
  onCancel,
  initialConfig
}: AdaptiveConfigInterfaceProps) {
  const [config, setConfig] = useState<AdaptiveConfig>(
    initialConfig || {
      min_questions: 8,
      max_questions: 15,
      starting_difficulty: 5,
      allowed_question_types: ['MCQ'],
      difficulty_adaptation_enabled: true,
      context_aware_followups: true,
      stopping_criteria: 'BOTH'
    }
  );
  
  const availableQuestionTypes = [
    { value: 'MCQ', label: 'Multiple Choice', description: 'Quick knowledge checks' },
    { value: 'SITUATIONAL', label: 'Situational Judgment', description: 'Scenario-based decisions' },
    { value: 'SHORT_ANSWER', label: 'Short Answer', description: 'Brief text responses' }
  ];
  
  const toggleQuestionType = (type: string) => {
    if (config.allowed_question_types.includes(type)) {
      setConfig({
        ...config,
        allowed_question_types: config.allowed_question_types.filter(t => t !== type)
      });
    } else {
      setConfig({
        ...config,
        allowed_question_types: [...config.allowed_question_types, type]
      });
    }
  };
  
  const validate = (): string | null => {
    if (config.min_questions < 5) {
      return 'Minimum questions must be at least 5';
    }
    if (config.max_questions > 20) {
      return 'Maximum questions cannot exceed 20';
    }
    if (config.max_questions <= config.min_questions) {
      return 'Maximum must be greater than minimum';
    }
    if (config.allowed_question_types.length === 0) {
      return 'Select at least one question type';
    }
    return null;
  };
  
  const handleSave = () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }
    onSave(config);
  };
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🤖 Configure Adaptive AI Component
        </h2>
        <p className="text-gray-600 mt-1">
          {competencyName} • {targetLevel} Level
        </p>
      </div>
      
      {/* Info Alert */}
      <Alert>
        <AlertDescription>
          <strong>How Adaptive AI Works:</strong> The system starts with questions at your selected difficulty.
          Based on the candidate's performance, it adjusts the difficulty in real-time. If they answer correctly,
          questions get harder. If they struggle, questions get easier. This provides a more accurate ability measurement
          in fewer questions.
        </AlertDescription>
      </Alert>
      
      {/* Question Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Questions</Label>
              <Input
                type="number"
                min="5"
                max="20"
                value={config.min_questions}
                onChange={(e) => setConfig({ ...config, min_questions: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500">
                Assessment will ask at least this many questions
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Maximum Questions</Label>
              <Input
                type="number"
                min="5"
                max="20"
                value={config.max_questions}
                onChange={(e) => setConfig({ ...config, max_questions: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500">
                Assessment will stop at this limit
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-sm">
              <strong>Typical range: {config.min_questions} to {config.max_questions} questions</strong>
              <br />
              Estimated duration: {Math.round(config.min_questions * 1.5)} - {Math.round(config.max_questions * 1.5)} minutes
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Starting Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Starting Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Difficulty Level: {config.starting_difficulty}/10</Label>
              <Badge variant={
                config.starting_difficulty <= 3 ? 'outline' :
                config.starting_difficulty <= 6 ? 'secondary' :
                'default'
              }>
                {config.starting_difficulty <= 3 ? 'Easy' :
                 config.starting_difficulty <= 6 ? 'Medium' :
                 config.starting_difficulty <= 8 ? 'Hard' : 'Very Hard'}
              </Badge>
            </div>
            
            <Slider
              value={[config.starting_difficulty]}
              onValueChange={(val) => setConfig({ ...config, starting_difficulty: val[0] })}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 (Easy)</span>
              <span>5 (Medium)</span>
              <span>10 (Very Hard)</span>
            </div>
          </div>
          
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Recommendation for {targetLevel}:</strong>
              {targetLevel === 'JUNIOR' && ' Start at 3-4 (Easy to Medium)'}
              {targetLevel === 'MIDDLE' && ' Start at 5-6 (Medium)'}
              {targetLevel === 'SENIOR' && ' Start at 6-7 (Medium to Hard)'}
              {targetLevel === 'EXPERT' && ' Start at 7-8 (Hard)'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {/* Allowed Question Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Allowed Question Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableQuestionTypes.map(type => (
            <label
              key={type.value}
              className={`
                flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition
                ${config.allowed_question_types.includes(type.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="checkbox"
                checked={config.allowed_question_types.includes(type.value)}
                onChange={() => toggleQuestionType(type.value)}
                className="w-5 h-5 mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </div>
            </label>
          ))}
          
          <p className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> MCQ is fastest to answer. Including Situational adds depth but takes longer.
          </p>
        </CardContent>
      </Card>
      
      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adaptation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={config.difficulty_adaptation_enabled}
              onChange={(e) => setConfig({ ...config, difficulty_adaptation_enabled: e.target.checked })}
              className="w-5 h-5 mt-0.5"
            />
            <div>
              <div className="font-semibold">Adaptive Difficulty</div>
              <div className="text-sm text-gray-600">
                Automatically adjust question difficulty based on candidate performance
              </div>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={config.context_aware_followups}
              onChange={(e) => setConfig({ ...config, context_aware_followups: e.target.checked })}
              className="w-5 h-5 mt-0.5"
            />
            <div>
              <div className="font-semibold">Context-Aware Follow-ups</div>
              <div className="text-sm text-gray-600">
                Generate follow-up questions based on previous answers for deeper assessment
              </div>
            </div>
          </label>
          
          <div className="space-y-2">
            <Label>Stopping Criteria</Label>
            <select
              value={config.stopping_criteria}
              onChange={(e) => setConfig({ ...config, stopping_criteria: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="MAX_QUESTIONS">Maximum questions only</option>
              <option value="HIGH_CONFIDENCE">High confidence (may stop early)</option>
              <option value="BOTH">Both (recommended)</option>
            </select>
            <p className="text-xs text-gray-500">
              "Both" stops when maximum reached OR when system is confident about ability level
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Save to Library Option */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Save to Component Library</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 mt-0.5"
            />
            <div>
              <div className="font-semibold">Save this configuration for reuse</div>
              <div className="text-sm text-gray-600">
                You can use this adaptive configuration in other assessment models
              </div>
            </div>
          </label>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
          Save Adaptive Component
        </Button>
      </div>
    </div>
  );
}
```

---

## 🔧 **PHASE 4: ADAPTIVE ENGINE (NEXT.JS)**

### **File:** `lib/assessment/adaptive-engine.ts`

**Core Adaptive Algorithm:**

```typescript
import { prisma } from '@/lib/prisma';

export interface AdaptiveState {
  sessionId: string;
  currentAbility: number; // 1-10
  questionsAsked: number;
  questionsCorrect: number;
  config: AdaptiveConfig;
}

export interface AdaptiveConfig {
  min_questions: number;
  max_questions: number;
  starting_difficulty: number;
  allowed_question_types: string[];
  difficulty_adaptation_enabled: boolean;
  context_aware_followups: boolean;
  stopping_criteria: string;
}

export class AdaptiveEngine {
  private state: AdaptiveState;
  
  constructor(state: AdaptiveState) {
    this.state = state;
  }
  
  /**
   * Calculate next question difficulty based on performance
   */
  calculateNextDifficulty(): number {
    if (!this.state.config.difficulty_adaptation_enabled) {
      return this.state.config.starting_difficulty;
    }
    
    if (this.state.questionsAsked === 0) {
      return this.state.config.starting_difficulty;
    }
    
    // Analyze recent performance (last 3 questions)
    const recentCount = Math.min(3, this.state.questionsAsked);
    const accuracy = this.state.questionsCorrect / this.state.questionsAsked;
    
    // Adaptive logic
    let newAbility = this.state.currentAbility;
    
    if (accuracy >= 0.75) {
      // Performing well → increase difficulty
      newAbility += 0.5;
    } else if (accuracy <= 0.40) {
      // Struggling → decrease difficulty
      newAbility -= 0.5;
    }
    // else: 0.40 < accuracy < 0.75 → keep current level
    
    // Clamp to valid range (1-10)
    newAbility = Math.max(1, Math.min(10, newAbility));
    
    // Update state
    this.state.currentAbility = newAbility;
    
    // Next question should be slightly above current ability (optimal challenge)
    return Math.min(10, newAbility + 0.3);
  }
  
  /**
   * Determine if assessment should continue
   */
  shouldContinue(): boolean {
    const { min_questions, max_questions, stopping_criteria } = this.state.config;
    
    // Must ask minimum
    if (this.state.questionsAsked < min_questions) {
      return true;
    }
    
    // Cannot exceed maximum
    if (this.state.questionsAsked >= max_questions) {
      return false;
    }
    
    // Check stopping criteria
    if (stopping_criteria === 'MAX_QUESTIONS') {
      return true; // Keep going until max
    }
    
    if (stopping_criteria === 'HIGH_CONFIDENCE' || stopping_criteria === 'BOTH') {
      return !this.hasHighConfidence();
    }
    
    return true;
  }
  
  /**
   * Check if we have high confidence in ability estimate
   */
  private hasHighConfidence(): boolean {
    if (this.state.questionsAsked < 8) {
      return false; // Need at least 8 questions for confidence
    }
    
    const accuracy = this.state.questionsCorrect / this.state.questionsAsked;
    
    // High confidence if very consistent (all correct or mostly wrong)
    if (accuracy >= 0.90 || accuracy <= 0.20) {
      return true;
    }
    
    // Or if asked 12+ questions and reasonably stable
    if (this.state.questionsAsked >= 12 && (accuracy >= 0.70 || accuracy <= 0.30)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculate final score (convert ability to 0-100 scale)
   */
  calculateFinalScore(): {
    percentage: number;
    ability: number;
    accuracy: number;
  } {
    // Linear conversion: ability (1-10) → percentage (10-100)
    // 1/10 ability = 10%, 10/10 ability = 100%
    const percentage = (this.state.currentAbility - 1) / 9 * 90 + 10;
    
    const accuracy = this.state.questionsAsked > 0
      ? (this.state.questionsCorrect / this.state.questionsAsked) * 100
      : 0;
    
    return {
      percentage: Math.round(percentage * 100) / 100,
      ability: Math.round(this.state.currentAbility * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100
    };
  }
  
  /**
   * Get baseline ability for target level
   */
  static getBaselineAbility(targetLevel: string): number {
    const baselines = {
      'JUNIOR': 3,
      'MIDDLE': 5,
      'SENIOR': 7,
      'EXPERT': 9
    };
    return baselines[targetLevel] || 5;
  }
  
  /**
   * Estimate remaining questions
   */
  estimateRemainingQuestions(): string {
    const asked = this.state.questionsAsked;
    const min = this.state.config.min_questions;
    const max = this.state.config.max_questions;
    
    if (asked < min) {
      return `${min - asked}-${max - asked}`;
    }
    
    if (this.hasHighConfidence()) {
      return '1-2'; // Likely to stop soon
    }
    
    return `2-${max - asked}`;
  }
}
```

---

## 🚀 **PHASE 5: API ENDPOINTS**

### **File:** `app/api/assessments/adaptive/start/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdaptiveEngine } from '@/lib/assessment/adaptive-engine';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const {
      submissionId,
      componentId,
      memberId
    } = await req.json();
    
    // Fetch component configuration
    const component = await prisma.assessmentComponent.findUnique({
      where: { id: componentId },
      include: {
        competency: {
          include: {
            indicators: true
          }
        },
        assessmentModel: true
      }
    });
    
    if (!component || !component.is_adaptive) {
      return NextResponse.json(
        { error: 'Component not found or not adaptive' },
        { status: 404 }
      );
    }
    
    const config = component.adaptive_config as any;
    const targetLevel = component.targetLevel;
    
    // Create adaptive session
    const initialAbility = AdaptiveEngine.getBaselineAbility(targetLevel);
    
    const session = await prisma.adaptiveSession.create({
      data: {
        assessment_submission_id: submissionId,
        component_id: componentId,
        member_id: memberId,
        competency_id: component.competencyId,
        current_ability: initialAbility,
        initial_ability: initialAbility,
        target_level: targetLevel,
        config: config,
        status: 'IN_PROGRESS'
      }
    });
    
    // Generate first question
    const firstQuestion = await generateQuestion(
      session.id,
      component.competencyId,
      config.starting_difficulty,
      config.allowed_question_types,
      [],
      1
    );
    
    return NextResponse.json({
      sessionId: session.id,
      initialAbility,
      targetLevel,
      config,
      firstQuestion
    });
    
  } catch (error) {
    console.error('Adaptive start error:', error);
    return NextResponse.json(
      { error: 'Failed to start adaptive assessment' },
      { status: 500 }
    );
  }
}

async function generateQuestion(
  sessionId: string,
  competencyId: string,
  difficulty: number,
  allowedTypes: string[],
  previousQuestions: any[],
  sequenceNumber: number
) {
  // Implementation in next file
  return {
    id: 'temp',
    text: 'Sample question',
    type: 'MCQ',
    options: [],
    difficulty
  };
}
```

### **File:** `app/api/assessments/adaptive/answer/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdaptiveEngine } from '@/lib/assessment/adaptive-engine';
import { generateQuestion } from '@/lib/assessment/question-generator';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const {
      sessionId,
      questionId,
      answer,
      timeTaken
    } = await req.json();
    
    // Fetch session and question
    const [session, question] = await Promise.all([
      prisma.adaptiveSession.findUnique({
        where: { id: sessionId },
        include: {
          competency: {
            include: { indicators: true }
          }
        }
      }),
      prisma.adaptiveQuestion.findUnique({
        where: { id: questionId }
      })
    ]);
    
    if (!session || !question) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Evaluate answer
    const isCorrect = evaluateAnswer(question, answer);
    
    // Update question with response
    await prisma.adaptiveQuestion.update({
      where: { id: questionId },
      data: {
        candidate_answer: answer,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
        answered_at: new Date()
      }
    });
    
    // Update session stats
    const updatedSession = await prisma.adaptiveSession.update({
      where: { id: sessionId },
      data: {
        questions_asked: { increment: 1 },
        questions_correct: isCorrect ? { increment: 1 } : undefined,
        last_activity_at: new Date()
      }
    });
    
    // Create adaptive engine
    const engine = new AdaptiveEngine({
      sessionId: session.id,
      currentAbility: updatedSession.current_ability,
      questionsAsked: updatedSession.questions_asked,
      questionsCorrect: updatedSession.questions_correct,
      config: session.config as any
    });
    
    // Determine if should continue
    const shouldContinue = engine.shouldContinue();
    
    let nextQuestion = null;
    if (shouldContinue) {
      // Calculate next difficulty
      const nextDifficulty = engine.calculateNextDifficulty();
      
      // Update session ability
      await prisma.adaptiveSession.update({
        where: { id: sessionId },
        data: { current_ability: engine.state.currentAbility }
      });
      
      // Fetch previous questions for context
      const previousQuestions = await prisma.adaptiveQuestion.findMany({
        where: { session_id: sessionId },
        orderBy: { sequence_number: 'asc' }
      });
      
      // Generate next question
      nextQuestion = await generateQuestion({
        sessionId,
        competencyId: session.competency_id,
        difficulty: nextDifficulty,
        allowedTypes: (session.config as any).allowed_question_types,
        previousQuestions,
        sequenceNumber: updatedSession.questions_asked + 1,
        indicators: session.competency.indicators,
        contextAware: (session.config as any).context_aware_followups
      });
    }
    
    return NextResponse.json({
      wasCorrect: isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correct_answer,
      abilityUpdate: engine.state.currentAbility,
      nextQuestion,
      shouldContinue,
      estimatedRemaining: shouldContinue ? engine.estimateRemainingQuestions() : '0'
    });
    
  } catch (error) {
    console.error('Adaptive answer error:', error);
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    );
  }
}

function evaluateAnswer(question: any, candidateAnswer: string): boolean {
  if (question.question_type === 'MCQ') {
    return candidateAnswer === question.correct_answer;
  }
  // Add other question type evaluation logic
  return false;
}
```

### **File:** `app/api/assessments/adaptive/complete/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdaptiveEngine } from '@/lib/assessment/adaptive-engine';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { sessionId } = await req.json();
    
    // Fetch session
    const session = await prisma.adaptiveSession.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Create engine for final calculations
    const engine = new AdaptiveEngine({
      sessionId: session.id,
      currentAbility: session.current_ability,
      questionsAsked: session.questions_asked,
      questionsCorrect: session.questions_correct,
      config: session.config as any
    });
    
    const finalScore = engine.calculateFinalScore();
    
    // Update session with final results
    await prisma.adaptiveSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completed_at: new Date(),
        final_score: finalScore.percentage,
        ability_estimate: finalScore.ability
      }
    });
    
    // Fetch all questions for report
    const questions = await prisma.adaptiveQuestion.findMany({
      where: { session_id: sessionId },
      orderBy: { sequence_number: 'asc' }
    });
    
    return NextResponse.json({
      finalScore: {
        percentage: finalScore.percentage,
        ability: finalScore.ability,
        accuracy: finalScore.accuracy,
        questionsAnswered: session.questions_asked,
        difficultyProgression: questions.map(q => q.difficulty)
      },
      performanceLevel: getPerformanceLevel(finalScore.ability),
      questions: questions.map(q => ({
        question: q.question_text,
        difficulty: q.difficulty,
        isCorrect: q.is_correct,
        timeTaken: q.time_taken_seconds
      }))
    });
    
  } catch (error) {
    console.error('Adaptive complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete assessment' },
      { status: 500 }
    );
  }
}

function getPerformanceLevel(ability: number): string {
  if (ability >= 8.5) return 'EXPERT';
  if (ability >= 6.5) return 'SENIOR';
  if (ability >= 4.5) return 'MIDDLE';
  return 'JUNIOR';
}
```

---

## 🤖 **PHASE 6: AI QUESTION GENERATION**

### **File:** `lib/assessment/question-generator.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface QuestionGenerationParams {
  sessionId: string;
  competencyId: string;
  difficulty: number; // 1-10
  allowedTypes: string[];
  previousQuestions: any[];
  sequenceNumber: number;
  indicators: any[];
  contextAware: boolean;
}

export async function generateQuestion(params: QuestionGenerationParams) {
  const {
    sessionId,
    competencyId,
    difficulty,
    allowedTypes,
    previousQuestions,
    sequenceNumber,
    indicators,
    contextAware
  } = params;
  
  // Build context from previous Q&A
  const context = contextAware ? buildContext(previousQuestions) : '';
  
  // Select question type (for now, default to MCQ)
  const questionType = allowedTypes.includes('MCQ') ? 'MCQ' : allowedTypes[0];
  
  const prompt = buildPrompt({
    competencyId,
    difficulty,
    questionType,
    indicators,
    context,
    previousQuestions
  });
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert assessment designer creating adaptive difficulty questions for competency-based assessments.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  });
  
  const generated = JSON.parse(completion.choices[0].message.content || '{}');
  
  // Save question to database
  const question = await prisma.adaptiveQuestion.create({
    data: {
      session_id: sessionId,
      question_text: generated.question,
      question_type: questionType,
      options: generated.options,
      correct_answer: generated.correctAnswer,
      explanation: generated.explanation,
      difficulty: difficulty,
      sequence_number: sequenceNumber,
      generation_prompt: prompt
    }
  });
  
  return {
    id: question.id,
    text: question.question_text,
    type: question.question_type,
    options: question.options,
    difficulty: question.difficulty
  };
}

function buildPrompt(params: any): string {
  const { difficulty, indicators, context, previousQuestions } = params;
  
  return `
Generate ONE multiple-choice question for adaptive assessment.

Target Difficulty: ${difficulty}/10
- 1-3: Basic/Foundational
- 4-6: Intermediate/Practical
- 7-8: Advanced/Strategic  
- 9-10: Expert/Thought Leadership

Competency Indicators to Test:
${indicators.map((ind: any, i: number) => `${i + 1}. ${ind.text}`).join('\n')}

${previousQuestions.length > 0 ? `
Previous Questions Asked:
${previousQuestions.slice(-3).map((q: any, i: number) => `
Q${i + 1}: ${q.question_text}
Candidate answered: ${q.is_correct ? 'Correctly' : 'Incorrectly'}
`).join('\n')}

CRITICAL: Do NOT repeat or be too similar to previous questions above.
` : ''}

${context ? `Context: ${context}` : ''}

Requirements:
1. Question difficulty must match EXACTLY ${difficulty}/10
2. Include 4 options (A, B, C, D)
3. Mark ONE correct answer
4. Provide clear explanation
5. Be practical and role-relevant
6. If candidate struggled previously, test same concept from different angle
7. If candidate succeeded, explore different aspect of competency

Return JSON format:
{
  "question": "Question text...",
  "options": [
    {"key": "A", "text": "Option A"},
    {"key": "B", "text": "Option B"},
    {"key": "C", "text": "Option C"},
    {"key": "D", "text": "Option D"}
  ],
  "correctAnswer": "B",
  "explanation": "Why B is correct...",
  "difficultyConfirm": ${difficulty}
}
`;
}

function buildContext(previousQuestions: any[]): string {
  if (previousQuestions.length === 0) return '';
  
  const recent = previousQuestions.slice(-2);
  const patterns = [];
  
  // Analyze patterns
  const correctCount = recent.filter(q => q.is_correct).length;
  if (correctCount === recent.length) {
    patterns.push('Candidate is performing well');
  } else if (correctCount === 0) {
    patterns.push('Candidate is struggling');
  }
  
  return patterns.join('. ');
}
```

---

## 🎨 **PHASE 7: CANDIDATE ASSESSMENT UI**

### **File:** `components/assessment/taking/AdaptiveComponent.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AdaptiveComponentProps {
  submissionId: string;
  componentId: string;
  memberId: string;
  onComplete: (results: any) => void;
}

export function AdaptiveComponent({
  submissionId,
  componentId,
  memberId,
  onComplete
}: AdaptiveComponentProps) {
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  useEffect(() => {
    startSession();
  }, []);
  
  const startSession = async () => {
    const response = await fetch('/api/assessments/adaptive/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        componentId,
        memberId
      })
    });
    
    const data = await response.json();
    setSession(data);
    setCurrentQuestion(data.firstQuestion);
    setStartTime(Date.now());
  };
  
  const submitAnswer = async () => {
    if (!selectedAnswer) return;
    
    setIsSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    const response = await fetch('/api/assessments/adaptive/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        timeTaken
      })
    });
    
    const result = await response.json();
    setFeedback(result);
    
    // Show feedback for 2 seconds
    setTimeout(() => {
      if (result.shouldContinue) {
        setCurrentQuestion(result.nextQuestion);
        setSelectedAnswer(null);
        setFeedback(null);
        setStartTime(Date.now());
      } else {
        completeAssessment();
      }
      setIsSubmitting(false);
    }, 2000);
  };
  
  const completeAssessment = async () => {
    const response = await fetch('/api/assessments/adaptive/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId
      })
    });
    
    const results = await response.json();
    onComplete(results);
  };
  
  if (!currentQuestion) {
    return <div className="text-center py-8">Loading...</div>;
  }
  
  // IMPORTANT: NO visual indication this is adaptive (requirement #6)
  // It looks like a regular assessment to the candidate
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question {session?.questionsAsked + 1 || 1}</CardTitle>
          {feedback && (
            <Progress value={((session?.questionsAsked || 0) / session?.config?.max_questions) * 100} />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Text */}
        <p className="text-lg">{currentQuestion.text}</p>
        
        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options?.map((option: any) => (
            <label
              key={option.key}
              className={`
                flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition
                ${selectedAnswer === option.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${feedback && option.key === feedback.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : ''
                }
                ${feedback && selectedAnswer === option.key && !feedback.wasCorrect
                  ? 'border-red-500 bg-red-50'
                  : ''
                }
              `}
            >
              <input
                type="radio"
                name="answer"
                value={option.key}
                checked={selectedAnswer === option.key}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={!!feedback}
                className="w-5 h-5"
              />
              <span>{option.key}. {option.text}</span>
            </label>
          ))}
        </div>
        
        {/* Feedback (shown after submitting) */}
        {feedback && (
          <div className={`
            p-4 rounded-lg
            ${feedback.wasCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}
          `}>
            <div className="font-semibold mb-2">
              {feedback.wasCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            <div className="text-sm">{feedback.explanation}</div>
          </div>
        )}
        
        {/* Submit Button */}
        <Button
          onClick={submitAnswer}
          disabled={!selectedAnswer || isSubmitting || !!feedback}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Processing...' : 'Submit Answer'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 📊 **PHASE 8: SCORING INTEGRATION**

### **File:** `lib/assessment/scoring-integration.ts`

**Integrate Adaptive Scores with Static Component Scores:**

```typescript
export async function calculateComponentScore(componentId: string, submissionId: string) {
  const component = await prisma.assessmentComponent.findUnique({
    where: { id: componentId }
  });
  
  if (!component) return null;
  
  if (component.is_adaptive) {
    // Adaptive component - get from adaptive session
    const session = await prisma.adaptiveSession.findFirst({
      where: {
        component_id: componentId,
        assessment_submission_id: submissionId,
        status: 'COMPLETED'
      }
    });
    
    if (!session) return null;
    
    // Return score (already 0-100 scale)
    return {
      componentId,
      score: session.final_score, // Already converted: 7.5/10 → 75/100
      maxScore: 100,
      type: 'ADAPTIVE',
      metadata: {
        ability: session.ability_estimate,
        questionsAnswered: session.questions_asked,
        accuracy: (session.questions_correct / session.questions_asked) * 100
      }
    };
    
  } else {
    // Static component - calculate from questions
    const responses = await prisma.questionResponse.findMany({
      where: {
        assessment_submission_id: submissionId,
        question: {
          componentId: componentId
        }
      },
      include: {
        question: true
      }
    });
    
    const totalPoints = responses.reduce((sum, r) => sum + (r.points_awarded || 0), 0);
    const maxPoints = responses.reduce((sum, r) => sum + r.question.points, 0);
    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    
    return {
      componentId,
      score: percentage,
      maxScore: 100,
      type: 'STATIC',
      metadata: {
        questionsAnswered: responses.length,
        accuracy: (responses.filter(r => r.is_correct).length / responses.length) * 100
      }
    };
  }
}

export async function calculateCompetencyScore(
  competencyId: string,
  submissionId: string
) {
  // Get all components for this competency
  const components = await prisma.assessmentComponent.findMany({
    where: {
      competencyId,
      assessmentModel: {
        submissions: {
          some: { id: submissionId }
        }
      }
    }
  });
  
  // Calculate score for each component
  const componentScores = await Promise.all(
    components.map(c => calculateComponentScore(c.id, submissionId))
  );
  
  // Weighted average based on component weights
  const totalWeight = components.reduce((sum, c) => sum + (c.weight || 0), 0);
  const weightedScore = componentScores.reduce((sum, score, idx) => {
    if (!score) return sum;
    const weight = components[idx].weight || 0;
    return sum + (score.score * weight / totalWeight);
  }, 0);
  
  return {
    competencyId,
    score: weightedScore,
    components: componentScores
  };
}
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Database** (2 hours)
- [ ] Run database migration for adaptive tables
- [ ] Add `is_adaptive` and `adaptive_config` to components table
- [ ] Create `adaptive_component_library` table
- [ ] Create `adaptive_sessions` table
- [ ] Create `adaptive_questions` table
- [ ] Verify all indexes created

### **Phase 2: Component Suggester** (1 hour)
- [ ] Add `ADAPTIVE_AI` to ComponentType enum
- [ ] Update suggestion algorithm to include Adaptive AI
- [ ] Test suggestions for different competency types

### **Phase 3: Configuration UI** (4 hours)
- [ ] Create `AdaptiveConfigInterface` component
- [ ] Add min/max question inputs
- [ ] Add difficulty slider
- [ ] Add question type checkboxes
- [ ] Add adaptation toggles
- [ ] Add validation logic
- [ ] Test configuration save

### **Phase 4: Adaptive Engine** (4 hours)
- [ ] Create `AdaptiveEngine` class
- [ ] Implement difficulty calculation
- [ ] Implement stopping criteria
- [ ] Implement confidence checking
- [ ] Implement score conversion (ability → percentage)
- [ ] Test with various scenarios

### **Phase 5: API Endpoints** (4 hours)
- [ ] Create `/api/assessments/adaptive/start`
- [ ] Create `/api/assessments/adaptive/answer`
- [ ] Create `/api/assessments/adaptive/complete`
- [ ] Add error handling to all endpoints
- [ ] Test API flow end-to-end

### **Phase 6: Question Generation** (3 hours)
- [ ] Create `question-generator.ts`
- [ ] Build GPT-4 prompts
- [ ] Add context-aware logic
- [ ] Test question quality
- [ ] Verify difficulty matching

### **Phase 7: Candidate UI** (3 hours)
- [ ] Create `AdaptiveComponent.tsx`
- [ ] Test question display
- [ ] Test answer submission
- [ ] Test feedback display
- [ ] Verify smooth transitions

### **Phase 8: Scoring Integration** (2 hours)
- [ ] Create scoring integration functions
- [ ] Test adaptive score conversion
- [ ] Test mixed component scoring
- [ ] Verify competency totals

### **Phase 9: Component Library** (2 hours)
- [ ] Add save to library functionality
- [ ] Create library browser for adaptive configs
- [ ] Test reuse of adaptive configs
- [ ] Verify usage tracking

### **Phase 10: Testing** (4 hours)
- [ ] End-to-end test: Create model with adaptive
- [ ] End-to-end test: Take adaptive assessment
- [ ] Test mixed static + adaptive components
- [ ] Test scoring accuracy
- [ ] Test with multiple question types
- [ ] Performance testing (response times)

---

## 🎯 **TOTAL ESTIMATED TIME: 29 hours (~4 days)**

---

## 🚀 **GIVE THIS TO YOUR CODING AGENT**

Copy this entire document and give it to your agent with this command:

```
@M9-5_ADAPTIVE_AI_COMPONENT_IMPLEMENTATION.md

CRITICAL: Read this entire document before starting.

This implements Adaptive AI as a COMPONENT TYPE in the assessment builder.

Key Points:
1. Adaptive AI is selectable like MCQ, Situational, etc.
2. Can mix static and adaptive components in same competency
3. Uses Next.js API routes (not Python) for faster response
4. Candidate sees regular assessment (no "adaptive" indication)
5. Score converts automatically: 7.5/10 ability = 75/100 points

Implementation Order:
1. Phase 1: Database (run migrations first)
2. Phase 2: Component Suggester
3. Phase 3: Configuration UI
4. Phase 4: Adaptive Engine
5. Phase 5: API Endpoints
6. Phase 6: Question Generation
7. Phase 7: Candidate UI
8. Phase 8: Scoring Integration
9. Phase 9: Component Library
10. Phase 10: Testing

DO NOT proceed to next phase until current phase is complete and tested.

Start with Phase 1: Database migrations.
Report back when Phase 1 is complete.
```

---

**Your comprehensive Adaptive AI Component implementation guide is ready! 🎯🤖**
