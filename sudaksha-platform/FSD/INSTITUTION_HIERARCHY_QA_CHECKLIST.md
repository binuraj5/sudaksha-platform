# Institution Hierarchy - Comprehensive QA & Testing Checklist

**Purpose:** Verify that ALL functionality, UI, UX, and micro-level features are fully implemented and working correctly for the Department → Course → Class → Student hierarchy.

**Instructions for Testing:**
1. Test in order (don't skip steps - later tests depend on earlier setup)
2. Mark each item as ✅ PASS or ❌ FAIL
3. For failures, note the exact error message and steps to reproduce
4. Test with MULTIPLE user roles (Super Admin, Tenant Admin, HoD, Class Teacher)
5. Test on both desktop and mobile viewports

---

## 🔐 TEST ENVIRONMENT SETUP

### Prerequisites
- [ ] Database migration completed successfully (`npx prisma migrate deploy`)
- [ ] Prisma client regenerated (`npx prisma generate`)
- [ ] Dev server running without errors
- [ ] Test institution exists with slug (e.g., "stanford-university")
- [ ] Test users created:
  - [ ] Super Admin user
  - [ ] Tenant Admin user
  - [ ] HoD user (manages IT department)
  - [ ] Class Teacher user (assigned to a specific class)

### Test Data Required
Before starting tests, create:
- [ ] At least 2 departments (e.g., "IT", "Mechanical")
- [ ] IT department has HoD assigned
- [ ] At least 1 Class Teacher member

---

## 📋 SECTION 1: SCHEMA & DATABASE

### 1.1 Database Schema Verification
```sql
-- Run these queries to verify schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Activity' 
AND column_name IN ('yearBegin', 'yearEnd', 'division', 'semesterCount', 'yearCount', 'deletedAt', 'deletedBy');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ActivityOrgUnit' 
AND column_name = 'relationship';
```

**Checklist:**
- [ ] `Activity.yearBegin` exists (INTEGER, nullable)
- [ ] `Activity.yearEnd` exists (INTEGER, nullable)
- [ ] `Activity.division` exists (TEXT/ENUM, nullable)
- [ ] `Activity.semesterCount` exists (INTEGER, nullable)
- [ ] `Activity.yearCount` exists (INTEGER, nullable)
- [ ] `Activity.deletedAt` exists (TIMESTAMP, nullable)
- [ ] `Activity.deletedBy` exists (TEXT, nullable)
- [ ] `ActivityOrgUnit.relationship` exists (TEXT, nullable)
- [ ] `ActivityType` enum includes 'COURSE' value
- [ ] No migration errors in console
- [ ] All indexes created successfully

### 1.2 Data Integrity Checks
- [ ] Can query existing departments without errors
- [ ] Can query existing classes without errors
- [ ] Existing student records unchanged (orgUnitId still valid)
- [ ] No foreign key constraint violations

---

## 📊 SECTION 2: NAVIGATION & URL STRUCTURE

### 2.1 Institution Routes (Logged in as HoD)

**Base URL Tests:**
- [ ] `/assessments/org/:slug` redirects correctly or shows landing page
- [ ] `/assessments/org/:slug/departments` loads department list
- [ ] URL shows correct institution slug (not UUID)
- [ ] Browser back/forward buttons work correctly

**Department Routes:**
- [ ] `/assessments/org/:slug/departments/:deptId` loads department detail
- [ ] Department detail shows correct department name
- [ ] URL uses department UUID (not slug)
- [ ] Can access department HoD manages
- [ ] **Cannot** access department HoD doesn't manage (shows 403 or redirects)

**Course Routes:**
- [ ] `/assessments/org/:slug/courses/:courseId` loads course detail
- [ ] Course detail shows correct course information
- [ ] 404 shown for non-existent course ID
- [ ] Accessing course from different tenant shows 403

**Class Routes:**
- [ ] `/assessments/org/:slug/classes/:classId` loads class detail
- [ ] Class detail shows correct class information
- [ ] Can access class in managed department
- [ ] **Cannot** access class in unmanaged department

### 2.2 Breadcrumb Navigation
Test from each page:

**Department Detail:**
- [ ] Breadcrumb shows: "Home > Departments > [Dept Name]"
- [ ] Clicking "Home" goes to dashboard
- [ ] Clicking "Departments" goes to department list
- [ ] Current page (Dept Name) is not clickable

**Course Detail:**
- [ ] Breadcrumb shows: "Home > Departments > [Dept Name] > Courses > [Course Name]"
- [ ] All links work correctly
- [ ] Current page not clickable

**Class Detail:**
- [ ] Breadcrumb shows: "Home > Departments > [Dept Name] > Classes > [Class Name]"
- [ ] If class linked to course: "Home > Departments > [Dept Name] > Courses > [Course Name] > [Class Name]"
- [ ] All links work correctly

### 2.3 Sidebar Navigation (Institution Context)
- [ ] Sidebar shows "Departments" menu item
- [ ] Sidebar shows "Courses" menu item (if implemented)
- [ ] Sidebar shows "Classes" menu item (if implemented)
- [ ] Active page highlighted in sidebar
- [ ] Sidebar collapses on mobile
- [ ] Icons displayed correctly

---

## 🏢 SECTION 3: DEPARTMENT DETAIL PAGE

**Navigate to:** `/assessments/org/:slug/departments/:deptId`

### 3.1 Page Layout
- [ ] Page loads without errors (check console)
- [ ] Department name displayed in header
- [ ] Tabs visible: Overview, Courses, Classes, Members
- [ ] Default tab opens on page load
- [ ] Tab navigation works (clicking tabs switches content)
- [ ] Selected tab highlighted visually
- [ ] Mobile responsive (tabs stack or scroll horizontally)

### 3.2 Overview Tab
- [ ] Department name, code displayed
- [ ] HoD name and contact info shown
- [ ] Stats cards displayed (if implemented):
  - [ ] Total Courses count
  - [ ] Total Classes count
  - [ ] Total Students count
  - [ ] Total Faculty count
- [ ] Stats are accurate (verify against database)
- [ ] Description shown (if exists)
- [ ] No layout overflow or broken styles

### 3.3 Courses Tab

**Empty State:**
- [ ] If no courses: "No courses yet" message shown
- [ ] "Add Course" button visible and prominent
- [ ] Empty state has helpful illustration/icon

**With Courses:**
- [ ] Courses list displayed in table/card format
- [ ] Each course shows:
  - [ ] Course name
  - [ ] Course code
  - [ ] Year range (e.g., "2023 - 2027")
  - [ ] Division (e.g., "8 Semesters / 4 Years")
  - [ ] Number of linked classes
  - [ ] Number of students (if calculated)
- [ ] Courses sorted logically (by year or name)
- [ ] View/Edit/Delete actions visible per row
- [ ] Pagination works (if >10 courses)
- [ ] Search/filter works (if implemented)

**Add Course Button:**
- [ ] Button visible at top of tab
- [ ] Button labeled "Add Course" or "➕ Add Course"
- [ ] Only visible for Admin/HoD (not Class Teacher)
- [ ] Clicking opens CreateCourseDialog
- [ ] Button disabled state works if no permission

**Upload Courses Button (if implemented):**
- [ ] "Upload Courses" or "📤 Upload CSV" button visible
- [ ] Only visible for Admin/HoD
- [ ] Clicking opens BulkUploadCoursesDialog

**Actions Per Course Row:**
- [ ] 👁️ View icon/link present → navigates to course detail
- [ ] ✏️ Edit icon/button present (for Admin/HoD only)
- [ ] 🗑️ Delete icon/button present (for Admin/HoD only)
- [ ] Tooltip shows on hover for each action
- [ ] Actions disabled for users without permission

### 3.4 Classes Tab

**Empty State:**
- [ ] If no classes: "No classes yet" message shown
- [ ] "Add Class" button visible
- [ ] Empty state helpful

**With Classes:**
- [ ] Classes list displayed
- [ ] Each class shows:
  - [ ] Class name
  - [ ] Class code
  - [ ] Linked course name (or "Not linked" warning)
  - [ ] Class Teacher name (or "No teacher assigned")
  - [ ] Number of students
- [ ] Warning badge (⚠️) shown for classes without course
- [ ] Warning text: "Not linked to course"
- [ ] Classes sorted by name or course
- [ ] Filter by course works (dropdown showing all dept courses)
- [ ] Selecting filter updates class list

**Add Class Button:**
- [ ] Button visible at top
- [ ] Visible for Admin, HoD, Class Teacher
- [ ] Opens CreateClassDialog

**Upload Classes Button (if implemented):**
- [ ] Button visible for Admin/HoD
- [ ] Opens BulkUploadClassesDialog

**Actions Per Class Row:**
- [ ] View icon → navigates to class detail
- [ ] Edit icon (for Admin/HoD/Teacher if own class)
- [ ] Delete icon (for Admin/HoD only)
- [ ] Actions respect permissions

### 3.5 Members Tab

**Student List:**
- [ ] Students displayed (if any exist)
- [ ] Each student shows:
  - [ ] Name
  - [ ] Enrollment number
  - [ ] Email
  - [ ] Class name
  - [ ] Course name (via class)
- [ ] Filter by class works (dropdown)
- [ ] Filter by course works (if implemented)
- [ ] Search by name/enrollment # works
- [ ] "Add Student" button visible
- [ ] "Upload Students" button visible

**Faculty List:**
- [ ] Faculty members shown (separate section or filter)
- [ ] Shows: Name, Email, Role (HoD/Class Teacher)
- [ ] Shows which classes they teach
- [ ] "Add Faculty" button (if implemented)

---

## 📚 SECTION 4: CREATE COURSE DIALOG

**Trigger:** Click "Add Course" from Department Courses tab

### 4.1 Dialog Appearance
- [ ] Dialog opens smoothly (no lag)
- [ ] Dialog title: "Create Course" or "Add Course"
- [ ] Dialog centered on screen
- [ ] Backdrop/overlay visible (dims background)
- [ ] Click outside dialog **doesn't** close it (or shows confirmation)
- [ ] ESC key closes dialog (or shows confirmation)
- [ ] Close button (×) in top corner works

### 4.2 Form Fields - Required Fields
- [ ] **Name** field:
  - [ ] Label: "Course Name"
  - [ ] Placeholder helpful (e.g., "B.Tech Computer Science")
  - [ ] Required indicator (*)
  - [ ] Validation: Cannot be empty
  - [ ] Error shown if submitted empty: "Course name is required"

- [ ] **Code** field:
  - [ ] Label: "Course Code"
  - [ ] Placeholder: e.g., "BTECH-CSE"
  - [ ] Required (*)
  - [ ] Validation: Cannot be empty
  - [ ] Validation: No special characters except hyphen/underscore
  - [ ] Error shown if invalid format

- [ ] **Year Begin** field:
  - [ ] Label: "Start Year"
  - [ ] Type: Number input
  - [ ] Placeholder: e.g., "2023"
  - [ ] Required (*)
  - [ ] Validation: Must be 4-digit year
  - [ ] Validation: Cannot be in far past (e.g., < 2000)
  - [ ] Validation: Cannot be far future (e.g., > current year + 10)
  - [ ] Default value: Current year (helpful)

- [ ] **Year End** field:
  - [ ] Label: "End Year"
  - [ ] Type: Number input
  - [ ] Placeholder: e.g., "2027"
  - [ ] Required (*)
  - [ ] Validation: Must be > Year Begin
  - [ ] Error shown if End < Begin: "End year must be after start year"
  - [ ] Auto-calculates based on Begin + typical duration (optional feature)

- [ ] **Division** field:
  - [ ] Label: "Course Division"
  - [ ] Type: Radio buttons or Dropdown
  - [ ] Options:
    - [ ] "Semesters Only"
    - [ ] "Years Only"
    - [ ] "Both Semesters and Years"
  - [ ] Required (*)
  - [ ] Default: None selected (forces user choice)
  - [ ] Helper text explains options

### 4.3 Form Fields - Conditional Fields

**If Division = "Semesters Only" or "Both":**
- [ ] **Semester Count** field appears
- [ ] Label: "Number of Semesters"
- [ ] Type: Number input
- [ ] Placeholder: "e.g., 8"
- [ ] Required when visible
- [ ] Validation: Must be > 0
- [ ] Validation: Must be reasonable (e.g., 1-20)
- [ ] Common values suggested (e.g., 2, 4, 6, 8)

**If Division = "Years Only" or "Both":**
- [ ] **Year Count** field appears
- [ ] Label: "Number of Years"
- [ ] Placeholder: "e.g., 4"
- [ ] Required when visible
- [ ] Validation: Must be > 0
- [ ] Validation: Must be ≤ (yearEnd - yearBegin)
- [ ] Error if yearCount > duration: "Cannot exceed course duration"

### 4.4 Form Fields - Optional Fields
- [ ] **Description** field:
  - [ ] Label: "Description" (no * indicator)
  - [ ] Type: Multiline text area
  - [ ] Placeholder: "Optional description..."
  - [ ] Not required
  - [ ] Character count shown (if limit exists)
  - [ ] Accepts line breaks

- [ ] **Slug** field (if editable):
  - [ ] Label: "URL Slug"
  - [ ] Auto-generated from code + yearBegin
  - [ ] Shown as read-only or editable
  - [ ] If editable: Validation for URL-safe characters
  - [ ] Preview shown: "URL will be: /courses/btech-cse-2023"

- [ ] **Curriculum Link** (if implemented):
  - [ ] Button: "Link Curriculum" or dropdown
  - [ ] Opens curriculum selector
  - [ ] Shows selected curriculum (if any)
  - [ ] Can deselect

### 4.5 Form Validation & Submission

**Client-Side Validation:**
- [ ] Empty required fields prevent submission
- [ ] Submit button disabled until form valid
- [ ] Real-time validation on blur (error shown after leaving field)
- [ ] All error messages clear and actionable
- [ ] No confusing technical jargon in errors

**Submit Button:**
- [ ] Labeled "Create Course" or "Add Course"
- [ ] Primary/prominent styling (e.g., blue/green)
- [ ] Disabled state visually clear (grayed out)
- [ ] Loading state while submitting:
  - [ ] Button shows spinner
  - [ ] Button text changes to "Creating..."
  - [ ] All form fields disabled during submission
  - [ ] Cannot submit twice (double-click prevented)

**Cancel Button:**
- [ ] Labeled "Cancel" or "Close"
- [ ] Secondary styling (e.g., gray outline)
- [ ] Always enabled
- [ ] Closes dialog immediately (or shows confirmation if form dirty)

**On Success:**
- [ ] Dialog closes automatically
- [ ] Success toast/notification appears: "Course created successfully"
- [ ] Courses list refreshes showing new course
- [ ] New course appears at top or sorted correctly
- [ ] No page reload required (optimistic update)

**On Error:**
- [ ] Dialog stays open
- [ ] Error message shown clearly (red alert box or inline)
- [ ] Specific error displayed (e.g., "Course code already exists")
- [ ] Form fields remain filled (user doesn't lose work)
- [ ] Can fix error and resubmit
- [ ] Error dismissible

**Specific Error Cases to Test:**
- [ ] Duplicate course code in same tenant:
  - Error: "Course code 'BTECH-CSE' already exists"
- [ ] Year End before Year Begin:
  - Error: "End year must be after start year"
- [ ] Missing semester count when division = SEMESTER:
  - Error: "Semester count is required for semester-based courses"
- [ ] Network error / API down:
  - Error: "Failed to create course. Please try again."
- [ ] Permission denied (testing as wrong role):
  - Error: "You don't have permission to create courses"

### 4.6 UX & Accessibility
- [ ] Tab order logical (name → code → yearBegin → etc.)
- [ ] Can navigate entire form with keyboard
- [ ] Enter key submits form (when valid)
- [ ] Field labels associated with inputs (click label focuses field)
- [ ] Required fields marked with * and aria-required
- [ ] Error messages have aria-live for screen readers
- [ ] Focus trapped in dialog (tab doesn't escape dialog)
- [ ] First field auto-focused when dialog opens
- [ ] Color contrast passes WCAG AA standards
- [ ] Font sizes readable (minimum 14px)

---

## 🏫 SECTION 5: CREATE CLASS DIALOG

**Trigger:** Click "Add Class" from Department Classes tab

### 5.1 Dialog Appearance
- [ ] Dialog opens smoothly
- [ ] Title: "Create Class" or "Add Class"
- [ ] Proper size (not too small or too large)
- [ ] Close button works
- [ ] Backdrop prevents clicking outside

### 5.2 Form Fields - Required
- [ ] **Name** field:
  - [ ] Label: "Class Name"
  - [ ] Placeholder: "e.g., Section A"
  - [ ] Required (*)
  - [ ] Cannot be empty

- [ ] **Code** field:
  - [ ] Label: "Class Code"
  - [ ] Placeholder: "e.g., CSE-A-2023"
  - [ ] Required (*)
  - [ ] Validation: No special characters except hyphen/underscore
  - [ ] Auto-generated suggestion (optional)

### 5.3 Form Fields - Optional
- [ ] **Course** field:
  - [ ] Label: "Course" (no * indicator)
  - [ ] Type: Dropdown/Autocomplete
  - [ ] Shows courses from current department only
  - [ ] Placeholder: "Select a course (optional)"
  - [ ] Can be left blank
  - [ ] Helper text: "Can be linked later"
  - [ ] If blank: Warning shown "Students cannot be added until class is linked"

- [ ] **Class Teacher** field (if implemented):
  - [ ] Label: "Class Teacher"
  - [ ] Type: Dropdown showing faculty members
  - [ ] Shows only faculty in this department
  - [ ] Can be left blank
  - [ ] Shows: "Name (email)" for each option

- [ ] **Description** field:
  - [ ] Optional multiline text
  - [ ] Accepts line breaks

### 5.4 Form Validation
- [ ] Required fields validated
- [ ] Class code uniqueness checked
- [ ] Cannot create class with duplicate code in same department
- [ ] Error shown if course selected from wrong department

### 5.5 Submission & Results
**Submit Button:**
- [ ] Labeled "Create Class"
- [ ] Loading state: "Creating..."
- [ ] Disabled during submission

**On Success:**
- [ ] Dialog closes
- [ ] Success toast: "Class created successfully"
- [ ] Classes list refreshes
- [ ] If no course linked: Warning badge shown on new class

**On Error:**
- [ ] Error message clear
- [ ] Specific errors for:
  - [ ] Duplicate class code
  - [ ] Invalid course selection
  - [ ] Permission denied

### 5.6 Permission-Based Behavior
**Test as HoD:**
- [ ] Can create class in managed department
- [ ] Can select any course in that department
- [ ] **Cannot** create class in different department

**Test as Class Teacher:**
- [ ] Can create class in own department (if permitted)
- [ ] Can select courses
- [ ] Can set self as class teacher (optional)

**Test as Tenant Admin:**
- [ ] Can create class in any department
- [ ] No restrictions

---

## 📖 SECTION 6: COURSE DETAIL PAGE

**Navigate to:** `/assessments/org/:slug/courses/:courseId`

### 6.1 Page Load & Header
- [ ] Page loads without console errors
- [ ] Course name displayed prominently
- [ ] Course code displayed (e.g., badge or subtitle)
- [ ] Loading state shown while fetching data
- [ ] 404 page if courseId invalid
- [ ] 403 page if user lacks permission

### 6.2 Course Information Section
- [ ] Department name shown with link back to dept detail
- [ ] Year range displayed: "2023 - 2027"
- [ ] Division displayed: "8 Semesters (4 Years)" or equivalent
- [ ] If semester-based: Semester count shown
- [ ] If year-based: Year count shown
- [ ] Description shown (if exists)
- [ ] Created date shown (optional)
- [ ] Last updated date shown (optional)

### 6.3 Stats Cards (if implemented)
- [ ] Total Classes count
  - [ ] Number accurate
  - [ ] Links to classes section below
- [ ] Total Students count
  - [ ] Calculated from all linked classes
  - [ ] Updates when classes change
- [ ] Completion Rate (optional)
  - [ ] Shows progress through course duration
  - [ ] Calculated as: (current date - yearBegin) / (yearEnd - yearBegin)
  - [ ] Displayed as percentage or progress bar

### 6.4 Linked Curriculum Section (if implemented)
- [ ] Section title: "Curriculum"
- [ ] If linked:
  - [ ] Shows program name
  - [ ] Shows subjects (expandable/collapsible)
  - [ ] Shows topics under subjects
  - [ ] "Edit Curriculum" button visible (for Admin/HoD)
- [ ] If not linked:
  - [ ] "No curriculum linked" message
  - [ ] "Link Curriculum" button visible
  - [ ] Clicking opens curriculum selector dialog

### 6.5 Classes Section
- [ ] Section title: "Classes" or "Linked Classes"
- [ ] Table/List showing classes
- [ ] Each class row shows:
  - [ ] Class name
  - [ ] Class code
  - [ ] Class Teacher name (or "No teacher")
  - [ ] Number of students
  - [ ] Actions (View/Edit/Delete)
- [ ] "Add Class to Course" button:
  - [ ] Visible for Admin/HoD
  - [ ] Opens dialog to create new class pre-linked to this course
- [ ] If no classes:
  - [ ] "No classes linked yet" message
  - [ ] Call-to-action button prominent

### 6.6 Action Buttons (Header)
**Edit Course Button:**
- [ ] Visible for Admin and HoD only
- [ ] Labeled "Edit Course" or "✏️ Edit"
- [ ] Clicking opens EditCourseDialog
- [ ] Hidden for Class Teacher and Students

**Delete Course Button:**
- [ ] Visible for Admin and HoD only
- [ ] Labeled "Delete Course" or "🗑️ Delete"
- [ ] Color: Red/danger
- [ ] Clicking opens DeleteCourseDialog
- [ ] Hidden for users without permission

**Back to Department Button (optional):**
- [ ] Labeled "← Back to Department" or in breadcrumb
- [ ] Navigates to department detail page
- [ ] Opens Courses tab automatically

### 6.7 Edit Course Dialog
**Trigger:** Click "Edit Course" button

**Dialog Behavior:**
- [ ] Opens with form pre-filled with current course data
- [ ] Title: "Edit Course"
- [ ] All fields editable except:
  - [ ] Year Begin (read-only / disabled)
  - [ ] Division (read-only / disabled)
  - [ ] Semester/Year counts (read-only / disabled)
- [ ] Editable fields:
  - [ ] Name
  - [ ] Description
  - [ ] Year End (can extend, not shorten if students exist)
  - [ ] Slug (if allowed)
  - [ ] Curriculum link

**Validation:**
- [ ] Name cannot be empty
- [ ] Year End cannot be < Year Begin
- [ ] Year End cannot be shortened if students already enrolled (show error)

**Submit:**
- [ ] Button: "Save Changes"
- [ ] Loading state: "Saving..."
- [ ] On success:
  - [ ] Dialog closes
  - [ ] Success toast: "Course updated successfully"
  - [ ] Page data refreshes showing new values
  - [ ] No page reload
- [ ] On error:
  - [ ] Error message shown in dialog
  - [ ] Can fix and retry

**Cancel:**
- [ ] Button: "Cancel"
- [ ] Discards changes
- [ ] Closes dialog
- [ ] If form dirty (changed), shows confirmation: "Discard changes?"

### 6.8 Delete Course Dialog
**Trigger:** Click "Delete Course" button

**Dialog Behavior:**
- [ ] Opens as modal
- [ ] Title: "Delete Course" or "Confirm Deletion"
- [ ] Warning message: "Are you sure you want to delete [Course Name]?"
- [ ] Warning icon/color (red/orange)
- [ ] States consequences:
  - [ ] "All linked classes will be unlinked"
  - [ ] "This action cannot be undone"

**Validation Before Deletion:**
- [ ] If course has classes WITH students:
  - [ ] Deletion blocked
  - [ ] Error shown in dialog: "Cannot delete course with enrolled students"
  - [ ] Error includes count: "50 students across 3 classes"
  - [ ] Helpful message: "Move students first or archive course instead"
  - [ ] Delete button disabled
  - [ ] Only option: Close/Cancel
- [ ] If course has classes WITHOUT students:
  - [ ] Warning shown: "This course has X empty classes"
  - [ ] Message: "These classes will be unlinked"
  - [ ] Delete button enabled but requires confirmation

**Delete Button:**
- [ ] Labeled "Delete" or "Delete Course"
- [ ] Color: Red/danger
- [ ] Requires second confirmation (optional but recommended)
- [ ] Loading state: "Deleting..."

**Cancel Button:**
- [ ] Always present
- [ ] Closes dialog
- [ ] No action taken

**On Successful Deletion:**
- [ ] Dialog closes
- [ ] Success toast: "Course deleted successfully"
- [ ] Redirects to department detail page (Courses tab)
- [ ] Deleted course no longer appears in list

**On Deletion Error:**
- [ ] Error message shown in dialog (red alert box)
- [ ] Specific error from API (e.g., "Students still enrolled")
- [ ] Can close dialog and fix issue
- [ ] Can retry after fixing (optional)

### 6.9 Mobile Responsiveness
- [ ] Page layout adapts to mobile viewport
- [ ] Stats cards stack vertically
- [ ] Tables scroll horizontally or become cards
- [ ] Action buttons accessible (not hidden)
- [ ] Text readable without zoom
- [ ] Breadcrumbs collapse appropriately

---

## 🎓 SECTION 7: CLASS DETAIL PAGE

**Navigate to:** `/assessments/org/:slug/classes/:classId`

### 7.1 Page Load & Header
- [ ] Page loads without errors
- [ ] Class name displayed prominently
- [ ] Class code shown
- [ ] Loading state while fetching
- [ ] 404 if classId invalid
- [ ] 403 if no permission

### 7.2 Class Information Section
- [ ] Department name with link
- [ ] Course name with link (if linked)
- [ ] If NOT linked to course:
  - [ ] Warning alert displayed
  - [ ] Message: "⚠️ Not linked to course"
  - [ ] Explanation: "Link to a course before adding students"
  - [ ] "Link to Course" button prominent
  - [ ] Warning styled appropriately (yellow/orange)
- [ ] Class Teacher info:
  - [ ] Name displayed
  - [ ] Email shown or link to profile
  - [ ] If no teacher: "No teacher assigned"
  - [ ] "Assign Teacher" button (for Admin/HoD)

### 7.3 Stats Cards (if implemented)
- [ ] Total Students count
- [ ] Current Semester/Year (calculated from course + date)
  - [ ] Formula: Based on months since course start
  - [ ] Example: If course started Aug 2023, now Feb 2026 → "Semester 5" or "Year 3"
- [ ] Assessments completed (if implemented)

### 7.4 Students Section
- [ ] Section title: "Students" or "Enrolled Students"
- [ ] If class NOT linked to course:
  - [ ] Info message: "Link to course before adding students"
  - [ ] Student list hidden or empty
  - [ ] Add button disabled with tooltip explaining why
- [ ] If class linked to course:
  - [ ] Student table/list displayed
  - [ ] Each student row shows:
    - [ ] Name
    - [ ] Enrollment number
    - [ ] Email
    - [ ] Joined date (optional)
    - [ ] Actions (View/Edit/Remove)
  - [ ] Search by name works
  - [ ] Search by enrollment # works
  - [ ] Filter by status (active/graduated) if implemented
  - [ ] Pagination if >20 students
  - [ ] "Add Students" button enabled
  - [ ] "Upload Students" button enabled

**Add Students Button:**
- [ ] Visible for Admin, HoD, Class Teacher (if managing this class)
- [ ] Opens AddStudentDialog
- [ ] Only enabled if class has course

**Upload Students Button:**
- [ ] Opens BulkUploadStudentsDialog
- [ ] Pre-fills class_code with current class
- [ ] Only enabled if class has course

### 7.5 Link Class to Course Dialog
**Trigger:** Click "Link to Course" from warning alert or header

**Dialog Behavior:**
- [ ] Opens as modal
- [ ] Title: "Link [Class Name] to Course"
- [ ] Instruction text: "Select a course from the same department"
- [ ] Course dropdown:
  - [ ] Shows only courses in class's department
  - [ ] Each option formatted: "Course Name (CODE) - Year Range"
  - [ ] Example: "B.Tech CSE (BTECH-CSE) - 2023-2027"
  - [ ] Searchable/filterable
  - [ ] Sorted by year descending (newest first)
- [ ] If no courses available:
  - [ ] Message: "No courses in this department yet"
  - [ ] Link to create course: "Create a course first"
  - [ ] Link button navigates to dept detail Courses tab

**Submit:**
- [ ] Button: "Link to Course"
- [ ] Disabled until course selected
- [ ] Loading state: "Linking..."
- [ ] On success:
  - [ ] Dialog closes
  - [ ] Success toast: "Class linked to course successfully"
  - [ ] Page refreshes showing course info
  - [ ] Warning banner removed
  - [ ] Students section now functional

**Cancel:**
- [ ] Button: "Cancel"
- [ ] Closes dialog
- [ ] No changes made

### 7.6 Edit Class Dialog (if implemented)
**Trigger:** Click "Edit Class" button

**Dialog Behavior:**
- [ ] Pre-filled with class data
- [ ] Editable fields:
  - [ ] Name
  - [ ] Description
  - [ ] Course (can change link)
  - [ ] Class Teacher
- [ ] Read-only:
  - [ ] Code (cannot change)
  - [ ] Department (cannot move to different dept)

**Validation:**
- [ ] Name required
- [ ] If changing course:
  - [ ] Can only select course from same department
  - [ ] Warning if students exist: "Changing course will affect student records"
- [ ] If assigning teacher:
  - [ ] Can only select faculty from same department

**Submit:**
- [ ] "Save Changes" button
- [ ] On success: Toast + page refresh
- [ ] On error: Show error, keep dialog open

### 7.7 Action Buttons (Header)
**Edit Class:**
- [ ] Visible for Admin, HoD, Class Teacher (if they manage this class)
- [ ] Opens EditClassDialog

**Delete Class:**
- [ ] Visible for Admin, HoD only
- [ ] Disabled if class has students (with tooltip)
- [ ] If no students: Opens confirmation dialog
- [ ] Confirmation shows: "Delete [Class Name]?"
- [ ] On confirm: Deletes and redirects to dept Classes tab

**Assign Class Teacher (if implemented):**
- [ ] Visible for Admin, HoD
- [ ] Opens faculty selector
- [ ] Can search by name/email
- [ ] On select: Updates class.managerId
- [ ] Toast confirmation

### 7.8 Mobile Responsiveness
- [ ] Layout adapts to mobile
- [ ] Warning alert readable
- [ ] Student list becomes cards or scrollable
- [ ] Action buttons accessible
- [ ] All text readable

---

## 👨‍🎓 SECTION 8: STUDENT MANAGEMENT

### 8.1 Add Student Dialog
**Trigger:** Click "Add Students" from class detail

**Dialog Behavior:**
- [ ] Opens as modal or side panel
- [ ] Title: "Add Student to [Class Name]"
- [ ] Form fields:
  - [ ] First Name (required)
  - [ ] Last Name (required)
  - [ ] Email (required, email validation)
  - [ ] Enrollment Number (required, unique check)
  - [ ] Phone (optional)
  - [ ] Has Graduated (checkbox, default false)
  - [ ] Graduation Date (conditional, if Has Graduated = true)
- [ ] Class pre-filled and read-only (shows current class)
- [ ] Course shown (read-only, from class)

**Validation:**
- [ ] Email format checked
- [ ] Enrollment # uniqueness validated
- [ ] If enrollment # exists: Error "Enrollment number already in use"
- [ ] Phone format validated (if provided)
- [ ] Graduation date required if Has Graduated checked
- [ ] Graduation date cannot be in future

**Submit:**
- [ ] Button: "Add Student"
- [ ] On success:
  - [ ] Dialog closes
  - [ ] Success toast: "Student added successfully"
  - [ ] Student appears in class list immediately
  - [ ] Total student count updates
- [ ] On error:
  - [ ] Error shown in dialog
  - [ ] Specific errors highlighted per field
  - [ ] Can fix and resubmit

### 8.2 Bulk Upload Students
**Trigger:** Click "Upload Students" from class detail or dept Members tab

**Dialog Behavior:**
- [ ] Opens as modal
- [ ] Title: "Bulk Upload Students"
- [ ] Instructions shown:
  - [ ] "Upload a CSV file with student data"
  - [ ] "Required columns: first_name, last_name, email, enrollment_number, class_code"
  - [ ] Link to download CSV template
- [ ] File upload area:
  - [ ] Drag-and-drop zone
  - [ ] Or "Browse files" button
  - [ ] Accepts only .csv files
  - [ ] Shows file name after selection
  - [ ] Can change file before upload

**Template Download:**
- [ ] "Download Template" link present
- [ ] Clicking downloads sample CSV
- [ ] Template includes:
  - [ ] Header row with correct column names
  - [ ] 2-3 example rows
  - [ ] Comments explaining format (optional)

**Upload Processing:**
- [ ] After selecting file: "Upload" button enabled
- [ ] Clicking upload:
  - [ ] Shows progress indicator
  - [ ] Progress text: "Processing... X of Y rows"
  - [ ] Cannot close dialog during processing
- [ ] Validation per row:
  - [ ] Class code must exist
  - [ ] Class must have linked course
  - [ ] Enrollment # must be unique
  - [ ] Email format checked

**Results Display:**
- [ ] After processing completes:
  - [ ] Success count shown: "✅ 45 students added"
  - [ ] Error count shown: "❌ 5 rows failed"
  - [ ] If errors:
    - [ ] Error table displayed
    - [ ] Shows: Row #, Issue, Student data
    - [ ] Example: "Row 23: Enrollment number already exists"
  - [ ] "Download Error Report" button (CSV with errors)
  - [ ] "Close" button (enabled after processing)

**On Close:**
- [ ] Students list refreshes showing new students
- [ ] Success toast summarizes: "45 students added, 5 failed"

### 8.3 Student Validation Rules (Backend)
**Test by attempting to create invalid students:**

- [ ] **Class without course:**
  - Create class without linking to course
  - Try to add student
  - Expected: Error "Class must be linked to a course"
  - Actual: [Record result]

- [ ] **orgUnitId not a CLASS:**
  - Via API: Try to create student with orgUnitId pointing to department
  - Expected: Error "Students must be assigned to a class, not a department"
  - Actual: [Record result]

- [ ] **Duplicate enrollment number:**
  - Create student with enrollment # "CS2023001"
  - Try to create another with same #
  - Expected: Error "Enrollment number already exists"
  - Actual: [Record result]

- [ ] **Assessment level restrictions (from Enhancement #2):**
  - Create assessment for student
  - Try to assign SENIOR or EXPERT level
  - Expected: Error "Senior/Expert levels not available for students"
  - Actual: [Record result]

### 8.4 Edit Student
**Trigger:** Click edit icon on student row

**Dialog Behavior:**
- [ ] Pre-filled with student data
- [ ] Can edit:
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Class (dropdown to move to different class)
  - [ ] Has Graduated status
  - [ ] Graduation Date
- [ ] Cannot edit:
  - [ ] Enrollment Number (immutable)
  - [ ] Course (derived from class)

**Moving Student to Different Class:**
- [ ] Class dropdown shows classes in same department only
- [ ] Cannot move to class without course
- [ ] If moving: Warning shown "This will change the student's course"
- [ ] If moving: Confirm dialog: "Move student from [Class A] to [Class B]?"

**Submit:**
- [ ] "Save Changes" button
- [ ] On success: Toast + list refresh
- [ ] On error: Error shown with details

### 8.5 Remove Student
**Trigger:** Click delete/remove icon on student row

**Dialog Behavior:**
- [ ] Confirmation modal
- [ ] Message: "Remove [Student Name] from [Class Name]?"
- [ ] Explains: "Student will be removed but not deleted from system"
- [ ] Option 1: "Remove from Class" (sets orgUnitId to null)
- [ ] Option 2: "Delete Permanently" (hard delete)
- [ ] Cancel button

**On Remove:**
- [ ] Student disappears from class list
- [ ] Total count updates
- [ ] Toast: "Student removed from class"

**On Delete:**
- [ ] Student deleted from system
- [ ] Toast: "Student deleted permanently"
- [ ] Cannot be undone

---

## 🔐 SECTION 9: PERMISSIONS & ROLE-BASED ACCESS

### 9.1 Super Admin Tests
**Login as Super Admin, then verify:**

**Department Access:**
- [ ] Can view all departments in all institutions
- [ ] Can create department in any institution
- [ ] Can edit any department
- [ ] Can delete any department (if no dependencies)

**Course Access:**
- [ ] Can view all courses
- [ ] Can create course in any department
- [ ] Can edit any course
- [ ] Can delete any course (with validation)

**Class Access:**
- [ ] Can view all classes
- [ ] Can create class in any department
- [ ] Can assign class to any course
- [ ] Can edit any class
- [ ] Can delete any class (if no students)

**Student Access:**
- [ ] Can view all students
- [ ] Can add student to any class
- [ ] Can edit any student
- [ ] Can move student between classes
- [ ] Can remove any student

**UI Elements:**
- [ ] All "Add" buttons visible
- [ ] All "Edit" buttons visible
- [ ] All "Delete" buttons visible
- [ ] No permission errors when performing actions

### 9.2 Tenant Admin Tests
**Login as Tenant Admin (Institution Admin), then verify:**

**Department Access:**
- [ ] Can view all departments in own institution
- [ ] Cannot view departments in other institutions
- [ ] Can create department in own institution
- [ ] Can edit any department in own institution
- [ ] Can delete department in own institution

**Course Access:**
- [ ] Can view all courses in own institution
- [ ] Cannot view courses in other institutions
- [ ] Can create course in any dept in own institution
- [ ] Can edit any course in own institution
- [ ] Can delete any course in own institution

**Class & Student Access:**
- [ ] Same as courses (full access within own institution)

**API Tests:**
- [ ] Try to access course from different institution
  - Expected: 403 Forbidden
  - Actual: [Record]
- [ ] Try to create course in different institution's dept
  - Expected: 403 Forbidden
  - Actual: [Record]

### 9.3 Department Head (HoD) Tests
**Login as HoD managing IT department, then verify:**

**Department Access:**
- [ ] Can view IT department (own)
- [ ] Cannot view Mechanical department (not managed)
- [ ] Can edit IT department info
- [ ] Cannot edit Mechanical department
- [ ] Attempting to access `/departments/mechanical-dept-id` → 403 or redirect

**Course Access in Managed Department (IT):**
- [ ] Can view all courses in IT dept
- [ ] Can create course in IT dept
- [ ] Can edit courses in IT dept
- [ ] Can delete courses in IT dept (with validation)
- [ ] "Add Course" button visible on IT dept page

**Course Access in Unmanaged Department (Mechanical):**
- [ ] Cannot create course in Mechanical dept
- [ ] Cannot edit courses in Mechanical dept
- [ ] Cannot delete courses in Mechanical dept
- [ ] "Add Course" button hidden on Mechanical dept page
- [ ] Attempting API call → 403 Forbidden

**Class Access:**
- [ ] Can manage classes in IT dept only
- [ ] Cannot manage classes in Mechanical dept
- [ ] Same permissions as courses

**Student Access:**
- [ ] Can add students to classes in IT dept
- [ ] Cannot add students to classes in Mechanical dept
- [ ] Can edit students in own department
- [ ] Cannot edit students in other departments

**UI Visibility:**
- [ ] Edit/Delete buttons hidden for unmanaged entities
- [ ] Hovering shows tooltip: "No permission" (optional)
- [ ] Attempting action shows toast error: "Insufficient permissions"

### 9.4 Class Teacher Tests
**Login as Class Teacher assigned to "Section A" (IT dept), then verify:**

**Department Access:**
- [ ] Can view IT department (read-only)
- [ ] Cannot edit department info
- [ ] Cannot create courses or classes

**Course Access:**
- [ ] Can view courses in IT dept (read-only)
- [ ] Cannot create, edit, or delete courses
- [ ] "Add Course" button hidden
- [ ] Edit/Delete buttons hidden on courses

**Class Access:**
- [ ] Can view "Section A" (own class)
- [ ] Can edit "Section A" details (name, description)
- [ ] Cannot delete "Section A"
- [ ] Cannot edit other classes (e.g., "Section B")
- [ ] "Edit Class" button visible only for own class

**Student Access:**
- [ ] Can add students to "Section A" (own class)
- [ ] Can edit students in "Section A"
- [ ] Can remove students from "Section A"
- [ ] Cannot add students to "Section B" (not own class)
- [ ] Attempting to add → 403 or error toast

**Profile Restrictions (from Enhancement #3):**
- [ ] Class Teacher profile is LIMITED
- [ ] No career planning features visible
- [ ] No competency self-assessment
- [ ] No gap analysis
- [ ] Profile shows only: Name, Phone, Email, Department, Classes
- [ ] To access career features: Must create separate B2C account

**UI Visibility:**
- [ ] "Add Students" button visible only for own class
- [ ] "Upload Students" button visible only for own class
- [ ] Action buttons disabled/hidden for other classes

### 9.5 API Permission Tests
**Use API client (Postman/curl) to test:**

**As HoD managing IT dept:**
- [ ] POST `/api/org/stanford/courses` with IT deptId → ✅ 200 Success
- [ ] POST `/api/org/stanford/courses` with Mech deptId → ❌ 403 Forbidden
- [ ] PATCH `/api/org/stanford/courses/it-course-id` → ✅ 200 Success
- [ ] PATCH `/api/org/stanford/courses/mech-course-id` → ❌ 403 Forbidden
- [ ] DELETE `/api/org/stanford/courses/it-course-id` → ✅ 200 or validation error
- [ ] DELETE `/api/org/stanford/courses/mech-course-id` → ❌ 403 Forbidden

**As Class Teacher:**
- [ ] POST `/api/org/stanford/courses` → ❌ 403 Forbidden
- [ ] POST `/api/org/stanford/members` with own class → ✅ 200 Success
- [ ] POST `/api/org/stanford/members` with other class → ❌ 403 Forbidden

**Response Format:**
- [ ] 403 responses include message: "Insufficient permissions" or similar
- [ ] 403 responses are JSON (not HTML error page)
- [ ] Error structure consistent across all endpoints

---

## 📤 SECTION 10: BULK UPLOAD FEATURES

### 10.1 Courses Bulk Upload (if implemented)
**Trigger:** Click "Upload Courses" from department Courses tab

**CSV Format Validation:**
- [ ] Accepts .csv files only
- [ ] Rejects other formats (.xlsx, .txt) with error
- [ ] Required columns:
  - [ ] name
  - [ ] code
  - [ ] department_code (or uses current dept by default)
  - [ ] year_begin
  - [ ] year_end
  - [ ] division
  - [ ] semester_count (if division includes SEMESTER)
  - [ ] year_count (if division includes YEAR)
- [ ] Optional columns:
  - [ ] description

**Sample CSV:**
```csv
name,code,department_code,year_begin,year_end,division,semester_count,year_count,description
"B.Tech Computer Science","BTECH-CSE","IT","2023","2027","BOTH","8","4","4-year UG program"
"MBA","MBA","BM","2024","2026","SEMESTER","4","","2-year PG program"
```

**Processing:**
- [ ] Validates all rows before inserting any
- [ ] If any row invalid: Shows all errors, inserts nothing
- [ ] If all rows valid: Inserts all courses
- [ ] Progress indicator updates during processing

**Validation Checks per Row:**
- [ ] Name not empty
- [ ] Code not empty and unique in tenant
- [ ] Department code exists in tenant
- [ ] year_begin is valid year (4 digits)
- [ ] year_end > year_begin
- [ ] division is one of: SEMESTER, YEAR, BOTH
- [ ] If division = SEMESTER or BOTH: semester_count provided and > 0
- [ ] If division = YEAR or BOTH: year_count provided and > 0
- [ ] User has permission to create course in that department

**Error Reporting:**
- [ ] Row number included in each error
- [ ] Example: "Row 5: Invalid division value 'QUARTERS'"
- [ ] All errors shown (not just first error)
- [ ] Can download error report as CSV

**Success:**
- [ ] Success count shown
- [ ] Courses appear in department list
- [ ] Toast: "X courses created successfully"

### 10.2 Classes Bulk Upload (if implemented)
**Trigger:** Click "Upload Classes" from department Classes tab

**CSV Format:**
```csv
name,code,course_code,department_code,manager_email
"Section A","CSE-A-2023","btech-cse-2023","IT","teacher1@uni.edu"
"Section B","CSE-B-2023","btech-cse-2023","IT","teacher2@uni.edu"
```

**Required Columns:**
- [ ] name
- [ ] code
- [ ] course_code (or course_id)
- [ ] department_code (or can use current dept)

**Optional Columns:**
- [ ] manager_email (Class Teacher)
- [ ] description

**Processing:**
- [ ] Validates course_code exists
- [ ] Validates course belongs to specified department
- [ ] Validates manager_email exists and is faculty
- [ ] Creates class with parentId = department
- [ ] Creates ActivityOrgUnit linking class to course
- [ ] Sets managerId if manager_email provided

**Validation:**
- [ ] Class code unique in department
- [ ] Course exists and is in correct department
- [ ] Manager is faculty in that department
- [ ] User has permission

**Error Reporting:**
- [ ] Same as courses bulk upload
- [ ] Specific errors like "Course code 'XYZ' not found"

**Success:**
- [ ] Classes appear in department list
- [ ] Each class shows linked course
- [ ] If manager assigned: Shows in class details

### 10.3 Students Bulk Upload
**Trigger:** Click "Upload Students" from class detail or dept Members tab

**CSV Format:**
```csv
first_name,last_name,email,enrollment_number,class_code,has_graduated
"John","Doe","john@uni.edu","CS2023001","CSE-A-2023","false"
"Jane","Smith","jane@uni.edu","CS2023002","CSE-A-2023","false"
```

**Required Columns:**
- [ ] first_name
- [ ] last_name
- [ ] email
- [ ] enrollment_number
- [ ] class_code

**Optional Columns:**
- [ ] phone
- [ ] has_graduated (boolean: true/false)
- [ ] graduation_date (if has_graduated = true)

**Processing:**
- [ ] Validates class_code exists
- [ ] Validates class has linked course
- [ ] Validates enrollment_number unique
- [ ] Validates email format and unique
- [ ] Creates member with orgUnitId = class

**Special Validations:**
- [ ] If class not linked to course: Row rejected with error
- [ ] If enrollment_number exists: Row rejected
- [ ] If email exists in tenant: Row rejected (or warning only)
- [ ] If has_graduated = true but no graduation_date: Warning

**Partial Success Handling:**
- [ ] If 50/100 rows succeed: Shows both counts
- [ ] Successful students added immediately
- [ ] Failed rows shown in error report
- [ ] Can fix errors and re-upload (won't duplicate successful ones)

**UI After Upload:**
- [ ] Students appear in class list
- [ ] Total count updates
- [ ] Can sort by "Recently Added" to see new students

---

## 🎨 SECTION 11: UI/UX POLISH & EDGE CASES

### 11.1 Loading States
**Test all pages for proper loading indicators:**

- [ ] Department list: Skeleton loaders or spinner while fetching
- [ ] Department detail: Loading state for each tab content
- [ ] Course detail: Loading before content appears
- [ ] Class detail: Loading indicator
- [ ] Dialogs: Loading when fetching dropdown data (e.g., courses for class)
- [ ] Bulk upload: Progress indicator during processing
- [ ] Delete actions: Button shows "Deleting..." with spinner

**Loading UX:**
- [ ] Fast enough (< 1 second for typical data)
- [ ] If slow (> 2 seconds): Skeleton loaders instead of blank page
- [ ] No flash of empty state before data loads
- [ ] Loading doesn't block entire page (only affected section)

### 11.2 Empty States
**Test empty states for:**

**Department with no courses:**
- [ ] "No courses yet" message displayed
- [ ] Helpful illustration or icon
- [ ] Call-to-action: "Create your first course"
- [ ] "Add Course" button prominent
- [ ] Description: "Courses organize classes and curriculum"

**Department with no classes:**
- [ ] "No classes yet" message
- [ ] "Add Class" button prominent
- [ ] Helpful message

**Course with no linked classes:**
- [ ] "No classes linked to this course"
- [ ] "Add Class" button
- [ ] Description: "Create classes or link existing ones"

**Class with no students:**
- [ ] "No students enrolled yet"
- [ ] If class not linked to course: Warning shown first
- [ ] If linked: "Add Students" button
- [ ] Illustration makes it welcoming

**Search with no results:**
- [ ] "No results found for '[search term]'"
- [ ] Option to clear search
- [ ] Suggestion: "Try different keywords"

### 11.3 Error States
**Test error handling for:**

**Network Errors:**
- [ ] Disconnect internet
- [ ] Try to load department detail
- [ ] Expected: Error message "Unable to load data"
- [ ] Retry button present
- [ ] Clicking retry re-fetches data
- [ ] No infinite loading spinner

**API Errors (500):**
- [ ] Simulate server error
- [ ] Expected: "Something went wrong" message
- [ ] Technical details hidden (or collapsible)
- [ ] Error ID shown for support reference
- [ ] Retry option available

**Validation Errors:**
- [ ] Shown inline next to field (red text/border)
- [ ] Clear, actionable messages
- [ ] No technical jargon
- [ ] Example: "Email is required" not "Field email failed validation"

**Permission Errors:**
- [ ] Attempting action without permission
- [ ] Expected: Toast error "You don't have permission"
- [ ] Or: 403 page with explanation
- [ ] No stack trace shown to user

### 11.4 Success States
**Test success feedback:**

**Toast Notifications:**
- [ ] Success toasts appear after actions
- [ ] Color: Green background
- [ ] Icon: ✅ checkmark
- [ ] Auto-dismiss after 3-5 seconds
- [ ] Can be manually dismissed (× button)
- [ ] Position: Top-right or center
- [ ] Multiple toasts stack properly
- [ ] Toast doesn't cover important content

**Messages:**
- [ ] Clear and specific
- [ ] Examples:
  - [ ] "Course created successfully" (not just "Success")
  - [ ] "3 classes added" (with count)
  - [ ] "Student moved to Section B" (with details)

### 11.5 Mobile Responsiveness
**Test on mobile viewport (375px width):**

**Department List:**
- [ ] Cards stack vertically
- [ ] All text readable without zoom
- [ ] Buttons accessible
- [ ] No horizontal scroll

**Department Detail:**
- [ ] Tabs become horizontal scroll or dropdown
- [ ] Each tab content fits mobile width
- [ ] Tables become cards or horizontal scroll
- [ ] Add buttons accessible (not hidden off-screen)

**Dialogs:**
- [ ] Full-screen on mobile
- [ ] Form fields stack vertically
- [ ] Keyboard doesn't cover input fields
- [ ] Submit button accessible (sticky at bottom)

**Course/Class Detail:**
- [ ] All sections readable
- [ ] Action buttons accessible
- [ ] Stats cards stack

**Navigation:**
- [ ] Breadcrumbs collapse or scroll
- [ ] Sidebar becomes hamburger menu
- [ ] Menu opens smoothly
- [ ] Can close menu easily

### 11.6 Accessibility (WCAG AA)
**Keyboard Navigation:**
- [ ] Can navigate entire app with Tab key
- [ ] Tab order logical (top-to-bottom, left-to-right)
- [ ] Focus indicator visible (blue outline or similar)
- [ ] Can open menus with Enter/Space
- [ ] Can close dialogs with ESC
- [ ] Skip to main content link present
- [ ] No keyboard traps (can always Tab away)

**Screen Reader:**
- [ ] Page titles announced
- [ ] Headings structured (H1 → H2 → H3)
- [ ] Form labels associated with inputs
- [ ] Buttons have descriptive labels
- [ ] Images have alt text
- [ ] Error messages announced (aria-live)
- [ ] Loading states announced

**Color Contrast:**
- [ ] All text passes WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] Test with contrast checker tool
- [ ] Error messages not relying on color alone
- [ ] Links distinguishable without color

**Interactive Elements:**
- [ ] Touch targets ≥ 44×44px (mobile)
- [ ] Buttons have visible hover/focus states
- [ ] Disabled buttons visually distinct

### 11.7 Performance
**Measure page load times:**

- [ ] Department list loads in < 1 second
- [ ] Department detail loads in < 1 second
- [ ] Course detail loads in < 1 second
- [ ] Opening dialog: < 200ms
- [ ] Submitting form: Response in < 2 seconds

**Large Data Tests:**
- [ ] Department with 100 courses: Loads without lag
- [ ] Course with 50 classes: Loads smoothly
- [ ] Class with 200 students: Loads in < 2 seconds
- [ ] Pagination prevents loading all data at once
- [ ] Infinite scroll smooth (if implemented)

**Network:**
- [ ] Test on slow 3G network
- [ ] Critical content loads first
- [ ] Images lazy-load
- [ ] No unnecessary API calls
- [ ] Data cached appropriately

---

## 🧪 SECTION 12: EDGE CASES & CORNER CASES

### 12.1 Data Consistency
**Orphaned Classes:**
- [ ] Create class without course
- [ ] Delete the course later (if somehow possible)
- [ ] Expected: Class still exists but shows "No course"
- [ ] Can re-link to different course

**Deleted Courses:**
- [ ] Soft-delete a course
- [ ] Expected: Course doesn't appear in lists
- [ ] Classes unlinked automatically
- [ ] Students remain in classes
- [ ] Cannot access course detail page (404 or "Course deleted")

**Student Movement:**
- [ ] Student in "Section A" of "B.Tech CSE"
- [ ] Move student to "Section B" of "MBA"
- [ ] Expected: Student now in different course
- [ ] Assessment history preserved
- [ ] All references updated

### 12.2 Concurrent Actions
**Multiple Users:**
- [ ] User A edits course
- [ ] User B deletes same course simultaneously
- [ ] Expected: One action succeeds, other gets error
- [ ] Error message clear: "Course was modified/deleted"

**Double Submission:**
- [ ] Click "Create Course" button twice quickly
- [ ] Expected: Only one course created
- [ ] Button disabled after first click
- [ ] Second click ignored

### 12.3 Validation Edge Cases
**Year Boundaries:**
- [ ] Course with yearBegin = 2023, yearEnd = 2023 (same year)
- [ ] Expected: Validation error "End year must be after start year"
- [ ] Or: Accepted if it's a 1-year course (validate yearCount ≥ 1)

**Division Validation:**
- [ ] Division = BOTH, but yearCount = 5, semesterCount = 8
- [ ] Math: 5 years should = 10 semesters (if 2/year)
- [ ] Expected: Warning or error about mismatch (optional)

**Slug Conflicts:**
- [ ] Create course "BTECH-CSE-2023"
- [ ] Try to create another with same code and year
- [ ] Expected: Slug conflict error
- [ ] Suggested slug: "BTECH-CSE-2023-2" (auto-increment)

### 12.4 Deletion Validation
**Course with Students:**
- [ ] Course has 3 classes
- [ ] 2 classes empty, 1 class has 10 students
- [ ] Try to delete course
- [ ] Expected: Blocked with error
- [ ] Error shows: "Cannot delete: 10 students in Class A"

**Class with Assessments:**
- [ ] Class has students with completed assessments
- [ ] Try to delete class
- [ ] Expected: Blocked (if assessment data linked to class)
- [ ] Or: Warning "Assessments will remain but class reference lost"

**Department with Dependencies:**
- [ ] Department has courses and classes
- [ ] Try to delete department
- [ ] Expected: Blocked with error
- [ ] Error lists dependencies
- [ ] Must delete/move courses and classes first

### 12.5 Character Limits & Input Validation
**Long Text:**
- [ ] Course name with 500 characters
- [ ] Expected: Either accepted or validation error
- [ ] If accepted: Displays properly (no layout overflow)
- [ ] If rejected: Clear character limit shown

**Special Characters:**
- [ ] Course code: "B.Tech/CSE(2023)"
- [ ] Expected: Validation error "Only letters, numbers, hyphen, underscore allowed"
- [ ] Or: Auto-sanitized to "B-Tech-CSE-2023"

**XSS Attempt:**
- [ ] Course name: `<script>alert('XSS')</script>`
- [ ] Expected: Sanitized/escaped
- [ ] Displayed as text, not executed
- [ ] No alert popup

**SQL Injection Attempt:**
- [ ] Course name: `'; DROP TABLE courses; --`
- [ ] Expected: Treated as normal text
- [ ] Inserted safely (parameterized query)
- [ ] No database error

### 12.6 Browser Compatibility
**Test on:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Check:**
- [ ] All pages load correctly
- [ ] Dialogs appear correctly
- [ ] Buttons clickable
- [ ] Forms submittable
- [ ] No console errors
- [ ] Layout not broken

---

## ✅ SECTION 13: FINAL CHECKLIST & SIGN-OFF

### 13.1 Core Functionality Verification
- [ ] Can create department
- [ ] Can create course in department
- [ ] Can create class in department
- [ ] Can link class to course
- [ ] Can add student to class
- [ ] Student cannot be added to class without course
- [ ] Can edit course
- [ ] Can delete course (with validation)
- [ ] Can edit class
- [ ] Can delete class (with validation)
- [ ] Bulk upload courses works
- [ ] Bulk upload classes works
- [ ] Bulk upload students works

### 13.2 Permission Verification
- [ ] Super Admin has full access
- [ ] Tenant Admin scoped to own institution
- [ ] HoD scoped to managed departments
- [ ] Class Teacher scoped to assigned classes
- [ ] Class Teacher has limited profile
- [ ] Unauthorized actions blocked (403)

### 13.3 UI/UX Verification
- [ ] Navigation intuitive
- [ ] Breadcrumbs work
- [ ] Loading states present
- [ ] Empty states helpful
- [ ] Error messages clear
- [ ] Success feedback visible
- [ ] Mobile responsive
- [ ] Accessible (keyboard, screen reader)

### 13.4 Data Integrity Verification
- [ ] No orphaned records
- [ ] Soft-delete working
- [ ] Relationships maintained
- [ ] Validation preventing bad data
- [ ] Bulk operations handle partial success

### 13.5 Performance Verification
- [ ] Pages load quickly (< 1 second)
- [ ] Large data sets handled
- [ ] No memory leaks
- [ ] API responses fast
- [ ] No unnecessary re-renders

---

## 📊 TEST SUMMARY

### Test Statistics
- Total Tests: [Count]
- Passed: [Count] ✅
- Failed: [Count] ❌
- Skipped: [Count] ⏭️

### Critical Issues Found
| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | [Description] | High/Medium/Low | Open/Fixed |
| 2 | [Description] | High/Medium/Low | Open/Fixed |

### Recommended Actions
1. [Action item based on test results]
2. [Action item based on test results]
3. [Action item based on test results]

### Sign-Off
- [ ] All critical issues resolved
- [ ] All high-priority tests passed
- [ ] Ready for production deployment
- [ ] User acceptance testing (UAT) completed

**Tested By:** [Name]  
**Date:** [Date]  
**Sign-Off:** [Signature]

---

## 📝 NOTES & OBSERVATIONS

[Space for testers to add notes, observations, suggestions]

---

**END OF CHECKLIST**

*Use this checklist systematically to ensure complete implementation verification.*
*Mark each item as you test, and document any issues found.*
*This checklist serves as both testing guide and quality assurance documentation.*