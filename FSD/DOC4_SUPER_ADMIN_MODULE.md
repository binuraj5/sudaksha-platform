# DOCUMENT 4: SUPER ADMIN MODULE REQUIREMENTS
## Implementation Guide for Super Admin Features (M11-M14) + Homepage & Pricing

**Module Group:** Super Admin (Sudaksha)  
**Total Requirements:** 5 core + Homepage + Pricing + Usage Analytics  
**User Roles:** Super Admin only  
**Priority:** HIGH  
**Implementation Order:** 4 of 6

---

## 🎯 OVERVIEW

This document covers **Super Admin features** that manage the entire platform:
- Competency management
- Approval workflow for tenant-submitted roles/competencies
- Institution tenant management
- Usage analytics and billing
- **PLUS:** Public homepage and pricing pages

**Key Responsibilities:**
- Review and approve tenant submissions
- Manage global competencies and roles
- Monitor platform usage across all tenants
- Configure pricing and billing
- Manage institution-specific features

---

## 📊 REQUIREMENT SUMMARY

| ID | Requirement | Priority | Time |
|----|-------------|----------|------|
| M11 | Enhanced Competency Form | MEDIUM | 1 day |
| M12 | Admin Approvals Queue | CRITICAL | 2 days |
| M13 | Institution Tenant Creation | HIGH | 0.5 days |
| M14 | Institution Management Tab | HIGH | 0.5 days |
| M14-1 | Institution-Specific Models | MEDIUM | 1 day |
| **BONUS** | Public Homepage | HIGH | 1 day |
| **BONUS** | Pricing Page & Calculator | HIGH | 2 days |
| **BONUS** | Usage Analytics Dashboard | HIGH | 2 days |
| **TOTAL** | **8 features** | | **~10 days** |

---

## M11: ENHANCED COMPETENCY FORM

### M11 - Add/Modify Competency Form
**ID:** M11  
**Priority:** MEDIUM  
**Type:** Competency Management

**Requirements:**
- Better competency creation form
- Category organization
- Industry tagging
- Level-based indicator management
- Preview before save

**Current Status:** Basic form exists at `/assessments/admin/competencies/create`

**Enhancement Needed:** Improve UX and add advanced features
[AUTONOMOUS MODE]

Implement M11: Enhanced Competency Form

OBJECTIVE: Improve the existing competency creation form with better UX and advanced features

CURRENT LOCATION: app/assessments/admin/competencies/create/page.tsx

ENHANCEMENTS NEEDED:

1. Improve Form Layout:
   File: components/Competencies/EnhancedCompetencyForm.tsx
   
   Structure:
   ┌─────────────────────────────────────────────────────┐
   │ Create Competency                                   │
   ├─────────────────────────────────────────────────────┤
   │ BASIC INFORMATION                                   │
   │ ┌─────────────────────────────────────────────────┐│
   │ │ Name: *                                         ││
   │ │ [_________________________________________]     ││
   │ │                                                 ││
   │ │ Code: (auto-generated)                          ││
   │ │ [COMP-001] (editable)                          ││
   │ │                                                 ││
   │ │ Category: *                                     ││
   │ │ [Technical ▼]                                  ││
   │ │   - Funtional                                   ││
   │ │   - Behavioral                                  ││
   │ │   - Leadership                                  ││
   │ │   - Communication                               ││
   │ │                                                 ││
   │ │ Industry Tags: (multi-select)                   ││
   │ │ [Technology] [Finance] [Healthcare] [+]        ││
   │ │                                                 ││
   │ │ Description:                                    ││
   │ │ [Rich text editor_________________________]    ││
   │ └─────────────────────────────────────────────────┘│
   │                                                     │
   │ INDICATORS BY LEVEL                                 │
   │ ┌─────────────────────────────────────────────────┐│
   │ │ Tabs: [Junior] [Middle] [Senior] [Expert]      ││
   │ │                                                 ││
   │ │ JUNIOR LEVEL:                                   ││
   │ │                                                 ││
   │ │ Positive Indicators 5 each (What to look for): ││
   │ │ ┌─────────────────────────────────────────────┐││
   │ │ │ 1. Understands basic concepts               │││
   │ │ │    [Edit] [Delete]                          │││
   │ │ │ 2. Can follow instructions                  │││
   │ │ │    [Edit] [Delete]                          │││
   │ │ └─────────────────────────────────────────────┘││
   │ │ [+ Add Positive Indicator]                      ││
   │ │                                                 ││
   │ │ Negative Indicators 5 each(Red flags):          ││
   │ │ ┌─────────────────────────────────────────────┐││
   │ │ │ 1. Makes frequent basic mistakes            │││
   │ │ │    [Edit] [Delete]                          │││
   │ │ └─────────────────────────────────────────────┘││
   │ │ [+ Add Negative Indicator]                      ││
   │ └─────────────────────────────────────────────────┘│
   │                                                     │
   │ PREVIEW                                             │
   │ [Show Preview]                                      │
   │                                                     │
   │ [Cancel]        [Save as Draft]    [Publish]       │
   └─────────────────────────────────────────────────────┘

2. Add Category Management:
   File: lib/competency-categories.ts
   
   export const COMPETENCY_CATEGORIES = {
     Functional Skill: {
       label: 'Technical',
       description: 'Hard skills specific to a domain',
       icon: '🔧',
       examples: ['Programming', 'Data Analysis', 'Design']
     },
     BEHAVIORAL: {
       label: 'Behavioral',
       description: 'Soft skills and personality traits',
       icon: '🧠',
       examples: ['Problem Solving', 'Adaptability', 'Teamwork']
     },
     LEADERSHIP: {
       label: 'Leadership',
       description: 'Management and leadership abilities',
       icon: '👔',
       examples: ['Decision Making', 'Delegation', 'Vision']
     },
     COMMUNICATION: {
       label: 'Communication',
       description: 'Interpersonal and presentation skills',
       icon: '💬',
       examples: ['Public Speaking', 'Writing', 'Active Listening']
     }
   };

3. Add Industry Tagging:
   Database Schema:
   
   ALTER TABLE competencies ADD COLUMN industry_tags TEXT[];
   CREATE INDEX idx_competencies_industry ON competencies USING GIN(industry_tags);
   
   UI Component:
   - Tag input with autocomplete
   - Common industries: Technology, Finance, Healthcare, Education, Manufacturing, Retail
   - Custom tags allowed
   - Multi-select

4. Improve Indicator Management:
   File: components/Competencies/IndicatorManager.tsx
   
   Features:
   - Tabbed interface for each level
   - Separate lists for positive/negative indicators
   - Drag & drop reordering
   - Inline editing
   - Bulk actions (duplicate to next level, delete all)
   - Preview mode

5. Add Preview Component:
   File: components/Competencies/CompetencyPreview.tsx
   
   Shows:
   - How competency will appear in role selection
   - How indicators will display in assessment builder
   - Example usage in assessments
   
   Preview:
   ┌──────────────────────────────────────────┐
   │ Preview: Java Programming                │
   ├──────────────────────────────────────────┤
   │ Category: Technical                      │
   │ Industries: Technology, Finance          │
   │                                          │
   │ Description:                             │
   │ Ability to write and maintain Java...   │
   │                                          │
   │ JUNIOR LEVEL (5 indicators)              │
   │ ✓ 3 positive, ✗ 2 negative              │
   │                                          │
   │ MIDDLE LEVEL (7 indicators)              │
   │ ✓ 5 positive, ✗ 2 negative              │
   │                                          │
   │ SENIOR LEVEL (8 indicators)              │
   │ ✓ 6 positive, ✗ 2 negative              │
   │                                          │
   │ EXPERT LEVEL (6 indicators)              │
   │ ✓ 5 positive, ✗ 1 negative              │
   │                                          │
   │ Used in 3 roles:                         │
   │ - Java Developer                         │
   │ - Backend Engineer                       │
   │ - Full Stack Developer                   │
   └──────────────────────────────────────────┘

BUSINESS RULES:
- At least 5 positive indicators per level required
- At least 5 negative indicator per level recommended
- Name must be unique
- Category required
- At least 1 industry tag recommended

VALIDATION:
- Name: 3-100 chars
- Description: 50-500 chars
- Each indicator: 10-200 chars
- Min 3 indicators per level
- Industry tags: 1-10 tags

SUCCESS CRITERIA:
✓ Form is more intuitive than current version
✓ Category selection works
✓ Industry tagging functional
✓ Indicator management improved
✓ Preview shows complete view
✓ Validation comprehensive
✓ Mobile responsive

Execute autonomously.
```

---

## M12: ADMIN APPROVALS QUEUE

### M12 - Admin Approvals (Roles & Competencies)
**ID:** M12  
**Priority:** CRITICAL  
**Type:** Approval Workflow

**Requirements:**
- Approval queue dashboard
- Review submitted roles and competencies
- Approve, Reject, or Modify submissions
- Send feedback to requester
- Track approval history
- Notification system

**This is the most critical Super Admin feature!**

[AUTONOMOUS MODE - CRITICAL]

Implement M12: Admin Approvals Queue

OBJECTIVE: Build complete approval workflow for tenant-submitted roles and competencies

IMPORTANCE: This is what allows tenants to request custom roles/competencies while maintaining quality control.

REQUIREMENTS:

1. Create Approvals Dashboard:
   File: app/(admin)/admin/approvals/page.tsx
   
   Layout:
   ┌─────────────────────────────────────────────────────────┐
   │ Approval Queue                                          │
   ├─────────────────────────────────────────────────────────┤
   │ Tabs: [Pending (5)] [Approved] [Rejected] [All]        │
   │                                                         │
   │ Filters:                                                │
   │ Type: [All ▼] Date: [Last 30 days ▼] Tenant: [All ▼]  │
   │                                                         │
   │ PENDING APPROVALS (5)                                   │
   │ ┌─────────────────────────────────────────────────────┐│
   │ │ 🔵 ROLE | Senior DevOps Engineer                    ││
   │ │    Submitted by: Acme Corp | 2 days ago             ││
   │ │    Level: SENIOR | Competencies: 8                  ││
   │ │    [Review] [Quick Approve] [Quick Reject]          ││
   │ └─────────────────────────────────────────────────────┘│
   │ ┌─────────────────────────────────────────────────────┐│
   │ │ 🔵 COMPETENCY | Kubernetes Administration           ││
   │ │    Submitted by: Tech Startup | 5 hours ago         ││
   │ │    Category: Technical | Indicators: 24             ││
   │ │    [Review] [Quick Approve] [Quick Reject]          ││
   │ └─────────────────────────────────────────────────────┘│
   │                                                         │
   │ Stats:                                                  │
   │ - Pending: 5                                            │
   │ - Avg Review Time: 1.5 days                            │
   │ - Approval Rate: 78%                                    │
   └─────────────────────────────────────────────────────────┘

2. Create Review Dialog:
   File: components/Admin/ApprovalReviewDialog.tsx
   
   Interface:
   ┌─────────────────────────────────────────────────────────┐
   │ Review Submission: Senior DevOps Engineer               │
   ├─────────────────────────────────────────────────────────┤
   │ Tabs: [Original] [Your Changes] [Diff View]            │
   │                                                         │
   │ ORIGINAL SUBMISSION:                                    │
   │ ┌─────────────────────────────────────────────────────┐│
   │ │ Name: Senior DevOps Engineer                        ││
   │ │ Level: SENIOR                                       ││
   │ │ Description: Manages cloud infrastructure...        ││
   │ │                                                     ││
   │ │ Competencies (8):                                   ││
   │ │ ✓ Kubernetes Administration                         ││
   │ │ ✓ Docker Containerization                           ││
   │ │ ✓ CI/CD Pipeline Management                         ││
   │ │ ✓ AWS Services                                      ││
   │ │ ✓ Infrastructure as Code                            ││
   │ │ ✓ Monitoring & Logging                              ││
   │ │ ✓ Security Best Practices                           ││
   │ │ ✓ Team Leadership                                   ││
   │ └─────────────────────────────────────────────────────┘│
   │                                                         │
   │ YOUR MODIFICATIONS (optional):                          │
   │ ┌─────────────────────────────────────────────────────┐│
   │ │ Name: [Senior DevOps Engineer____________]          ││
   │ │ Description: [Edit if needed_______________]        ││
   │ │                                                     ││
   │ │ Competencies:                                       ││
   │ │ [Edit list - add, remove, reorder]                 ││
   │ └─────────────────────────────────────────────────────┘│
   │                                                         │
   │ NOTES TO REQUESTER (optional):                          │
   │ [We've adjusted the description to be more________]    │
   │ [specific and added Infrastructure as Code_______]     │
   │                                                         │
   │ ACTION:                                                 │
   │ ┌─────────────────────────────────────────────────────┐│
   │ │ ○ Approve as-is                                     ││
   │ │ ○ Approve with modifications (send notes)           ││
   │ │ ○ Reject (provide reason)                           ││
   │ │ ○ Request more information                          ││
   │ └─────────────────────────────────────────────────────┘│
   │                                                         │
   │ [Cancel]                            [Submit Decision]   │
   └─────────────────────────────────────────────────────────┘

3. Update approval_requests Table:
   File: prisma/schema.prisma
   
   model ApprovalRequest {
     id String @id @default(uuid())
     tenantId String
     tenant Tenant @relation(fields: [tenantId])
     requesterId String
     requester User @relation(fields: [requesterId])
     
     entityType ApprovalEntityType // ROLE | COMPETENCY
     entityId String
     
     originalData Json // The submitted data
     modifiedData Json? // Admin's modifications (if any)
     
     status ApprovalStatus
     submittedAt DateTime @default(now())
     reviewedBy String?
     reviewer User? @relation("Reviewer", fields: [reviewedBy])
     reviewedAt DateTime?
     
     modificationNotes String? @db.Text // Sent to requester
     rejectionReason String? @db.Text
     
     // Notification tracking
     notificationSent Boolean @default(false)
     notificationSentAt DateTime?
     
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   
   enum ApprovalEntityType {
     ROLE
     COMPETENCY
   }
   
   enum ApprovalStatus {
     PENDING
     UNDER_REVIEW
     APPROVED
     APPROVED_WITH_MODIFICATIONS
     REJECTED
     MORE_INFO_NEEDED
   }

4. Create API Routes:
   File: app/api/admin/approvals/route.ts
   
   GET /api/admin/approvals
   - Query params: ?status=PENDING&type=ROLE&tenantId=...
   - Returns: { requests: ApprovalRequest[], stats: {...} }
   
   File: app/api/admin/approvals/[requestId]/route.ts
   
   GET /api/admin/approvals/[requestId]
   - Returns: Full approval request with original and modified data
   
   PATCH /api/admin/approvals/[requestId]/review
   - Input:
     {
       action: 'APPROVE' | 'APPROVE_WITH_MODIFICATIONS' | 'REJECT' | 'REQUEST_MORE_INFO',
       modifiedData?: {...},
       notes?: string,
       rejectionReason?: string
     }
   - Process:
     1. Update approval request status
     2. If approved:
        - Update the role/competency record
        - Set visibility = TENANT_SPECIFIC
        - Set approvedBy = currentUser
     3. Send notification email to requester
     4. Log action in audit trail
   - Returns: { success: boolean }

5. Implement Notification System:
   File: lib/notifications/approval-notifications.ts
   
   export async function sendApprovalNotification(
     request: ApprovalRequest,
     action: string
   ) {
     const emailTemplates = {
       APPROVED: {
         subject: `✓ Your ${request.entityType} "${request.originalData.name}" has been approved`,
         body: `
           Great news! Your ${request.entityType} submission has been approved.
           
           ${request.modificationNotes ? 
             `Note from reviewer: ${request.modificationNotes}` : 
             'No changes were needed.'
           }
           
           You can now use this ${request.entityType} in your assessments.
           
           [View ${request.entityType}]
         `
       },
       APPROVED_WITH_MODIFICATIONS: {
         subject: `✓ Your ${request.entityType} "${request.originalData.name}" has been approved with modifications`,
         body: `
           Your ${request.entityType} submission has been approved with some modifications.
           
           Changes made:
           ${request.modificationNotes}
           
           [View Changes] [Accept] [Discuss]
         `
       },
       REJECTED: {
         subject: `Your ${request.entityType} "${request.originalData.name}" needs revision`,
         body: `
           Your ${request.entityType} submission requires some revisions before approval.
           
           Reason:
           ${request.rejectionReason}
           
           Please make the necessary changes and resubmit.
           
           [Edit & Resubmit]
         `
       },
       MORE_INFO_NEEDED: {
         subject: `Additional information needed for "${request.originalData.name}"`,
         body: `
           We need more information to review your ${request.entityType} submission.
           
           Questions:
           ${request.notes}
           
           [Respond]
         `
       }
     };
     
     const template = emailTemplates[action];
     
     await sendEmail({
       to: request.requester.email,
       subject: template.subject,
       html: template.body
     });
   }

6. Create Approval History View:
   File: components/Admin/ApprovalHistory.tsx
   
   Shows:
   - Timeline of all actions
   - Who submitted, when
   - Who reviewed, when
   - What changes were made
   - Communication thread
   
   Display:
   ┌──────────────────────────────────────────┐
   │ Approval History                         │
   ├──────────────────────────────────────────┤
   │ ● Submitted                              │
   │   By: John Doe (Acme Corp)              │
   │   Date: Jan 15, 2026 10:30 AM           │
   │                                          │
   │ ● Under Review                           │
   │   By: Admin User                         │
   │   Date: Jan 15, 2026 2:15 PM            │
   │                                          │
   │ ● Approved with Modifications            │
   │   By: Admin User                         │
   │   Date: Jan 16, 2026 9:00 AM            │
   │   Notes: "Adjusted description..."       │
   │                                          │
   │ ● Notification Sent                      │
   │   Date: Jan 16, 2026 9:01 AM            │
   └──────────────────────────────────────────┘

7. Add Bulk Actions:
   - Select multiple requests
   - Bulk approve (if similar)
   - Bulk reject with same reason
   - Assign to reviewer

8. Add Quick Actions:
   - Approve without opening (if clearly valid)
   - Reject with pre-defined reasons
   - Request more info with templates

WORKFLOW STATES:
PENDING → UNDER_REVIEW → 
  ├─ APPROVED
  ├─ APPROVED_WITH_MODIFICATIONS
  ├─ REJECTED
  └─ MORE_INFO_NEEDED → (back to PENDING after response)

BUSINESS RULES:
- Only Super Admins can access approval queue
- Cannot approve own submissions (if Super Admin submits)
- Modification notes required for APPROVED_WITH_MODIFICATIONS
- Rejection reason required for REJECTED
- Approved entities get visibility = TENANT_SPECIFIC
- Original submission preserved (audit trail)

NOTIFICATIONS:
- Email sent immediately on status change
- In-app notification (bell icon)
- Badge count on approval queue menu item

SUCCESS CRITERIA:
✓ Approval queue displays all pending requests
✓ Can review and modify submissions
✓ All actions work (approve, reject, modify)
✓ Notifications sent correctly
✓ History tracked properly
✓ Bulk actions functional
✓ Mobile responsive

Execute autonomously.
```

---

## M13 & M14: INSTITUTION MANAGEMENT

### M13 - Create Institution Login
### M14 - Institution Tab
### M14-1 - Institution-Specific Models

**These are actually quite simple!**

[AUTONOMOUS MODE]

Implement M13, M14, M14-1: Institution Management

OBJECTIVE: Add institution tenant management to Super Admin

REQUIREMENTS:

M13: Institution Tenant Creation
─────────────────────────────────

1. Update Tenant Creation Form:
   File: app/(admin)/admin/tenants/create/page.tsx
   
   Add tenant type selector:
   ┌──────────────────────────────────────────┐
   │ Create New Tenant                        │
   ├──────────────────────────────────────────┤
   │ Tenant Type: *                           │
   │ ○ Corporate                              │
   │ ● Institution                            │
   │                                          │
   │ Name: [ABC University___________]        │
   │ Email: [admin@abcuniv.edu_______]        │
   │                                          │
   │ [Create Tenant]                          │
   └──────────────────────────────────────────┘
   
   When type = INSTITUTION:
   - Set tenantType = 'INSTITUTION'
   - Enable curriculum features
   - Set default labels (Students, Courses, Classes)

M14: Institution Tab in Admin Menu
───────────────────────────────────

2. Add to Super Admin Navigation:
   File: lib/navigation-config.ts
   
   Add to SUPER_ADMIN_NAV_ITEMS:
   {
     id: 'institutions',
     icon: GraduationCap,
     label: 'Institutions',
     path: () => '/admin/institutions',
     permission: 'tenants:read_all',
     roles: ['SUPER_ADMIN']
   }

3. Create Institutions List Page:
   File: app/(admin)/admin/institutions/page.tsx
   
   Shows:
   - List of all institution tenants
   - Stats: Students, Courses, Departments
   - Status: Active, Trial, Expired
   - Actions: View, Edit, Disable
   
   ┌──────────────────────────────────────────────┐
   │ Institutions (12)              [+ Add]       │
   ├──────────────────────────────────────────────┤
   │ ┌──────────────────────────────────────────┐│
   │ │ 🎓 ABC University                        ││
   │ │    Students: 1,234 | Courses: 56         ││
   │ │    Status: Active | Plan: Growth         ││
   │ │    [View] [Edit] [Usage]                 ││
   │ └──────────────────────────────────────────┘│
   │ ┌──────────────────────────────────────────┐│
   │ │ 🎓 XYZ Institute                         ││
   │ │    Students: 456 | Courses: 23           ││
   │ │    Status: Trial | Plan: Starter         ││
   │ │    [View] [Edit] [Usage]                 ││
   │ └──────────────────────────────────────────┘│
   └──────────────────────────────────────────────┘

M14-1: Institution-Specific Features
─────────────────────────────────────

4. Feature Flags:
   File: lib/tenant-features.ts
   
   export function getTenantFeatures(tenantType: TenantType) {
     const features = {
       CORPORATE: {
         hasCurriculum: false,
         hasProjects: true,
         hasTeams: true,
         memberLabel: 'Employee'
       },
       INSTITUTION: {
         hasCurriculum: true,
         hasCourses: true,
         hasClasses: true,
         memberLabel: 'Student'
       }
     };
     
     return features[tenantType];
   }

5. Conditional UI Rendering:
   
   // In components, check tenant features:
   const features = getTenantFeatures(tenant.type);
   
   {features.hasCurriculum && (
     <Link href="/curriculum">Curriculum</Link>
   )}
   
   <h1>{features.memberLabel}s</h1>

6. Institution-Specific Analytics:
   File: app/(admin)/admin/institutions/[institutionId]/analytics/page.tsx
   
   Metrics specific to institutions:
   - Enrollment trends
   - Course completion rates
   - Assessment scores by department/course
   - Faculty activity
   - Student engagement

VALIDATION:
- Institution email must be from educational domain (.edu)
- Name must be unique
- At least one admin user required

SUCCESS CRITERIA:
✓ Can create institution tenants
✓ Institutions tab shows in Super Admin menu
✓ Institutions list displays correctly
✓ Feature flags work (curriculum visible for institutions only)
✓ Institution-specific analytics available

Execute autonomously.
```

### Usage Analytics Dashboard

**Location:** `app/(admin)/admin/usage-analytics/page.tsx`  
**Purpose:** Monitor all tenant usage, billing, health  
**Priority:** HIGH



```
[AUTONOMOUS MODE]

Implement Usage Analytics Dashboard

OBJECTIVE: Super Admin can see usage data for all tenants

REQUIREMENTS:

1. Create Usage Dashboard:
   File: app/(admin)/admin/usage-analytics/page.tsx
   
   Layout:
   ┌─────────────────────────────────────────────────────┐
   │ Usage Analytics                                     │
   ├─────────────────────────────────────────────────────┤
   │ OVERVIEW                                            │
   │ ┌──────────┬──────────┬──────────┬──────────┐     │
   │ │ Total    │ Active   │ MRR      │ Growth   │     │
   │ │ Tenants  │ Users    │          │          │     │
   │ │   50     │  2,450   │ $9,552   │ ↑ 12%    │     │
   │ └──────────┴──────────┴──────────┴──────────┘     │
   │                                                     │
   │ TENANT LIST                                         │
   │ ┌─────────────────────────────────────────────────┐│
   │ │ Tenant      │Plan  │Users│Assessments│Revenue ││
   │ ├─────────────────────────────────────────────────┤│
   │ │ Acme Corp   │Growth│  25 │ 342/500   │ $199  ││
   │ │ Tech Start  │Start │   8 │  89/100   │  $49  ││
   │ │ ABC Univ    │Business│150│1245/2000  │ $599  ││
   │ └─────────────────────────────────────────────────┘│
   │                                                     │
   │ USAGE TRENDS                                        │
   │ [Chart: Assessments over time]                     │
   │ [Chart: Feature adoption]                          │
   │ [Chart: User growth]                               │
   │                                                     │
   │ [Export CSV] [Generate Report]                     │
   └─────────────────────────────────────────────────────┘

2. Create API Endpoint:
   File: app/api/admin/usage-analytics/route.ts
   
   GET /api/admin/usage-analytics
   
   Returns:
   {
     overview: {
       totalTenants: 50,
       activeUsers: 2450,
       mrr: 9552,
       growth: 0.12
     },
     tenants: [
       {
         id: "tenant-1",
         name: "Acme Corp",
         type: "CORPORATE",
         plan: "GROWTH",
         userCount: 25,
         assessmentsUsed: 342,
         assessmentsIncluded: 500,
         revenue: 199,
         status: "ACTIVE",
         lastActive: "2026-02-01"
       }
     ],
     trends: {
       assessments: [...], // Time series data
       features: [...],    // Feature adoption
       users: [...]        // User growth
     }
   }

3. Create Usage Queries:
   File: lib/analytics/usage-queries.ts
   
   // Total assessments per tenant
   export async function getTenantUsage(tenantId: string) {
     const result = await prisma.memberAssessment.groupBy({
       by: ['tenantId'],
       where: {
         tenantId,
         createdAt: {
           gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
         }
       },
       _count: { id: true }
     });
     
     return result[0]?._count.id || 0;
   }
   
   // MRR calculation
   export async function calculateMRR() {
     const subscriptions = await prisma.subscription.findMany({
       where: { status: 'ACTIVE' }
     });
     
     return subscriptions.reduce((sum, sub) => {
       // Convert to monthly if not already
       const monthly = sub.billingPeriod === 'MONTHLY' ? sub.totalPrice :
                      sub.billingPeriod === 'QUARTERLY' ? sub.totalPrice / 3 :
                      sub.billingPeriod === 'SEMI_ANNUAL' ? sub.totalPrice / 6 :
                      sub.totalPrice / 12; // ANNUAL
       
       return sum + monthly;
     }, 0);
   }
   
   // Growth rate
   export async function calculateGrowth() {
     const thisMonth = await getTenantCount(new Date());
     const lastMonth = await getTenantCount(
       new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
     );
     
     return (thisMonth - lastMonth) / lastMonth;
   }

4. Create Charts:
   File: components/Admin/UsageCharts.tsx
   
   Using Recharts:
   - Line chart: Assessments over time
   - Bar chart: Feature adoption
   - Area chart: User growth
   - Pie chart: Revenue by tenant type

5. Add Export Functionality:
   File: app/api/admin/usage-analytics/export/route.ts
   
   GET /api/admin/usage-analytics/export?format=csv
   
   Generates CSV with all tenant data:
   - Tenant name, type, plan
   - User count, assessment usage
   - Revenue, status
   - Last active date

METRICS TO TRACK:
- Total tenants (Corporate, Institution, System)
- Active users (logged in last 30 days)
- Assessments taken (total, by type)
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Growth rate (month-over-month)
- Churn rate
- Feature adoption (% using each feature)
- Average revenue per tenant
- LTV (Lifetime Value)

FILTERS:
- Date range
- Tenant type
- Plan level
- Status (Active, Trial, Expired)

ALERTS:
- Usage approaching limits
- Trials expiring soon
- Payment failures
- Unusual activity

SUCCESS CRITERIA:
✓ Dashboard displays accurate metrics
✓ Tenant list shows all data
✓ Charts render correctly
✓ Export generates valid CSV
✓ Performance good (loads in <3s)
✓ Mobile responsive

Execute autonomously.

## ✅ COMPLETION CHECKLIST

### Super Admin Features:
- [ ] Enhanced competency form
- [ ] Approval queue dashboard
- [ ] Approval review interface
- [ ] Approval notifications
- [ ] Institution tenant creation
- [ ] Institution list page
- [ ] Institution-specific features

### Public Pages:
- [ ] Homepage (minimalistic, fast)
- [ ] Pricing page
- [ ] Pricing calculator (real-time)
- [ ] Feature comparison table
- [ ] FAQ section

### Usage Analytics:
- [ ] Usage dashboard
- [ ] Tenant list with stats
- [ ] Charts (assessments, features, users)
- [ ] Export to CSV
- [ ] Filters and search

### Testing:
- [ ] Submit role for approval
- [ ] Review and approve role
- [ ] Verify notification sent
- [ ] Create institution tenant
- [ ] Test pricing calculator
- [ ] Check usage analytics accuracy
- [ ] Lighthouse score >90 (homepage, pricing)

---

## 🔄 REUSABILITY NOTE

This completes the **administrative layer** of the platform:
- Super Admins manage global resources
- Approve tenant submissions
- Monitor platform health
- Public pages drive signups

**Next:** Documents 5 & 6 for B2C and Survey modules!

---

END OF DOCUMENT 4