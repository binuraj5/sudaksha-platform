# CURSOR: REUSE EXISTING COMPONENTS INSTRUCTION

## 🎯 CRITICAL RULE: REUSE, DON'T RECREATE

Before implementing anything from CURSOR_ASSESSMENT_BUILDER_PROMPT.md, you MUST:

---

## STEP 1: AUDIT EXISTING COMPONENTS

Run this investigation FIRST:

```bash
# Find existing UI components
find components/ -name "*.tsx" -o -name "*.jsx"

# Find existing assessment-related files
find . -path ./node_modules -prune -o -name "*assessment*" -type f

# Find existing API routes
find app/api -name "route.ts"

# Check existing Prisma models
cat prisma/schema.prisma | grep "model "
```

**Report back with:**
- What assessment components already exist
- What API endpoints are already implemented
- What database models are already defined

---

## STEP 2: REUSE CHECKLIST

Before creating ANY new file, check if you can reuse existing:

### UI Components (Check these first):
- [ ] Is there an existing `Button` component? → Use it, don't create new
- [ ] Is there an existing `Card` component? → Use it, don't create new
- [ ] Is there an existing `Dialog`/`Modal` component? → Use it, don't create new
- [ ] Is there an existing `Badge` component? → Use it, don't create new
- [ ] Is there an existing `Input`/`Select` component? → Use it, don't create new
- [ ] Is there an existing `Table` component? → Use it, don't create new
- [ ] Is there an existing form components? → Use them, don't create new

### Assessment Components (Check these):
- [ ] Is there an `AssessmentModel` Prisma model? → Extend it, don't replace
- [ ] Is there an existing assessment creation flow? → Build on it, don't replace
- [ ] Are there existing question components? → Reuse them
- [ ] Is there an existing role selector? → Enhance it, don't recreate

### API Routes (Check these):
- [ ] Does `/api/assessments/admin/models` exist? → Extend it, don't replace
- [ ] Are there existing assessment APIs? → Build on them
- [ ] Is there an OpenAI integration? → Reuse the pattern

---

## STEP 3: IMPLEMENTATION PATTERN

**For each new feature, follow this pattern:**

### ❌ WRONG WAY (Don't do this):
```typescript
// Creating entirely new components from scratch
export function NewButton() { ... }
export function NewCard() { ... }
export function NewDialog() { ... }
```

### ✅ RIGHT WAY (Do this):
```typescript
// Import and use existing components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';

// Build NEW functionality using EXISTING components
export function AssessmentBuilderWizard() {
  return (
    <Card>
      <Dialog>
        <Button>Use Existing Components</Button>
      </Dialog>
    </Card>
  );
}
```

---

## STEP 4: EXTENSION PATTERN

### For Prisma Schema:
```prisma
// ❌ WRONG - Don't recreate existing models
model AssessmentModel {
  id String @id
  // ... all fields redefined
}

// ✅ RIGHT - Extend existing model by adding new fields
model AssessmentModel {
  // ... existing fields remain untouched ...
  
  // NEW FIELDS ONLY:
  visibility         String   @default("PRIVATE")
  completionPercentage Int     @default(0)
  // ... only new additions
}
```

### For React Components:
```typescript
// ❌ WRONG - Creating duplicate component
export function MyCustomButton() {
  return <button>Click me</button>
}

// ✅ RIGHT - Using existing component with new props
import { Button } from '@/components/ui/button';

export function FeatureButton() {
  return (
    <Button 
      variant="default" 
      size="lg"
      onClick={handleNewFeature}
    >
      New Feature
    </Button>
  );
}
```

### For API Routes:
```typescript
// ❌ WRONG - Completely replacing existing route
// app/api/assessments/admin/models/route.ts
export async function GET() {
  // Entirely new implementation that breaks existing
}

// ✅ RIGHT - Extending existing route functionality
// app/api/assessments/admin/models/route.ts
export async function GET() {
  // Keep existing logic...
  const models = await existingFetchLogic();
  
  // Add new filtering if needed
  if (newFilterParam) {
    // Apply new filter
  }
  
  return models; // Maintain existing response structure
}
```

---

## STEP 5: FILE ORGANIZATION

**Before creating new files, check existing structure:**

### Existing Structure Example:
```
components/
  ├── ui/              (Base UI components - USE THESE)
  │   ├── button.tsx
  │   ├── card.tsx
  │   └── dialog.tsx
  ├── assessment/      (Assessment-specific - ADD HERE)
  │   ├── ModelList.tsx
  │   └── CreateModel.tsx (existing)
  └── forms/           (Form components - USE THESE)

app/
  ├── api/
  │   └── assessments/
  │       └── admin/
  │           └── models/
  │               └── route.ts (existing - EXTEND THIS)
  └── assessments/
      └── admin/
          └── models/
              └── page.tsx (existing - ENHANCE THIS)
```

### Where to Add New Files:
```
components/
  └── assessment/
      ├── AssessmentBuilderWizard.tsx    (NEW - add here)
      ├── ComponentBuildingView.tsx      (NEW - add here)
      └── LibraryBrowser.tsx             (NEW - add here)

lib/
  └── assessment/
      ├── component-suggester.ts         (NEW - add here)
      └── ai-generator.ts                (NEW - add here)
```

---

## STEP 6: SAFE IMPLEMENTATION CHECKLIST

Before making ANY changes:

### Database Changes:
- [ ] I've reviewed the existing Prisma schema
- [ ] I'm only ADDING fields, not removing or replacing existing ones
- [ ] I'm not changing existing field types
- [ ] I'm adding indexes for new fields if needed
- [ ] I've marked new fields as optional (nullable) for backwards compatibility

### API Changes:
- [ ] I've tested existing API endpoints before modifying
- [ ] I'm only ADDING new endpoints or EXTENDING existing ones
- [ ] I'm not breaking existing request/response formats
- [ ] I'm maintaining backwards compatibility
- [ ] I've added new query parameters without removing existing ones

### UI Changes:
- [ ] I've imported and used existing UI components
- [ ] I'm not creating duplicate components
- [ ] I'm following the existing design system
- [ ] I'm using existing styling patterns (Tailwind classes)
- [ ] I'm maintaining consistent spacing and layout

---

## EXAMPLE: CORRECT IMPLEMENTATION FLOW

### Task: Add Component Library Feature

**STEP 1: Check what exists**
```bash
# Find existing library code
find . -name "*library*" -type f

# Find existing modal/dialog components
find components/ -name "*dialog*" -o -name "*modal*"
```

**STEP 2: Reuse existing components**
```typescript
// components/assessment/LibraryBrowser.tsx (NEW FILE)
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'; // EXISTING
import { Button } from '@/components/ui/button'; // EXISTING
import { Card, CardContent } from '@/components/ui/card'; // EXISTING
import { Badge } from '@/components/ui/badge'; // EXISTING

export function LibraryBrowser() {
  // NEW functionality using EXISTING components
  return (
    <Dialog>
      <DialogHeader>Browse Component Library</DialogHeader>
      <DialogContent>
        <Card>
          <CardContent>
            <Badge>MCQ</Badge>
            <Button>Select</Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
```

**STEP 3: Extend existing API**
```typescript
// app/api/assessments/library/route.ts (NEW FILE)
import { getCurrentUser } from '@/lib/auth'; // EXISTING
import { prisma } from '@/lib/prisma'; // EXISTING

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(); // REUSE existing auth
  
  // NEW library fetching logic
  const components = await prisma.componentLibrary.findMany({
    // ...
  });
  
  return NextResponse.json({ components });
}
```

**STEP 4: Extend existing database**
```prisma
// prisma/schema.prisma
model AssessmentComponent {
  // ... ALL EXISTING FIELDS REMAIN UNCHANGED ...
  
  // ADD ONLY NEW FIELDS:
  isFromLibrary      Boolean  @default(false)
  libraryComponentId String?  @db.Uuid
}

// ADD NEW TABLE (doesn't affect existing):
model ComponentLibrary {
  id String @id @default(uuid()) @db.Uuid
  // ... new fields
}
```

---

## 🚨 IMMEDIATE ACTION REQUIRED

Before implementing ANYTHING from the assessment builder prompt:

1. **STOP and run the audit commands** (Step 1)
2. **Report to me:**
   - What components exist
   - What APIs exist
   - What database models exist
3. **Wait for my confirmation** before proceeding
4. **Then implement** using REUSE pattern, not RECREATE pattern

---

## 📝 RESPONSE FORMAT REQUIRED

After running the audit, respond with:

```markdown
## AUDIT REPORT

### Existing UI Components Found:
- components/ui/button.tsx (will reuse)
- components/ui/card.tsx (will reuse)
- components/assessment/ModelList.tsx (will extend)
... (list all)

### Existing API Routes Found:
- app/api/assessments/admin/models/route.ts (will extend)
... (list all)

### Existing Prisma Models Found:
- AssessmentModel (will add fields to)
- AssessmentComponent (will add fields to)
... (list all)

### Implementation Plan:
1. REUSE Button, Card, Dialog from /components/ui/
2. CREATE NEW AssessmentBuilderWizard.tsx in /components/assessment/
3. EXTEND existing model API at /api/assessments/admin/models/
4. ADD NEW FIELDS to existing Prisma models
5. DO NOT recreate any existing components

Ready to proceed with reuse-first approach?
```

---

## ✅ FINAL CHECKLIST

Before writing any code:

- [ ] I've run the audit commands
- [ ] I've listed all existing components
- [ ] I've identified what can be reused
- [ ] I have a clear plan that shows REUSE over RECREATE
- [ ] I've received confirmation to proceed
- [ ] I understand I must EXTEND, not REPLACE

**DO NOT PROCEED WITHOUT COMPLETING THIS CHECKLIST**

---

**Now run the audit and report back before implementing anything.**
