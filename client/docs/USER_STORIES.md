# Nexus - Complete User Stories by Role

## Overview
This document provides comprehensive user stories for Nexus across all major features and three user roles.

### Role Hierarchy
- **Team Lead**: Full control + configuration + approvals
- **Team Member**: Task execution + progress updates
- **Adviser**: Read-only visibility

### Key Features Covered
- Authentication
- Project Configuration
- Phase & Deliverable Management
- Sprint & Task Management
- Evidence & Documentation
- Collaboration & Comments
- Progress Tracking & Dashboards
- Team Onboarding
- Data Management & Exports

---

## PART 1: AUTHENTICATION & ONBOARDING

### US-001: User Login
**Goal:** Any user can log into the system securely.

**Scenario:**
As a user, I want to log in with my email and password so that I can access my project workspace.

**Actions:**
1. Navigate to `/login`
2. Enter email and temporary password (received from Team Lead)
3. Click "Login"
4. Redirected to dashboard based on role
5. Optional: System prompts to change password on first login

**Acceptance Criteria:**
- Email validation works
- Password is validated securely
- JWT token is issued on successful login
- Session persists across browser refresh
- Logout clears session

---

### US-002: Team Onboarding via Email Invitation
**Goal:** Team Lead can invite team members by email.

**Scenario:**
As a Team Lead, I want to invite team members by entering their email so they can join the project.

**Actions:**
1. Navigate to Settings → Team Members
2. Click "Invite User"
3. Enter:
   - Email address
   - Name
   - Role (Member or Adviser)
4. Click "Send Invitation"
5. System generates random cryptographically-strong password
6. System sends email with:
   - Login URL
   - Email address
   - Temporary password
   - Instruction to change password
7. User receives email and logs in

**Acceptance Criteria:**
- Email must be unique
- Password is hashed and never stored in plain text
- Email is sent via SMTP or transactional service
- User is created with MEMBER role by default
- Invitation email contains all necessary info

---

## PART 2: PROJECT CONFIGURATION

### US-003: Configure Project Details
**Goal:** Team Lead sets up the project metadata.

**Scenario:**
As a Team Lead, I want to configure the project title, description, and repository so that all team members understand the project context.

**Actions:**
1. Navigate to Settings → Project Configuration
2. Fill in:
   - Project Title (e.g., "Student Capstone: AI Chatbot")
   - Description (e.g., "An AI-powered customer support chatbot")
   - Repository URL (GitHub, GitLab link)
   - Academic Term (e.g., "Fall 2025")
   - Team size and member names
3. Save configuration
4. Information appears on dashboard for all users

**Acceptance Criteria:**
- Project is stored as singleton in database
- All users can view (read-only except Team Lead)
- Changes are immediately reflected
- Repository link is clickable

---

## PART 3: PHASE & DELIVERABLE MANAGEMENT

### US-004: Configure Project Phases
**Goal:** Team Lead can define the WSF phases for the project.

**Scenario:**
As a Team Lead, I want to set up the three WSF phases (Waterfall, Scrum, Fall) with dates and descriptions so that work is organized.

**Actions:**
1. Navigate to Settings → Project Configuration or `/phases`
2. See three pre-defined phase templates
3. For each phase, configure:
   - Phase name (e.g., "Phase 1: Planning & Design")
   - Description
   - Start date
   - End date
   - Status (Active, Completed, On Hold)
4. Save
5. Phases are visible in `/phases` page as cards

**Acceptance Criteria:**
- All three phases are visible in order
- Dates can be edited anytime
- Status affects visual display (color coding)
- Changes persist to database

---

### US-005: Create & Manage Deliverables
**Goal:** Team Lead defines required deliverables for each phase.

**Scenario:**
As a Team Lead, I want to create deliverables under each phase so that team members know what must be completed.

**Actions:**
1. Navigate to `/phases`
2. Click on a phase
3. Click "Add Deliverable"
4. Fill in:
   - Deliverable name
   - Description (requirements)
   - Expected due date
   - File type (PDF)
5. Save
6. Deliverable appears under the phase with status "Not Started"

**Acceptance Criteria:**
- Deliverables are linked to phases
- Default status is "Not Started"
- Team Lead can edit/delete (soft delete)
- Due dates can be in past (for planning purposes)

---

### US-006: Monitor Phase Progress
**Goal:** Team Lead can see completion status of all phases.

**Scenario:**
As a Team Lead, I want to see how much of each phase is completed so I can identify bottlenecks early.

**Actions:**
1. Navigate to `/phases`
2. See phase cards showing:
   - Phase name
   - Phase dates (start - end)
   - Total deliverables count
   - Completion percentage (e.g., "3/5 = 60%")
   - Status badge (Active, Completed, At Risk)
3. Click phase to expand and see individual deliverables with color-coded status:
   - Gray: Not Started
   - Yellow: In Progress
   - Blue: Review (awaiting approval)
   - Green: Completed

**Acceptance Criteria:**
- Progress calculation is accurate
- Real-time updates when status changes
- Color coding is consistent
- Visual hierarchy is clear

---

## PART 4: SPRINT & TASK MANAGEMENT

### US-007: Create & Plan Sprints
**Goal:** Team Lead can create time-boxed iterations within the Scrum phase.

**Scenario:**
As a Team Lead, I want to create sprints (e.g., 2-week iterations) so the team can organize work into manageable chunks.

**Actions:**
1. Navigate to `/sprints`
2. Click "Create Sprint"
3. Fill in:
   - Sprint name (e.g., "Sprint 1: Core Features")
   - Sprint duration (start date, end date)
   - Description/goals
   - Assign team members
4. Save
5. Sprint appears in list and calendar view

**Acceptance Criteria:**
- Multiple sprints can exist
- Each sprint belongs to Scrum phase
- Dates can't overlap
- Team members are notified of assignment

---

### US-008: Create & Assign Tasks
**Goal:** Team Lead can break down work into tasks and assign them to team members.

**Scenario:**
As a Team Lead, I want to create tasks within a sprint and assign them to team members so work is clear and trackable.

**Actions:**
1. Navigate to `/sprints/[id]` (sprint detail page)
2. Click "Add Task"
3. Fill in:
   - Task title (e.g., "Implement user authentication")
   - Description
   - Assigned member
   - Due date (within sprint)
   - Labels/tags
4. Save
5. Task appears in task board (Kanban view)

**Acceptance Criteria:**
- Tasks are organized in columns (Todo, In Progress, Blocked, Done)
- Can drag-drop tasks between columns
- Assigned member gets notification
- Task has unique ID for reference

---

### US-009: Mark Tasks as Blocked with Explanation
**Goal:** Team Member can mark a task as blocked and explain why.

**Scenario:**
As a Team Member, I want to mark a task as "Blocked" and explain the reason so the Team Lead knows what's preventing progress.

**Actions:**
1. Navigate to `/sprints/[id]`
2. Click on a task
3. Click "Mark as Blocked"
4. A comment dialog appears (mandatory)
5. Type blocker reason (e.g., "Waiting for API endpoint from backend team")
6. Submit
7. Task status changes to "Blocked" (red indicator)
8. Team Lead receives notification

**Acceptance Criteria:**
- Blocked status requires a comment
- Comment is visible to all team members
- Cannot mark as blocked without explanation
- Team Lead can unblock task

---

## PART 5: DELIVERABLES & EVIDENCE

### US-010: Upload Evidence for Deliverables
**Goal:** Team Member can submit evidence (files) to fulfill deliverables.

**Scenario:**
As a Team Member, I want to upload a document or file to show that a deliverable is complete.

**Actions:**
1. Navigate to `/deliverables`
2. Find a deliverable with status "Not Started" or "In Progress"
3. Click "Upload Evidence"
4. Dialog appears:
   - File picker (drag & drop or browse)
   - Optional comment field
   - Submit button
5. Select file (PDF, image, etc.)
6. Add optional comment (e.g., "Here's the requirements document")
7. Click "Submit"
8. Deliverable status changes to "Review"
9. Team Lead gets notification

**Acceptance Criteria:**
- File type validation (only allowed types)
- File size validation (e.g., max 10MB)
- Status automatically changes to "Review"
- Timestamp recorded
- Multiple uploads allowed (version history)

---

### US-011: Approve or Request Changes on Deliverables
**Goal:** Team Lead can review and approve/reject submitted evidence.

**Scenario:**
As a Team Lead, I want to review uploaded evidence and either approve it or request changes.

**Actions:**
1. Navigate to `/deliverables` or `/phases`
2. See deliverables with status "Review"
3. Click on deliverable to view:
   - File(s) uploaded
   - Upload timestamp
   - Comments from team member
4. Either:
   - **Approve:** Click "Approve" → Status becomes "Completed" → Team member notified
   - **Request Changes:** Click "Request Changes" → Add feedback comment → Status reverts to "In Progress" → Team member notified
5. Activity logged

**Acceptance Criteria:**
- Can preview files (PDFs, images)
- Can download files
- Feedback comment is visible to team member
- Approval/rejection is timestamped
- Activity is audited

---

### US-012: View Evidence History & Versions
**Goal:** Any user can see all versions of submitted evidence.

**Scenario:**
As a Team Member, I want to see the history of my submissions so I know what feedback was given and what version is current.

**Actions:**
1. Navigate to a deliverable detail page
2. Scroll to "Evidence" section
3. See list of all submissions with:
   - Upload date/time
   - Uploader name
   - File name
   - Status at time of upload
   - Associated comments
4. Click on submission to download or view details

**Acceptance Criteria:**
- All versions are preserved
- Can revert to previous version if needed
- Comments are shown for each version
- Clear indication of which is "current" version

---

## PART 6: COMMENTS & COLLABORATION

### US-013: Add Comments to Deliverables or Tasks
**Goal:** Team members can collaborate via comments.

**Scenario:**
As a Team Member, I want to comment on deliverables or tasks to explain progress, ask questions, or note blockers.

**Actions:**
1. Navigate to a deliverable or task
2. Scroll to "Comments" section
3. Click "Add Comment"
4. Type message (e.g., "Ready for review" or "Blocked waiting on design approval")
5. Submit
6. Comment appears with timestamp and author
7. All team members can see comment
8. Mentioned users (if @mentioned) get notification

**Acceptance Criteria:**
- Comments are threaded
- Support @mentions
- Timestamps are shown
- Comments are editable by author
- Comments can be deleted by author or Team Lead
- Supports markdown formatting

---

### US-014: Receive Notifications
**Goal:** Users get notified of important activities.

**Scenario:**
As a Team Member, I want to receive notifications when:
- Evidence is approved/rejected
- Task is assigned to me
- Someone comments on my work
- Team Lead requests changes

**Actions:**
1. Notifications appear as:
   - In-app badge on bell icon
   - In-app notification list
   - Optional email notifications (if enabled)
2. Click notification to navigate to relevant item
3. Mark as read

**Acceptance Criteria:**
- Notifications are real-time (or near real-time)
- Can be dismissed
- Notification preferences are configurable
- Team Lead can disable notifications for specific events

---

## PART 7: PROGRESS TRACKING & DASHBOARDS

### US-015: View Dashboard
**Goal:** Users can see project overview at a glance.

**Scenario:**
As a Team Lead, I want to see a dashboard showing overall project health so I can make decisions quickly.

**Actions:**
1. Navigate to `/dashboard`
2. See key metrics:
   - Overall project completion % (e.g., "45% Complete")
   - Phase breakdown (progress bars for each phase)
   - Sprint status (active sprint highlighted)
   - Team member contributions (# of tasks completed per member)
   - Recent activity feed
   - Upcoming deadlines
   - Blocked tasks list
3. Dashboard is role-specific (Team Members see only their tasks)

**Acceptance Criteria:**
- Metrics are calculated accurately
- Updates in real-time
- Responsive design (mobile-friendly)
- Team Member sees only assigned tasks
- Adviser sees full read-only view

---

### US-016: View Sprint Board
**Goal:** Team can visualize sprint progress with task board.

**Scenario:**
As a Team Member, I want to see a Kanban-style board showing all tasks in the current sprint and their statuses.

**Actions:**
1. Navigate to `/sprints/[id]`
2. See board with columns:
   - **Todo** (unstarted tasks)
   - **In Progress** (assigned to me, being worked on)
   - **Blocked** (stuck, with red indicator)
   - **Done** (completed)
3. See task cards showing:
   - Task title
   - Assignee avatar
   - Due date
   - Labels
4. Drag task between columns to update status
5. Click task to see details and add comments

**Acceptance Criteria:**
- Drag-drop is smooth
- Status updates immediately
- Can't move blocked tasks without unblocking
- Can filter by assignee
- Can sort by date

---

## PART 8: CONTRIBUTION & PERFORMANCE TRACKING

### US-017: View Team Member Contributions
**Goal:** Team Lead can see who contributed what.

**Scenario:**
As a Team Lead, I want to see a breakdown of each team member's contributions (tasks completed, evidence submitted) so I can evaluate their effort.

**Actions:**
1. Navigate to Settings → Team Members or Contributions report
2. See table with each member showing:
   - Name
   - # of tasks assigned
   - # of tasks completed
   - # of deliverables submitted
   - # of comments added
   - Last activity date
3. Click on member to see detailed activity log
4. Can export contribution report

**Acceptance Criteria:**
- Calculations are accurate
- Sortable by any column
- Historical data is available
- Export works (CSV, JSON)

---

### US-018: View Activity Timeline
**Goal:** Team Lead can see audit trail of all actions.

**Scenario:**
As a Team Lead, I want to see an activity log of who did what and when so I can resolve disputes and understand project history.

**Actions:**
1. Navigate to Settings → Activity Log or History
2. See timeline showing:
   - Timestamp
   - User name
   - Action (e.g., "submitted evidence", "approved deliverable", "marked task done")
   - Related item (link to deliverable/task)
   - Status change (if applicable)
3. Can filter by:
   - User
   - Action type
   - Date range
4. Can export activity report

**Acceptance Criteria:**
- All actions are logged
- Immutable (cannot be edited)
- Timestamps are accurate (UTC)
- Can search/filter effectively

---

## PART 9: MEETINGS & DOCUMENTATION

### US-019: Upload Meeting Minutes
**Goal:** Team members can upload meeting minutes (PDF) linked to sprints or phases.

**Scenario:**
As a Team Lead or Team Member, I want to upload a PDF file containing meeting minutes so there's a record of decisions and discussions.

**Actions:**
1. Navigate to `/meetings` or `/sprints/[id]`
2. Click "Upload Meeting Minutes"
3. Dialog appears:
   - File picker (PDF)
   - Meeting date
   - Meeting title (e.g., "Sprint 2 Retrospective")
   - Optional description
   - Assign to sprint or phase (dropdown)
4. Upload file
5. File appears in meetings list or sprint/phase detail

**Acceptance Criteria:**
- PDF files accepted
- File size limits enforced
- Linked to specific sprint or phase
- Can be downloaded/previewed
- Metadata (date, title) is searchable
- Team Members can upload (not just Team Lead)

---

### US-020: View Meeting Minutes Repository
**Goal:** Any user can access uploaded meeting minutes.

**Scenario:**
As an Adviser, I want to view all uploaded meeting minutes so I can understand team decisions and progress.

**Actions:**
1. Navigate to `/meetings`
2. See list of all uploaded PDFs showing:
   - Meeting date
   - Meeting title
   - Related sprint
   - Upload date
   - Uploaded by (user name)
3. Click to download or preview PDF
4. Can filter by sprint or date range

**Acceptance Criteria:**
- All files are accessible
- Preview works for PDFs
- Download works
- Sortable by date
- Search by title works

---

## PART 10: TIMELINE & GANTT VIEW

### US-021: View Project Timeline
**Goal:** Team Lead can see planned vs. actual dates.

**Scenario:**
As a Team Lead, I want to see a timeline showing planned phase dates vs. actual completion dates so I can track schedule adherence.

**Actions:**
1. Navigate to `/timeline` or Dashboard → Timeline tab
2. See Gantt chart showing:
   - All phases as horizontal bars
   - Phase start and end dates
   - Deliverable milestones
   - Current date indicator
   - Delays highlighted in red
3. Hover over bar to see details
4. Can zoom in/out for different views

**Acceptance Criteria:**
- Timeline is accurate
- Responsive and readable
- Delays are clearly marked
- Legend explains colors
- Can export as image

---

## PART 11: TEAM MANAGEMENT

### US-022: Manage Team Members
**Goal:** Team Lead can add/remove/modify team members.

**Scenario:**
As a Team Lead, I want to manage the team (add, remove, change roles) so team access is controlled.

**Actions:**
1. Navigate to Settings → Team Members
2. See list of all team members with:
   - Name
   - Email
   - Role (Member, Team Lead, Adviser)
   - Join date
   - Last login
3. Can:
   - Click "Invite User" to add new member (email sent)
   - Click "Remove" to remove user (confirm dialog)
   - Change role in dropdown
   - View activity per user
4. Changes are saved immediately

**Acceptance Criteria:**
- Invite sends email with credentials
- Role changes are immediate
- Removed users lose access
- Cannot remove self
- Audit log shows changes

---

## PART 12: DATA MANAGEMENT & BACKUP

### US-023: Export Project Data
**Goal:** Team Lead can download a backup of all project data.

**Scenario:**
As a Team Lead, I want to export all project data (as JSON) so I have a backup or can migrate to another system.

**Actions:**
1. Navigate to Settings → Data Management
2. Click "Export Project Data"
3. Choose what to export:
   - ☑ Project metadata
   - ☑ Phases and deliverables
   - ☑ Sprints and tasks
   - ☑ Team members
   - ☑ Evidence files (as ZIP)
   - ☑ Comments and activity logs
4. Click "Generate Export"
5. File is generated and downloads (JSON + optional ZIP)

**Acceptance Criteria:**
- Export includes all selected data
- Data is in standard JSON format
- Evidence ZIP includes all files
- No sensitive data (passwords) is included
- Can be imported back to system

---

### US-024: Download Evidence Archive
**Goal:** Team Lead can download all evidence files at once.

**Scenario:**
As a Team Lead, I want to download all uploaded evidence files in a ZIP so I can back them up or share with adviser.

**Actions:**
1. Navigate to Settings → Data Management or `/deliverables`
2. Click "Download All Evidence"
3. Choose filter (optional):
   - All
   - By phase
   - By status (completed only)
   - By date range
4. System generates ZIP file
5. File downloads

**Acceptance Criteria:**
- ZIP preserves folder structure (organized by phase/deliverable)
- Filenames include upload date
- Can download partial archive by filter
- File size is reasonable

---

### US-025: Restore Deleted Items
**Goal:** Team Lead can recover accidentally deleted deliverables or tasks.

**Scenario:**
As a Team Lead, I want to restore a soft-deleted deliverable so no work is permanently lost.

**Actions:**
1. Navigate to Settings → Trash or Data Management
2. See list of soft-deleted items (with deletion date and who deleted it)
3. Click "Restore" on an item
4. Item reappears in its original location
5. All associated evidence and comments are restored
6. Activity logged

**Acceptance Criteria:**
- Deleted items stored for 30 days minimum
- One-click restore
- Restore is logged
- All related data is restored
- Cannot restore past retention period

---

## PART 13: ADVISER-SPECIFIC FEATURES

### US-026: View Project Overview (Adviser)
**Goal:** Adviser can monitor project health without making changes.

**Scenario:**
As an Adviser, I want to see the complete project status so I can evaluate team performance.

**Actions:**
1. Navigate to `/dashboard` (read-only view)
2. See:
   - Overall completion %
   - Phase breakdown
   - Sprint status
   - Team contributions
   - Timeline with all activities
   - Evidence submitted (with download links)
3. Can filter/search but cannot edit
4. Can view activity logs

**Acceptance Criteria:**
- All data visible
- No edit buttons
- Cannot delete or modify
- Can download/export summary
- View is responsive

---

### US-027: Export Summary Report
**Goal:** Adviser can generate a report for academic records.

**Scenario:**
As an Adviser, I want to export a summary report showing project completion, team contributions, and timeline so I can include it in course records.

**Actions:**
1. Navigate to Settings → Reports or `/dashboard`
2. Click "Generate Report"
3. Choose format: PDF or JSON
4. System generates report with:
   - Project title and team members
   - Phase completion % and timelines
   - Individual contributions per member
   - Evidence summary
   - Activity log highlights
5. Download file

**Acceptance Criteria:**
- PDF is well-formatted
- All metrics are included
- No sensitive passwords/tokens
- Can be generated multiple times
- Report is timestamped

---

## QUICK REFERENCE: ROLE COMPARISON TABLE

| Feature                    | Team Lead | Team Member   | Adviser            |
| -------------------------- | --------- | ------------- | ------------------ |
| **Login**                  | ✅         | ✅             | ✅                  |
| **Configure Project**      | ✅         | ❌             | ❌                  |
| **Invite Users**           | ✅         | ❌             | ❌                  |
| **Create Phases**          | ✅         | ❌             | ❌                  |
| **Create Deliverables**    | ✅         | ❌             | ❌                  |
| **Upload Evidence**        | ❌         | ✅             | ❌                  |
| **Approve Deliverables**   | ✅         | ❌             | ❌                  |
| **Create Sprints**         | ✅         | ❌             | ❌                  |
| **Create Tasks**           | ✅         | ❌             | ❌                  |
| **Update Task Status**     | ✅         | ✅ (own tasks) | ❌                  |
| **Mark Task Blocked**      | ✅         | ✅ (own tasks) | ❌                  |
| **Add Comments**           | ✅         | ✅             | ✅                  |
| **Mention in Comments**    | ✅         | ❌             | ✅                  |
| **View Dashboard**         | ✅ (full)  | ✅ (personal)  | ✅ (full read-only) |
| **View Activity Log**      | ✅         | ❌             | ✅ (read-only)      |
| **Export Data**            | ✅         | ❌             | ✅ (summary only)   |
| **Restore Deleted Items**  | ✅         | ❌             | ❌                  |
| **View Contributions**     | ✅         | ❌             | ✅ (read-only)      |
| **Upload Meeting Minutes** | ✅         | ✅             | ❌                  |
| **View Meetings**          | ✅         | ✅             | ✅                  |

---

## END-TO-END WORKFLOW EXAMPLE

### Scenario: Complete Project Cycle

**Phase 1: Setup (Team Lead)**
1. Team Lead creates project "AI Chatbot Capstone"
2. Team Lead invites 5 team members + adviser (emails sent)
3. Team Lead configures 3 phases with dates
4. Team Lead creates deliverables for Waterfall phase

**Phase 2: Execution (Team Members)**
1. Team members see deliverables in `/deliverables`
2. Member 1 uploads "Requirements Document"
3. Status changes to "Review", Team Lead notified
4. Team Lead reviews, approves on `/phases`
5. Status changes to "Completed"

**Phase 3: Sprint Work (Team + Lead)**
1. Team Lead creates Sprint 1 (2 weeks)
2. Team Lead creates 5 tasks
3. Team Lead assigns tasks to members
4. Members update task status (Todo → In Progress → Done)
5. If blocked, member marks as Blocked + explains
6. Team Lead unblocks and adjusts
7. Sprint completes, Team Lead uploads meeting minutes

**Phase 4: Monitoring (All Roles)**
1. Team Lead views dashboard to track progress
2. Team Members see their assigned work
3. Adviser monitors overall progress via read-only dashboard

**Phase 5: Closure (Team Lead + Adviser)**
1. Team Lead marks final deliverables as approved
2. Project completion reaches 100%
3. Team Lead exports final data + evidence ZIP
4. Adviser downloads summary report for course records

---

## IMPLEMENTATION CHECKLIST

### Backend Routes (API Endpoints)
- Authentication: POST `/api/auth/login`, `/api/auth/logout`
- Users: POST `/api/users/invite`, GET `/api/users`, DELETE `/api/users/:id`
- Project: GET/PUT `/api/project`
- Phases: GET/POST/PUT/DELETE `/api/phases`, GET `/api/phases/:id/deliverables`
- Deliverables: GET/POST/PUT/DELETE `/api/deliverables`
- Evidence: POST `/api/deliverables/:id/evidence`, GET `/api/deliverables/:id/evidence`
- Tasks: GET/POST/PUT/DELETE `/api/sprints/:id/tasks`
- Sprints: GET/POST/PUT `/api/sprints`
- Comments: POST/GET `/api/:entityType/:id/comments`
- Activity: GET `/api/activity-log`
- Notifications: GET `/api/notifications`, PUT `/api/notifications/:id/read`
- Exports: GET `/api/export/project`, `/api/export/evidence`, `/api/export/report`

### Database Models (Prisma)
- User (with soft delete)
- Project (singleton)
- Phase
- Deliverable (with soft delete)
- Evidence
- Sprint
- Task (with soft delete)
- Comment (polymorphic)
- ActivityLog
- Notification
- MeetingLog

### Frontend Pages (Next.js Routes)
- `/login` - Login page
- `/dashboard` - Project overview
- `/phases` - Phase tracking
- `/sprints` - Sprint list
- `/sprints/[id]` - Sprint board
- `/deliverables` - Evidence management
- `/meetings` - Meeting minutes
- `/timeline` - Gantt chart
- `/settings/team` - Team management
- `/settings/project` - Project config
- `/settings/data` - Data export/backup

### UI Components Needed
- Header/Navigation
- Sidebar
- Phase cards with progress
- Deliverable list
- Task Kanban board
- Evidence upload modal
- Comment threads
- Activity feed
- Dashboard metrics
- Timeline/Gantt chart
- Export dialogs
- Notification center
- User invite form
- Role-based permission UI (hide/show buttons)
