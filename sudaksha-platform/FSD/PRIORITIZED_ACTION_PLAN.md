# SUDASSESS PLATFORM - PRIORITIZED ACTION PLAN
## Based on Functional Requirements Audit Report (Feb 1, 2026)

---

## 📊 AUDIT SUMMARY

**Overall Status:**
- ✅ Fully Implemented: 45 (36%)
- ⚠️ Partially Implemented: 55 (44%)
- 🚧 In Progress: 15 (12%)
- ❌ Not Implemented: 10 (8%)

**Key Strength:** 
Rock-solid backend foundation with sophisticated multi-tenant schema ⭐

**Key Weakness:** 
Employee/Student end-user experience focused only on taking assessments, missing career planning features

---

## 🎯 CRITICAL GAPS IDENTIFIED

### **Gap 1: Employee/Student Career Portal** ❌ CRITICAL
**Requirements Affected:** M4-2 through M4-9, M8-2 through M8-9, M15-2 through M15-7
**Impact:** ~30 requirements (24% of total)
**Status:** NOT IMPLEMENTED

Missing Features:
- My Details (profile form)
- My Hierarchy (org structure visualization)
- My Career section
- My Current Role management
- My Previous Roles
- My Aspirational Role (with gap calculation)
- My Competencies (role-based + self-assigned)

### **Gap 2: Department/Team Dedicated Pages** ⚠️ HIGH
**Requirements Affected:** M1-4, M1-7, M2-2, M3-3
**Impact:** Partial implementation via dialogs only
**Status:** PARTIALLY IMPLEMENTED

Missing:
- `/clients/[clientId]/departments` page
- `/clients/[clientId]/teams` page
- Dedicated management dashboards for each

### **Gap 3: Role Request Workflow UI** 🚧 MEDIUM
**Requirements Affected:** M1-8, M2-6, M3-6
**Impact:** Backend ready, frontend missing
**Status:** IN PROGRESS

Missing:
- Role request form in client portal
- Tracking interface for submitted roles
- Clear approval status visibility

### **Gap 4: Institution-Specific UI Terminology** ⚠️ MEDIUM
**Requirements Affected:** M5-M8
**Impact:** Generic labels instead of institution-specific
**Status:** PARTIALLY IMPLEMENTED

Missing:
- Dynamic label switching (Student vs Employee, Class vs Team)
- Curriculum/Subject hierarchy for M8-11
- Institution-specific navigation items

### **Gap 5: Granular RBAC for Managers** ⚠️ MEDIUM
**Requirements Affected:** M2, M3
**Impact:** Middleware handles broad roles, needs granular permissions
**Status:** PARTIALLY IMPLEMENTED

Needs:
- Department-scoped data access for Dept Heads
- Team-scoped data access for Team Leads
- Strict RLS verification

---

## 🚀 EXECUTION PLAN - 4 WEEKS

### **WEEK 1: Employee/Student Career Portal** (CRITICAL)

#### **Priority 1A: Profile & Hierarchy (2 days)**
```
Files to Create:
├─ app/assessments/profile/page.tsx
├─ app/assessments/profile/layout.tsx
├─ app/assessments/hierarchy/page.tsx
├─ components/Profile/ProfileForm.tsx
├─ components/Hierarchy/OrgChart.tsx
└─ app/api/profile/route.ts

Features:
✅ My Details form (9 sections A-I from career form)
✅ Organization hierarchy tree visualization
✅ Team and manager details display
✅ Editable profile information

Database: Already exists (Member, OrganizationUnit tables)
```

#### **Priority 1B: Career Management (3 days)**
```
Files to Create:
├─ app/assessments/career/page.tsx
├─ app/assessments/career/layout.tsx
├─ app/assessments/career/current-role/page.tsx
├─ app/assessments/career/previous-roles/page.tsx
├─ app/assessments/career/aspirational-role/page.tsx
├─ components/Career/RoleSelector.tsx
├─ components/Career/GapAnalysis.tsx
├─ components/Career/CompetencyManager.tsx
├─ app/api/career/roles/route.ts
└─ app/api/career/competencies/route.ts

Features:
✅ Current Role management (add/edit/delete)
✅ Previous Roles tracking
✅ Aspirational Role selection
✅ Auto-competency assignment based on role
✅ Gap calculation (High/Medium/Low with color coding)
✅ Self-assign competencies option

Database: Already exists (Role, Competency, Member tables)
```

**Week 1 Deliverable:**
- Complete career portal for employees at `/assessments/profile` and `/assessments/career`
- Mirror for students (reuse same components)
- Mirror for B2C individuals at `/individuals/profile` and `/individuals/career`

---

### **WEEK 2: Department/Team Management Pages** (HIGH)

#### **Priority 2A: Department Management (2 days)**
```
Files to Create:
├─ app/clients/[clientId]/departments/page.tsx
├─ app/clients/[clientId]/departments/[deptId]/page.tsx
├─ app/clients/[clientId]/departments/[deptId]/dashboard/page.tsx
├─ components/Departments/DepartmentList.tsx
├─ components/Departments/DepartmentDashboard.tsx
├─ components/Departments/DepartmentSettings.tsx
└─ app/api/clients/[clientId]/departments/route.ts

Features:
✅ List all departments with stats
✅ Department dashboard (teams, employees, projects)
✅ Department-specific analytics
✅ Assign HoD (Head of Department)
✅ Create/Edit/Delete departments (enhance existing dialog)

Note: Integrate existing CreateDepartmentDialog.tsx
```

#### **Priority 2B: Team Management (2 days)**
```
Files to Create:
├─ app/clients/[clientId]/teams/page.tsx
├─ app/clients/[clientId]/teams/[teamId]/page.tsx
├─ app/clients/[clientId]/teams/[teamId]/dashboard/page.tsx
├─ components/Teams/TeamList.tsx
├─ components/Teams/TeamDashboard.tsx
├─ components/Teams/TeamSettings.tsx
└─ app/api/clients/[clientId]/teams/route.ts

Features:
✅ List all teams with stats
✅ Team dashboard (members, projects, assessments)
✅ Team-specific analytics
✅ Assign Team Lead
✅ Allocate employees to teams
✅ Create/Edit/Delete teams

Database: Already exists (OrganizationUnit with type: TEAM)
```

#### **Priority 2C: Role Request Workflow UI (1 day)**
```
Files to Create:
├─ app/clients/[clientId]/roles/page.tsx
├─ app/clients/[clientId]/roles/request/page.tsx
├─ app/clients/[clientId]/roles/my-requests/page.tsx
├─ components/Roles/RoleRequestForm.tsx
├─ components/Roles/RequestStatusTracker.tsx
└─ app/api/clients/[clientId]/roles/request/route.ts

Features:
✅ Create new role request form
✅ Submit for Sudaksha Admin approval
✅ Track request status (Pending/Approved/Rejected)
✅ View modification notes from admin
✅ Resubmit rejected requests

Integration: Links to existing app/(admin)/admin/approvals
```

**Week 2 Deliverable:**
- Complete department management system
- Complete team management system
- Role request workflow functional end-to-end

---

### **WEEK 3: Institution-Specific Features** (MEDIUM)

#### **Priority 3A: Dynamic Label System (2 days)**
```
Files to Create/Modify:
├─ lib/tenant-labels.ts (label configuration)
├─ hooks/useTenantLabels.ts
├─ components/Providers/LabelProvider.tsx
└─ Update all components to use dynamic labels

Configuration:
{
  CORPORATE: {
    member: "Employee",
    memberPlural: "Employees",
    orgUnit: "Department",
    subUnit: "Team",
    activity: "Project"
  },
  INSTITUTION: {
    member: "Student",
    memberPlural: "Students",
    orgUnit: "Department",
    subUnit: "Class",
    activity: "Course"
  }
}

Usage in Components:
const labels = useTenantLabels();
<h1>{labels.memberPlural}</h1> // "Employees" or "Students"
```

#### **Priority 3B: Curriculum Hierarchy for Students (2 days)**
```
Files to Create:
├─ app/clients/[clientId]/curriculum/page.tsx
├─ app/clients/[clientId]/curriculum/[programId]/page.tsx
├─ components/Curriculum/ProgramTree.tsx
├─ components/Curriculum/SubjectAssignments.tsx
└─ app/api/clients/[clientId]/curriculum/route.ts

Features:
✅ Curriculum structure (Department → Program → Subject → Topic)
✅ Topic-wise assessment assignment (M8-11)
✅ Subject completion tracking
✅ Academic term/semester support

Database Schema Addition:
model CurriculumNode {
  id          String
  tenantId    String
  type        PROGRAM | SUBJECT | TOPIC
  name        String
  parentId    String?
  assessments AssessmentAssignment[]
}
```

#### **Priority 3C: Institution Navigation & Branding (1 day)**
```
Update:
├─ app/clients/[clientId]/layout.tsx (conditional navigation)
├─ components/Navigation/Sidebar.tsx
└─ components/Branding/TenantBranding.tsx

Features:
✅ Show "Classes" instead of "Teams" for institutions
✅ Show "Courses" instead of "Projects" for institutions
✅ Add "Curriculum" tab for institutions only
✅ Institution-specific dashboard widgets
```

**Week 3 Deliverable:**
- Dynamic label system working across entire app
- Curriculum management for institutions
- Institution-specific UI complete

---

### **WEEK 4: Granular RBAC & Polish** (MEDIUM)

#### **Priority 4A: Department Head & Team Lead Scoped Access (2 days)**
```
Files to Create/Modify:
├─ middleware.ts (enhance with granular checks)
├─ lib/permissions/check-scope.ts
├─ app/api/clients/[clientId]/middleware.ts
└─ prisma/rls-policies.sql (Row-Level Security)

RLS Policies:
-- Department Head sees only their department
CREATE POLICY dept_head_access ON members
  USING (
    org_unit_id IN (
      SELECT id FROM organization_units 
      WHERE head_user_id = current_user_id()
    )
  );

-- Team Lead sees only their team
CREATE POLICY team_lead_access ON members
  USING (
    org_unit_id = (
      SELECT id FROM organization_units 
      WHERE head_user_id = current_user_id() 
      AND type = 'TEAM'
    )
  );

Middleware Logic:
if (user.role === 'DEPARTMENT_HEAD') {
  // Restrict queries to user's department
  where.orgUnitId = user.managedOrgUnitId;
}
```

#### **Priority 4B: Manager-Specific Dashboards (2 days)**
```
Files to Create:
├─ app/clients/[clientId]/my-department/page.tsx
├─ app/clients/[clientId]/my-team/page.tsx
├─ components/Manager/DepartmentOverview.tsx
├─ components/Manager/TeamOverview.tsx
└─ components/Manager/DirectReports.tsx

Features:
✅ Department Head sees own department dashboard
✅ Team Lead sees own team dashboard
✅ Direct reports list and management
✅ Department/Team-specific analytics
✅ Quick actions (assign assessments, view reports)
```

#### **Priority 4C: Testing & Documentation (1 day)**
```
Tasks:
✅ Write E2E tests for critical user journeys
✅ Test multi-tenant isolation (Corporate vs Institution)
✅ Test permission boundaries (Admin vs Manager vs Employee)
✅ Document new features in README
✅ Create user guide for career portal
✅ Update API documentation
```

**Week 4 Deliverable:**
- Granular RBAC fully implemented and tested
- Manager-specific views functional
- Complete test coverage for new features

---

## 📋 IMPLEMENTATION CHECKLIST

### **Week 1: Employee Career Portal** ✅
- [ ] Profile page with 9-section form
- [ ] Hierarchy visualization
- [ ] Current Role management
- [ ] Previous Roles tracking
- [ ] Aspirational Role selection
- [ ] Auto-competency assignment
- [ ] Gap analysis (High/Medium/Low)
- [ ] Self-assign competencies
- [ ] Mirror for Students
- [ ] Mirror for B2C Individuals

### **Week 2: Department/Team Management** ✅
- [ ] Department list page
- [ ] Department dashboard
- [ ] Department settings
- [ ] Team list page
- [ ] Team dashboard
- [ ] Team member allocation
- [ ] Role request form
- [ ] Request status tracking
- [ ] Integration with approval system

### **Week 3: Institution Features** ✅
- [ ] Dynamic label configuration
- [ ] Label provider component
- [ ] Update all components to use labels
- [ ] Curriculum hierarchy model
- [ ] Program/Subject/Topic management
- [ ] Topic-wise assessments (M8-11)
- [ ] Institution navigation items
- [ ] Institution-specific branding

### **Week 4: RBAC & Polish** ✅
- [ ] Row-Level Security policies
- [ ] Department-scoped queries
- [ ] Team-scoped queries
- [ ] Manager dashboards
- [ ] Permission boundary tests
- [ ] Multi-tenant isolation tests
- [ ] User documentation
- [ ] API documentation

---

## 🎯 SUCCESS METRICS

### **Week 1 Success:**
- Employees can manage complete career profile
- Gap analysis shows High/Medium/Low competency gaps
- Self-assignment of competencies works
- 3 user types (Employee, Student, Individual) use same components

### **Week 2 Success:**
- Departments have dedicated management pages
- Teams have dedicated management pages
- Role requests can be submitted and tracked
- Approval workflow is end-to-end functional

### **Week 3 Success:**
- Corporate users see "Employees", "Teams", "Projects"
- Institution users see "Students", "Classes", "Courses"
- Curriculum hierarchy supports topic-wise assessments
- Institution branding and navigation distinct

### **Week 4 Success:**
- Department Heads can ONLY see their department data
- Team Leads can ONLY see their team data
- Permission boundaries verified with tests
- No data leakage between scopes

---

## 🔧 TECHNICAL APPROACH

### **Reuse Existing Architecture**
```
✅ Use existing Member, OrganizationUnit models
✅ Use existing polymorphic Activity model
✅ Use existing Role, Competency models
✅ Leverage existing CreateDepartmentDialog
✅ Build on existing approval system
```

### **Follow Unified Patterns**
```
✅ Configuration-driven UI (dynamic labels)
✅ Permission-based rendering
✅ Tenant-aware queries
✅ Polymorphic relationships
✅ Single codebase for all user types
```

### **Minimal New Models**
```
Only 1 new model needed:
├─ CurriculumNode (for institution curriculum M8-11)

Everything else uses existing schema! ✅
```

---

## 📊 EFFORT ESTIMATION

| Week | Focus Area | Complexity | Days | Files Created | Files Modified |
|------|-----------|------------|------|---------------|----------------|
| 1 | Career Portal | High | 5 | ~15 | ~5 |
| 2 | Dept/Team Mgmt | Medium | 5 | ~12 | ~8 |
| 3 | Institution UI | Medium | 5 | ~8 | ~20 |
| 4 | RBAC & Polish | Medium | 5 | ~6 | ~15 |
| **Total** | | | **20** | **~41** | **~48** |

---

## 🚨 RISK MITIGATION

### **Risk 1: Career Portal Scope Creep**
**Mitigation:** Use 9-section form from COMPLETE_IMPLEMENTATION_PROMPT.txt as exact spec. No additions.

### **Risk 2: RLS Performance**
**Mitigation:** Add database indexes for `orgUnitId`, `managedOrgUnitId`. Test with 10,000+ members.

### **Risk 3: Dynamic Labels Breaking Existing UI**
**Mitigation:** Implement LabelProvider gradually, component by component. Test each change.

### **Risk 4: Permission Boundary Bugs**
**Mitigation:** Write comprehensive E2E tests for each role. Manual QA by different team members.

---

## 💡 QUICK WINS (Can Do In Parallel)

While working on main plan, these can be done quickly:

### **Quick Win 1: Add Navigation Items** (30 min)
```
Update: app/assessments/layout.tsx
Add: "My Profile", "My Career" to sidebar
Status: ❌ Missing → ✅ Done in 30 minutes
```

### **Quick Win 2: Expose Department/Team Links** (1 hour)
```
Update: app/clients/[clientId]/dashboard/page.tsx
Add: "View All Departments" and "View All Teams" buttons
Link to: Existing CreateDepartmentDialog (temporary)
Status: Improves navigation immediately
```

### **Quick Win 3: Institution Label Toggle** (2 hours)
```
Add: lib/get-tenant-type.ts
Update: 3-4 key components with ternary labels
Example: {tenantType === 'INSTITUTION' ? 'Students' : 'Employees'}
Status: Partial solution while building full system
```

---

## 📈 PROGRESS TRACKING

### **Daily Stand-up Questions:**
1. Which page/component did you complete?
2. Which tests did you write?
3. Any blockers or questions?

### **Weekly Review:**
- Demo completed features
- Review audit checklist
- Adjust priorities if needed

### **Final Acceptance Criteria:**
- [ ] All 10 "Not Implemented" items → Implemented
- [ ] All 55 "Partially Implemented" → Fully Implemented
- [ ] Employee/Student career portal fully functional
- [ ] Manager dashboards with proper scoping
- [ ] Institution UI with correct terminology
- [ ] All tests passing
- [ ] Documentation complete

---

## 🎯 POST-4-WEEK ENHANCEMENTS

After completing the 4-week plan, these are next priorities:

### **Month 2:**
- Survey UI enhancements (M16-M19 polish)
- Code test external integration (HackerRank/Codility)
- Gamification features (M4-14, M8-15, M15-12)

### **Month 3:**
- Advanced analytics and reporting
- Custom report builder UI
- Bulk operations optimization

### **Month 4:**
- AI Voice/Video interview enhancements
- Mobile app development
- Performance optimization at scale

---

## 🎬 NEXT STEPS - START NOW

### **Immediate Actions (Today):**

1. **Create Week 1 Branch**
   ```bash
   git checkout -b feature/employee-career-portal
   ```

2. **Set Up File Structure**
   ```bash
   mkdir -p app/assessments/{profile,career,hierarchy}
   mkdir -p components/{Profile,Career,Hierarchy}
   ```

3. **Start With Profile Page**
   ```
   Priority: app/assessments/profile/page.tsx
   Reference: COMPLETE_IMPLEMENTATION_PROMPT.txt Section 4
   Use: 9-section form (A-I)
   ```

4. **Feed This to AntiGravity**
   ```
   [AUTONOMOUS MODE]
   
   Implement Week 1 of the action plan: Employee Career Portal
   
   Start with:
   1. app/assessments/profile/page.tsx (9-section form)
   2. components/Profile/ProfileForm.tsx
   3. app/api/profile/route.ts
   
   Reference: COMPLETE_IMPLEMENTATION_PROMPT.txt for form structure
   Use existing: Member, Role, Competency models
   
   Execute completely without asking for permission.
   ```

---

## ✅ SUMMARY

**The Good News:**
- Backend is EXCELLENT (36% fully done, 44% partially done)
- Multi-tenant architecture is solid
- Database schema is sophisticated and complete
- Core admin features work well

**The Work Needed:**
- 4 weeks of focused development
- ~41 new files, ~48 file modifications
- Primary focus: End-user experience (Employee/Student)
- Secondary focus: Manager dashboards and institution UI

**Expected Outcome:**
- 100% of requirements implemented after 4 weeks
- Professional, polished end-user experience
- Proper RBAC with granular permissions
- Institution and Corporate experiences properly differentiated

**Let's build! 🚀**

---

END OF ACTION PLAN
