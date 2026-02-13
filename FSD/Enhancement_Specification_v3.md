SUDAKSHA ASSESSMENT PORTAL
Enhancement Specification Document
Version 2.0 - Strategic Enhancements
Document Date: February 5, 2026
Prepared For: AntiGravity Implementation

Executive Summary
This document outlines six strategic enhancements to the Sudaksha Assessment Portal that will significantly improve multi-tenant role management, student assessment capabilities, institutional workflows, and system intelligence. These enhancements address critical gaps in the current system and establish scalable patterns for future growth.
Enhancement Overview
#
Enhancement
Impact
Priority
1
Polymorphic Role & Competency Creation with Approval Workflow
High - Enables tenant customization
CRITICAL
2
Student Experience Level Restrictions
Medium - Improves assessment accuracy
HIGH
3
Institution Staff Capabilities & Profile Restrictions
High - Clarifies role boundaries
HIGH
4
Unique Identifiers (Enrollment & Employee IDs)
Medium - Improves usability
MEDIUM
5
Intelligent Recommendations System
High - Enhances user experience
MEDIUM
6
Navigation Label Update (Competency Matrix → Role Matrix)
Low - Cosmetic improvement
LOW
Enhancement #1: Polymorphic Role & Competency Creation
1.1 Overview
This enhancement enables Corporate and Institution tenants to create custom roles and competencies that align with their specific organizational needs, while maintaining system integrity through a hierarchical approval workflow.
1.2 Business Requirements
Core Capabilities:
1. Tenants can create custom roles/competencies using the same form interface as Super Admin
2. Each custom role/competency is tagged with creator tenant ID and type (CORPORATE/INSTITUTION)
3. Multi-level approval workflow: Team Lead/Class Teacher → Department Head → Super Admin
4. Complete audit trail of all submission, approval, and rejection events with iteration tracking
5. Tenant isolation: Each tenant sees only their custom roles + system roles
1.3 Database Schema
A. Roles Table Enhancements:
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tenant Ownership
  created_by_tenant_id UUID REFERENCES tenants(id),
  role_type VARCHAR(20) CHECK (role_type IN ('SYSTEM', 'CORPORATE', 'INSTITUTION')),
  is_system_role BOOLEAN DEFAULT FALSE,
  
  -- Approval Workflow
  approval_status VARCHAR(20) DEFAULT 'PENDING_APPROVAL' 
    CHECK (approval_status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DRAFT', 
                                'PENDING_DEPT_HEAD', 'PENDING_SUPER_ADMIN')),
  submitted_by_user_id UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejected_by_user_id UUID REFERENCES users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT role_ownership_check CHECK (
    (is_system_role = TRUE AND created_by_tenant_id IS NULL) OR
    (is_system_role = FALSE AND created_by_tenant_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_roles_tenant ON roles(created_by_tenant_id);
CREATE INDEX idx_roles_approval_status ON roles(approval_status);
CREATE INDEX idx_roles_type ON roles(role_type);
B. Competencies Table Enhancements:
CREATE TABLE competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  -- Tenant Ownership
  created_by_tenant_id UUID REFERENCES tenants(id),
  competency_type VARCHAR(20) CHECK (competency_type IN ('SYSTEM', 'CORPORATE', 'INSTITUTION')),
  is_system_competency BOOLEAN DEFAULT FALSE,
  
  -- Approval Workflow (same structure as roles)
  approval_status VARCHAR(20) DEFAULT 'PENDING_APPROVAL',
  submitted_by_user_id UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejected_by_user_id UUID REFERENCES users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competencies_tenant ON competencies(created_by_tenant_id);
CREATE INDEX idx_competencies_approval_status ON competencies(approval_status);
CREATE INDEX idx_competencies_type ON competencies(competency_type);
C. Approval Audit Trail:
CREATE TABLE approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'ROLE' or 'COMPETENCY'
  entity_id UUID NOT NULL,
  
  -- Workflow Stage
  approver_role VARCHAR(50) NOT NULL, -- 'TEAM_LEAD', 'CLASS_TEACHER', 'DEPT_HEAD', 'SUPER_ADMIN'
  approver_user_id UUID REFERENCES users(id),
  
  -- Action Details
  action VARCHAR(20) NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
  action_at TIMESTAMPTZ DEFAULT NOW(),
  comments TEXT,
  
  -- Iteration Tracking
  iteration_number INT NOT NULL DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_entity ON approval_history(entity_type, entity_id);
CREATE INDEX idx_approval_iteration ON approval_history(entity_id, iteration_number);
1.4 Approval Workflow Logic
For CORPORATE Tenants:
1. Step 1: Team Lead creates role/competency → Status: DRAFT
2. Step 2: Team Lead submits → Department Head → Status: PENDING_DEPT_HEAD
3. Step 3: Department Head reviews:
– ✅ If APPROVED: Submits to Super Admin → Status: PENDING_SUPER_ADMIN
– ❌ If REJECTED: Returns to Team Lead with reason → Status: REJECTED
4. Step 4: Super Admin reviews:
– ✅ If APPROVED: Status: ACTIVE (available to tenant)
– ❌ If REJECTED: Returns with reason, can be edited and resubmitted (iteration++)
For INSTITUTION Tenants:
1. Step 1: Class Teacher creates role/competency → Status: DRAFT
2. Step 2: Class Teacher submits → Department Head → Status: PENDING_DEPT_HEAD
3. Step 3: Department Head → Super Admin (same as Corporate flow)
4. Step 4: Super Admin final approval (same as Corporate flow)
Resubmission Logic:
• When rejected, creator can edit and resubmit
• Iteration number increments with each resubmission
• All iterations captured in approval_history for audit purposes
• Super Admin can also make edits and approve directly
1.5 UI Components Required
Component
Location
Description
Role Creation Form
/assessments/clients/[clientId]/roles/request
Polymorphic form matching Super Admin design, adapts based on user role
Competency Creation Form
/assessments/clients/[clientId]/competencies/request
Polymorphic form for competency creation
Approval Queue (Dept Head)
/assessments/dept-head/approvals
Shows pending requests from Team Leads/Class Teachers
Approval Queue (Super Admin)
/assessments/admin/approvals
Shows pending requests from Department Heads
Approval History View
/assessments/roles/[roleId]/history
Timeline showing all iterations, comments, approvers for audit purposes
My Submissions
/assessments/my-submissions
View status of submitted roles/competencies
1.6 Key Features
✅ Tenant Isolation: Corporate A cannot see Corporate B’s custom roles
✅ Polymorphic Forms: Same form interface, different behavior based on user role
✅ Complete Audit Trail: Every action logged with timestamp, user, and reason
✅ Iterative Approval: Support multiple rejection/resubmission cycles
✅ Email Notifications: Notify submitter/approver at each workflow stage

Enhancement #2: Student Experience Level Restrictions
2.1 Overview
This enhancement implements intelligent restrictions on competency assessment levels for students based on their academic status and lack of professional work experience. It ensures assessments are contextually appropriate and realistic.
2.2 Student Classification Logic
Academic Status
User Label
Experience Level
Database Field
has_graduated = FALSE
Student
STUDENT
Default for enrolled students
has_graduated = TRUE
Fresh Graduate / Job Seeker
FRESH_GRADUATE
Updated upon graduation
2.3 Competency Level Restrictions
Available Levels for Students & Fresh Graduates:
Level
Status
UI Behavior
Rationale
JUNIOR
✅ ENABLED
Clickable, normal styling
Entry-level skills appropriate for learners
MIDDLE
✅ ENABLED
Clickable, normal styling
Intermediate skills achievable through academic projects
SENIOR
❌ DISABLED
Grayed out, tooltip on hover
Requires significant professional experience
EXPERT
❌ DISABLED
Grayed out, tooltip on hover
Requires extensive professional mastery
Tooltip Text:
“Senior and Expert levels are not available for students as they require professional work experience.”
2.4 Database Schema Update
ALTER TABLE members 
ADD COLUMN has_graduated BOOLEAN DEFAULT FALSE,
ADD COLUMN graduation_date DATE;

-- Update existing students
UPDATE members 
SET has_graduated = FALSE 
WHERE tenant_type = 'INSTITUTION' AND role IN ('STUDENT');

-- For graduated students (can be updated via admin interface or bulk upload)
UPDATE members 
SET has_graduated = TRUE, 
    graduation_date = '2024-05-15'  
WHERE enrollment_number IN ('CS2020001', 'CS2020002');
2.5 UI Implementation Requirements
1. Assessment Creation Page:
When creating assessment for students: - Check member.has_graduated status - Competency level selector shows: - Junior ✅ (enabled) - Middle ✅ (enabled) - Senior 🚫 (grayed out, cursor: not-allowed) - Expert 🚫 (grayed out, cursor: not-allowed) - Display tooltip on hover over disabled levels
2. Backend Validation:
// API endpoint validation
if ((member.has_graduated === false || member.experience_level === 'FRESH_GRADUATE') 
    && (requestedLevel === 'SENIOR' || requestedLevel === 'EXPERT')) {
  throw new ValidationError(
    "Invalid competency level for student/fresh graduate. Only Junior and Middle levels are permitted."
  );
}
3. Bulk Assessment Assignment:
When assigning assessments to a class: - System automatically validates each student’s has_graduated status - Prevents assignment if any student in the group would violate level restrictions - Displays warning: “X students in this class cannot take Senior/Expert level assessments”

Enhancement #3: Institution Staff Capabilities & Profile Restrictions
3.1 Overview
This enhancement defines clear boundaries for institutional staff (Department Heads and Class Teachers), positioning them as facilitators and administrators rather than assessment participants. It also establishes their specific capabilities in creating and managing academic content.
3.2 Role Definitions & Capabilities
Role
CAN DO
CANNOT DO
Department Head
• Create Courses• Create Curriculum (Program → Subject → Topic)• Create Roles (requires approval)• Assign Competencies• Create Projects• Add Students to Projects• Create Assessments• Assign to: Class, Project, CSV Upload• Approve role/competency requests from Class Teachers
• Have full career profile (9-section form)• Take assessments as institution member• Access career planning features• Self-assess competencies within portal
Class Teacher
• Create Courses (for their subjects)• Create Roles (requires approval)• Create Projects• Add Students to Projects• Create Assessments• Assign to: Class, Project, CSV Upload• Submit role/competency requests to Dept Head
• Have full career profile• Take assessments as institution member• Access career planning features• Create institution-wide curriculum (only Dept Head)
IMPORTANT NOTE: If Department Heads or Class Teachers want to use career planning features for personal skill development, they must create a separate B2C (individual) account unrelated to their institutional role.
3.3 Staff Profile Structure
Limited Profile Fields (Institution Staff):
Field
Status
Description
✅ Name
INCLUDED
Full name of staff member
✅ Phone
INCLUDED
Contact phone number
✅ Email
INCLUDED
Institutional email address
✅ Department
INCLUDED
Which department they belong to / head
✅ Classes
INCLUDED
Which classes they teach (for Class Teachers)
❌ Career Aspirations
EXCLUDED
Staff are facilitators, not career-tracked users
❌ Competency Assessment
EXCLUDED
They assess others, not themselves
❌ Gap Analysis
EXCLUDED
Not applicable for facilitator role
❌ Career Planning
EXCLUDED
Not applicable for facilitator role
3.4 Student Assignment Methods
Method 1: Assign to Entire Class
• Select a class from dropdown (e.g., CS-3A, ME-2B)
• All students enrolled in that class automatically receive the assessment
• Useful for: Term exams, class-wide evaluations
Method 2: Assign to Project Team
• Select a project from dropdown (e.g., “E-commerce App”, “IoT Smart Home”)
• Only students who are members of that project team receive the assessment
• Useful for: Project-based evaluations, team assessments
Method 3: CSV Upload (Custom List)
• Upload CSV file with student enrollment numbers
• System matches enrollment numbers to student accounts
• Allows cross-class assignment (e.g., all top performers from multiple classes)
• Available to BOTH Department Heads AND Class Teachers
• Useful for: Special programs, honors assessments, remedial groups
CSV Upload Format Example:
enrollment_number
CS2021001
CS2021045
ME2020022
EE2021033
IT2020012
System Behavior: 1. Parse CSV and extract enrollment numbers 2. Lookup members where enrollment_number IN (list) and tenant_id = current_tenant 3. Validate all found (report any not found) 4. Assign assessment to matched students

Enhancement #4: Unique Identifiers (Enrollment & Employee IDs)
4.1 Overview
This enhancement adds human-readable identifiers to students and employees, complementing the system’s internal UUIDs. These identifiers improve usability in reports, bulk operations, and daily administrative tasks.
4.2 Database Schema
ALTER TABLE members 
ADD COLUMN enrollment_number VARCHAR(50) UNIQUE,
ADD COLUMN employee_id VARCHAR(50) UNIQUE;

-- Add conditional constraints
ALTER TABLE members 
ADD CONSTRAINT enrollment_for_students CHECK (
  (tenant_type = 'INSTITUTION' AND enrollment_number IS NOT NULL) OR
  (tenant_type != 'INSTITUTION')
),
ADD CONSTRAINT employee_id_for_corporate CHECK (
  (tenant_type = 'CORPORATE' AND employee_id IS NOT NULL) OR
  (tenant_type != 'CORPORATE')
);

-- Indexes for fast lookups
CREATE INDEX idx_members_enrollment ON members(enrollment_number);
CREATE INDEX idx_members_employee_id ON members(employee_id);
4.3 Usage Scenarios
Context
Internal System
User-Facing Display
Database Operations
UUID (id)
Not visible to users
Assessment Reports
UUID for joins
enrollment_number / employee_id
CSV Bulk Upload
Lookup enrollment_number → UUID
Users provide enrollment_number
Student Lists
UUID for filtering
Display name + enrollment_number
Search Functionality
Search both UUID and enrollment_number
Users search by enrollment_number
4.4 UI Display Rules
1. Student Lists & Reports: - Display format: "John Doe (CS2021001)" or "CS2021001 - John Doe" - Always show enrollment number alongside name for easy identification
2. Employee Lists & Reports: - Display format: "Jane Smith (EMP12345)" or "EMP12345 - Jane Smith" - Always show employee ID alongside name
3. Assessment Assignment Interface: - When selecting students, show enrollment number in autocomplete/dropdown - Search functionality must support searching by enrollment_number OR name - Example: Typing “CS2021” shows all students with enrollment numbers starting with “CS2021”
4. Reports & Exports: - Always include both name and enrollment_number/employee_id columns - Make enrollment_number/employee_id the primary identifier in CSV exports - Example CSV header: enrollment_number,name,email,score,grade
4.5 Bulk Import Enhancements
CSV Upload Support:
enrollment_number,assessment_id
CS2021001,uuid-of-assessment
CS2021045,uuid-of-assessment
ME2020022,uuid-of-assessment
System Processing: 1. Read CSV line by line 2. For each enrollment_number, query: SELECT id FROM members WHERE enrollment_number = ? AND tenant_id = ? 3. Create assessment_assignment record using the found member UUID 4. Report success/failure for each line

Enhancement #5: Intelligent Recommendations System
5.1 Overview
This enhancement transforms Sudaksha from a passive tool into an intelligent advisor that proactively suggests best practices, optimal configurations, and actionable insights based on context, user role, and industry standards.
5.2 Recommendation Categories
A. Assessment Creation Recommendations
Recommendation Type
Context
Suggestion
Assessment Method Mix
For technical role (e.g., Software Engineer)
“Recommended: 40% Code Execution, 40% MCQ, 20% Voice AI Interview”
Difficulty Level
For 3rd year CS students
“Suggested: Junior to Middle level (students typically lack senior-level experience)”
Question Distribution
For 50-question MCQ assessment
“Recommended: 20 Easy, 20 Medium, 10 Hard questions for balanced assessment”
Duration Estimate
Based on question count and type
“Estimated completion time: 60-75 minutes (avg 1.5 min per MCQ question)”
Pass Threshold
For certification assessment
“Industry standard: 70% for junior roles, 80% for senior roles”
B. Report Generation Recommendations
Scenario
User Goal
Recommended Report
Post-Class Assessment
Identify struggling students
“Student Performance by Topic + Bottom 20% Intervention Report”
Hiring Decision
Compare candidates
“Candidate Comparison Matrix with Competency Heatmap”
Quarterly Review
Track team progress
“Team Competency Growth Trend + Gap Analysis Dashboard”
Curriculum Planning
Identify missing competencies
“Cohort Competency Gap Analysis by Program”
C. Survey Recommendations
Purpose
Recommendation
Optimal Frequency
Employee Engagement
“Use Employee Satisfaction Template with Likert scale + open feedback”
“Quarterly (4 times/year)”
Course Feedback
“Use Course Evaluation Template with teaching effectiveness metrics”
“End of semester”
Training Effectiveness
“Use Training Evaluation with knowledge gain + application intent questions”
“Immediately post-training + 30 days follow-up”
5.3 Implementation Approach
1. Contextual Trigger System:
interface RecommendationContext {
  userRole: string;           // 'DEPT_HEAD', 'CLASS_TEACHER', 'TEAM_LEAD'
  targetAudience: string;     // 'STUDENTS', 'EMPLOYEES'
  assessmentType: string;     // 'TECHNICAL', 'BEHAVIORAL', 'MIXED'
  competencyCategory: string; // 'CODING', 'COMMUNICATION', 'LEADERSHIP'
  roleLevel: string;          // 'JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'
}
System analyzes context and triggers relevant recommendations automatically when patterns match.
2. UI Presentation:
<!-- Recommendation Card Example -->
<div class="recommendation-card">
  <div class="icon">💡</div>
  <div class="content">
    <h4>Suggested Assessment Mix</h4>
    <p>For technical roles, we recommend: 40% Code Execution, 40% MCQ, 20% Voice AI</p>
    <button class="why-tooltip">Why?</button>
    <button class="apply-btn">Apply Suggestion</button>
    <button class="dismiss-btn">Dismiss</button>
  </div>
</div>
Features: - Dismissible info cards with lightbulb icon - “Why?” tooltip explaining rationale - “Apply” button to auto-fill suggested values - Users can always ignore or override (not enforced)
3. Recommendation Rules Database:
CREATE TABLE recommendation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50), -- 'ASSESSMENT', 'REPORT', 'SURVEY'
  trigger_context JSONB, -- Conditions that trigger this recommendation
  recommendation_text TEXT,
  rationale TEXT,
  auto_apply_values JSONB, -- Values to auto-fill if user clicks "Apply"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_recommendation_category ON recommendation_rules(category);
CREATE INDEX idx_recommendation_context ON recommendation_rules USING GIN (trigger_context);

-- Track recommendation usage
CREATE TABLE recommendation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES recommendation_rules(id),
  user_id UUID REFERENCES users(id),
  context JSONB,
  action VARCHAR(20) CHECK (action IN ('APPLIED', 'DISMISSED', 'MODIFIED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendation_usage_rule ON recommendation_usage(rule_id);
CREATE INDEX idx_recommendation_usage_user ON recommendation_usage(user_id);
Example Recommendation Rule:
INSERT INTO recommendation_rules (category, trigger_context, recommendation_text, rationale, auto_apply_values)
VALUES (
  'ASSESSMENT',
  '{"role_category": "technical", "audience": "students", "year": [3, 4]}',
  'Recommended: 40% Code Execution, 40% MCQ, 20% Voice AI',
  'Technical roles require hands-on coding validation. MCQs test theoretical knowledge. Voice AI assesses communication skills critical for teamwork.',
  '{"code_execution_weight": 40, "mcq_weight": 40, "voice_ai_weight": 20}'
);
5.4 User Interaction Flow
1. User begins creating an assessment for “Software Engineer - Junior” role
2. System detects: Technical role + Junior level + For students
3. Displays recommendation card:
“💡 Suggested Assessment Mix: 40% Code, 40% MCQ, 20% Voice AI”
4. User can:
– Click “Apply” to auto-fill
– Click “Dismiss” to ignore
– Manually adjust after applying
5. Action logged in recommendation_usage for future improvement of suggestion accuracy
5.5 Machine Learning Enhancement (Future Phase)
Track recommendation acceptance/rejection rates to: - Identify which recommendations are most valuable - Refine trigger conditions based on actual user behavior - Personalize recommendations based on user preferences over time

Enhancement #6: Navigation Label Update
6.1 Overview
This is a simple UX improvement to better reflect the actual functionality of the page. The current label “Competency Matrix” is misleading as the page primarily manages roles and their associated competencies.
6.2 Change Required
Location
Current Label
New Label
Super Admin Sidebar
❌ Competency Matrix
✅ Role Matrix
6.3 Rationale
The page displays a matrix of Roles (rows) × Competencies (columns), making “Role Matrix” a more accurate descriptor. This change improves navigational clarity and helps users quickly understand the page’s primary function.
6.4 Implementation
// Simple label change in navigation config
const superAdminNavigation = [
  { label: 'Dashboard', path: '/assessments/admin/dashboard' },
  { label: 'Tenants', path: '/assessments/admin/tenants' },
  { label: 'Role Matrix', path: '/assessments/admin/competencies' }, // Changed from "Competency Matrix"
  { label: 'Approvals', path: '/assessments/admin/approvals' },
  { label: 'Usage Analytics', path: '/assessments/admin/analytics' }
];

Database Migration Summary
This section consolidates all database schema changes required across all enhancements for easy implementation.
Complete Migration Script
-- ============================================
-- ENHANCEMENT #1: Polymorphic Role & Competency Creation
-- ============================================

-- Update roles table
ALTER TABLE roles 
ADD COLUMN created_by_tenant_id UUID REFERENCES tenants(id),
ADD COLUMN role_type VARCHAR(20) CHECK (role_type IN ('SYSTEM', 'CORPORATE', 'INSTITUTION')),
ADD COLUMN is_system_role BOOLEAN DEFAULT FALSE,
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING_APPROVAL' 
  CHECK (approval_status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DRAFT', 
                              'PENDING_DEPT_HEAD', 'PENDING_SUPER_ADMIN')),
ADD COLUMN submitted_by_user_id UUID REFERENCES users(id),
ADD COLUMN submitted_at TIMESTAMPTZ,
ADD COLUMN approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN rejected_by_user_id UUID REFERENCES users(id),
ADD COLUMN rejected_at TIMESTAMPTZ,
ADD COLUMN rejection_reason TEXT;

-- Add constraint for role ownership
ALTER TABLE roles 
ADD CONSTRAINT role_ownership_check CHECK (
  (is_system_role = TRUE AND created_by_tenant_id IS NULL) OR
  (is_system_role = FALSE AND created_by_tenant_id IS NOT NULL)
);

-- Create indexes for roles
CREATE INDEX idx_roles_tenant ON roles(created_by_tenant_id);
CREATE INDEX idx_roles_approval_status ON roles(approval_status);
CREATE INDEX idx_roles_type ON roles(role_type);

-- Update competencies table
ALTER TABLE competencies 
ADD COLUMN created_by_tenant_id UUID REFERENCES tenants(id),
ADD COLUMN competency_type VARCHAR(20) CHECK (competency_type IN ('SYSTEM', 'CORPORATE', 'INSTITUTION')),
ADD COLUMN is_system_competency BOOLEAN DEFAULT FALSE,
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'PENDING_APPROVAL',
ADD COLUMN submitted_by_user_id UUID REFERENCES users(id),
ADD COLUMN submitted_at TIMESTAMPTZ,
ADD COLUMN approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN rejected_by_user_id UUID REFERENCES users(id),
ADD COLUMN rejected_at TIMESTAMPTZ,
ADD COLUMN rejection_reason TEXT;

-- Create indexes for competencies
CREATE INDEX idx_competencies_tenant ON competencies(created_by_tenant_id);
CREATE INDEX idx_competencies_approval_status ON competencies(approval_status);
CREATE INDEX idx_competencies_type ON competencies(competency_type);

-- Create approval history table
CREATE TABLE approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  approver_role VARCHAR(50) NOT NULL,
  approver_user_id UUID REFERENCES users(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED')),
  action_at TIMESTAMPTZ DEFAULT NOW(),
  comments TEXT,
  iteration_number INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_entity ON approval_history(entity_type, entity_id);
CREATE INDEX idx_approval_iteration ON approval_history(entity_id, iteration_number);

-- ============================================
-- ENHANCEMENT #2: Student Level Restrictions
-- ============================================

ALTER TABLE members 
ADD COLUMN has_graduated BOOLEAN DEFAULT FALSE,
ADD COLUMN graduation_date DATE;

-- Update existing students
UPDATE members 
SET has_graduated = FALSE 
WHERE tenant_type = 'INSTITUTION' AND role IN ('STUDENT');

-- ============================================
-- ENHANCEMENT #4: Unique Identifiers
-- ============================================

ALTER TABLE members 
ADD COLUMN enrollment_number VARCHAR(50) UNIQUE,
ADD COLUMN employee_id VARCHAR(50) UNIQUE;

-- Add conditional constraints
ALTER TABLE members 
ADD CONSTRAINT enrollment_for_students CHECK (
  (tenant_type = 'INSTITUTION' AND enrollment_number IS NOT NULL) OR
  (tenant_type != 'INSTITUTION')
),
ADD CONSTRAINT employee_id_for_corporate CHECK (
  (tenant_type = 'CORPORATE' AND employee_id IS NOT NULL) OR
  (tenant_type != 'CORPORATE')
);

-- Create indexes for fast lookups
CREATE INDEX idx_members_enrollment ON members(enrollment_number);
CREATE INDEX idx_members_employee_id ON members(employee_id);

-- ============================================
-- ENHANCEMENT #5: Intelligent Recommendations
-- ============================================

CREATE TABLE recommendation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50),
  trigger_context JSONB,
  recommendation_text TEXT,
  rationale TEXT,
  auto_apply_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_recommendation_category ON recommendation_rules(category);
CREATE INDEX idx_recommendation_context ON recommendation_rules USING GIN (trigger_context);

-- Track recommendation usage
CREATE TABLE recommendation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES recommendation_rules(id),
  user_id UUID REFERENCES users(id),
  context JSONB,
  action VARCHAR(20) CHECK (action IN ('APPLIED', 'DISMISSED', 'MODIFIED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendation_usage_rule ON recommendation_usage(rule_id);
CREATE INDEX idx_recommendation_usage_user ON recommendation_usage(user_id);

Implementation Timeline & Phases
The following timeline assumes parallel development by AntiGravity AI agent and provides a realistic roadmap for implementing all six enhancements.
Phase
Enhancements
Duration
Deliverables
Phase 1
• Enhancement #4 (Unique IDs)• Enhancement #6 (Label Change)
2-3 days
• Database migration• UI label update• CSV upload support
Phase 2
• Enhancement #2 (Student Restrictions)• Enhancement #3 (Staff Profiles)
4-5 days
• Level restriction logic• Limited staff profiles• Assignment methods (Class/Project/CSV)
Phase 3
• Enhancement #1 (Polymorphic Roles)
7-10 days
• Polymorphic forms• Approval workflow• Audit trail• Tenant isolation
Phase 4
• Enhancement #5 (Recommendations)
5-7 days
• Recommendation engine• Context detection• Suggestion UI• Usage analytics
Phase 5
• Testing & QA• Documentation
3-4 days
• End-to-end testing• User acceptance testing• Technical documentation• User guides
Total Estimated Timeline: 21-29 days

Conclusion & Next Steps
These six enhancements represent a significant evolution of the Sudaksha Assessment Portal, transforming it from a basic assessment tool into an intelligent, multi-tenant platform with robust workflow management, contextual intelligence, and user-centric design.
Key Benefits
1. Scalability:
Tenant-specific customization enables the platform to serve diverse organizations without code changes
2. Quality Control:
Multi-level approval workflow ensures custom roles and competencies maintain quality standards
3. Contextual Accuracy:
Student level restrictions and staff role boundaries prevent inappropriate assessments
4. Usability:
Human-readable identifiers and intelligent recommendations reduce cognitive load on users
5. Intelligence:
System acts as a knowledgeable advisor, not just a passive tool, guiding users toward best practices
Immediate Next Steps
1. ✅ Review and approve this specification document
2. ✅ Execute database migration script in development environment
3. ✅ Begin Phase 1 implementation (Enhancements #4 and #6)
4. ✅ Prepare AntiGravity AI prompts for automated implementation
5. ✅ Schedule UAT sessions with representative users from each tenant type

END OF DOCUMENT
