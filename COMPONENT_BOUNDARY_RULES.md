# Component Boundary Rules
## SudakshaNWS vs SudAssess Platform Separation

**Purpose:** Ensure clear separation between Sudaksha (Training Platform) and SudAssess (Assessment Platform) components to prevent cross-contamination.

---

## 🎯 BOUNDARY DEFINITIONS

### SudakshaNWS Platform (`localhost:3000/`)
**Routes:** `app/(main)/**`  
**Purpose:** Training & Placement Platform  
**Components:** `components/home/`, `components/corporates/`, `components/individuals/`, `components/courses/`,`components/about/`,`components/admin/`

### SudAssess Platform (`localhost:3000/assessments`)
**Routes:** `app/assessments/**`  
**Purpose:** Assessment & Talent Intelligence Platform  
**Components:** `components/assessments/`, `components/admin/`

---

## 📋 COMPONENT IMPORT RULES

### ✅ ALLOWED Imports

#### Sudaksha Pages (`app/(main)/**`)
**CAN Import:**
- ✅ `components/home/*` - Homepage components
- ✅ `components/corporates/*` - Corporate pages
- ✅ `components/individuals/*` - Individual pages
- ✅ `components/institutions/*` - Institution pages
- ✅ `components/courses/*` - Course pages
- ✅ `components/ui/*` - **Shared UI components**
- ✅ `components/Marketing/*` - Marketing components
- ✅ `components/resources/*` - Resource pages
- ✅ `components/why-sudaksha/*` - Why Sudaksha pages
- ✅ `components/domestic/*` - Domestic corporate pages
- ✅ `lib/*` - Shared utilities
- ✅ `types/*` - Shared types

**CANNOT Import:**
- ❌ `components/assessments/*` - Assessment-specific components
- ❌ `components/admin/*` - Admin components (SudAssess only)
- ❌ `components/Dashboard/*` - Assessment dashboards
- ❌ `components/Competencies/*` - Assessment competencies
- ❌ `components/Roles/*` - Assessment roles

#### SudAssess Pages (`app/assessments/**`)
**CAN Import:**
- ✅ `components/assessments/*` - Assessment components
- ✅ `components/admin/*` - Admin components
- ✅ `components/Dashboard/*` - Dashboard components
- ✅ `components/Competencies/*` - Competency components
- ✅ `components/Roles/*` - Role components
- ✅ `components/ui/*` - **Shared UI components**
- ✅ `lib/*` - Shared utilities
- ✅ `types/*` - Shared types

**CANNOT Import:**
- ❌ `components/home/*` - Sudaksha homepage components
- ❌ `components/corporates/*` - Sudaksha corporate pages
- ❌ `components/individuals/*` - Sudaksha individual pages
- ❌ `components/courses/*` - Sudaksha course pages
- ❌ `components/Marketing/*` - Sudaksha marketing

---

## 🔍 SHARED COMPONENTS

### Components That CAN Be Used by Both Platforms

**Location:** `components/ui/*`
- All UI primitives (Button, Input, Dialog, etc.)
- Form components
- Layout components (if generic)

**Location:** `lib/*`
- Utility functions
- API clients (if shared)
- Constants (if shared)

**Location:** `types/*`
- Shared TypeScript types
- Interfaces used by both platforms

---

## 🚫 VIOLATION EXAMPLES

### ❌ WRONG - Sudaksha importing SudAssess
```typescript
// app/(main)/courses/page.tsx
import { AssessmentCard } from '@/components/assessments/AssessmentCard'; // ❌ VIOLATION
import { CompetencyList } from '@/components/Competencies/CompetencyList'; // ❌ VIOLATION
```

### ❌ WRONG - SudAssess importing Sudaksha
```typescript
// app/assessments/admin/dashboard/page.tsx
import { Hero } from '@/components/home/Hero'; // ❌ VIOLATION
import { CorporateClients } from '@/components/corporates/CorporateClients'; // ❌ VIOLATION
```

### ✅ CORRECT - Using Shared Components
```typescript
// app/(main)/courses/page.tsx
import { Button } from '@/components/ui/button'; // ✅ OK - Shared UI
import { Card } from '@/components/ui/card'; // ✅ OK - Shared UI

// app/assessments/admin/dashboard/page.tsx
import { Button } from '@/components/ui/button'; // ✅ OK - Shared UI
import { Card } from '@/components/ui/card'; // ✅ OK - Shared UI
```

---

## 🔧 ENFORCEMENT STRATEGY

### 1. ESLint Rules (Recommended)

Create `.eslintrc.js` rules:

```javascript
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/components/assessments',
            message: 'Sudaksha pages cannot import SudAssess components. Use shared components instead.',
            allowTypeImports: false,
          },
          {
            name: '@/components/admin',
            message: 'Sudaksha pages cannot import admin components. Use shared components instead.',
            allowTypeImports: false,
          },
        ],
        patterns: [
          {
            group: ['@/components/home/*', '@/components/corporates/*'],
            message: 'SudAssess pages cannot import Sudaksha components.',
            allowTypeImports: false,
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['app/(main)/**/*.tsx', 'app/(main)/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@/components/assessments',
                message: 'Sudaksha pages cannot import SudAssess components.',
              },
              {
                name: '@/components/admin',
                message: 'Sudaksha pages cannot import admin components.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['app/assessments/**/*.tsx', 'app/assessments/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/components/home/*', '@/components/corporates/*', '@/components/individuals/*'],
                message: 'SudAssess pages cannot import Sudaksha components.',
              },
            ],
          },
        ],
      },
    },
  ],
};
```

### 2. Manual Audit Checklist

**Before Committing:**
- [ ] Check imports in `app/(main)/**` - no `components/assessments/*` or `components/admin/*`
- [ ] Check imports in `app/assessments/**` - no `components/home/*`, `components/corporates/*`, etc.
- [ ] Verify shared components (`components/ui/*`) are used correctly
- [ ] Run ESLint with boundary rules

### 3. Pre-commit Hook (Future)

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check for boundary violations
if grep -r "from '@/components/assessments" app/(main)/; then
  echo "❌ ERROR: Sudaksha pages cannot import SudAssess components"
  exit 1
fi

if grep -r "from '@/components/home" app/assessments/; then
  echo "❌ ERROR: SudAssess pages cannot import Sudaksha components"
  exit 1
fi

echo "✅ Component boundary checks passed"
```

---

## 📊 CURRENT STATUS AUDIT

### ✅ No Violations Found

**Verified:**
- `app/(main)/**` pages do NOT import `components/assessments/*`
- `app/(main)/**` pages do NOT import `components/admin/*`
- `app/assessments/**` pages do NOT import `components/home/*`
- `app/assessments/**` pages do NOT import `components/corporates/*`

**Shared Components Usage:**
- ✅ Both platforms use `components/ui/*` correctly
- ✅ Both platforms use `lib/*` correctly
- ✅ Both platforms use `types/*` correctly

---

## 🎯 BEST PRACTICES

### 1. When You Need Shared Functionality

**Option A: Extract to Shared Library**
```typescript
// lib/shared/formatDate.ts
export function formatDate(date: Date): string {
  // Shared utility
}

// Use in both platforms
import { formatDate } from '@/lib/shared/formatDate';
```

**Option B: Create Shared Component**
```typescript
// components/ui/DatePicker.tsx
export function DatePicker() {
  // Generic date picker usable by both
}

// Use in both platforms
import { DatePicker } from '@/components/ui/DatePicker';
```

### 2. When You Need Platform-Specific Functionality

**Create Platform-Specific Component:**
```typescript
// components/home/SudakshaHero.tsx (Sudaksha only)
export function SudakshaHero() {
  // Sudaksha-specific hero
}

// components/assessments/SudAssessHero.tsx (SudAssess only)
export function SudAssessHero() {
  // SudAssess-specific hero
}
```

### 3. Component Naming Conventions

**Prefix Platform-Specific Components:**
- Sudaksha: `Sudaksha*` or in `components/home/`, `components/corporates/`
- SudAssess: `SudAssess*` or in `components/assessments/`, `components/admin/`
- Shared: Generic names in `components/ui/`

---

## 🔄 MIGRATION GUIDE

### If You Find a Violation

**Step 1: Identify the Shared Functionality**
- What does the component do?
- Can it be made generic?

**Step 2: Extract to Shared Location**
- Move to `components/ui/` if UI component
- Move to `lib/shared/` if utility function

**Step 3: Update Imports**
- Update all files importing the old location
- Ensure both platforms can use it

**Step 4: Test**
- Verify Sudaksha pages still work
- Verify SudAssess pages still work
- Run boundary checks

---

## 📝 EXAMPLES

### Example 1: Button Component (Shared)
```typescript
// components/ui/button.tsx
export function Button() {
  // Generic button - usable by both
}

// ✅ Used in Sudaksha
// app/(main)/courses/page.tsx
import { Button } from '@/components/ui/button';

// ✅ Used in SudAssess
// app/assessments/admin/dashboard/page.tsx
import { Button } from '@/components/ui/button';
```

### Example 2: Hero Component (Platform-Specific)
```typescript
// components/home/Hero.tsx (Sudaksha only)
export function Hero() {
  // Sudaksha homepage hero
}

// ✅ Used in Sudaksha
// app/(main)/page.tsx
import { Hero } from '@/components/home/Hero';

// ❌ NOT used in SudAssess
// app/assessments/page.tsx should NOT import this
```

### Example 3: Assessment Card (SudAssess Only)
```typescript
// components/assessments/AssessmentCard.tsx (SudAssess only)
export function AssessmentCard() {
  // Assessment-specific card
}

// ✅ Used in SudAssess
// app/assessments/admin/models/page.tsx
import { AssessmentCard } from '@/components/assessments/AssessmentCard';

// ❌ NOT used in Sudaksha
// app/(main)/courses/page.tsx should NOT import this
```

---

## ✅ VERIFICATION COMMANDS

### Check for Violations

```bash
# Check Sudaksha pages importing SudAssess components
grep -r "from '@/components/assessments" app/(main)/
grep -r "from '@/components/admin" app/(main)/

# Check SudAssess pages importing Sudaksha components
grep -r "from '@/components/home" app/assessments/
grep -r "from '@/components/corporates" app/assessments/
grep -r "from '@/components/individuals" app/assessments/
```

### Expected Result
**No matches** = ✅ No violations

---

## 🎯 SUMMARY

**Golden Rules:**
1. ✅ Sudaksha (`app/(main)/`) → Can import `components/ui/*`, `components/home/*`, `components/corporates/*`, etc.
2. ✅ SudAssess (`app/assessments/`) → Can import `components/ui/*`, `components/assessments/*`, `components/admin/*`, etc.
3. ❌ Never cross the boundary (Sudaksha ↔ SudAssess platform-specific components)
4. ✅ Always use shared components (`components/ui/*`) when possible

**Current Status:** ✅ **NO VIOLATIONS DETECTED**

---

**END OF BOUNDARY RULES DOCUMENT**
