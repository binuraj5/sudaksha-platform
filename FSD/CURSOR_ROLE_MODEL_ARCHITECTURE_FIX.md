# CURSOR CRITICAL UPDATE: Merge Role-Model Architecture with Assessment Builder

## 🚨 CRITICAL ARCHITECTURE CHANGE REQUIRED

You previously implemented the Assessment Builder Wizard from `CURSOR_ASSESSMENT_BUILDER_PROMPT.md`. However, there is a **fundamental architecture issue** that must be fixed immediately.

---

## ❌ PROBLEM: Current Implementation is WRONG

### What's Wrong:
The current assessment builder **modifies the role itself** during model creation. This is incorrect because:

1. **Roles are MASTER data** - They should only be managed by Super Admins on the role page
2. **Models are USER-SPECIFIC snapshots** - Each user should select a subset of role competencies for their model
3. **Multiple users create different models from same role** - User A might select competencies A,B,C while User B selects D,E,F from the same role
4. **Weights should be model-specific** - Not role-level

### Current (INCORRECT) Behavior:
```
User creates assessment model
    ↓
Modifies role competencies (adds/removes/changes weights)
    ↓
Affects the role itself (WRONG!)
    ↓
Other users see changed role
```

### Target (CORRECT) Behavior:
```
User creates assessment model
    ↓
Selects subset of role's competencies
    ↓
Sets weights for THIS MODEL only
    ↓
Role remains unchanged
    ↓
Other users see original role
```

---

## ✅ CORRECT ARCHITECTURE

### Role (Master Data)
```typescript
Role: "Project Manager - IT"
├── Managed ONLY on role page (/assessments/admin/roles/[roleId])
├── Managed ONLY by Super Admin / Tenant Admin
├── Has competencies: [A, B, C, D, E, F, G] (7 competencies)
├── Each competency has indicators at all levels (Junior/Middle/Senior/Expert)
└── NEVER modified during model creation
```

### Assessment Model (User Snapshot)
```typescript
User 1 creates Model 1:
├── Role: Project Manager - IT (reference only)
├── Target Level: Senior
├── Selected Competencies: [A, B, C, D] (4 of 7) ← User chooses subset
├── Model-Specific Weights: {A: 30%, B: 25%, C: 25%, D: 20%} ← For this model only
└── Components created with SENIOR-level indicators only

User 2 creates Model 2:
├── Role: Project Manager - IT (same role)
├── Target Level: Junior
├── Selected Competencies: [E, F] (2 of 7) ← Different subset
├── Model-Specific Weights: {E: 60%, F: 40%} ← Different weights
└── Components created with JUNIOR-level indicators only

Role remains unchanged:
├── Still has all 7 competencies [A, B, C, D, E, F, G]
├── Not affected by either model creation
```

---

## 🔧 REQUIRED CHANGES

### Change 1: Remove Role-Modifying Behavior from Assessment Builder

**Files to Modify:**
- `app/assessments/admin/models/create/page.tsx`
- `components/assessment/RoleSelector.tsx`
- `components/assessment/AssessmentBuilderWizard.tsx`

**What to Remove:**
❌ Remove `RoleCompetencyManager` from create flow  
❌ Remove "Add Competency" button from model creation  
❌ Remove "Remove Competency" button from model creation  
❌ Remove any API calls that modify role competencies  
❌ Remove any weight changes that affect the role  

**What to Keep:**
✅ Keep "View/Edit Competencies" as a LINK to role page  
✅ Keep role selection dropdown  
✅ Keep level selection (Junior/Middle/Senior/Expert)  

---

### Change 2: Add Model-Scoped Competency Selection

**Create New Component:** `components/assessment/ModelCompetencySelector.tsx`

This component should:

```typescript
interface ModelCompetencySelectorProps {
  roleId: string;
  roleName: string;
  roleCompetencies: RoleCompetency[]; // FROM ROLE (read-only)
  targetLevel: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'EXPERT';
  onSelectionComplete: (selection: CompetencySelection) => void;
}

interface CompetencySelection {
  selectedCompetencyIds: string[];
  weights: Map<string, number>; // competencyId → weight (0-100)
}

export function ModelCompetencySelector({
  roleCompetencies,
  targetLevel,
  onSelectionComplete
}: ModelCompetencySelectorProps) {
  const [selectedCompetencies, setSelectedCompetencies] = useState<Set<string>>(
    new Set(roleCompetencies.map(rc => rc.competencyId)) // Default: all checked
  );
  
  const [weights, setWeights] = useState<Map<string, number>>(
    new Map(roleCompetencies.map(rc => [rc.competencyId, rc.weight])) // Initial from role
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Competencies for This Assessment</CardTitle>
        <p className="text-sm text-gray-600">
          Choose which competencies to include in this model.
          You can adjust weights for this assessment only.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roleCompetencies.map(rc => (
            <div key={rc.competencyId} className="flex items-center gap-4 p-4 border rounded">
              {/* CHECKBOX: Include in this model */}
              <input
                type="checkbox"
                checked={selectedCompetencies.has(rc.competencyId)}
                onChange={(e) => {
                  const newSelected = new Set(selectedCompetencies);
                  if (e.target.checked) {
                    newSelected.add(rc.competencyId);
                  } else {
                    newSelected.delete(rc.competencyId);
                  }
                  setSelectedCompetencies(newSelected);
                }}
                className="w-5 h-5"
              />
              
              {/* Competency Name */}
              <div className="flex-1">
                <div className="font-semibold">{rc.competency.name}</div>
                <div className="text-sm text-gray-600">
                  {rc.competency.description}
                </div>
                <Badge variant="outline" className="mt-1">
                  {getIndicatorCount(rc.competencyId, targetLevel)} {targetLevel} indicators
                </Badge>
              </div>
              
              {/* WEIGHT INPUT: Model-specific */}
              {selectedCompetencies.has(rc.competencyId) && (
                <div className="w-32">
                  <Label className="text-xs">Weight (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.get(rc.competencyId) || 0}
                    onChange={(e) => {
                      const newWeights = new Map(weights);
                      newWeights.set(rc.competencyId, parseInt(e.target.value));
                      setWeights(newWeights);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Weight Validation */}
        <WeightValidation 
          selectedCompetencies={selectedCompetencies}
          weights={weights}
        />
        
        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              // Link to role page for admins
              window.open(`/assessments/admin/roles/${roleId}`, '_blank');
            }}
          >
            View/Edit Role Competencies →
          </Button>
          
          <Button
            onClick={() => {
              onSelectionComplete({
                selectedCompetencyIds: Array.from(selectedCompetencies),
                weights
              });
            }}
            disabled={!validateWeights(selectedCompetencies, weights)}
          >
            Continue to Component Selection →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WeightValidation({ selectedCompetencies, weights }) {
  const total = Array.from(selectedCompetencies).reduce(
    (sum, id) => sum + (weights.get(id) || 0), 
    0
  );
  
  const isValid = total === 100;
  
  return (
    <Alert variant={isValid ? 'default' : 'destructive'} className="mt-4">
      <AlertDescription>
        Total weight: <strong>{total}%</strong>
        {!isValid && ' (must equal 100%)'}
      </AlertDescription>
    </Alert>
  );
}

function validateWeights(selected: Set<string>, weights: Map<string, number>): boolean {
  if (selected.size === 0) return false;
  
  const total = Array.from(selected).reduce(
    (sum, id) => sum + (weights.get(id) || 0),
    0
  );
  
  return total === 100;
}
```

---

### Change 3: Update Assessment Builder Wizard Flow

**File:** `components/assessment/AssessmentBuilderWizard.tsx`

**New Flow:**

```typescript
export function AssessmentBuilderWizard({
  roleId,
  roleName,
  roleCompetencies, // FROM DATABASE (read-only)
  targetLevel
}: AssessmentBuilderWizardProps) {
  const [step, setStep] = useState<'OVERVIEW' | 'SELECT_COMPETENCIES' | 'COMPONENTS' | 'BUILD'>('OVERVIEW');
  const [selectedCompetencies, setSelectedCompetencies] = useState<CompetencySelection | null>(null);
  
  // STEP 1: Overview (existing)
  const renderOverview = () => {
    // ... existing code
  };
  
  // STEP 2: Select Competencies for THIS MODEL (NEW)
  const renderCompetencySelection = () => {
    return (
      <ModelCompetencySelector
        roleId={roleId}
        roleName={roleName}
        roleCompetencies={roleCompetencies}
        targetLevel={targetLevel}
        onSelectionComplete={(selection) => {
          setSelectedCompetencies(selection);
          setStep('COMPONENTS');
        }}
      />
    );
  };
  
  // STEP 3: Component Selection (UPDATED)
  const renderComponentSelection = () => {
    if (!selectedCompetencies) return null;
    
    // Filter to ONLY selected competencies
    const competenciesToShow = roleCompetencies.filter(rc =>
      selectedCompetencies.selectedCompetencyIds.includes(rc.competencyId)
    );
    
    return (
      <ComponentSelectionTable
        competencies={competenciesToShow}
        targetLevel={targetLevel}
        weights={selectedCompetencies.weights}
        onComplete={() => setStep('BUILD')}
      />
    );
  };
  
  // STEP 4: Build Components (existing)
  const renderComponentBuilding = () => {
    // ... existing code
  };
  
  return (
    <div>
      {step === 'OVERVIEW' && renderOverview()}
      {step === 'SELECT_COMPETENCIES' && renderCompetencySelection()}
      {step === 'COMPONENTS' && renderComponentSelection()}
      {step === 'BUILD' && renderComponentBuilding()}
    </div>
  );
}
```

---

### Change 4: Update API Endpoint - from-role

**File:** `app/api/assessments/admin/models/from-role/route.ts`

**Current (INCORRECT):**
```typescript
// Uses ALL role competencies
const roleCompetencies = await prisma.roleCompetency.findMany({
  where: { roleId }
});

// Creates components for ALL
for (const rc of roleCompetencies) {
  await createComponent(rc);
}
```

**Updated (CORRECT):**
```typescript
export async function POST(req: NextRequest) {
  const {
    roleId,
    targetLevel,
    competencyWeights, // NEW: Map of competencyId → weight
    name,
    description
  } = await req.json();
  
  // Validation
  if (!competencyWeights || Object.keys(competencyWeights).length === 0) {
    return NextResponse.json(
      { error: 'Must select at least one competency' },
      { status: 400 }
    );
  }
  
  // Validate weights sum to 100
  const totalWeight = Object.values(competencyWeights).reduce((sum, w) => sum + w, 0);
  if (totalWeight !== 100) {
    return NextResponse.json(
      { error: 'Weights must sum to 100%' },
      { status: 400 }
    );
  }
  
  // Fetch ONLY selected competencies
  const selectedCompetencyIds = Object.keys(competencyWeights);
  const competencies = await prisma.competency.findMany({
    where: {
      id: { in: selectedCompetencyIds }
    },
    include: {
      indicators: {
        where: {
          level: targetLevel // Filter by target level
        }
      }
    }
  });
  
  // Create model
  const model = await prisma.assessmentModel.create({
    data: {
      tenantId: user.tenantId,
      createdBy: user.id,
      name,
      description,
      sourceType: 'ROLE_BASED',
      roleId,
      targetLevel,
      status: 'DRAFT'
    }
  });
  
  // Create components ONLY for selected competencies
  for (const comp of competencies) {
    const weight = competencyWeights[comp.id];
    
    await prisma.assessmentComponent.create({
      data: {
        assessmentModelId: model.id,
        competencyId: comp.id,
        weight, // Use model-specific weight
        targetLevel,
        indicatorIds: comp.indicators.map(ind => ind.id),
        status: 'DRAFT',
        completionPercentage: 0
      }
    });
  }
  
  return NextResponse.json({ model });
}
```

---

### Change 5: Update from-wizard API

**File:** `app/api/assessments/admin/models/from-wizard/route.ts`

**Same changes as from-role:**
```typescript
export async function POST(req: NextRequest) {
  const {
    roleId,
    targetLevel,
    selectedCompetencyIds, // NEW: Array of selected competency IDs
    weights, // NEW: Map of competencyId → weight
    name
  } = await req.json();
  
  // Convert to competencyWeights format
  const competencyWeights = {};
  selectedCompetencyIds.forEach(id => {
    competencyWeights[id] = weights[id];
  });
  
  // Same logic as from-role
  // ... (use competencyWeights to create components)
}
```

---

## 🔄 UPDATED WIZARD FLOW

### Complete User Journey:

```
STEP 1: Role & Level Selection
┌─────────────────────────────────────────┐
│ Select Role: [Project Manager - IT ▼]  │
│ Target Level: [● Senior]                │
│                                         │
│ [Continue →]                            │
└─────────────────────────────────────────┘
           ↓
STEP 2: Select Competencies (NEW)
┌─────────────────────────────────────────┐
│ Select competencies for this assessment │
│                                         │
│ ☑ Leadership           Weight: [30]%    │
│ ☑ Communication        Weight: [25]%    │
│ ☑ Problem Solving      Weight: [25]%    │
│ ☑ Technical Skills     Weight: [20]%    │
│ ☐ Project Management   Weight: [--]     │
│ ☐ Stakeholder Mgmt     Weight: [--]     │
│ ☐ Strategic Thinking   Weight: [--]     │
│                                         │
│ Total: 100% ✓                           │
│                                         │
│ [View Role Competencies]  [Continue →]  │
└─────────────────────────────────────────┘
           ↓
STEP 3: Component Suggestions
┌─────────────────────────────────────────┐
│ Competency      | Suggested | Selected  │
├─────────────────────────────────────────┤
│ Leadership      | MCQ       | ☑ MCQ     │
│ (30%)           | Situational| ☑ Situational
│                 | Voice     | ☐ Voice   │
├─────────────────────────────────────────┤
│ Communication   | MCQ       | ☑ MCQ     │
│ (25%)           | Essay     | ☑ Essay   │
│                 | Video     | ☐ Video   │
├─────────────────────────────────────────┤
│ ... (only showing selected 4)           │
└─────────────────────────────────────────┘
           ↓
STEP 4: Build Components
(Existing flow - unchanged)
```

---

## 📊 DATA FLOW DIAGRAM

```
┌────────────────────────────────────────────────┐
│ ROLE (Master - Never Modified)                 │
├────────────────────────────────────────────────┤
│ ID: role_123                                   │
│ Name: "Project Manager - IT"                   │
│ Competencies:                                  │
│   - A: Leadership (weight: 20)                 │
│   - B: Communication (weight: 15)              │
│   - C: Problem Solving (weight: 15)            │
│   - D: Technical Skills (weight: 15)           │
│   - E: Project Management (weight: 15)         │
│   - F: Stakeholder Management (weight: 10)     │
│   - G: Strategic Thinking (weight: 10)         │
└────────────────────────────────────────────────┘
                    ↓ (read-only reference)
        ┌───────────┴───────────┐
        ↓                       ↓
┌──────────────────┐    ┌──────────────────┐
│ MODEL 1          │    │ MODEL 2          │
│ (User A)         │    │ (User B)         │
├──────────────────┤    ├──────────────────┤
│ Role: role_123   │    │ Role: role_123   │
│ Level: Senior    │    │ Level: Junior    │
│ Selected: A,B,C,D│    │ Selected: E,F    │
│ Weights:         │    │ Weights:         │
│   A: 30%         │    │   E: 60%         │
│   B: 25%         │    │   F: 40%         │
│   C: 25%         │    │                  │
│   D: 20%         │    │                  │
│                  │    │                  │
│ Components:      │    │ Components:      │
│   - A (Senior)   │    │   - E (Junior)   │
│   - B (Senior)   │    │   - F (Junior)   │
│   - C (Senior)   │    │                  │
│   - D (Senior)   │    │                  │
└──────────────────┘    └──────────────────┘

ROLE remains unchanged ✓
Each model is independent ✓
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase A: Remove Role-Modifying Code
- [ ] Remove `RoleCompetencyManager` from create flow
- [ ] Remove "Add Competency" button from model creation
- [ ] Remove "Remove Competency" button from model creation
- [ ] Remove any API calls that update role competencies during model creation
- [ ] Change "Edit Competencies" to "View Role Competencies" (link only)

### Phase B: Create Model-Scoped Selection
- [ ] Create `ModelCompetencySelector.tsx` component
- [ ] Add checkbox column for "include in this model"
- [ ] Add weight input that's model-specific
- [ ] Add weight validation (must sum to 100%)
- [ ] Default: all competencies checked with role weights

### Phase C: Update Wizard Flow
- [ ] Update `AssessmentBuilderWizard.tsx` to have 4 steps instead of 3
- [ ] Add STEP 2: Select Competencies (new)
- [ ] Update STEP 3: Only show selected competencies
- [ ] Update STEP 4: Build components (existing)

### Phase D: Update APIs
- [ ] Update `from-role` API to accept `competencyWeights`
- [ ] Update `from-role` API to create components ONLY for selected competencies
- [ ] Update `from-wizard` API similarly
- [ ] Add validation: weights must sum to 100%
- [ ] Add validation: at least one competency selected

### Phase E: Testing
- [ ] Test: Create model with subset of competencies
- [ ] Test: Verify role is unchanged after model creation
- [ ] Test: Two users create different models from same role
- [ ] Test: Weight validation (must sum to 100%)
- [ ] Test: Cannot select zero competencies

---

## 🚨 CRITICAL RULES

1. **NEVER modify role during model creation**
   - Role competencies are read-only in the create flow
   - Only Super Admin can modify roles on the role page

2. **Model-specific selections**
   - Each model selects a subset of role competencies
   - Each model has its own weights
   - Weights apply ONLY to that model

3. **Backward compatibility**
   - If `competencyWeights` is empty in API, fall back to all role competencies
   - Existing models without weights still work

4. **Weight validation**
   - Must sum to exactly 100%
   - Must have at least one competency selected
   - Each weight must be > 0

---

## 📝 IMPLEMENTATION ORDER

Execute in this exact sequence:

### Day 1: Remove Wrong Behavior
1. Remove role-modifying code from create flow
2. Change "Edit" to "View Role Competencies" link
3. Test that role page still works for admins

### Day 2: Create New Component
4. Create `ModelCompetencySelector.tsx`
5. Add to wizard as new step
6. Test weight validation

### Day 3: Update APIs
7. Update `from-role` API
8. Update `from-wizard` API
9. Add validation

### Day 4: Integration & Testing
10. Test complete flow end-to-end
11. Test multiple users creating models
12. Test edge cases

---

## 🎯 SUCCESS CRITERIA

Implementation is successful when:

✅ **Role stays unchanged** when creating models  
✅ **User can select subset** of role competencies  
✅ **User can set model-specific weights**  
✅ **Weights must sum to 100%**  
✅ **Two users can create different models from same role**  
✅ **Role page is the ONLY place to modify role competencies**  
✅ **Create flow shows "View Role Competencies" link**  
✅ **API accepts competencyWeights and uses only selected competencies**  

---

## 🚀 START IMPLEMENTATION NOW

Begin with Phase A (Remove Role-Modifying Code) and proceed through all phases.

**This is a critical architecture fix - prioritize this above all other features.**
