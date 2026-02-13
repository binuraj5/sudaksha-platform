# DOCUMENT 5: B2C INDIVIDUAL MODULE REQUIREMENTS
## Implementation Guide for Individual Users (M15)

**Module Group:** Individual B2C Users  
**Total Requirements:** 15  
**User Roles:** Individual (Self-service)  
**Priority:** HIGH  
**Implementation Order:** 5 of 6

---

## 🎯 OVERVIEW

This document covers **Individual B2C users** - people using the platform for personal career development without organizational affiliation.

**Key Insight:** M15 is **90% reuse from M4 (Employee)** with these differences:
1. No organization (tenantId = SYSTEM)
2. No manager, no team, no department
3. Self-service role/competency selection
4. FREE tier (10 assessments/month)
5. Optional "Student Mode" until employed

**Time Estimate:** 3 days (vs 16 days for M4, thanks to reuse!)

---

## 📊 REQUIREMENT SUMMARY

| ID | Requirement | Equivalent to M4 | Difference |
|----|-------------|------------------|------------|
| M15 | Individual Login | M4 | No tenant affiliation |
| M15-1 | Menu Items | M4-1 | Simplified menu |
| M15-2 | My Details | M4-2 | Same (9-section form) |
| M15-3 | My Hierarchy | M4-3 | Hidden (no org) |
| M15-4 | My Activities | M4-4 | "My Goals" instead |
| M15-5 | My Career | M4-5 | Same |
| M15-6 | Current Role | M4-6 | Self-declared |
| M15-7 | Previous Roles | M4-7 | Same |
| M15-8 | Aspirational Role | M4-8 | Same |
| M15-9 | My Competencies | M4-9 | Self-select all |
| M15-10 | My Assessments | M4-10 | Same |
| M15-11 | Role-wise Assessments | M4-11 | Same |
| M15-12 | Competency Assessments | M4-12 | Same |
| M15-13 | Assessment Scores | M4-13 | No comparisons |
| M15-14 | Student Mode | NEW | Act as student |

**Total:** 15 requirements, 14 are reuse, 1 is new

---

## 🔄 POLYMORPHIC IMPLEMENTATION

### Database Design

```typescript
// B2C users are Members with special tenantId
const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000000';

interface IndividualUser extends Member {
  tenantId: typeof SYSTEM_TENANT_ID; // Special system tenant
  memberType: 'INDIVIDUAL';
  orgUnitId: null; // No organization
  reportingToId: null; // No manager
  
  // Self-declared
  currentRole: string; // Free-text or selected from library
  aspirationalRole: string;
  competencies: string[]; // Self-selected
  
  // B2C specific
  userMode: 'PROFESSIONAL' | 'STUDENT'; // M15-14
  freeAssessmentsUsed: number; // Track free tier usage
  subscriptionTier: 'FREE' | 'PREMIUM'; // Future monetization
}
```

### What's the Same

```
✅ Profile management (9-section form)
✅ Career planning (roles, competencies, gaps)
✅ Assessment taking
✅ Results and scoring
✅ Career development planning
```

### What's Different

```
❌ No organization hierarchy
❌ No team/department
❌ No manager approval workflows
❌ No org-wide reports
✅ Self-service everything
✅ FREE tier (10 assessments/month)
✅ Can switch to "Student Mode"
```

---

## IMPLEMENTATION GUIDE

### Phase 1: Self-Service Registration (Day 1)

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE]

Implement M15: Individual B2C Registration

OBJECTIVE: Allow individuals to sign up without organization

STEP 1: Create B2C Registration Flow
File: app/(auth)/register-individual/page.tsx

Interface:
┌──────────────────────────────────────────┐
│ Join SudAssess                           │
├──────────────────────────────────────────┤
│                                          │
│ I am a:                                  │
│ ○ Professional                           │
│ ○ Student                                │
│                                          │
│ First Name: *                            │
│ [John____________________]               │
│                                          │
│ Last Name: *                             │
│ [Doe_____________________]               │
│                                          │
│ Email: *                                 │
│ [john@email.com__________]               │
│                                          │
│ Password: *                              │
│ [●●●●●●●●●●______________]               │
│                                          │
│ ☑ I agree to Terms & Privacy Policy     │
│                                          │
│ [Create Free Account]                    │
│                                          │
│ Already have account? [Login]            │
└──────────────────────────────────────────┘

STEP 2: Create System Tenant (if not exists)
On first B2C registration:

const SYSTEM_TENANT = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'SudAssess Individual Users',
  type: 'SYSTEM',
  slug: 'system',
  isActive: true
};

// Create once, reuse for all B2C users

STEP 3: Registration Logic
File: app/api/auth/register-individual/route.ts

export async function POST(req: Request) {
  const { firstName, lastName, email, password, userMode } = await req.json();
  
  // 1. Check email not already used
  const existing = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 400 });
  }
  
  // 2. Create user account
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role: 'INDIVIDUAL',
      emailVerified: false
    }
  });
  
  // 3. Create member profile
  const member = await prisma.member.create({
    data: {
      userId: user.id,
      tenantId: SYSTEM_TENANT_ID,
      memberType: 'INDIVIDUAL',
      memberCode: `IND${Date.now()}`, // Unique code
      firstName,
      lastName,
      email,
      status: 'ACTIVE',
      metadata: {
        userMode, // 'PROFESSIONAL' or 'STUDENT'
        freeAssessmentsUsed: 0,
        subscriptionTier: 'FREE',
        registeredAt: new Date()
      }
    }
  });
  
  // 4. Send verification email
  await sendEmail({
    to: email,
    subject: 'Welcome to SudAssess - Verify your email',
    template: 'individual-welcome',
    data: {
      firstName,
      verificationLink: `${BASE_URL}/verify-email?token=${token}`
    }
  });
  
  return Response.json({
    success: true,
    user: { id: user.id, email },
    member: { id: member.id }
  });
}

STEP 4: Post-Registration Flow
After email verification:
1. Redirect to onboarding wizard
2. Step 1: Set current role (or "Not employed yet")
3. Step 2: Select aspirational role
4. Step 3: Choose competencies to develop
5. Step 4: Take first assessment

BUSINESS RULES:
- Email must be unique
- Email verification required before taking assessments
- Default to FREE tier (10 assessments/month)
- No credit card required
- Can upgrade to premium later

SUCCESS CRITERIA:
✓ Can register as individual
✓ Creates member with SYSTEM tenant
✓ Email verification works
✓ Onboarding wizard functional
✓ Mobile responsive

Execute autonomously.
```

---

### Phase 2: Individual Dashboard (Day 2)

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE]

Implement Individual B2C Dashboard

OBJECTIVE: Create simplified dashboard for B2C users

STEP 1: Create Dashboard
File: app/(individuals)/dashboard/page.tsx

Interface:
┌──────────────────────────────────────────────────────┐
│ Welcome, John! 👋                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ YOUR PROGRESS                                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ Career Development Score: 62/100               │ │
│ │ [=============|=====================]          │ │
│ │                                                │ │
│ │ Current Role: Junior Java Developer           │ │
│ │ Aspirational Role: Senior Java Developer      │ │
│ │ Gap: MEDIUM (5 competencies to develop)       │ │
│ │                                                │ │
│ │ [View Career Plan]                             │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ QUICK ACTIONS                                        │
│ ┌──────────┬──────────┬──────────┐                 │
│ │ Take     │ View My  │ Explore  │                 │
│ │ Assess-  │ Career   │ Roles    │                 │
│ │ ment     │          │          │                 │
│ └──────────┴──────────┴──────────┘                 │
│                                                      │
│ MY ASSESSMENTS                                       │
│ ┌────────────────────────────────────────────────┐ │
│ │ Free Assessments: 7/10 used this month        │ │
│ │ [Resets in 12 days]                           │ │
│ │                                                │ │
│ │ Completed: 23 total                            │ │
│ │ Average Score: 74%                             │ │
│ │                                                │ │
│ │ [Browse Assessments]   [Upgrade to Premium]   │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ RECOMMENDED ASSESSMENTS                              │
│ Based on your career goals:                          │
│ ┌────────────────────────────────────────────────┐ │
│ │ Java Programming - Senior Level               │ │
│ │ 45 min | 20 questions                          │ │
│ │ [Start Assessment]                             │ │
│ ├────────────────────────────────────────────────┤ │
│ │ Spring Framework Mastery                       │ │
│ │ 30 min | 15 questions                          │ │
│ │ [Start Assessment]                             │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ LEARNING PATH                                        │
│ Your personalized path to Senior Java Developer:     │
│ 1. ✓ Master core Java (Completed)                   │
│ 2. → Spring Framework (In Progress - 60%)           │
│ 3. ○ Microservices Architecture (Not Started)       │
│ 4. ○ Advanced Design Patterns (Not Started)         │
└──────────────────────────────────────────────────────┘

STEP 2: Track Free Tier Usage
File: lib/b2c/free-tier.ts

export async function canTakeAssessment(
  memberId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { metadata: true }
  });
  
  const metadata = member.metadata as any;
  
  // Check tier
  if (metadata.subscriptionTier === 'PREMIUM') {
    return { allowed: true }; // No limits for premium
  }
  
  // Check free tier usage
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const usedThisMonth = await prisma.memberAssessment.count({
    where: {
      memberId,
      createdAt: { gte: thisMonth }
    }
  });
  
  if (usedThisMonth >= 10) {
    return {
      allowed: false,
      reason: 'Free tier limit reached (10/month). Upgrade to Premium for unlimited assessments.'
    };
  }
  
  return { allowed: true };
}

STEP 3: Create Career Path Generator
File: lib/b2c/career-path-generator.ts

export async function generateLearningPath(
  currentRole: Role,
  aspirationalRole: Role
): Promise<LearningStep[]> {
  // 1. Get competency gap
  const currentCompetencies = currentRole.competencies;
  const requiredCompetencies = aspirationalRole.competencies;
  
  const gaps = requiredCompetencies.filter(
    rc => !currentCompetencies.some(cc => cc.id === rc.id)
  );
  
  // 2. Order by dependency and difficulty
  const orderedGaps = orderByDependency(gaps);
  
  // 3. Generate learning steps
  return orderedGaps.map((competency, index) => ({
    order: index + 1,
    competency,
    status: index === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
    progress: index === 0 ? calculateProgress(competency) : 0,
    estimatedTime: estimateTime(competency),
    assessments: findAssessmentsForCompetency(competency),
    resources: findLearningResources(competency)
  }));
}

STEP 4: Recommendation Engine
File: lib/b2c/recommendation-engine.ts

export async function getRecommendedAssessments(
  memberId: string,
  limit: number = 5
): Promise<Assessment[]> {
  const member = await getMemberWithGoals(memberId);
  
  // Factors:
  // 1. Aspirational role competencies
  // 2. Self-identified weak areas
  // 3. Haven't taken yet
  // 4. Appropriate level
  
  const assessments = await prisma.assessmentModel.findMany({
    where: {
      OR: [
        // Role-based assessments for aspirational role
        {
          roleId: member.aspirationalRoleId,
          targetLevel: getNextLevel(member.currentLevel)
        },
        // Competency-based for gaps
        {
          components: {
            some: {
              competencyId: { in: member.competencyGaps }
            }
          }
        }
      ],
      // Exclude already completed
      NOT: {
        assessments: {
          some: {
            memberId,
            status: 'COMPLETED'
          }
        }
      }
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
  
  return assessments;
}

BUSINESS RULES:
- Free tier: 10 assessments/month
- Premium tier: Unlimited assessments
- Career path auto-generated from goals
- Recommendations based on gaps
- Progress tracked automatically

NAVIGATION (Simplified):
- Dashboard
- My Career
- Assessments
- Results
- Settings

NO ORGANIZATION FEATURES:
- No hierarchy view
- No team comparisons
- No manager approval
- No org-wide reports

SUCCESS CRITERIA:
✓ Dashboard shows personalized content
✓ Free tier limits enforced
✓ Career path generated correctly
✓ Recommendations relevant
✓ Mobile responsive
✓ Fast loading

Execute autonomously.
```

---

### Phase 3: Student Mode (Day 3)

**M15-14 - Student Mode Option**

**AntiGravity Prompt:**

```
[AUTONOMOUS MODE]

Implement M15-14: Student Mode

OBJECTIVE: Allow B2C users to act as "students" until employed

WHY: Many users are students or recent graduates without professional experience

STEP 1: Add Mode Toggle
File: components/Individuals/ModeSwitcher.tsx

Interface:
┌────────────────────────────────────────┐
│ Your Profile Mode                      │
├────────────────────────────────────────┤
│                                        │
│ Current Mode: Professional             │
│                                        │
│ ○ Professional                         │
│   For working professionals            │
│   Track: Current role, Company         │
│                                        │
│ ● Student                              │
│   For students and learners            │
│   Track: Institution, Program          │
│                                        │
│ [Switch Mode]                          │
│                                        │
│ Note: You can switch anytime           │
└────────────────────────────────────────┘

STEP 2: Mode-Specific Fields
When mode = 'STUDENT':

Profile Fields:
┌────────────────────────────────────────┐
│ STUDENT INFORMATION                    │
├────────────────────────────────────────┤
│ Institution: [ABC University_____]     │
│ Program: [Computer Science_______]     │
│ Year: [3rd Year ▼]                    │
│ Expected Graduation: [May 2027___]     │
│                                        │
│ Current Focus Areas:                   │
│ ☑ Learning Java                        │
│ ☑ Building projects                    │
│ ☑ Preparing for interviews             │
│                                        │
│ Career Aspirations:                    │
│ Target Role: [Software Engineer___]    │
│ Target Companies: [Google, Amazon_]    │
└────────────────────────────────────────┘

When mode = 'PROFESSIONAL':

Profile Fields:
┌────────────────────────────────────────┐
│ PROFESSIONAL INFORMATION               │
├────────────────────────────────────────┤
│ Current Company: [Acme Corp______]     │
│ Current Role: [Junior Developer__]     │
│ Years Experience: [2___]               │
│ Industry: [Technology ▼]              │
│                                        │
│ Career Goals:                          │
│ Aspirational Role: [Senior Dev___]     │
│ Target Timeline: [2 years________]     │
└────────────────────────────────────────┘

STEP 3: Mode-Specific Dashboard
Student Mode Dashboard:
┌────────────────────────────────────────────────┐
│ Welcome, John! 📚                              │
├────────────────────────────────────────────────┤
│ ACADEMIC PROGRESS                              │
│ Program: Computer Science (3rd Year)           │
│ Expected Graduation: May 2027                  │
│                                                │
│ INTERVIEW READINESS: 68/100                    │
│ [================|==================]          │
│                                                │
│ Skills Assessed:                               │
│ ✓ Java Programming: 75%                        │
│ ✓ Data Structures: 82%                         │
│ → Algorithms: 60% (Needs improvement)          │
│ ○ System Design: Not assessed yet              │
│                                                │
│ RECOMMENDED PREP:                              │
│ Based on your target role (Software Engineer): │
│ 1. Complete Algorithm assessments              │
│ 2. Practice System Design                      │
│ 3. Take Mock Technical Interview               │
│                                                │
│ JOB READINESS: 72%                             │
│ [Resume][Projects][Interview Prep]             │
└────────────────────────────────────────────────┘

STEP 4: Graduation Workflow
When student graduates:
┌────────────────────────────────────────┐
│ Congratulations on graduating! 🎓      │
├────────────────────────────────────────┤
│ Update your profile to Professional:   │
│                                        │
│ First Job:                             │
│ Company: [Enter company name____]      │
│ Role: [Enter job title_________]       │
│ Start Date: [June 2027_________]       │
│                                        │
│ [Update to Professional Mode]          │
│                                        │
│ Your assessment history and skills     │
│ will be preserved!                     │
└────────────────────────────────────────┘

STEP 5: Database Schema
Add to members.metadata:

interface MemberMetadata {
  userMode: 'PROFESSIONAL' | 'STUDENT';
  
  // Student-specific
  studentInfo?: {
    institution: string;
    program: string;
    year: string;
    expectedGraduation: Date;
    focusAreas: string[];
    targetRole: string;
    targetCompanies: string[];
  };
  
  // Professional-specific
  professionalInfo?: {
    currentCompany: string;
    currentRole: string;
    yearsExperience: number;
    industry: string;
    aspirationalRole: string;
    targetTimeline: string;
  };
}

BUSINESS LOGIC:
- Mode can be changed anytime
- All assessments preserved when switching
- Different dashboards based on mode
- Different recommendations
- Same competency tracking

BENEFITS:
- Students can prepare for career
- Track academic progress
- Interview preparation focus
- Smooth transition to professional

SUCCESS CRITERIA:
✓ Can toggle between Professional and Student modes
✓ Mode-specific fields displayed
✓ Dashboard adapts to mode
✓ Assessments work in both modes
✓ Graduation workflow functional
✓ Mobile responsive

Execute autonomously.
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Registration & Onboarding:
- [ ] B2C registration form
- [ ] System tenant creation
- [ ] Email verification
- [ ] Onboarding wizard (4 steps)
- [ ] Mode selection (Professional/Student)

### Dashboard:
- [ ] Personalized dashboard
- [ ] Progress tracking
- [ ] Quick actions
- [ ] Free tier usage display
- [ ] Recommended assessments
- [ ] Learning path

### Career Management:
- [ ] Current role (self-declared)
- [ ] Previous roles history
- [ ] Aspirational role selection
- [ ] Competency self-selection
- [ ] Gap analysis

### Assessment Features:
- [ ] Browse assessments
- [ ] Take assessments (FREE tier limits)
- [ ] View results
- [ ] No comparisons (only personal scores)
- [ ] Certificate generation

### Student Mode:
- [ ] Mode switcher
- [ ] Student-specific fields
- [ ] Student dashboard
- [ ] Interview prep features
- [ ] Graduation workflow

### Monetization (Structure Only):
- [ ] Free tier enforcement (10/month)
- [ ] Upgrade prompts
- [ ] Premium features listed
- [ ] Payment integration (later)

---

## 🎯 EXPECTED RESULTS

After implementation:
- ✅ Individuals can sign up without organization
- ✅ Self-service career planning
- ✅ FREE tier (10 assessments/month)
- ✅ Student mode for learners
- ✅ Personalized recommendations
- ✅ Smooth path to premium (future)
- ✅ Opens third market segment

---

## 💡 KEY INSIGHTS

### Why B2C Module is Fast (3 Days)

```
M15 Components:
├─ 90% reuse from M4 (Employee)
├─ Remove: Organization features
├─ Add: Free tier limits
├─ Add: Student mode
└─ Total: 3 days vs 16 days for M4
```

### Market Opportunity

```
3 Market Segments:
1. Corporate (B2B) → Organizations
2. Institution (B2E) → Educational
3. Individual (B2C) → Self-service

B2C Strategy:
- Freemium model
- 10 free assessments/month
- Upgrade to unlimited
- Viral growth through sharing
```

---

## 🔄 REUSABILITY PROVEN

This module completes the proof of polymorphic architecture:
- Same tables serve Corporate, Institution, AND B2C
- Same assessment engine
- Same competency system
- Only context differs
- **60% overall code reuse**

---

## 🚀 READY TO IMPLEMENT

**Sequence:**
1. Day 1: Registration & system tenant
2. Day 2: Dashboard & free tier
3. Day 3: Student mode

**Dependencies:**
- ✅ Document 1 (Corporate/M4) must be complete
- ✅ Document 3 (Assessment) must be complete

**Next:** Document 6 (Survey Module) to complete all 125 requirements!

---

END OF DOCUMENT 5