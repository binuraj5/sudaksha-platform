# SYSTEMATIC STABILIZATION ROADMAP
## Corporate Functionality Testing & Fixing Matrix
### Client: Tanzania Revenue Authority | Deadline: 24th February 2026

---

## 🎯 APPROACH: Test → Fix → Confirm → Move

**Critical Rule:** Do NOT move to the next functionality until the current one works 100% for ALL user roles.

**Testing Order per Feature:**
1. Super Admin (complete testing)
2. Corporate Admin (Tenant Admin)
3. Department Head (HOD)
4. Team Leader
5. Employee (read-only where applicable)

**Per User Role, Test:**
- Create ✓
- Read/View ✓
- Update/Modify ✓
- Delete ✓
- Special actions (Submit for Global, Approve, etc.) ✓

---

## PART 1: COMPLETE FUNCTIONALITY MATRIX

### MODULE 1: ROLES MANAGEMENT

| # | Functionality | Sub-Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee |
|---|---------------|-------------------|-------------|------------|-----------|-------------|----------|
| **1.1** | **View Roles** |  |  |  |  |  |  |
| 1.1.1 | List all roles | Global roles visible | ✓ Must see ALL | ✓ See Global + Own Org | ✓ See Global + Org + Dept | ✓ See Global + Org + Dept + Team | ✓ See Global + Org |
| 1.1.2 | Filter by scope | Tabs: Global/Org/Dept/Team/Pending | ✓ All tabs | ✓ Global/Org tabs | ✓ Global/Org/Dept tabs | ✓ Global/Org/Dept/Team tabs | ✓ Global/Org tabs |
| 1.1.3 | Search roles | By name/description | ✓ | ✓ | ✓ | ✓ | ✓ |
| 1.1.4 | View role detail | Competencies, indicators | ✓ | ✓ | ✓ | ✓ | ✓ |
| 1.1.5 | Scope badge display | Shows GLOBAL/ORG/DEPT/TEAM | ✓ | ✓ | ✓ | ✓ | ✓ |
| **1.2** | **Create Role** |  |  |  |  |  |  |
| 1.2.1 | Create - Manual entry | Form with name/desc/competencies | ✓ Creates GLOBAL | ✓ Creates ORG scope | ✓ Creates DEPT scope | ✓ Creates TEAM scope | ✗ No access |
| 1.2.2 | Create - Bulk upload | CSV with multiple roles | ✓ All scopes | ✓ ORG scope only | ✓ DEPT scope only | ✓ TEAM scope only | ✗ No access |
| 1.2.3 | Create - AI generate | Describe role → AI creates | ✓ All scopes | ✓ ORG scope | ✓ DEPT scope | ✓ TEAM scope | ✗ No access |
| 1.2.4 | Scope enforcement | Auto-sets scope based on user | ✓ Can choose | ✓ Locked to ORG | ✓ Locked to DEPT | ✓ Locked to TEAM | N/A |
| 1.2.5 | Level selection | Junior/Middle/Senior/Expert | ✓ All levels | ✓ All levels (Corp) | ✓ All levels | ✓ All levels | N/A |
| 1.2.6 | Competency assignment | Select competencies for role | ✓ | ✓ | ✓ | ✓ | N/A |
| **1.3** | **Edit Role** |  |  |  |  |  |  |
| 1.3.1 | Edit own scope roles | Name/desc/competencies | ✓ Edit any | ✓ Edit own ORG | ✓ Edit own DEPT | ✓ Edit own TEAM | ✗ No access |
| 1.3.2 | Cannot edit higher scope | Blocked from editing parent scopes | N/A | ✗ Cannot edit GLOBAL | ✗ Cannot edit ORG | ✗ Cannot edit DEPT | N/A |
| 1.3.3 | Add competencies | Add more competencies to role | ✓ | ✓ Own scope | ✓ Own scope | ✓ Own scope | ✗ |
| 1.3.4 | Remove competencies | Remove from role | ✓ | ✓ Own scope | ✓ Own scope | ✓ Own scope | ✗ |
| **1.4** | **Delete Role** |  |  |  |  |  |  |
| 1.4.1 | Delete own roles | Soft delete (isActive = false) | ✓ Delete any | ✓ Delete own ORG | ✓ Delete own DEPT | ✓ Delete own TEAM | ✗ No access |
| 1.4.2 | Cannot delete in use | Blocked if role used in models | ✓ Shows warning | ✓ Shows warning | ✓ Shows warning | ✓ Shows warning | N/A |
| **1.5** | **Global Approval** |  |  |  |  |  |  |
| 1.5.1 | Submit for global | Request to make role global | ✗ Already creates global | ✓ Can submit ORG | ✓ Can submit DEPT | ✓ Can submit TEAM | ✗ |
| 1.5.2 | View pending requests | See submission status | ✓ See all (approval queue) | ✓ See own | ✓ See own | ✓ See own | ✗ |
| 1.5.3 | Approve global request | Make role GLOBAL | ✓ Can approve all | ✗ Cannot approve | ✗ Cannot approve | ✗ Cannot approve | ✗ |
| 1.5.4 | Reject global request | Reject with reason | ✓ Can reject | ✗ Cannot | ✗ Cannot | ✗ Cannot | ✗ |
| 1.5.5 | Request changes | Ask for revisions | ✓ Can request | ✗ Cannot | ✗ Cannot | ✗ Cannot | ✗ |

---

### MODULE 2: COMPETENCIES MANAGEMENT

| # | Functionality | Sub-Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee |
|---|---------------|-------------------|-------------|------------|-----------|-------------|----------|
| **2.1** | **View Competencies** |  |  |  |  |  |  |
| 2.1.1 | List competencies | With categories | ✓ See ALL | ✓ See Global + Own | ✓ See Global + Org + Dept | ✓ See Global + Org + Dept + Team | ✓ See Global + Org |
| 2.1.2 | Filter by category | Behavioral/Technical/etc | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2.1.3 | Filter by scope | Global/Org/Dept/Team tabs | ✓ All tabs | ✓ Global/Org | ✓ Global/Org/Dept | ✓ All scopes | ✓ Global/Org |
| 2.1.4 | View competency detail | Indicators by level | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2.1.5 | Scope badge display | Color-coded badges | ✓ | ✓ | ✓ | ✓ | ✓ |
| **2.2** | **Create Competency** |  |  |  |  |  |  |
| 2.2.1 | Create - Manual | Name/category/indicators | ✓ GLOBAL scope | ✓ ORG scope | ✓ DEPT scope | ✓ TEAM scope | ✗ |
| 2.2.2 | Create - Bulk upload | CSV with competencies | ✓ All scopes | ✓ ORG scope | ✓ DEPT scope | ✓ TEAM scope | ✗ |
| 2.2.3 | Create - AI generate | AI creates from description | ✓ All scopes | ✓ ORG scope | ✓ DEPT scope | ✓ TEAM scope | ✗ |
| 2.2.4 | Scope enforcement | Based on user role | ✓ Can choose | ✓ Locked ORG | ✓ Locked DEPT | ✓ Locked TEAM | N/A |
| 2.2.5 | Add indicators | Per level (Junior/Senior) | ✓ | ✓ | ✓ | ✓ | N/A |
| **2.3** | **Edit Competency** |  |  |  |  |  |  |
| 2.3.1 | Edit own scope | Name/category/indicators | ✓ Edit any | ✓ Edit own ORG | ✓ Edit own DEPT | ✓ Edit own TEAM | ✗ |
| 2.3.2 | Cannot edit higher | Blocked from parent scopes | N/A | ✗ Cannot edit GLOBAL | ✗ Cannot edit ORG | ✗ Cannot edit DEPT | N/A |
| 2.3.3 | Edit indicators | Modify text/level | ✓ | ✓ Own scope | ✓ Own scope | ✓ Own scope | ✗ |
| **2.4** | **Delete Competency** |  |  |  |  |  |  |
| 2.4.1 | Delete own | Soft delete | ✓ Any | ✓ Own ORG | ✓ Own DEPT | ✓ Own TEAM | ✗ |
| 2.4.2 | Block if in use | Used in roles/models | ✓ Warning | ✓ Warning | ✓ Warning | ✓ Warning | N/A |
| **2.5** | **Global Approval** |  |  |  |  |  |  |
| 2.5.1 | Submit for global | Request global status | ✗ | ✓ Submit ORG | ✓ Submit DEPT | ✓ Submit TEAM | ✗ |
| 2.5.2 | Approve/Reject | SuperAdmin only | ✓ | ✗ | ✗ | ✗ | ✗ |

---

### MODULE 3: ASSESSMENT MODELS

| # | Functionality | Sub-Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee |
|---|---------------|-------------------|-------------|------------|-----------|-------------|----------|
| **3.1** | **View Models** |  |  |  |  |  |  |
| 3.1.1 | List models | All assessment models | ✓ See ALL tenants | ✓ See own tenant | ✓ See own tenant | ✓ See own tenant | ✓ See published only |
| 3.1.2 | Filter by status | Draft/Published/Archived | ✓ All statuses | ✓ All in tenant | ✓ All in tenant | ✓ All in tenant | ✓ Published only |
| 3.1.3 | Filter by role | Select role to filter | ✓ | ✓ | ✓ | ✓ | ✓ |
| 3.1.4 | View model details | Competencies, components | ✓ | ✓ | ✓ | ✓ | ✓ Published only |
| 3.1.5 | Completion percentage | Shows build progress | ✓ | ✓ | ✓ | ✓ | N/A |
| **3.2** | **Create Model** |  |  |  |  |  |  |
| 3.2.1 | Create from role | Select role → create model | ✓ Any role | ✓ Org roles | ✓ Org roles | ✓ Org roles | ✗ |
| 3.2.2 | Select competencies | Subset of role competencies | ✓ | ✓ | ✓ | ✓ | N/A |
| 3.2.3 | Set weights | Per competency (sum = 100%) | ✓ | ✓ | ✓ | ✓ | N/A |
| 3.2.4 | Set target level | Junior/Middle/Senior/Expert | ✓ | ✓ All levels | ✓ All levels | ✓ All levels | N/A |
| 3.2.5 | Role NOT modified | Role stays unchanged | ✓ Must verify | ✓ Must verify | ✓ Must verify | ✓ Must verify | N/A |
| **3.3** | **Edit Model** |  |  |  |  |  |  |
| 3.3.1 | Edit draft model | Name/desc/duration | ✓ Any model | ✓ Own tenant | ✓ Own tenant | ✓ Own tenant | ✗ |
| 3.3.2 | Cannot edit published | Must unpublish first | ✓ Can unpublish | ✓ Can unpublish | ✓ Can unpublish | ✓ Can unpublish | ✗ |
| 3.3.3 | Change competencies | Add/remove competencies | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 3.3.4 | Change weights | Adjust percentages | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| **3.4** | **Delete Model** |  |  |  |  |  |  |
| 3.4.1 | Delete draft | Hard delete | ✓ Any | ✓ Own tenant | ✓ Own tenant | ✓ Own tenant | ✗ |
| 3.4.2 | Cannot delete published | Or has submissions | ✓ Warning | ✓ Warning | ✓ Warning | ✓ Warning | N/A |
| **3.5** | **Publish/Unpublish** |  |  |  |  |  |  |
| 3.5.1 | Publish model | Make available for assignment | ✓ | ✓ | ✓ | ✓ | ✗ |
| 3.5.2 | Version increment | 1.0.0 → 1.0.1 on publish | ✓ | ✓ | ✓ | ✓ | N/A |
| 3.5.3 | Unpublish | Return to draft | ✓ | ✓ Own tenant | ✓ Own tenant | ✓ Own tenant | ✗ |
| 3.5.4 | Lock on publish | No edits when published | ✓ Enforced | ✓ Enforced | ✓ Enforced | ✓ Enforced | N/A |

---

### MODULE 4: COMPONENTS (per Model)

| # | Functionality | Sub-Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee |
|---|---------------|-------------------|-------------|------------|-----------|-------------|----------|
| **4.1** | **View Components** |  |  |  |  |  |  |
| 4.1.1 | List components | All components in model | ✓ | ✓ Own tenant | ✓ Own tenant | ✓ Own tenant | ✓ Published models |
| 4.1.2 | Component type badges | MCQ/Voice/Code/etc | ✓ | ✓ | ✓ | ✓ | ✓ |
| 4.1.3 | Completion status | Draft/In Progress/Complete | ✓ | ✓ | ✓ | ✓ | N/A |
| 4.1.4 | Question count | Shows # questions | ✓ | ✓ | ✓ | ✓ | ✓ |
| **4.2** | **Add Component** |  |  |  |  |  |  |
| 4.2.1 | Select component type | MCQ/Situational/Voice/etc | ✓ Draft models | ✓ Draft models | ✓ Draft models | ✓ Draft models | ✗ |
| 4.2.2 | Component suggester | AI suggests best types | ✓ Shows suggestions | ✓ Shows suggestions | ✓ Shows suggestions | ✓ Shows suggestions | N/A |
| 4.2.3 | Set competency | Which competency to test | ✓ | ✓ | ✓ | ✓ | N/A |
| 4.2.4 | Block on published | Cannot add to published | ✓ Blocked (403) | ✓ Blocked | ✓ Blocked | ✓ Blocked | N/A |
| **4.3** | **Edit Component** |  |  |  |  |  |  |
| 4.3.1 | Edit config | Component-specific settings | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 4.3.2 | Block on published | Cannot edit published | ✓ 403 | ✓ 403 | ✓ 403 | ✓ 403 | N/A |
| **4.4** | **Delete Component** |  |  |  |  |  |  |
| 4.4.1 | Delete from model | Remove component | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 4.4.2 | Block on published | 403 error | ✓ | ✓ | ✓ | ✓ | N/A |

---

### MODULE 5: QUESTIONS (per Component)

| # | Functionality | Sub-Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee |
|---|---------------|-------------------|-------------|------------|-----------|-------------|----------|
| **5.1** | **View Questions** |  |  |  |  |  |  |
| 5.1.1 | List questions | All in component | ✓ | ✓ Own tenant | ✓ Own tenant | ✓ Own tenant | ✗ (candidates see during test) |
| 5.1.2 | Question preview | Full text + options | ✓ | ✓ | ✓ | ✓ | ✗ |
| 5.1.3 | Read-only on published | No edit buttons when published | ✓ Read-only | ✓ Read-only | ✓ Read-only | ✓ Read-only | N/A |
| **5.2** | **Add Questions - Manual** |  |  |  |  |  |  |
| 5.2.1 | Manual entry form | Type question + options | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.2.2 | Question types | MCQ/True-False/Multi-select | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.2.3 | Set difficulty | Easy/Medium/Hard | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.2.4 | Set correct answer | Mark correct option | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.2.5 | Add explanation | For learning | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.2.6 | Block on published | 403 error | ✓ | ✓ | ✓ | ✓ | N/A |
| **5.3** | **Add Questions - Bulk Upload** |  |  |  |  |  |  |
| 5.3.1 | Upload CSV/Excel | Multiple questions | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.3.2 | Template download | Get sample file | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.3.3 | Validation | Check format/required fields | ✓ Shows errors | ✓ Shows errors | ✓ Shows errors | ✓ Shows errors | N/A |
| 5.3.4 | Preview before save | Review uploaded questions | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.3.5 | Block on published | 403 | ✓ | ✓ | ✓ | ✓ | N/A |
| **5.4** | **Add Questions - AI Generate** |  |  |  |  |  |  |
| 5.4.1 | AI parameters | Count, difficulty, types | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.4.2 | Context from indicators | Uses competency indicators | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.4.3 | Preview AI questions | Review before accept | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.4.4 | Regenerate individual | Regenerate one question | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.4.5 | Accept & save | Bulk save to component | ✓ | ✓ | ✓ | ✓ | N/A |
| 5.4.6 | Block on published | 403 | ✓ | ✓ | ✓ | ✓ | N/A |
| **5.5** | **Edit Questions** |  |  |  |  |  |  |
| 5.5.1 | Edit question text | Modify question | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.5.2 | Edit options | Change answer choices | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.5.3 | Change correct answer | Update right answer | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.5.4 | Block on published | 403 | ✓ | ✓ | ✓ | ✓ | N/A |
| **5.6** | **Delete Questions** |  |  |  |  |  |  |
| 5.6.1 | Delete single | Remove one question | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.6.2 | Delete bulk | Select multiple | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✓ Draft only | ✗ |
| 5.6.3 | Block on published | 403 | ✓ | ✓ | ✓ | ✓ | N/A |
| **5.7** | **Component Library** |  |  |  |  |  |  |
| 5.7.1 | Save to library | Reusable component | ✓ | ✓ Own tenant | ✓ Own tenant | ✓ Own tenant | ✗ |
| 5.7.2 | Use from library | Import saved component | ✓ | ✓ | ✓ | ✓ | ✗ |
| 5.7.3 | Library visibility | Private/Org/Global | ✓ All | ✓ Own org | ✓ Own org | ✓ Own org | N/A |

---

### MODULE 6: ASSESSMENT BUILDER WIZARD

| # | Functionality | Sub-Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee |
|---|---------------|-------------------|-------------|------------|-----------|-------------|----------|
| **6.1** | **Wizard Step 1: Overview** |  |  |  |  |  |  |
| 6.1.1 | Set model name | Required field | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.1.2 | Set description | Optional | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.1.3 | Select role | From visible roles | ✓ Any role | ✓ Org roles | ✓ Org roles | ✓ Org roles | N/A |
| 6.1.4 | Select target level | Junior/Senior/etc | ✓ All levels | ✓ All levels | ✓ All levels | ✓ All levels | N/A |
| 6.1.5 | Save as draft | Can save & exit | ✓ | ✓ | ✓ | ✓ | N/A |
| **6.2** | **Step 2: Select Competencies** |  |  |  |  |  |  |
| 6.2.1 | Show role competencies | All from selected role | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.2.2 | Select subset | Checkbox selection | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.2.3 | Set weights | Must sum to 100% | ✓ Validated | ✓ Validated | ✓ Validated | ✓ Validated | N/A |
| 6.2.4 | Weight validation | Error if ≠ 100% | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.2.5 | Save draft | Can save & exit | ✓ | ✓ | ✓ | ✓ | N/A |
| **6.3** | **Step 3: Select Components** |  |  |  |  |  |  |
| 6.3.1 | Component suggestions | Per competency | ✓ AI suggests | ✓ AI suggests | ✓ AI suggests | ✓ AI suggests | N/A |
| 6.3.2 | Select component types | MCQ/Voice/Code/etc | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.3.3 | Multiple per competency | Can add multiple | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.3.4 | Estimated duration | Shows time estimate | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.3.5 | Save draft | Can save & exit | ✓ | ✓ | ✓ | ✓ | N/A |
| **6.4** | **Step 4: Build Components** |  |  |  |  |  |  |
| 6.4.1 | Build per component | Configure each one | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.4.2 | Manual/Bulk/AI/Library | Choose build method | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.4.3 | Component completion % | Track progress | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.4.4 | Model completion % | Overall progress | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.4.5 | Save draft | Can save & exit | ✓ | ✓ | ✓ | ✓ | N/A |
| **6.5** | **Step 5: Publish** |  |  |  |  |  |  |
| 6.5.1 | Review summary | All details | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.5.2 | Publish button | Make available | ✓ | ✓ | ✓ | ✓ | N/A |
| 6.5.3 | Version assignment | 1.0.0 on first publish | ✓ | ✓ | ✓ | ✓ | N/A |

---

### MODULE 7: ASSIGNMENT & TAKING

| # | Functionality | Sub-Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee |
|---|---------------|-------------------|-------------|------------|-----------|-------------|----------|
| **7.1** | **Assign Assessment** |  |  |  |  |  |  |
| 7.1.1 | Assign to project | All project members | ✓ | ✓ | ✓ | ✓ | ✗ |
| 7.1.2 | Assign to department | All dept members | ✓ | ✓ | ✓ | ✗ | ✗ |
| 7.1.3 | Assign to individual | One employee | ✓ | ✓ | ✓ | ✓ | ✗ |
| 7.1.4 | Set due date | Deadline | ✓ | ✓ | ✓ | ✓ | N/A |
| 7.1.5 | Set mandatory flag | Required or optional | ✓ | ✓ | ✓ | ✓ | N/A |
| **7.2** | **Take Assessment** |  |  |  |  |  |  |
| 7.2.1 | View assigned | Dashboard list | ✗ | ✗ | ✗ | ✗ | ✓ Takes test |
| 7.2.2 | Start assessment | Begin taking | ✗ | ✗ | ✗ | ✗ | ✓ |
| 7.2.3 | Complete sections | All component types | ✗ | ✗ | ✗ | ✗ | ✓ |
| 7.2.4 | Submit assessment | Final submit | ✗ | ✗ | ✗ | ✗ | ✓ |
| **7.3** | **View Results** |  |  |  |  |  |  |
| 7.3.1 | View own results | Employee sees scores | ✗ | ✗ | ✗ | ✗ | ✓ If allowed |
| 7.3.2 | View team results | Manager sees reports | ✓ All | ✓ All in tenant | ✓ Own dept | ✓ Own team | ✗ |
| 7.3.3 | Export reports | Download CSV/PDF | ✓ | ✓ | ✓ | ✓ | ✗ |

---

## PART 2: TESTING PROTOCOL (PER FUNCTIONALITY)

### Testing Template

For EACH functionality listed above:

```
FUNCTIONALITY: [e.g., 1.2.1 Create Role - Manual Entry]

┌─────────────────────────────────────────────────┐
│ SUPER ADMIN TEST                                │
├─────────────────────────────────────────────────┤
│ 1. Login as Super Admin                        │
│ 2. Navigate to /assessments/admin/roles        │
│ 3. Click "Create Role"                         │
│ 4. Fill form:                                  │
│    - Name: "Test Role SA"                      │
│    - Description: "Testing as Super Admin"     │
│    - Scope: GLOBAL (should be selectable)      │
│    - Level: All levels (should be available)   │
│    - Competencies: Select 3                    │
│ 5. Click Save                                  │
│ 6. VERIFY:                                     │
│    ✓ Role created with scope = GLOBAL         │
│    ✓ Role appears in roles list               │
│    ✓ Scope badge shows "🌐 Global"           │
│    ✓ Database: scope='GLOBAL', tenantId=null  │
│    ✓ No errors in console                     │
│ 7. PASS / FAIL: ___________                   │
│ 8. If FAIL, note issue: ________________      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CORPORATE ADMIN TEST                            │
├─────────────────────────────────────────────────┤
│ 1. Login as Corp Admin (TRA tenant)            │
│ 2. Navigate to /assessments/clients/[id]/roles │
│ 3. Click "Create Role"                         │
│ 4. Fill form:                                  │
│    - Name: "Test Role CA"                      │
│    - Description: "Testing as Corp Admin"      │
│    - Scope: Should be LOCKED to ORGANIZATION   │
│    - Level: All levels available               │
│    - Competencies: Select 3                    │
│ 5. Click Save                                  │
│ 6. VERIFY:                                     │
│    ✓ Role created with scope=ORGANIZATION     │
│    ✓ tenantId = TRA tenant ID                 │
│    ✓ Role appears in "My Organization" tab    │
│    ✓ Scope badge shows "🏢 My Org"           │
│    ✓ Cannot see Super Admin's global roles    │
│       in edit mode                             │
│    ✓ No errors                                 │
│ 7. PASS / FAIL: ___________                   │
│ 8. If FAIL, note issue: ________________      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ DEPT HEAD TEST                                  │
├─────────────────────────────────────────────────┤
│ 1. Login as Dept Head (TRA, HR Dept)           │
│ 2. Navigate to roles page                      │
│ 3. Click "Create Role"                         │
│ 4. VERIFY:                                     │
│    ✓ Scope LOCKED to DEPARTMENT                │
│    ✓ departmentId auto-set to their dept      │
│    ✓ Can see Global + Org + own Dept roles    │
│    ✓ Cannot edit Org-level roles              │
│ 5. Create role                                 │
│ 6. VERIFY:                                     │
│    ✓ scope=DEPARTMENT                          │
│    ✓ departmentId=HR Dept ID                  │
│    ✓ Appears in "My Department" tab           │
│    ✓ Scope badge: "🏬 My Dept"               │
│ 7. PASS / FAIL: ___________                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ TEAM LEADER TEST                                │
├─────────────────────────────────────────────────┤
│ Similar pattern - test scope=TEAM              │
│ teamId auto-set, badge "👥 My Team"           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ EMPLOYEE TEST                                   │
├─────────────────────────────────────────────────┤
│ 1. Login as Employee                           │
│ 2. Navigate to roles page                      │
│ 3. VERIFY:                                     │
│    ✓ "Create Role" button NOT visible         │
│    ✓ Can only VIEW roles (read-only)          │
│    ✓ No edit/delete buttons on cards          │
│ 4. PASS / FAIL: ___________                   │
└─────────────────────────────────────────────────┘
```

---

## PART 3: SYSTEMATIC FIXING APPROACH

### Phase 1: Audit Current State (Day 1 — 20th Feb)

**Action:** Run audit on EACH module

```bash
# Run these commands and document results

# 1. Check all role-related files
find app -path "*roles*" -name "*.tsx" -o -name "route.ts" | grep -E "(admin|clients)" 

# 2. Check API endpoints
find app/api -path "*roles*" -o -path "*competencies*" -o -path "*models*" | head -30

# 3. Check components
find components -name "*Role*" -o -name "*Competency*" -o -name "*Assessment*" | head -30

# 4. Check permission files
ls -la lib/permissions/
ls -la hooks/usePermissions.ts 2>/dev/null || echo "Missing"

# 5. Test database schema
npx prisma db pull  # Verify schema matches code
grep -A 5 "model Role" prisma/schema.prisma
grep -A 5 "model Competency" prisma/schema.prisma
```

**Document findings in:** `CURRENT_STATE_AUDIT_20FEB.md`

---

### Phase 2: Fix Roles Module (Day 1-2 — 20-21 Feb)

**Priority Order:**

#### 2.1 Fix RLS & Permissions (Critical Foundation)
1. Verify `lib/permissions/role-competency-permissions.ts` exists and is correct
2. Verify `hooks/useRoleCompetencyPermissions.ts` works
3. Test permission utility with mock users (unit test)

#### 2.2 Fix Roles API
1. Fix GET `/api/admin/roles` — RLS filter working
2. Fix POST `/api/admin/roles` — scope enforcement
3. Fix submit-global endpoint
4. Fix approve-global endpoint
5. Test each with Postman/curl for all user roles

#### 2.3 Fix Roles UI
1. Extract `RolesPageContent.tsx` shared component
2. Wire admin page to use it
3. Wire client page to use it
4. Test tabs, badges, buttons for all roles

#### 2.4 Test Roles End-to-End
Use the testing template above for:
- Create (Manual/Bulk/AI)
- Read/View
- Edit
- Delete
- Submit for Global
- Approve/Reject

**Complete this before moving to Competencies.**

---

### Phase 3: Fix Competencies Module (Day 3 — 22 Feb)

Same pattern as Roles:
1. API RLS
2. API scope enforcement
3. Submit/approve endpoints
4. Shared UI component
5. End-to-end testing

**Complete before moving to Assessment Models.**

---

### Phase 4: Fix Assessment Models (Day 4 — 23 Feb)

#### 4.1 Core Model CRUD
- Create from role
- Competency selection (role NOT modified)
- Weights
- Publish/Unpublish

#### 4.2 Test with each user role

**Complete before moving to Components.**

---

### Phase 5: Fix Components & Questions (Day 5 — 24 Feb)

#### 5.1 Component Management
- Add component (with block on published)
- Component suggester
- Edit/Delete (with block on published)

#### 5.2 Question Management
- Manual entry (with block on published)
- Bulk upload (with block on published)
- AI generate (with block on published)
- Edit/Delete (with block on published)
- Component library

#### 5.3 Wizard Flow
- All 5 steps working
- Draft save at each step
- Progress tracking
- Final publish

**Day 5 (24th) — FINAL TESTING & CLIENT DEMO PREP**

---

## PART 4: ANTIGRAVITY IMPLEMENTATION PROMPT

```markdown
@SYSTEMATIC_STABILIZATION_ROADMAP.md

You are Antigravity. Your mission: Fix the SudAssess platform systematically.

CRITICAL RULES:
1. Work ONE module at a time (Roles → Competencies → Models → Components)
2. Work ONE user role at a time (Super Admin → Corp Admin → Dept Head → Team Leader → Employee)
3. Test EVERY functionality before moving to the next
4. Do NOT touch unrelated files
5. Do NOT create new components if they exist
6. Use the testing template for EACH functionality

START WITH: Phase 2.1 — Fix RLS & Permissions

STEP 1: Audit
- Read lib/permissions/role-competency-permissions.ts
- Read hooks/useRoleCompetencyPermissions.ts
- Report: Do they exist? Are they correct per ROLES_COMPETENCIES_RLS_POLYMORPHIC.md?

STEP 2: Fix Roles API
- Read app/api/admin/roles/route.ts
- Fix GET: Apply buildRoleVisibilityFilter
- Fix POST: Apply scope enforcement
- Test with curl for all user roles
- Report results

STEP 3: Fix Roles UI
- Extract RolesPageContent.tsx
- Wire admin and client pages
- Test: Do all 5 user roles see correct data?

ONLY after Roles are 100% working for all roles, ask:
"Roles module complete. Ready to move to Competencies? (y/n)"

Then repeat for Competencies, Models, Components.

Do NOT work on multiple modules simultaneously.
Do NOT skip testing any user role.

Begin with Phase 2.1 audit now.
```

---

## PART 5: TESTING CHECKLIST TRACKER

### Roles Module

| Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee | Status |
|---------------|-------------|------------|-----------|-------------|----------|--------|
| 1.1.1 List all roles | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.1.2 Filter by scope | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.2.1 Create - Manual | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.2.2 Create - Bulk | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.2.3 Create - AI | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.3.1 Edit own roles | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.4.1 Delete own roles | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.5.1 Submit for global | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 1.5.3 Approve global | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |

### Competencies Module

| Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee | Status |
|---------------|-------------|------------|-----------|-------------|----------|--------|
| 2.1.1 List competencies | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 2.2.1 Create - Manual | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 2.2.2 Create - Bulk | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 2.2.3 Create - AI | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |

### Assessment Models

| Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee | Status |
|---------------|-------------|------------|-----------|-------------|----------|--------|
| 3.2.1 Create from role | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 3.2.5 Role NOT modified | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 3.5.1 Publish model | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 3.5.3 Unpublish | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |

### Components & Questions

| Functionality | Super Admin | Corp Admin | Dept Head | Team Leader | Employee | Status |
|---------------|-------------|------------|-----------|-------------|----------|--------|
| 4.2.1 Add component | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 5.2.1 Manual entry | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 5.3.1 Bulk upload | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |
| 5.4.1 AI generate | ☐ | ☐ | ☐ | ☐ | ☐ | ⏳ Pending |

---

## PART 6: DAILY GOALS (20-24 Feb)

### Day 1 (20 Feb) — ROLES MODULE
- ✓ Complete audit
- ✓ Fix permissions utility
- ✓ Fix roles API (GET/POST/submit/approve)
- ✓ Test API with all 5 user roles
- Target: All roles CRUD working for all roles

### Day 2 (21 Feb) — ROLES UI + COMPETENCIES START
- ✓ Extract RolesPageContent
- ✓ Wire admin and client pages
- ✓ Test roles UI end-to-end for all roles
- ✓ Start competencies API fixes
- Target: Roles 100% done, Competencies API 50%

### Day 3 (22 Feb) — COMPETENCIES COMPLETE
- ✓ Complete competencies API
- ✓ Complete competencies UI
- ✓ Test end-to-end for all roles
- Target: Competencies 100% done

### Day 4 (23 Feb) — ASSESSMENT MODELS
- ✓ Fix model creation (from role)
- ✓ Verify role NOT modified
- ✓ Fix competency selection & weights
- ✓ Fix publish/unpublish
- ✓ Test for all roles
- Target: Models 100% done

### Day 5 (24 Feb) — COMPONENTS & QUESTIONS
- ✓ Fix component management
- ✓ Fix question management (Manual/Bulk/AI)
- ✓ Fix published model locking
- ✓ Test wizard flow
- ✓ Final integration test
- ✓ CLIENT DEMO READY

---

## PART 7: SUCCESS CRITERIA

Before declaring "DONE":

### Roles Module ✓
- [ ] Super Admin can create GLOBAL roles
- [ ] Corp Admin can create ORG roles (scope locked)
- [ ] Dept Head can create DEPT roles (scope locked)
- [ ] Team Leader can create TEAM roles (scope locked)
- [ ] Employee cannot create, only view
- [ ] Manual/Bulk/AI all working for each role type
- [ ] Submit for global works (non-SuperAdmin)
- [ ] Approve global works (SuperAdmin only)
- [ ] RLS filters work (each sees only their scope)
- [ ] Scope badges display correctly
- [ ] Edit/Delete permissions enforced

### Competencies Module ✓
- [ ] Same checklist as Roles (parallel structure)

### Assessment Models ✓
- [ ] Create from role works
- [ ] Role is NOT modified during creation
- [ ] Competency selection works (subset)
- [ ] Weights sum to 100% (validated)
- [ ] Publish increments version
- [ ] Unpublish returns to draft
- [ ] Published models locked (403 on edit)

### Components & Questions ✓
- [ ] Add component works (with published block)
- [ ] Component suggester works
- [ ] Manual question entry works
- [ ] Bulk upload works
- [ ] AI generate works
- [ ] Edit/Delete blocked when published
- [ ] Unpublish → Edit → Publish cycle works
- [ ] Component library save/use works

### Integration ✓
- [ ] Full wizard flow (5 steps) works
- [ ] Draft saving at each step
- [ ] Progress tracking accurate
- [ ] All user roles tested
- [ ] No console errors
- [ ] TRA tenant fully functional

---

## PART 8: EMERGENCY ROLLBACK PLAN

If something breaks badly:

```bash
# 1. Identify what broke
git log --oneline -10

# 2. Find the last working commit
git log --grep="working"

# 3. Create a rollback branch
git checkout -b rollback-roles-fix

# 4. Revert to last stable
git reset --hard [commit-hash]

# 5. Deploy last stable version
# Then fix forward with smaller changes
```

---

**END OF SYSTEMATIC STABILIZATION ROADMAP**

This roadmap ensures you fix the system methodically, test thoroughly, and don't break things by touching too much at once. Use this as your daily guide for the next 5 days.
