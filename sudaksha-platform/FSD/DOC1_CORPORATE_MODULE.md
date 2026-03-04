# DOCUMENT 1: CORPORATE MODULE REQUIREMENTS
## Implementation Guide for Corporate Tenant Features (M1-M4)

**Module Group:** Corporate Tenant  
**Total Requirements:** 47  
**User Roles:** Corporate Admin (M1), Department Head (M2), Team Lead (M3), Employee (M4)  
**Priority:** CRITICAL  
**Implementation Order:** 1 of 6

---

## 🎯 OVERVIEW

This document covers all Corporate tenant functionality. The key insight is that **M2 and M3 are scoped versions of M1**, and **M4 is the end-user experience**. 

**Polymorphic Architecture:**
- Same database tables serve Corporate, Institution, and B2C
- Role-based permissions control feature access
- Configuration-driven UI changes labels dynamically

---

## 📊 REQUIREMENT SUMMARY

| Module | Role | Requirements | Pattern |
|--------|------|--------------|---------|
| M1 | Corporate Admin | 10 | Base implementation |
| M2 | Department Head | 8 | M1 + dept scope |
| M3 | Team Lead | 9 | M1 + team scope |
| M4 | Employee | 16 | End-user portal |
| **TOTAL** | | **47** | |

---

## M1: CORPORATE ADMIN (10 Requirements)

### M1 - Corporate Admin Login
**ID:** M1  
**Priority:** CRITICAL  
**Type:** Authentication

**Requirements:**
- Username/Password authentication
- Redirects to Admin Portal of Corporate
- Session management
- Remember me functionality
- Password reset flow

**Implementation:**
```typescript
// Files to create/modify:
app/(auth)/login/page.tsx
app/api/auth/[...nextauth]/route.ts
lib/auth-config.ts

// Database:
users table (already exists)
sessions table (NextAuth)

// Features:
1. Login form with username/password
2. Email verification
3. Password reset via email
4. Session expiry (7 days with remember me, 24 hours without)
5. Redirect logic:
   - Super Admin → /admin/dashboard
   - Tenant Admin → /clients/[clientId]/dashboard
   - Employee → /assessments/dashboard
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1: Corporate Admin Login

REQUIREMENTS:
- Create login page at app/(auth)/login/page.tsx
- Username (email) and password fields
- Remember me checkbox
- Forgot password link
- NextAuth configuration with credentials provider
- Redirect after login based on user role:
  * SUPER_ADMIN → /admin/dashboard
  * TENANT_ADMIN → /clients/[clientId]/dashboard
  * EMPLOYEE → /assessments/dashboard

VALIDATION:
- Email format validation
- Password minimum 8 characters
- Max 5 login attempts before 15min lockout
- Session expiry: 7 days (remember me) or 24 hours

SUCCESS CRITERIA:
✓ User can log in with valid credentials
✓ Invalid credentials show error message
✓ Remember me works correctly
✓ Redirects to appropriate dashboard
✓ Mobile-responsive login page

Execute autonomously.
```

---

### M1-1 - Menu Items (Super Admin Tab & My Page Tab)
**ID:** M1-1  
**Priority:** CRITICAL  
**Type:** Navigation

**Requirements:**
- Super Admin Tab (if user is super admin)
- My Page Tab (personal section)
- Role-based menu rendering
- Mobile hamburger menu

**Implementation:**
```typescript
// Files:
components/Navigation/Sidebar.tsx
components/Navigation/MobileNav.tsx
lib/navigation-config.ts

// Menu Structure for Corporate Admin:
const corporateAdminMenu = [
  { icon: Home, label: 'Dashboard', path: '/clients/[id]/dashboard', permission: '*' },
  { icon: Building, label: 'Departments', path: '/clients/[id]/departments', permission: 'org_units:read' },
  { icon: Users, label: 'Employees', path: '/clients/[id]/employees', permission: 'members:read' },
  { icon: Briefcase, label: 'Projects', path: '/clients/[id]/projects', permission: 'activities:read' },
  { icon: UsersIcon, label: 'Teams', path: '/clients/[id]/teams', permission: 'org_units:read' },
  { icon: FileText, label: 'Assessments', path: '/clients/[id]/assessments', permission: 'assessments:read' },
  { icon: ClipboardList, label: 'Surveys', path: '/clients/[id]/surveys', permission: 'surveys:read' },
  { icon: BarChart, label: 'Reports', path: '/clients/[id]/reports', permission: 'reports:read' },
  { icon: Settings, label: 'Settings', path: '/clients/[id]/settings', permission: 'tenant:update' },
  {
    icon: User,
    label: 'My Page',
    children: [
      { label: 'My Profile', path: '/assessments/profile' },
      { label: 'My Career', path: '/assessments/career' },
      { label: 'Logout', action: 'logout' }
    ]
  }
];

// Super Admin Tab (conditional):
const superAdminMenu = [
  { icon: Globe, label: 'All Tenants', path: '/admin/tenants' },
  { icon: CheckCircle, label: 'Approvals', path: '/admin/approvals' },
  { icon: DollarSign, label: 'Usage & Billing', path: '/admin/usage-analytics' },
  { icon: GraduationCap, label: 'Institutions', path: '/admin/institutions' },
  { icon: TrendingUp, label: 'Analytics', path: '/admin/analytics' }
];
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-1: Dynamic Navigation Menu

REQUIREMENTS:
1. Create components/Navigation/Sidebar.tsx
   - Desktop sidebar (always visible on ≥1024px)
   - Logo at top
   - Menu items with icons
   - Active state highlighting
   - Collapse/expand toggle
   
2. Create components/Navigation/MobileNav.tsx
   - Hamburger menu button (top-left)
   - Slide-out drawer
   - Full-screen overlay
   - Swipe to close

3. Create lib/navigation-config.ts
   - Menu configuration by role
   - Permission-based filtering
   - Dynamic label support (for Institution later)

4. Conditional Super Admin Tab
   - Show only if user.role === 'SUPER_ADMIN'
   - Place at top of menu

5. My Page Tab
   - Always show at bottom
   - Dropdown submenu: My Profile, My Career, Logout
   - Logout redirects to /

MOBILE-FIRST:
- Hamburger menu on mobile (<768px)
- Touch targets minimum 44x44px
- Swipe gestures (close drawer)

SUCCESS CRITERIA:
✓ Menu renders based on user role
✓ Active route highlighted
✓ Super Admin sees extra tab
✓ Mobile menu works smoothly
✓ Permissions filter menu items

Execute autonomously.
```

---

### M1-2 - Dashboard (Departments, Employees, Projects, Teams)
**ID:** M1-2  
**Priority:** CRITICAL  
**Type:** Analytics Dashboard

**Requirements:**
- Real-time statistics
- Department count and overview
- Employee count (active/inactive)
- Active projects
- Team performance metrics
- Quick actions
- Gap analysis chart

**Implementation:**
```typescript
// Files:
app/clients/[clientId]/dashboard/page.tsx
components/Dashboard/StatsGrid.tsx
components/Dashboard/GapAnalysisChart.tsx
components/Dashboard/RecentActivity.tsx
components/Dashboard/QuickActions.tsx

// API:
app/api/clients/[clientId]/dashboard/stats/route.ts
app/api/clients/[clientId]/dashboard/gap-analysis/route.ts

// Stats to Display:
interface DashboardStats {
  employees: {
    total: number;
    active: number;
    inactive: number;
    trend: number; // percentage change from last month
  };
  departments: {
    total: number;
    avgEmployeesPerDept: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  teams: {
    total: number;
    avgSize: number;
  };
  assessments: {
    pending: number;
    completed: number;
    avgScore: number;
  };
  performance: {
    overall: number; // avg of all assessments
    byDepartment: { deptName: string; score: number }[];
  };
}

// Gap Analysis:
interface GapAnalysis {
  competency: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gap: 'HIGH' | 'MEDIUM' | 'LOW';
  employeesAffected: number;
}
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-2: Corporate Admin Dashboard

REQUIREMENTS:
1. Create app/clients/[clientId]/dashboard/page.tsx
   - 4 stat cards (Employees, Departments, Projects, Avg Performance)
   - Each card shows: Icon, Value, Label, Trend (↑ +5%)
   - Animate numbers on mount (count-up effect)

2. Create components/Dashboard/StatsGrid.tsx
   - Responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
   - StatCard component with icon, value, trend

3. Create components/Dashboard/GapAnalysisChart.tsx
   - Horizontal bar chart showing top 10 competency gaps
   - Color-coded: Red (HIGH), Yellow (MEDIUM), Green (LOW)
   - Use Recharts library

4. Create components/Dashboard/RecentActivity.tsx
   - Feed of last 10 actions in tenant
   - Format: "John Doe completed Java Assessment" (2 hours ago)

5. Create app/api/clients/[clientId]/dashboard/stats/route.ts
   - Query database for all stats
   - Calculate trends (compare to previous period)
   - Return JSON response

6. Create app/api/clients/[clientId]/dashboard/gap-analysis/route.ts
   - Query competency scores
   - Calculate gaps: (targetLevel - currentLevel)
   - Classify: HIGH (>40% gap), MEDIUM (20-40%), LOW (<20%)

DATABASE QUERIES:
-- Employee count:
SELECT COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'ACTIVE') as active
FROM members
WHERE tenantId = :tenantId AND memberType = 'EMPLOYEE';

-- Avg performance:
SELECT AVG(overallScore) as avgScore
FROM member_assessments
WHERE tenantId = :tenantId AND status = 'COMPLETED';

MOBILE-FIRST:
- Cards stack vertically on mobile
- Charts use responsive container
- Pull-to-refresh gesture

SUCCESS CRITERIA:
✓ Dashboard loads in <2 seconds
✓ Stats display correctly
✓ Charts render properly
✓ Mobile responsive
✓ Real-time data (or 5-min cache)

Execute autonomously.
```

---

### M1-3 - Organization Setup
**ID:** M1-3  
**Priority:** HIGH  
**Type:** Settings/Configuration

**Requirements:**
- Company name (pre-filled from signup)
- Address (City, District, State, Country)
- Timezone
- Logo upload
- Description
- Line of Business

**Implementation:**
```typescript
// Files:
app/clients/[clientId]/settings/page.tsx
components/Settings/OrganizationForm.tsx
components/Settings/LogoUpload.tsx
app/api/clients/[clientId]/settings/route.ts
app/api/clients/[clientId]/settings/logo/route.ts

// Database:
tenants table:
  - name (read-only, set during signup)
  - logoUrl
  - primaryColor
  - secondaryColor

tenant_settings table:
  - tenantId (FK)
  - city, district, state, country
  - timezone
  - description
  - lineOfBusiness
  - phone, email, website
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-3: Organization Setup

REQUIREMENTS:
1. Create app/clients/[clientId]/settings/page.tsx
   - Tabbed interface: Organization, Branding, Billing
   - Organization tab shows all settings

2. Create components/Settings/OrganizationForm.tsx
   - Sections: Basic Info, Address, Contact, Branding
   - Name field (read-only, from signup)
   - City, District, State, Country (dropdowns)
   - Timezone (grouped by continent)
   - Description (textarea, max 500 chars)
   - Line of Business (dropdown)

3. Create components/Settings/LogoUpload.tsx
   - Drag & drop zone
   - Image preview
   - Crop tool (square, 200x200px)
   - Upload to S3/Cloud Storage
   - Max 2MB, JPG/PNG/SVG only

4. Color pickers for primary/secondary colors
   - Live preview of changes
   - Apply to entire app via CSS variables

5. Create API endpoints:
   GET /api/clients/[clientId]/settings
   PATCH /api/clients/[clientId]/settings
   POST /api/clients/[clientId]/settings/logo

LINE OF BUSINESS OPTIONS:
- Technology / IT Services
- Healthcare
- Education
- Finance / Banking
- Manufacturing
- Retail / E-commerce
- Professional Services
- Other

SUCCESS CRITERIA:
✓ All fields save correctly
✓ Logo uploads and displays
✓ Colors apply to app
✓ Mobile-responsive form
✓ Validation works

Execute autonomously.
```

---

### M1-4 - Department Management
**ID:** M1-4  
**Priority:** CRITICAL  
**Type:** Organization Structure

**Requirements:**
- Add department
- Modify department
- Delete department (with warning)
- Department dashboard
- Assign Head of Department
- View teams and employees

**Implementation:**
```typescript
// Files:
app/clients/[clientId]/departments/page.tsx
app/clients/[clientId]/departments/[deptId]/page.tsx
components/Departments/DepartmentList.tsx
components/Departments/DepartmentCard.tsx
components/Departments/DepartmentDashboard.tsx
components/Departments/CreateDepartmentDialog.tsx (already exists - enhance)
app/api/clients/[clientId]/departments/route.ts

// Database:
organization_units table:
  - type = 'DEPARTMENT'
  - name, code, description
  - headUserId (FK to users)
  - tenantId (FK)
  - parentUnitId (NULL for departments)
  - path (ltree for hierarchy)
  - level = 0
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-4: Department Management

REQUIREMENTS:
1. Create app/clients/[clientId]/departments/page.tsx
   - List all departments in grid/list view
   - Search by name
   - Filter by status (active/inactive)
   - Sort by name, employees, teams
   - "Create Department" button

2. Enhance existing CreateDepartmentDialog.tsx
   - Fields: Name (required), Code (auto-gen, editable), Description
   - Head of Department selector (dropdown of employees)
   - Submit creates department + redirects to detail page

3. Create app/clients/[clientId]/departments/[deptId]/page.tsx
   - Department dashboard with tabs:
     * Overview: Stats (teams, employees, projects)
     * Teams: List of teams in department
     * Employees: List of employees in department
     * Projects: Projects assigned to department
     * Analytics: Performance charts
   - Edit/Delete actions (top-right)

4. Create components/Departments/DepartmentCard.tsx
   - Display: Name, HoD avatar/name
   - Stats: X teams, Y employees, Z projects
   - Avg performance score
   - Actions menu: View, Edit, Delete
   - Click card → Navigate to detail page

5. Delete Confirmation Dialog
   - Warning: "This department has X teams and Y employees"
   - Reassignment dropdown (move to another dept)
   - Cannot delete if has active projects
   - Soft delete (isActive = false)

6. API Endpoints:
   GET /api/clients/[clientId]/departments
   POST /api/clients/[clientId]/departments
   GET /api/clients/[clientId]/departments/[deptId]
   PATCH /api/clients/[clientId]/departments/[deptId]
   DELETE /api/clients/[clientId]/departments/[deptId]?reassignTo=[deptId]

DATABASE QUERIES:
-- Get departments with stats:
SELECT 
  ou.id, ou.name, ou.code,
  u.name as hod_name,
  COUNT(DISTINCT teams.id) as team_count,
  COUNT(DISTINCT m.id) as employee_count,
  AVG(ma.overallScore) as avg_score
FROM organization_units ou
LEFT JOIN users u ON ou.headUserId = u.id
LEFT JOIN organization_units teams ON teams.parentUnitId = ou.id AND teams.type = 'TEAM'
LEFT JOIN members m ON m.orgUnitId IN (ou.id, teams.id)
LEFT JOIN member_assessments ma ON ma.memberId = m.id
WHERE ou.tenantId = :tenantId AND ou.type = 'DEPARTMENT'
GROUP BY ou.id, u.name;

VALIDATION:
- Name: 3-100 chars, alphanumeric
- Code: Auto-generate from first 3 letters + number
- HoD: Must be active employee

MOBILE-FIRST:
- Cards stack vertically on mobile
- Swipe actions (edit, delete)
- Bottom sheet for create/edit forms

SUCCESS CRITERIA:
✓ Can create, view, edit, delete departments
✓ Department detail page shows all data
✓ HoD assignment works
✓ Delete with reassignment works
✓ Mobile responsive

Execute autonomously.
```

---

### M1-5 - Employee Management
**ID:** M1-5  
**Priority:** CRITICAL  
**Type:** Member Management

**Requirements:**
- Add individual employee
- Modify employee
- Delete employee
- Bulk upload via CSV/Excel
- Assign to department/team
- Assign roles
- View employee assessments

**Implementation:**
```typescript
// Files:
app/clients/[clientId]/employees/page.tsx
app/clients/[clientId]/employees/[empId]/page.tsx
components/Employees/EmployeeList.tsx
components/Employees/EmployeeTable.tsx
components/Employees/CreateEmployeeDialog.tsx
components/Employees/BulkUploadDialog.tsx (already exists - enhance)
app/api/clients/[clientId]/employees/route.ts
app/api/clients/[clientId]/employees/bulk-upload/route.ts

// CSV Template Columns:
employee_id, first_name, last_name, email, phone,
department_code, team_code, designation, 
reporting_manager_email, primary_role_code, status
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-5: Employee Management

REQUIREMENTS:
1. Create app/clients/[clientId]/employees/page.tsx
   - Table view with columns:
     * Employee ID, Name, Email, Department, Team, Role, Status
   - Search by name/email/ID
   - Filters: Department, Team, Status, Role
   - Actions: Add Employee, Bulk Upload, Export CSV
   - Pagination (25/50/100 per page)
   - Sort by any column

2. Create components/Employees/CreateEmployeeDialog.tsx
   - Multi-step form:
     Step 1: Personal Info (first name, last name, email, phone)
     Step 2: Organization (department, team, designation, reporting manager)
     Step 3: Roles & Access (primary role, additional roles)
   - Employee ID auto-generated (EMP0001, EMP0002, ...)
   - Send invitation email on create
   - Validation:
     * Email unique within tenant
     * Manager must exist
     * Department required

3. Enhance components/Employees/BulkUploadDialog.tsx
   - 4-step wizard:
     Step 1: Download CSV template
     Step 2: Upload filled file (drag & drop)
     Step 3: Validation & preview (show errors)
     Step 4: Confirm & import (process valid rows)
   - Max 500 rows per upload
   - Show: X valid, Y invalid
   - Allow: Skip errors OR Fix & retry

4. Create app/clients/[clientId]/employees/[empId]/page.tsx
   - Employee detail with tabs:
     * Profile: Photo, contact info, org chart position
     * Career: Roles, competencies, development plan
     * Assessments: All assessments taken + scores
     * Projects: Assigned projects
     * Activity: Action log
   - Edit/Delete actions

5. API Endpoints:
   GET /api/clients/[clientId]/employees
   POST /api/clients/[clientId]/employees
   GET /api/clients/[clientId]/employees/[empId]
   PATCH /api/clients/[clientId]/employees/[empId]
   DELETE /api/clients/[clientId]/employees/[empId]
   POST /api/clients/[clientId]/employees/bulk-upload

BULK UPLOAD VALIDATION:
- Parse CSV/Excel
- Validate each row:
  * Email format and uniqueness
  * Department exists
  * Team exists and belongs to department
  * Manager exists
  * Role exists
- Return { valid: [...], invalid: [...errors] }

INVITATION EMAIL:
Subject: "Welcome to [Company] - Set up your account"
Body: 
  "Hi [Name],
   You've been added to [Company]'s assessment platform.
   Click here to set your password and get started: [link]
   Your temporary employee ID is: [ID]"

DATABASE:
members table:
  - memberType = 'EMPLOYEE'
  - memberCode (Employee ID)
  - firstName, lastName, email, phone
  - orgUnitId (FK to team or department)
  - reportingToId (FK to members)
  - designation
  - primaryRoleId, additionalRoles (UUID[])
  - status (ACTIVE | INACTIVE | RESIGNED)

SUCCESS CRITERIA:
✓ Can create employees individually
✓ Bulk upload processes 500+ employees
✓ Validation catches errors
✓ Invitation emails sent
✓ Employee detail page shows all info
✓ Mobile responsive table/cards

Execute autonomously.
```

---

### M1-6 - Projects Management
**ID:** M1-6  
**Priority:** HIGH  
**Type:** Activity Management

**Requirements:**
- Create project
- Assign to departments
- Project dashboard
- Project timeline
- Assign employees
- Link assessments

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-6: Projects Management

REQUIREMENTS:
1. Create app/clients/[clientId]/projects/page.tsx
   - Kanban board view (by status: Planned, Active, On Hold, Completed)
   - List view option
   - Create Project button
   - Filters: Status, Department, Date range

2. Create components/Projects/ProjectCard.tsx
   - Name, description (truncated)
   - Status badge (color-coded)
   - Progress bar (based on assessments completed)
   - Department tags
   - Team members (avatar stack)
   - Start/End dates
   - Actions: View, Edit, Archive

3. Create components/Projects/CreateProjectDialog.tsx
   - Fields:
     * Name (required)
     * Code (auto-gen: PROJ001)
     * Description (rich text)
     * Start date, End date
     * Status (PLANNED | ACTIVE | ON_HOLD | COMPLETED)
     * Departments (multi-select)
     * Project manager (employee selector)
     * Budget, Priority (optional)

4. Create app/clients/[clientId]/projects/[projectId]/page.tsx
   - Tabs:
     * Overview: Details, timeline, budget
     * Team: Assigned employees, roles
     * Assessments: Linked assessments
     * Timeline: Gantt chart/milestones
     * Analytics: Completion rate, performance

5. API Endpoints:
   GET /api/clients/[clientId]/projects
   POST /api/clients/[clientId]/projects
   GET /api/clients/[clientId]/projects/[projectId]
   PATCH /api/clients/[clientId]/projects/[projectId]
   DELETE /api/clients/[clientId]/projects/[projectId]

DATABASE:
activities table:
  - type = 'PROJECT'
  - name, code, description
  - startDate, endDate, status
  - ownerId (project manager)
  - assignedUnits (UUID[]) -- departments
  - assignedMembers (UUID[]) -- employees
  - metadata (JSONB): { budget, priority, technology, client }

MOBILE-FIRST:
- Kanban columns scroll horizontally on mobile
- Cards optimized for mobile view
- Swipe gestures to change status

SUCCESS CRITERIA:
✓ Can create, view, edit projects
✓ Kan ban board works smoothly
✓ Can assign departments and employees
✓ Timeline view displays correctly
✓ Mobile responsive

Execute autonomously.
```

---

### M1-7 - Teams Management
**ID:** M1-7  
**Priority:** HIGH  
**Type:** Organization Structure

**Requirements:**
- Create team within department
- Assign Team Lead
- Allocate employees to team
- Team dashboard
- Team performance

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-7: Teams Management

REQUIREMENTS:
1. Create app/clients/[clientId]/teams/page.tsx
   - Filter by department (tabs or dropdown)
   - Team cards in grid
   - Create Team button

2. Create components/Teams/TeamCard.tsx
   - Team name, department name
   - Team lead avatar/name
   - Member count
   - Avg performance score
   - Actions: View, Edit, Delete

3. Create components/Teams/CreateTeamDialog.tsx
   - Name (required)
   - Code (auto-gen)
   - Parent department (required)
   - Team lead (employee from department)
   - Description

4. Create app/clients/[clientId]/teams/[teamId]/page.tsx
   - Tabs:
     * Overview: Stats, description
     * Members: List with add/remove
     * Assessments: Team assessments
     * Performance: Charts

5. Create components/Teams/AllocateEmployeesDialog.tsx
   - Show employees from parent department
   - Multi-select
   - Allocate button
   - Validation: Employee can only be in one team

6. API Endpoints:
   GET /api/clients/[clientId]/teams
   POST /api/clients/[clientId]/teams
   GET /api/clients/[clientId]/teams/[teamId]
   POST /api/clients/[clientId]/teams/[teamId]/members
   DELETE /api/clients/[clientId]/teams/[teamId]/members/[memberId]

DATABASE:
organization_units table:
  - type = 'TEAM'
  - parentUnitId (FK to department)
  - headUserId (team lead)
  - level = 1
  - path = 'tenant.dept.team'

members table:
  - orgUnitId (FK to team)

BUSINESS RULES:
- Team must belong to a department
- Team lead must be team member
- Employee can only be in one team
- Cannot delete team with active projects

SUCCESS CRITERIA:
✓ Can create, view, edit teams
✓ Can allocate employees to teams
✓ Team lead assignment works
✓ Performance metrics display
✓ Mobile responsive

Execute autonomously.
```

---

### M1-8 - Add Roles (Submit for Approval)
**ID:** M1-8  
**Priority:** HIGH  
**Type:** Role Management

**Requirements:**
- Create custom role
- Add competencies to role
- Submit for Sudaksha Admin approval
- Track approval status
- View/edit pending roles

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-8: Role Creation & Approval Workflow

REQUIREMENTS:
1. Create app/clients/[clientId]/roles/page.tsx
   - Tabs:
     * Global Roles (⭐ Sudaksha created)
     * My Roles (✅ Approved, ⏳ Pending, ❌ Rejected)
   - Create Role button (only in My Roles tab)
   - Search and filters

2. Create components/Roles/CreateRoleDialog.tsx
   - 3-step wizard:
     Step 1: Basic Info
       - Name (required)
       - Code (auto-gen)
       - Level (Junior | Middle | Senior | Expert)
       - Description
     Step 2: Select Competencies
       - Browse global competencies
       - Multi-select
       - Can add new competency (also needs approval)
     Step 3: Review & Submit
       - Summary
       - Checkbox: "Submit for approval"
       - Create button

3. Create app/clients/[clientId]/roles/my-requests/page.tsx
   - List of submitted roles
   - Status: PENDING | APPROVED | REJECTED
   - View approval notes (if modified)
   - Resubmit button (if rejected)

4. Create components/Roles/ApprovalStatusTracker.tsx
   - Timeline view: Submitted → Under Review → Approved/Rejected
   - Admin notes/feedback
   - Modification details (if admin changed anything)

5. API Endpoints:
   GET /api/clients/[clientId]/roles
   POST /api/clients/[clientId]/roles
   POST /api/clients/[clientId]/roles/[roleId]/submit
   GET /api/clients/[clientId]/roles/[roleId]/approval-status

DATABASE:
roles table:
  - createdByTenantId (NULL = global, UUID = tenant-specific)
  - visibility (UNIVERSAL | TENANT_SPECIFIC)
  - approvalStatus (DRAFT | PENDING_APPROVAL | APPROVED | REJECTED)
  - approvedBy, approvedAt
  - rejectionReason

approval_requests table:
  - entityType = 'ROLE'
  - entityId (FK to roles)
  - originalData (JSONB)
  - modifiedData (JSONB) -- if admin makes changes
  - modificationNotes
  - status (PENDING | APPROVED | REJECTED)

WORKFLOW:
1. Tenant creates role → status = DRAFT
2. Can use DRAFT roles internally
3. Click "Submit for Approval" → status = PENDING_APPROVAL
4. Sudaksha Admin reviews in /admin/approvals
5. Admin can: Approve | Modify & Approve | Reject
6. If approved: status = APPROVED, visibility = TENANT_SPECIFIC
7. If rejected: Can edit and resubmit

UI INDICATORS:
- ⭐ = Universal (Sudaksha)
- ✅ = Approved (tenant)
- ⏳ = Pending Approval
- ❌ = Rejected
- 📝 = Draft

SUCCESS CRITERIA:
✓ Can create custom roles
✓ Can submit for approval
✓ Status tracker shows progress
✓ Approved roles usable
✓ Rejected roles can be edited
✓ Mobile responsive

Execute autonomously.
```

---

### M1-9 - Reports (Multi-Report Format)
**ID:** M1-9  
**Priority:** MEDIUM  
**Type:** Analytics & Reporting

**Requirements:**
- Custom report builder
- Predefined templates
- Export (PDF, Excel, CSV)
- Scheduled reports
- Interactive dashboards

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-9: Custom Reports System

REQUIREMENTS:
1. Create app/clients/[clientId]/reports/page.tsx
   - Tabs: Templates, My Reports, Scheduled
   - Report template gallery
   - Create Custom Report button

2. Predefined Templates (6):
   a) Department Performance Report
   b) Individual Development Plan (IDP)
   c) Role Readiness Report
   d) Assessment Campaign Summary
   e) Competency Heatmap
   f) Training ROI Report

3. Create components/Reports/ReportBuilder.tsx
   - 5-step wizard:
     Step 1: Data Source (Assessments, Members, Projects)
     Step 2: Filters (Date range, Department, Role, Status)
     Step 3: Metrics (Select what to measure)
     Step 4: Visualizations (Charts, Tables)
     Step 5: Schedule (Optional: Daily, Weekly, Monthly)

4. Create components/Reports/ReportViewer.tsx
   - Interactive dashboard
   - Drill-down capability
   - Export buttons (PDF, Excel, CSV)
   - Share button (email link)

5. Create components/Reports/ScheduleReportDialog.tsx
   - Frequency (Daily | Weekly | Monthly)
   - Day of week/month
   - Time
   - Recipients (emails)
   - Format (PDF | Excel)
   - Active toggle

6. API Endpoints:
   GET /api/clients/[clientId]/reports/templates
   POST /api/clients/[clientId]/reports/generate
   GET /api/clients/[clientId]/reports/[reportId]
   POST /api/clients/[clientId]/reports/schedule
   POST /api/clients/[clientId]/reports/[reportId]/export

DATABASE:
report_templates table:
  - name, description, type
  - config (JSONB) -- data sources, metrics
  - isSystem (true for predefined)

reports table:
  - tenantId, templateId, userId
  - filters (JSONB)
  - generatedAt, expiresAt (30 days)
  - fileUrl (if exported)

report_schedules table:
  - reportId, frequency, recipients
  - isActive, lastRunAt, nextRunAt

EXPORT FORMATS:
- PDF: Styled report with charts (puppeteer)
- Excel: Multiple sheets, formatted
- CSV: Raw data only

BUSINESS RULES:
- Reports expire after 30 days
- Max 5 scheduled reports per tenant
- Large reports queued (background job)

SUCCESS CRITERIA:
✓ Can create custom reports
✓ Templates work correctly
✓ Export in all formats
✓ Scheduled reports send emails
✓ Mobile-friendly viewer

Execute autonomously.
```

---

### M1-10 - Survey Management
**ID:** M1-10  
**Priority:** MEDIUM  
**Type:** Survey

**Requirements:**
- Create survey
- Use existing templates
- Assign survey
- Modify/delete survey
- Personalize survey
- View responses
- Export results

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M1-10: Survey Management

REQUIREMENTS:
1. Create app/clients/[clientId]/surveys/page.tsx
   - Tabs: Active, Draft, Completed
   - Survey cards
   - Create Survey button
   - Templates gallery

2. Create components/Surveys/CreateSurveyWizard.tsx
   - 5-step wizard:
     Step 1: Basic Info (name, description, purpose, audience)
     Step 2: Questions (add from bank, create new, bulk upload)
     Step 3: Scoring (optional: enable, method, categories)
     Step 4: Settings (anonymous, time limit, dates)
     Step 5: Personalize (branding, emails)

3. Survey Question Types:
   - Likert Scale (Strongly Disagree → Strongly Agree)
   - Multiple Choice (single answer)
   - Multiple Select (multiple answers)
   - Rating Scale (1-5 stars)
   - Text Response (short/long)

4. Create components/Surveys/AssignSurveyDialog.tsx
   - Target selection:
     * All employees
     * Specific departments
     * Specific teams
     * Specific roles
     * Custom list (upload)
   - Due date
   - Reminder settings

5. Create app/clients/[clientId]/surveys/[surveyId]/results/page.tsx
   - Response rate card
   - Score distribution chart
   - Question-by-question analysis
   - Department/Team breakdown
   - Word cloud (text responses)
   - Export button (PDF, Excel, CSV)

6. API Endpoints:
   GET /api/clients/[clientId]/surveys
   POST /api/clients/[clientId]/surveys
   GET /api/clients/[clientId]/surveys/[surveyId]
   POST /api/clients/[clientId]/surveys/[surveyId]/assign
   GET /api/clients/[clientId]/surveys/[surveyId]/results

DATABASE:
surveys table:
  - tenantId, name, description, purpose
  - targetAudience
  - scoringEnabled, scoringMethod
  - metadata (JSONB) -- settings, branding

survey_questions table:
  - surveyId, questionText, questionType
  - options (JSONB)
  - order, isRequired, points

survey_assignments table:
  - surveyId, targetType, targetId
  - assignedAt, dueDate
  - completionCount

survey_responses table:
  - surveyId, memberId (NULL if anonymous)
  - answers (JSONB)
  - score, completedAt

TEMPLATES:
1. Employee Satisfaction Survey
2. 360° Feedback
3. Training Effectiveness
4. Exit Interview
5. Onboarding Experience

SUCCESS CRITERIA:
✓ Can create surveys
✓ Can assign to target audience
✓ Responses collected correctly
✓ Results dashboard accurate
✓ Export works
✓ Mobile-optimized survey taking

Execute autonomously.
```

---

## M2: DEPARTMENT HEAD (8 Requirements)

**Key Insight:** M2 is a **scoped version of M1**. Same features, department-level permissions.

### Implementation Strategy

```typescript
// Same components as M1, different permissions

// Middleware checks:
if (user.role === 'DEPARTMENT_HEAD') {
  // Scope all queries to user's department
  where.orgUnitId = user.managedOrgUnitId;
}

// Navigation: Same menu, fewer items
const deptHeadMenu = corporateAdminMenu.filter(item => 
  ['Dashboard', 'Teams', 'Employees', 'Projects', 'Reports'].includes(item.label)
);
```

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M2: Department Head Features

APPROACH: Reuse M1 components with scoped permissions

REQUIREMENTS:
1. Update middleware.ts
   - Add role check for DEPARTMENT_HEAD
   - Add query scope: WHERE orgUnitId = user.managedOrgUnitId

2. Update navigation config
   - Filter menu items for dept head
   - Remove: Organization Setup, Add Roles
   - Keep: Dashboard, Teams, Employees, Projects, Reports, Surveys

3. Update API routes with scope:
   GET /api/clients/[clientId]/employees
     - Add filter: WHERE orgUnitId = user.managedOrgUnitId
   
   GET /api/clients/[clientId]/teams
     - Add filter: WHERE parentUnitId = user.managedOrgUnitId

4. Update dashboard queries
   - Show only department data
   - Stats scoped to department

5. Create app/clients/[clientId]/my-department/page.tsx
   - Department-specific dashboard
   - Show: Department name, stats, team list
   - Quick actions: Add employee, Create team, Assign assessment

BUSINESS RULES:
- Department Head can only see/edit their department
- Cannot access other departments
- Cannot modify organization settings
- Can create roles (submit for approval)
- Can view/create reports (department-scoped)

DATABASE:
users table:
  - role = 'DEPARTMENT_HEAD'
  - managedOrgUnitId (FK to department they manage)

Row-Level Security (RLS):
CREATE POLICY dept_head_access ON members
  USING (
    orgUnitId IN (
      SELECT id FROM organization_units 
      WHERE id = current_user_managed_org_unit_id()
      OR parentUnitId = current_user_managed_org_unit_id()
    )
  );

SUCCESS CRITERIA:
✓ Dept Head sees only their department
✓ Cannot access other departments
✓ All M1 features work (scoped)
✓ Dashboard shows department stats
✓ Mobile responsive

Execute autonomously.
```

---

## M3: TEAM LEAD (9 Requirements)

**Key Insight:** M3 is a **further scoped version of M1/M2**. Team-level permissions only.

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M3: Team Lead Features

APPROACH: Reuse M1/M2 components with team scope

REQUIREMENTS:
1. Update middleware.ts
   - Add role check for TEAM_LEAD
   - Add query scope: WHERE orgUnitId = user.managedOrgUnitId (team)

2. Update navigation
   - Remove: Departments, Organization Setup
   - Keep: Dashboard, Employees, Projects, Assessments, Reports

3. Add RLS policy for team leads:
   CREATE POLICY team_lead_access ON members
     USING (orgUnitId = current_user_managed_org_unit_id());

4. Create app/clients/[clientId]/my-team/page.tsx
   - Team-specific dashboard
   - Team members list
   - Team projects
   - Team performance metrics
   - Actions: Add member, Assign assessment, View reports

5. Add feature: Create & Assign Assessments (M3-8)
   - Team leads can create assessment models
   - Can assign to team members
   - Link to CREATE button in assessments tab

BUSINESS RULES:
- Team Lead can only see their team
- Cannot access other teams/departments
- Can create assessments
- Can assign assessments to team members
- Can view team reports

SUCCESS CRITERIA:
✓ Team Lead sees only their team
✓ Cannot access other teams
✓ Can create & assign assessments
✓ Dashboard shows team stats
✓ Mobile responsive

Execute autonomously.
```

---

## M4: EMPLOYEE (16 Requirements)

**Key Insight:** This is the **END-USER EXPERIENCE**. Completely different from M1-M3.

### M4-2 through M4-9: Career Portal (CRITICAL - NEW)

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE - PRIORITY 1]

Implement M4: Employee Career Portal

This is NEW functionality (not in current codebase).

REQUIREMENTS:
1. Create app/assessments/profile/page.tsx
   - 9-section career form:
     A. Employee Information
     B. Current Responsibilities
     C. Technical Competencies (current level)
     D. Behavioral Competencies (current level)
     E. Aspirational Role
     F. Aspirational Technical Competencies (with gap)
     G. Aspirational Behavioral Competencies (with gap)
     H. Learning Preferences
     I. Self-Assessment
   - Progress indicator
   - Auto-save on section change
   - Submit button

2. Create app/assessments/career/page.tsx
   - My Current Role section
     * Add role (dropdown or request new)
     * Edit role
     * Delete role
   - My Previous Roles section
     * List of past roles
     * Add/edit/delete
   - My Aspirational Role section
     * Select from role library
     * Auto-load required competencies
     * Show gap analysis
   - My Competencies section
     * Role-based competencies (auto)
     * Self-assigned competencies
     * Add competency button
     * Proficiency self-rating

3. Create app/assessments/hierarchy/page.tsx
   - Organization chart visualization
   - Show: Company → Department → Team → Employee (you)
   - Display: Manager name, Team lead name
   - Interactive (click to view details)

4. Create components/Career/GapAnalysis.tsx
   - Compare current vs aspirational competencies
   - Calculate gap:
     * HIGH (0-40% proficiency) - RED
     * MEDIUM (41-70% proficiency) - YELLOW
     * LOW (71-100% proficiency) - GREEN
   - Display top 5 priority gaps
   - Recommend assessments
   - Development plan suggestions

5. Add navigation items to employee menu:
   - My Profile (new)
   - My Career (new)
   - My Hierarchy (new)

6. API Endpoints:
   GET /api/profile
   PATCH /api/profile
   GET /api/career/roles
   POST /api/career/roles
   DELETE /api/career/roles/[roleId]
   GET /api/career/gap-analysis
   GET /api/hierarchy

DATABASE ADDITIONS:
ALTER TABLE members ADD COLUMN:
  - currentRoleId (FK to roles)
  - aspirationalRoleId (FK to roles)
  - previousRoles (JSONB array)
  - careerFormData (JSONB for 9 sections)
  - selfAssignedCompetencies (UUID[])

Gap Calculation Logic:
function calculateGap(
  currentProficiency: number,
  requiredProficiency: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  const gap = requiredProficiency - currentProficiency;
  if (gap > 60) return 'HIGH';
  if (gap > 30) return 'MEDIUM';
  return 'LOW';
}

REUSABILITY:
- Same components work for Students (M8) and B2C Users (M15)
- Use tenant context to show/hide org hierarchy
- Dynamic labels based on user type

SUCCESS CRITERIA:
✓ Employee can fill 9-section career form
✓ Can manage current/previous/aspirational roles
✓ Gap analysis calculates correctly
✓ Can self-assign competencies
✓ Hierarchy chart displays correctly
✓ Mobile responsive
✓ Auto-save works

Execute autonomously. This is CRITICAL functionality.
```

---

### M4-10 through M4-16: Assessments & Additional Features

**AntiGravity Prompt:**
```
[AUTONOMOUS MODE]

Implement M4-10 through M4-16: Employee Assessment Features

NOTE: Most of these already exist in /assessments/dashboard

REQUIREMENTS:
1. M4-10: My Assessments
   - Already exists at /assessments/dashboard
   - Ensure shows: Assigned assessments, Completed assessments

2. M4-11: Role-wise Assessments
   - Filter assessments by role (current/aspirational)
   - Allow employee to request assessments for roles

3. M4-12: Competency-wise Assessments
   - Filter assessments by self-assigned competencies
   - Show available assessments for each competency

4. M4-13: Assessment Scores
   - Personal scores (already exists)
   - ADD: Comparison with team average
   - ADD: Comparison with department average
   - ADD: Comparison with organization average
   - ADD: Trend chart (scores over time)

5. M4-14: Gamify Assessments (LOW PRIORITY)
   - Points system (10 points per assessment completed)
   - Badges (Bronze/Silver/Gold based on scores)
   - Leaderboard (within team, optional)
   - Achievements (milestones)

6. M4-15: Take Survey
   - Already exists (survey response interface)
   - Ensure employee can view assigned surveys

7. M4-16: Opt for B2C
   - Add button: "Continue as individual user"
   - Converts corporate employee to B2C user
   - Keeps assessment history
   - Removes org affiliation

API Endpoints:
GET /api/assessments/comparisons?memberId=X
  - Returns: team avg, dept avg, org avg
POST /api/profile/convert-to-b2c
  - Converts employee to B2C user

SUCCESS CRITERIA:
✓ Assessment comparisons work
✓ Gamification displays (if enabled)
✓ B2C conversion works
✓ All features mobile responsive

Execute autonomously.
```

---

## 🎯 IMPLEMENTATION SEQUENCE

### Phase 1: Foundation (Days 1-3)
1. M1 - Login
2. M1-1 - Navigation
3. M1-2 - Dashboard

### Phase 2: Core Admin (Days 4-7)
4. M1-3 - Organization Setup
5. M1-4 - Departments
6. M1-5 - Employees
7. M1-6 - Projects
8. M1-7 - Teams

### Phase 3: Advanced Admin (Days 8-10)
9. M1-8 - Role Management
10. M1-9 - Reports
11. M1-10 - Surveys

### Phase 4: Scoped Roles (Days 11-12)
12. M2 - Department Head (reuse M1)
13. M3 - Team Lead (reuse M1)

### Phase 5: End User (Days 13-15) - CRITICAL
14. M4-2 to M4-9 - Career Portal (NEW)
15. M4-10 to M4-16 - Assessment Features

---

## ✅ COMPLETION CHECKLIST

- [ ] All M1 requirements implemented
- [ ] All M2 requirements (scoped M1)
- [ ] All M3 requirements (scoped M1)
- [ ] All M4 requirements (career portal)
- [ ] Mobile responsive verified
- [ ] All API endpoints tested
- [ ] Database migrations complete
- [ ] No TypeScript errors
- [ ] Lighthouse score >90

---

## 🔄 REUSABILITY NOTE

These Corporate features are **100% reusable** for Institution and B2C:
- Same database tables
- Same components
- Only labels change
- Configuration-driven

**Next Document:** Institution & Students Requirements (M5-M8)

---

END OF DOCUMENT 1
