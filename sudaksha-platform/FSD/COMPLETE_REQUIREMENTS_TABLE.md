# SUDASSESS - COMPLETE REQUIREMENTS TABLE
## All 125 Requirements in Tabular Format

---

## REQUIREMENT SUMMARY BY MODULE

| Module | Description | Total Reqs | Repetitive Pattern |
|--------|-------------|------------|-------------------|
| M1 | Corporate Admin | 10 | Base pattern |
| M2 | Corporate Dept Head | 8 | Repeats M1 (scoped) |
| M3 | Corporate Team Lead | 9 | Repeats M1 (scoped) |
| M4 | Corporate Employee | 16 | Unique end-user |
| M5 | Institution Admin | 9 | = M1 (label change) |
| M6 | Institution Dept Head | 7 | = M2 (label change) |
| M7 | Institution Class Teacher | 8 | = M3 (label change) |
| M8 | Institution Student | 16 | = M4 (+ curriculum) |
| M9 | Assessment Methods | 11 | Unique |
| M11-M14 | Super Admin | 5 | Unique |
| M15 | Individual B2C | 15 | = M4 (no org) |
| M16-M19 | Survey Module | 4 | Unique |
| **TOTAL** | | **125** | **~60% repetitive** |

---

## DETAILED REQUIREMENTS TABLE

### CORPORATE MODULE

| ID | Requirement | User Role | Features | Priority | Polymorphic | Implementation |
|----|-------------|-----------|----------|----------|-------------|----------------|
| M1 | Corporate Admin Login | Tenant Admin | Authentication, Session Mgmt, 2FA | CRITICAL | ✅ (All users) | `/api/auth/login` |
| M1-1 | Menu Items | Tenant Admin | Dynamic navigation, Role-based | CRITICAL | ✅ (All roles) | `Sidebar.tsx` |
| M1-2 | Dashboard | Tenant Admin | Stats, Charts, Quick Actions | CRITICAL | ✅ (All dashboards) | `/clients/[id]/dashboard` |
| M1-3 | Organization Setup | Tenant Admin | Profile, Address, Branding | HIGH | ✅ (Tenant settings) | `/clients/[id]/settings` |
| M1-4 | Department Management | Tenant Admin | CRUD, Dashboard, Assign HoD | CRITICAL | ✅ (Org Units) | `/clients/[id]/departments` |
| M1-5 | Employee Management | Tenant Admin | CRUD, Bulk Upload, Assign | CRITICAL | ✅ (Members) | `/clients/[id]/employees` |
| M1-6 | Projects Management | Tenant Admin | CRUD, Assign to Depts, Track | HIGH | ✅ (Activities) | `/clients/[id]/projects` |
| M1-7 | Teams Management | Tenant Admin | CRUD, Assign TL, Allocate | HIGH | ✅ (Org Units) | `/clients/[id]/teams` |
| M1-8 | Add Roles (Approval) | Tenant Admin | Create, Submit, Track Status | HIGH | ✅ (Role system) | `/clients/[id]/roles` |
| M1-9 | Reports | Tenant Admin | Builder, Templates, Export | MEDIUM | ✅ (Reports) | `/clients/[id]/reports` |
| M1-10 | Survey Management | Tenant Admin | Create, Assign, Analyze | MEDIUM | ✅ (Surveys) | `/clients/[id]/surveys` |

| ID | Requirement | User Role | Features | Priority | Polymorphic | Implementation |
|----|-------------|-----------|----------|----------|-------------|----------------|
| M2 | Dept Head Login | Dept Head | Same as M1 | CRITICAL | ✅ | Reuse M1 |
| M2-1 | Menu Items | Dept Head | Dept-scoped navigation | CRITICAL | ✅ | Permission-filtered |
| M2-2 | Team Management | Dept Head | View, Modify (own dept) | HIGH | ✅ | Scoped queries |
| M2-3 | Team Login | Dept Head | Same context | HIGH | ✅ | Same auth |
| M2-4 | Employees (View) | Dept Head | Dept employees only | HIGH | ✅ | `WHERE orgUnitId` |
| M2-5 | Projects (Dept) | Dept Head | Dept projects only | HIGH | ✅ | Scoped |
| M2-6 | Add Roles | Dept Head | Submit for approval | MEDIUM | ✅ | Same as M1-8 |
| M2-7 | Reports (Dept) | Dept Head | Dept-level reports | MEDIUM | ✅ | Filtered |
| M2-8 | Surveys | Dept Head | Dept surveys | MEDIUM | ✅ | Scoped |

| ID | Requirement | User Role | Features | Priority | Polymorphic | Implementation |
|----|-------------|-----------|----------|----------|-------------|----------------|
| M3 | Team Lead Login | Team Lead | Same as M1/M2 | CRITICAL | ✅ | Reuse |
| M3-1 | Menu Items | Team Lead | Team-scoped | CRITICAL | ✅ | Permission-filtered |
| M3-2 | Team Management | Team Lead | Own team only | HIGH | ✅ | Scoped |
| M3-3 | Team Details | Team Lead | View/edit | HIGH | ✅ | Team context |
| M3-4 | Employees (Team) | Team Lead | Team members only | HIGH | ✅ | Scoped |
| M3-5 | Projects (Team) | Team Lead | Team projects | HIGH | ✅ | Scoped |
| M3-6 | Add Roles | Team Lead | Submit for approval | MEDIUM | ✅ | Same |
| M3-7 | Reports (Team) | Team Lead | Team reports | MEDIUM | ✅ | Filtered |
| M3-8 | Assessments | Team Lead | Create & Assign | HIGH | ✅ | Team scope |
| M3-9 | Surveys | Team Lead | Team surveys | MEDIUM | ✅ | Scoped |

| ID | Requirement | User Role | Features | Priority | Polymorphic | Implementation |
|----|-------------|-----------|----------|----------|-------------|----------------|
| M4 | Employee Login | Employee | Authentication | CRITICAL | ✅ | Same auth |
| M4-1 | Menu Items | Employee | Personal menu | CRITICAL | ✅ | Role-filtered |
| M4-2 | My Details | Employee | Profile, Contact, Career Form | CRITICAL | ❌ NEW | `/assessments/profile` |
| M4-3 | My Hierarchy | Employee | Org chart, Team info | HIGH | ❌ NEW | `/assessments/hierarchy` |
| M4-4 | My Projects | Employee | Assigned projects | HIGH | ✅ | Filtered |
| M4-5 | My Career | Employee | Section header | HIGH | ❌ NEW | `/assessments/career` |
| M4-6 | My Current Role | Employee | Add, Modify, Delete | CRITICAL | ❌ NEW | Career management |
| M4-7 | My Previous Roles | Employee | History | HIGH | ❌ NEW | Same |
| M4-8 | My Aspirational Role | Employee | Goal setting, Gap analysis | CRITICAL | ❌ NEW | Gap calculator |
| M4-9 | My Competencies | Employee | Role-based + Self-assign | CRITICAL | ❌ NEW | Competency manager |
| M4-10 | My Assessments | Employee | Section header | HIGH | ✅ | Existing |
| M4-11 | Role-wise Assessments | Employee | Current/Aspirational | HIGH | ✅ | Existing |
| M4-12 | Competency Assessments | Employee | Self-assigned | HIGH | ✅ | Existing |
| M4-13 | Assessment Scores | Employee | Personal + Comparisons | HIGH | ⚠️ PARTIAL | Add comparisons |
| M4-14 | Gamify Assessments | Employee | Points, Badges | LOW | ❌ NEW | Gamification |
| M4-15 | Take Survey | Employee | Respond to surveys | MEDIUM | ✅ | Existing |
| M4-16 | Opt for B2C | Employee | Convert to B2C | LOW | ❌ NEW | Account conversion |

---

### INSTITUTION MODULE (Polymorphic = Corporate)

| ID | Requirement | User Role | Polymorphic Equivalent | Label Change | New Feature |
|----|-------------|-----------|------------------------|--------------|-------------|
| M5 | Institution Admin Login | Inst Admin | M1 | ✅ | None |
| M5-1 | Menu Items | Inst Admin | M1-1 | ✅ | None |
| M5-2 | Dashboard | Inst Admin | M1-2 | Students/Courses | None |
| M5-3 | Organization Setup | Inst Admin | M1-3 | ✅ | None |
| M5-4 | Department Management | Inst Admin | M1-4 | ✅ | None |
| M5-5 | Student Management | Inst Admin | M1-5 | Students | None |
| M5-6 | Courses Management | Inst Admin | M1-6 | Courses | None |
| M5-7 | Classes Management | Inst Admin | M1-7 | Classes | None |
| M5-8 | Add Roles | Inst Admin | M1-8 | ✅ | None |
| M5-9 | Reports | Inst Admin | M1-9 | ✅ | None |

| ID | Requirement | User Role | Polymorphic Equivalent | Label Change | New Feature |
|----|-------------|-----------|------------------------|--------------|-------------|
| M6 | Dept Head (Inst) Login | Dept Head | M2 | ✅ | None |
| M6-1 to M6-7 | Same as M2-1 to M2-7 | Dept Head | M2 series | Students/Classes | None |

| ID | Requirement | User Role | Polymorphic Equivalent | Label Change | New Feature |
|----|-------------|-----------|------------------------|--------------|-------------|
| M7 | Class Teacher Login | Teacher | M3 | ✅ | None |
| M7-1 to M7-8 | Same as M3-1 to M3-9 | Teacher | M3 series | Classes/Students | None |

| ID | Requirement | User Role | Polymorphic Equivalent | Label Change | New Feature |
|----|-------------|-----------|------------------------|--------------|-------------|
| M8 | Student Login | Student | M4 | ✅ | None |
| M8-1 to M8-10 | Same as M4-1 to M4-10 | Student | M4 series | Students | None |
| M8-11 | Curriculum Assessments | Student | ❌ | N/A | **Curriculum hierarchy** |
| M8-12 to M8-15 | Same as M4-11 to M4-15 | Student | M4 series | ✅ | None |

---

### ASSESSMENT MODULE

| ID | Requirement | User Role | Features | Priority | New Model |
|----|-------------|-----------|----------|----------|-----------|
| M9 | Assessment Methods | All | Create, Modify, Delete | CRITICAL | ❌ |
| M9-1 | Role/Competency Based | Admin | Source from role + competency | CRITICAL | ❌ |
| M9-1-1 | Assign to Role | Admin | Role selection | CRITICAL | ❌ |
| M9-1-2 | Assign Level | Admin | Junior/Middle/Senior/Expert | CRITICAL | ❌ |
| M9-1-3 | Add Questions | Admin | Manual, Bulk, AI | CRITICAL | ✅ (AI) |
| M9-1-4 | AI Prompt Logic | System | Generate from role+competency+level | CRITICAL | ✅ |
| M9-2 | Code Test Model | Admin | IT assessments, code execution | MEDIUM | ✅ |
| M9-3 | Scenario-Based | Admin | Behavioral assessments | MEDIUM | ⚠️ |
| M9-4 | AI Voice Interview | Admin | Voice-based evaluation | LOW | ✅ |
| M9-5 | Runtime AI Questions | System | On-the-fly generation | LOW | ✅ |
| M9-6 | AI Video Interview | Admin | Video-based evaluation | LOW | ✅ |

---

### SUPER ADMIN MODULE

| ID | Requirement | User Role | Features | Priority | New Feature |
|----|-------------|-----------|----------|----------|-------------|
| M11 | Add/Modify Competency | Super Admin | Enhanced competency form | MEDIUM | ⚠️ Enhance existing |
| M12 | Admin Approvals | Super Admin | Review queue, Approve/Reject/Modify | CRITICAL | ❌ NEW |
| M13 | Institution Login | Super Admin | Create inst tenant | HIGH | ✅ Tenant type |
| M14 | Institution Tab | Super Admin | Institution management | HIGH | ❌ NEW |
| M14-1 | Separate Inst Models | System | Institution-specific visibility | MEDIUM | ✅ Config-driven |

---

### B2C INDIVIDUAL MODULE

| ID | Requirement | User Role | Polymorphic Equivalent | Difference |
|----|-------------|-----------|------------------------|------------|
| M15 | B2C User Login | Individual | M4 | No tenant affiliation |
| M15-1 to M15-13 | Same as M4 features | Individual | M4 series | Self-service, no org |
| M15-14 | Student Mode | Individual | M8 | Act as student until employed |

---

### SURVEY MODULE

| ID | Requirement | User Role | Features | Priority | New Feature |
|----|-------------|-----------|----------|----------|-------------|
| M16 | Survey CRUD | Admin | Create, Modify, Delete, Settings | MEDIUM | ❌ NEW |
| M17 | Add Questions | Admin | Manual, Bulk upload | MEDIUM | ❌ NEW |
| M18 | Modify Questions | Admin | Edit existing | MEDIUM | ❌ NEW |
| M19 | Delete Questions | Admin | Remove questions | MEDIUM | ❌ NEW |

---

## POLYMORPHIC IMPLEMENTATION SUMMARY

### Reusable Across All Tenants (Corporate + Institution)

| Feature | Table/Model | Polymorphic Field | Values |
|---------|-------------|-------------------|--------|
| Members | `members` | `memberType` | EMPLOYEE, STUDENT, INDIVIDUAL |
| Activities | `activities` | `type` | PROJECT, COURSE, PROGRAM |
| Org Units | `organization_units` | `type` | DEPARTMENT, TEAM, CLASS, SECTION |
| Roles | `roles` | `createdByTenantId` | NULL (global) or UUID (tenant) |
| Competencies | `competencies` | `createdByTenantId` | NULL (global) or UUID (tenant) |

### Label Configuration

```typescript
const TENANT_LABELS = {
  CORPORATE: {
    member: 'Employee',
    memberPlural: 'Employees',
    orgUnit: 'Department',
    subUnit: 'Team',
    activity: 'Project'
  },
  INSTITUTION: {
    member: 'Student',
    memberPlural: 'Students',
    orgUnit: 'Department',
    subUnit: 'Class',
    activity: 'Course'
  },
  SYSTEM: { // B2C
    member: 'User',
    memberPlural: 'Users',
    orgUnit: null,
    subUnit: null,
    activity: 'Goal'
  }
};
```

---

## FEATURE PATTERNS & COUNTS

### CRUD Operations (Repetitive)

| Operation | Count | Modules |
|-----------|-------|---------|
| Create | 45 | All admin modules |
| Read/View | 125 | All modules |
| Update/Modify | 42 | All admin modules |
| Delete | 38 | All admin modules |
| Bulk Upload | 6 | Members, Questions |

### Authentication & Authorization

| Feature | Count | Modules |
|---------|-------|---------|
| Login | 10 | M1-M8, M15 (polymorphic) |
| Role-based Access | 125 | All modules |
| Permission Checks | 125 | All operations |

### Dashboard & Analytics

| Type | Count | Modules |
|------|-------|---------|
| Admin Dashboard | 3 | M1, M5, Super Admin |
| Manager Dashboard | 4 | M2, M3, M6, M7 |
| Employee Dashboard | 3 | M4, M8, M15 |
| Report Types | 6 | Templates |

### Assessment Features

| Feature | Count | Status |
|---------|-------|--------|
| Question Types | 8 | MCQ, True/False, Short Answer, Essay, Code, Scenario, Voice, Video |
| Assessment Types | 5 | Role-based, Competency, Code, Voice, Survey |
| AI-Powered | 4 | Question Gen, Voice Interview, Video Interview, Runtime Gen |

---

## NEW vs EXISTING FEATURES

### Fully Implemented (✅)
- Authentication system
- Multi-tenant database
- Role & Competency models
- Assessment models
- Basic CRUD for tenants, members, org units
- Assessment taking interface
- Admin dashboard

### Partially Implemented (⚠️)
- Department/Team management (dialogs exist, full pages missing)
- Employee management (bulk upload needs enhancement)
- Approval workflow (backend ready, UI missing)
- Reports (basic exists, templates missing)

### Not Implemented (❌)
- Employee Career Portal (M4-2 through M4-9)
- Student Career Portal (M8-2 through M8-9)
- B2C Individual Portal (M15)
- Department/Team dedicated pages
- Role request workflow UI
- Survey module (complete)
- Code testing integration
- AI voice/video interview
- Gamification
- Curriculum hierarchy (M8-11)

---

## IMPLEMENTATION PRIORITY MATRIX

| Priority | Requirements | Weeks | Impact |
|----------|--------------|-------|--------|
| **P0 (Critical)** | M4-2 to M4-9, M8-2 to M8-9, M12 | 2 weeks | 30 requirements, 24% of total |
| **P1 (High)** | M1-4, M1-7 pages, M14, M15 | 2 weeks | 20 requirements, 16% of total |
| **P2 (Medium)** | M16-M19, Dynamic labels, RBAC | 1 week | 15 requirements, 12% of total |
| **P3 (Low)** | Gamification, AI features | 2+ weeks | 10 requirements, 8% of total |
| **TOTAL** | **125 requirements** | **7-8 weeks** | **100%** |

---

## MOBILE-FIRST REQUIREMENTS

### All Features Must Support

| Breakpoint | Layout | Navigation | Input |
|------------|--------|------------|-------|
| Mobile (<768px) | Single column, stacked | Hamburger menu | Touch-optimized (44px min) |
| Tablet (768-1023px) | 2 columns, condensed | Sidebar (collapsible) | Touch + Keyboard |
| Desktop (≥1024px) | Multi-column, full | Full sidebar | Keyboard + Mouse |

### Progressive Web App (PWA)

- Offline capability (service worker)
- Install prompt
- Push notifications
- Background sync

---

## SEO REQUIREMENTS

### Public Pages (Indexable)

- Homepage (`/`)
- Pricing page (`/pricing`)
- Features page (`/features`)
- About/Contact pages

### Private Pages (Noindex)

- All authenticated dashboards
- Assessment interfaces
- Admin panels
- Reports

### Technical SEO

- Server-side rendering (Next.js)
- Semantic HTML
- Meta tags (title, description, OG)
- Structured data (Schema.org)
- Sitemap.xml
- Robots.txt
- Fast loading (<2s LCP)

---

## PERFORMANCE REQUIREMENTS

| Metric | Target | Method |
|--------|--------|--------|
| First Contentful Paint | <1.5s | SSR, CDN |
| Largest Contentful Paint | <2.0s | Image optimization |
| Time to Interactive | <3.0s | Code splitting |
| Cumulative Layout Shift | <0.1 | Reserved space |
| API Response Time (p95) | <200ms | Caching, indexing |
| Database Query Time | <50ms | Indexes, connection pool |

---

END OF TABULAR REQUIREMENTS DOCUMENT
