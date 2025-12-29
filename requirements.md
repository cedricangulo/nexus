# Nexus - Requirements Specification

## 1. Overview
**Nexus** is an internal web application designed to help student teams monitor and evaluate their own capstone project progress. The system aligns with the **Water-Scrum-Fall (WSF)** methodology and focuses on tracking phases, deliverables, sprints, timelines, and individual contributions.

This system is a support and self-monitoring tool used alongside the actual capstone project.

## 2. Objectives
- **Centralize Project Metadata:** Store project title, academic term, and repository links.
- **Track Progress:** Monitor WSF phases, deliverables, and sprints.
- **Contextualize Work:** Allow commenting on tasks and deliverables (e.g., explaining blockers).
- **Audit & Evidence:** Record contributions, meeting logs, and evidence files.
- **Data Safety:** Prevent data loss via soft deletes and history logging.

## 3. Target Users

### 3.1 User Roles
*   **Team Member**
    *   Update assigned tasks (including blocking issues).
    *   Add comments to explain progress or blockers.
    *   Upload evidence.
    *   **Upload Meeting Minutes.**
    *   View progress dashboards.
*   **Team Lead / Project Manager**
    *   **Onboarding:** Create team member accounts via email invitation.
    *   Configure Project details (Title, Repository).
    *   Manage phases, sprints, and deliverables.
    *   Approve task completion.
    *   Upload Meeting Minutes.
    *   Restore deleted items.
*   **Adviser (View-Only)**
    *   View overall progress and evidence.

## 4. Technology Stack

### 4.1 Frontend
*   **Framework:** Next.js 15+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Responsive Design required)

### 4.2 Backend
*   **Server:** Fastify (Node.js)
*   **Architecture:** RESTful API
*   **Auth:** JWT-based authentication
*   **Email Service:** Nodemailer (SMTP) or a transactional provider (e.g., Resend/SendGrid) for credential delivery.

### 4.3 Database
*   **ORM:** Prisma
*   **Engine:** PostgreSQL or MySQL (Configurable)
*   **Normalization:** Strictly 3NF (First Normal Form compliant).

## 5. Functional Requirements

### 5.1 Authentication & Authorization
*   Users must be able to log in using email and password.
*   **No Public Sign-up:** Account creation is restricted to the Team Lead (Invite-only).
*   System must support Role-Based Access Control (RBAC).
*   Unauthorized users must be redirected to the login page via Next.js Middleware.

### 5.2 Routing (Next.js App Router)
The application shall implement **file-system based routing** using the Next.js App Router structure.

*   **Route Map:**
    *   `/login` – (`app/login/page.tsx`) Entry point.
    *   `/dashboard` – (`app/dashboard/page.tsx`) Overall progress overview.
    *   `/phases` – (`app/phases/page.tsx`) Waterfall, Scrum, and Fall phase tracking.
    *   `/sprints` – (`app/sprints/page.tsx`) Sprint list.
    *   `/sprints/[id]` – (`app/sprints/[id]/page.tsx`) Task board for a specific sprint.
    *   `/meetings` – (`app/meetings/page.tsx`) Repository of uploaded meeting minutes.
    *   `/deliverables` – (`app/deliverables/page.tsx`) Evidence and document uploads.
    *   `/settings` – (`app/settings/page.tsx`) Team configuration, User Management, and Backup.

*   **Rules:**
    *   **Middleware:** A `middleware.ts` file must protect all routes except `/login` and static assets.
    *   **Layouts:** A root layout (`app/layout.tsx`) or group layout (`app/(authenticated)/layout.tsx`) must handle the sidebar/navigation for logged-in users.

### 5.3 Project & Phase Management (WSF)
*   **Project Settings:** Define Title, Description, and Global Deadlines (stored as a singleton entity).
*   **Phases:**
    1.  **Waterfall** (Planning & Design)
    2.  **Scrum** (Development & Iteration)
    3.  **Fall** (Testing, Deployment, Closure)
*   Each phase must contain a list of required deliverables.
*   Each deliverable must have a status (*Not Started, In Progress, Review, Completed*) and a stage (*Planning, Design, Development, Testing, Deployment, General*).

### 5.4 Deliverable Tracking
*   Users must be able to view required deliverables per phase.
*   Users must be able to upload evidence (PDFs, images).
*   **Comments:** Users can add comments to deliverables (e.g., feedback on rejection).
*   **Safety:** Deleting a deliverable or evidence must perform a **Soft Delete**.

### 5.5 Sprint & Task Management
*   **Sprints:** Must allow creation with Tasks, Assigned Members, Start/End Dates, and Status.
*   **Tasks:** Must support:
    *   Description & Assignment.
    *   **Linking:** Can be linked to a **Sprint** OR a **Phase** (for tasks outside active sprints).
    *   **Status:** *Todo, In Progress, Blocked, Done*.
    *   **Blockers:** Tasks marked as "Blocked" must require a **Comment** explaining the reason.

### 5.6 Progress Dashboard
The dashboard must display:
*   Overall project completion percentage.
*   Phase-level progress.
*   Sprint completion status.
*   **Notifications:** Alert list for assigned tasks, blockers, or mentions.

### 5.7 Contribution Tracking
*   System must record tasks completed per member.
*   System must record sprint participation.
*   Contribution summaries must be viewable by the Team Lead.

### 5.8 Timeline & Gantt View
*   Display a timeline comparing **Planned Dates** vs **Actual Completion Dates**.
*   Delays must be visually indicated.

### 5.9 Audit & Activity Logging
*   The system must maintain an immutable history of critical actions.
*   **Logged Events:** Task status changes, File uploads, Deliverable approvals.
*   **Visible to:** Team Leads (to resolve disputes on who did what).

### 5.10 Meeting Minutes (PDF/Image Upload)
*   Users must be able to upload a PDF or Image file representing the "Minutes of Meeting" (MoM).
*   **Linking:** Each upload must be linked to a specific **Sprint** or a **Phase** (to allow for pre-sprint meetings during Waterfall).
*   **Required Fields:** Meeting Date, Title, File.
*   **Viewing:** Users must be able to download/preview the uploaded file.
*   **Note:** Structured data for "Attendees" or "Summary" is NOT required in the database; this information is assumed to be inside the uploaded document.

### 5.11 Data Backup
*   **Export:** Team Lead must be able to download a JSON export of current progress and a ZIP of all files (Evidence + Meeting Minutes).

### 5.12 Team Onboarding & Email Notification
*   **Invite Flow:** The Team Lead shall be able to create new users by entering an email address and Name.
*   **Auto-Generation:** The system must automatically generate a cryptographically strong, random password.
*   **Delivery:** The system must send an email to the new user containing their Login URL, Email, and Temporary Password.
*   **Security:** The generated password must be hashed immediately and stored securely in the database. It must **never** be stored in plain text.

### 5.13 Global Search
*   Users must be able to search across multiple entities from a single search bar.
*   **Searchable Entities:**
    *   **Tasks:** Search by title and description.
    *   **Deliverables:** Search by title and description.
    *   **Comments:** Search by content.
    *   **Meeting Logs:** Search by title.
*   **Authentication:** Search endpoint must require authentication.
*   **Validation:** Empty search queries must be rejected with a 400 error.
*   Results must be returned grouped by entity type.

### 5.14 Push Notifications
*   Users must be able to receive browser push notifications for important events.
*   **Supported Platforms:** Web browsers (Chrome, Firefox, Edge). iOS Safari requires PWA installation.
*   **Technology:** Firebase Cloud Messaging (FCM) for cross-platform delivery.
*   **Trigger Events:** Notifications are sent when in-app notifications are created (task assignments, mentions, blockers, etc.).
*   **Device Token Management:**
    *   Device tokens are registered automatically after login.
    *   Invalid/expired tokens are cleaned up automatically.
*   **User Control:** Users can deny browser notification permission; the system gracefully handles this.

## 6. Non-Functional Requirements

### 6.1 Usability
*   **Responsiveness:** Interface must be fully responsive (mobile-friendly) via Tailwind CSS.
*   Interface must be simple and intuitive.

### 6.2 Performance
*   Page load time should not exceed 2 seconds (Next.js SSR/SSG optimization).
*   API responses should complete within acceptable latency.

### 6.3 Security
*   Passwords must be securely hashed (e.g., bcrypt/argon2).
*   JWT tokens must be validated on protected routes.
*   File uploads must be validated for type (PDF/Image) and size.

### 6.4 Maintainability
*   Codebase must follow modular architecture.
*   **Database Seeding:** A script must be provided to seed the database with default Phases and Deliverables.

## 7. Backend API Requirements (Fastify + Prisma)

### 7.1 Core Entities (Schema Mapped)
*   **Project** (Singleton - Title, Repo, Dates)
*   **User** (Standard Auth & Profile)
*   **Phase** (Water, Scrum, Fall)
*   **Sprint** (Time-boxed iterations)
*   **Task** (Work items; linked to Sprint OR Phase)
*   **Deliverable** (Required Phase outputs; categorized by Stage)
*   **Evidence** (Files linked to deliverables)
*   **Comment** (Polymorphic: linked to Task OR Deliverable)
*   **MeetingLog** (Links to Sprint OR Phase; contains `fileUrl` for PDF/Image)
*   **ActivityLog** (Audit Trail)
*   **Notification** (In-app alerts)
*   **DeviceToken** (FCM tokens for push notifications; linked to User)

### 7.2 API Capabilities
*   CRUD operations for all core entities.
*   **User Provisioning:** Endpoint to create user + generate password + send email.
*   **Soft Delete** implementation for Tasks, Deliverables, and Evidence.
*   Authentication endpoints.
*   Role-protected endpoints.
*   File upload handling.

## 8. Constraints
*   System is intended for small teams (5–10 users).
*   No public access or SEO requirements.
*   No grading or evaluation automation.

## 9. Out of Scope
*   Learning Management System (LMS) features.
*   Adviser grading tools.
*   Real-time chat (Comments on entities are sufficient).
*   Native Mobile application (Web only).

## 10. Success Criteria
*   The team can clearly identify their capstone progress at any time.
*   Required deliverables are tracked and evidenced.
*   Blockers are communicated clearly via comments.
*   Data is recoverable via Soft Deletes.
