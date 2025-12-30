import 'dotenv/config'
import { PrismaClient, Role, PhaseType, DeliverableStatus, DeliverableStage, TaskStatus } from '../src/generated/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Helper to create a date
function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')

  // Clear existing data (optional - comment out to preserve data)
  console.log('🧹 Clearing existing data...')
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.meetingLog.deleteMany()
  await prisma.evidence.deleteMany()
  await prisma.task.deleteMany()
  await prisma.deliverable.deleteMany()
  await prisma.sprint.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  // ============================================
  // 1. CREATE USERS
  // ============================================
  console.log('\n👥 Creating users...')

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice.johnson@nexus.local',
        name: 'Alice Johnson',
        passwordHash: await hashPassword('password123'),
        role: Role.TEAM_LEAD
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob.smith@nexus.local',
        name: 'Bob Smith',
        passwordHash: await hashPassword('password123'),
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        email: 'carol.white@nexus.local',
        name: 'Carol White',
        passwordHash: await hashPassword('password123'),
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        email: 'david.brown@nexus.local',
        name: 'David Brown',
        passwordHash: await hashPassword('password123'),
        role: Role.ADVISER
      }
    }),
    prisma.user.create({
      data: {
        email: 'emma.davis@nexus.local',
        name: 'Emma Davis',
        passwordHash: await hashPassword('password123'),
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        email: 'frank.miller@nexus.local',
        name: 'Frank Miller',
        passwordHash: await hashPassword('password123'),
        role: Role.ADVISER
      }
    }),
    prisma.user.create({
      data: {
        email: 'grace.wilson@nexus.local',
        name: 'Grace Wilson',
        passwordHash: await hashPassword('password123'),
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        email: 'henry.taylor@nexus.local',
        name: 'Henry Taylor',
        passwordHash: await hashPassword('password123'),
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        email: 'isabella.anderson@nexus.local',
        name: 'Isabella Anderson',
        passwordHash: await hashPassword('password123'),
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        email: 'jack.thomas@nexus.local',
        name: 'Jack Thomas',
        passwordHash: await hashPassword('password123'),
        role: Role.ADVISER
      }
    })
  ])

  console.log(`✅ Created ${users.length} users`)
  const userMap = new Map(users.map(u => [u.id, u]))

  // ============================================
  // 2. CREATE PROJECT
  // ============================================
  console.log('\n📦 Creating project...')

  const project = await prisma.project.create({
    data: {
      name: 'Nexus Capstone Project',
      description: 'A comprehensive capstone project management and tracking system spanning 19 months with full team collaboration features',
      repositoryUrl: 'https://github.com/nexus/capstone-project',
      startDate: createDate(2025, 12, 19),
      endDate: createDate(2027, 7, 19)
    }
  })

  console.log(`✅ Created project: "${project.name}"`)

  // ============================================
  // 3. CREATE PHASES
  // ============================================
  console.log('\n🎯 Creating phases...')

  const phases = await Promise.all([
    prisma.phase.create({
      data: {
        projectId: project.id,
        type: PhaseType.WATERFALL,
        name: 'Planning & Design',
        description: 'Requirements gathering, stakeholder analysis, system architecture design, and UI/UX mockups',
        startDate: createDate(2025, 12, 19),
        endDate: createDate(2026, 3, 19)
      }
    }),
    prisma.phase.create({
      data: {
        projectId: project.id,
        type: PhaseType.SCRUM,
        name: 'Development & Iteration',
        description: 'Sprint-based development with 2-week iterations, continuous integration, and agile delivery',
        startDate: createDate(2026, 3, 20),
        endDate: createDate(2027, 4, 20)
      }
    }),
    prisma.phase.create({
      data: {
        projectId: project.id,
        type: PhaseType.FALL,
        name: 'Testing, Deployment & Closure',
        description: 'QA testing, user acceptance testing, production deployment, documentation, and project closure',
        startDate: createDate(2027, 4, 21),
        endDate: createDate(2027, 7, 19)
      }
    })
  ])

  console.log(`✅ Created ${phases.length} phases`)

  const [waterfall, scrum, fall] = phases

  // ============================================
  // 4. CREATE DELIVERABLES
  // ============================================
  console.log('\n📄 Creating deliverables...')

  const deliverables = await Promise.all([
    // Waterfall Phase Deliverables
    prisma.deliverable.create({
      data: {
        phaseId: waterfall.id,
        title: 'Project Charter & Scope Statement',
        description: 'Formal project charter defining scope, objectives, stakeholders, and success criteria',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.PLANNING,
        dueDate: createDate(2026, 1, 5)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: waterfall.id,
        title: 'Stakeholder Requirements Document',
        description: 'Comprehensive functional and non-functional requirements from all stakeholders',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.PLANNING,
        dueDate: createDate(2026, 1, 20)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: waterfall.id,
        title: 'System Architecture Diagram',
        description: 'High-level system architecture showing components, integrations, and data flow',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.DESIGN,
        dueDate: createDate(2026, 2, 5)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: waterfall.id,
        title: 'Database Schema Design',
        description: 'Normalized database design with entity-relationship diagram and schema specification',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.DESIGN,
        dueDate: createDate(2026, 2, 20)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: waterfall.id,
        title: 'UI/UX Wireframes & Mockups',
        description: 'Low-fidelity wireframes and high-fidelity mockups for all user interfaces',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.DESIGN,
        dueDate: createDate(2026, 3, 5)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: waterfall.id,
        title: 'Technical Design Document',
        description: 'Detailed technical design including APIs, database queries, and implementation approach',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.DESIGN,
        dueDate: createDate(2026, 3, 19)
      }
    }),
    // Scrum Phase Deliverables
    prisma.deliverable.create({
      data: {
        phaseId: scrum.id,
        title: 'Sprint 1-2 Code Review Report',
        description: 'Code quality assessment, testing coverage, and technical debt tracking for early sprints',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.DEVELOPMENT,
        dueDate: createDate(2026, 5, 15)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: scrum.id,
        title: 'REST API Documentation',
        description: 'Comprehensive OpenAPI/Swagger documentation for all backend APIs',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.DEVELOPMENT,
        dueDate: createDate(2026, 9, 30)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: scrum.id,
        title: 'Frontend Component Library',
        description: 'Reusable React component library with Storybook documentation',
        status: DeliverableStatus.COMPLETED,
        stage: DeliverableStage.DEVELOPMENT,
        dueDate: createDate(2026, 12, 31)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: scrum.id,
        title: 'Performance & Security Assessment',
        description: 'Third-party security audit and performance benchmarking results',
        status: DeliverableStatus.IN_PROGRESS,
        stage: DeliverableStage.DEVELOPMENT,
        dueDate: createDate(2027, 4, 15)
      }
    }),
    // Fall Phase Deliverables
    prisma.deliverable.create({
      data: {
        phaseId: fall.id,
        title: 'Test Plan & QA Strategy',
        description: 'Comprehensive testing strategy including unit, integration, and end-to-end testing',
        status: DeliverableStatus.IN_PROGRESS,
        stage: DeliverableStage.TESTING,
        dueDate: createDate(2027, 5, 15)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: fall.id,
        title: 'User Acceptance Testing Results',
        description: 'UAT findings, bug reports, and sign-off from stakeholders',
        status: DeliverableStatus.IN_PROGRESS,
        stage: DeliverableStage.TESTING,
        dueDate: createDate(2027, 6, 10)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: fall.id,
        title: 'Deployment Runbook',
        description: 'Step-by-step deployment procedures, rollback plans, and monitoring setup',
        status: DeliverableStatus.IN_PROGRESS,
        stage: DeliverableStage.DEPLOYMENT,
        dueDate: createDate(2027, 6, 25)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: fall.id,
        title: 'End User Documentation',
        description: 'User manuals, video tutorials, and FAQ documentation',
        status: DeliverableStatus.NOT_STARTED,
        stage: DeliverableStage.DEPLOYMENT,
        dueDate: createDate(2027, 7, 10)
      }
    }),
    prisma.deliverable.create({
      data: {
        phaseId: fall.id,
        title: 'Project Closure Report',
        description: 'Final project report including lessons learned, metrics, and recommendations',
        status: DeliverableStatus.NOT_STARTED,
        stage: DeliverableStage.DEPLOYMENT,
        dueDate: createDate(2027, 7, 19)
      }
    })
  ])

  console.log(`✅ Created ${deliverables.length} deliverables`)

  // ============================================
  // 5. CREATE SPRINTS
  // ============================================
  console.log('\n🔄 Creating sprints...')

  const sprints = await Promise.all([
    // Sprints 1-10 - All within SCRUM phase (Mar 20, 2026 - Aug 6, 2026)
    // 2-week sprints during Scrum phase only
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 1,
        goal: 'Project setup, requirements gathering, and initial planning',
        startDate: createDate(2026, 3, 20),
        endDate: createDate(2026, 4, 2)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 2,
        goal: 'System architecture design and technical specifications',
        startDate: createDate(2026, 4, 3),
        endDate: createDate(2026, 4, 16)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 3,
        goal: 'Database design and backend infrastructure setup',
        startDate: createDate(2026, 4, 17),
        endDate: createDate(2026, 4, 30)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 4,
        goal: 'Core API development and authentication system',
        startDate: createDate(2026, 5, 1),
        endDate: createDate(2026, 5, 14)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 5,
        goal: 'Frontend setup and component library foundation',
        startDate: createDate(2026, 5, 15),
        endDate: createDate(2026, 5, 28)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 6,
        goal: 'User interface implementation and integration',
        startDate: createDate(2026, 5, 29),
        endDate: createDate(2026, 6, 11)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 7,
        goal: 'Feature completion and comprehensive testing',
        startDate: createDate(2026, 6, 12),
        endDate: createDate(2026, 6, 25)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 8,
        goal: 'Performance optimization and security hardening',
        startDate: createDate(2026, 6, 26),
        endDate: createDate(2026, 7, 9)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 9,
        goal: 'User acceptance testing and bug fixes',
        startDate: createDate(2026, 7, 10),
        endDate: createDate(2026, 7, 23)
      }
    }),
    prisma.sprint.create({
      data: {
        projectId: project.id,
        number: 10,
        goal: 'Final polishing, documentation, and deployment preparation',
        startDate: createDate(2026, 7, 24),
        endDate: createDate(2026, 8, 6)
      }
    })
  ])

  console.log(`✅ Created ${sprints.length} sprints`)

  // ============================================
  // 6. CREATE TASKS
  // ============================================
  console.log('\n✏️ Creating tasks...')

  const taskTitles = [
    'Setup Node.js and Express backend',
    'Configure PostgreSQL database',
    'Implement JWT authentication',
    'Create user model and schema',
    'Build user registration endpoint',
    'Build user login endpoint',
    'Setup password hashing with bcrypt',
    'Create middleware for authentication',
    'Write authentication tests',
    'Document authentication APIs',
    'Design dashboard layout',
    'Create dashboard component',
    'Integrate dashboard with APIs',
    'Add real-time data updates',
    'Style dashboard with Tailwind CSS',
    'Create responsive layout',
    'Build sprint management features',
    'Create sprint creation form',
    'Implement sprint listing view',
    'Add sprint editing functionality',
    'Create task board component',
    'Implement drag and drop functionality',
    'Build task creation dialog',
    'Add task filtering options',
    'Implement task status updates',
    'Create task assignment feature',
    'Build notification system',
    'Setup email notifications',
    'Create notification preferences',
    'Add in-app notifications',
    'Build reporting dashboard',
    'Create sprint metrics charts',
    'Generate burndown charts',
    'Add export to PDF functionality',
    'Create user management page',
    'Build role-based access control',
    'Implement team management',
    'Add user invitation system',
    'Create user profile page',
    'Build settings panel',
    'Setup CI/CD pipeline',
    'Configure automated testing',
    'Setup database backups',
    'Create API documentation',
    'Write component documentation',
    'Setup error handling',
    'Implement logging system',
    'Create monitoring dashboard',
    'Add performance metrics',
    'Optimize database queries'
  ]

  const taskDescriptions = [
    'Set up basic Express server with middleware configuration',
    'Create PostgreSQL connection pool and migrations',
    'Implement JWT token generation and validation',
    'Design user table with appropriate fields and constraints',
    'Create POST endpoint for user registration with validation',
    'Create POST endpoint for user login with token generation',
    'Implement bcrypt hashing for secure password storage',
    'Create auth middleware for protecting routes',
    'Write comprehensive unit tests for auth functionality',
    'Generate OpenAPI documentation for auth endpoints',
    'Create responsive dashboard layout using React',
    'Develop main dashboard component with widgets',
    'Connect dashboard to backend APIs for data fetching',
    'Implement WebSocket connection for real-time updates',
    'Apply Tailwind CSS styling for modern appearance',
    'Ensure layout works on mobile, tablet, and desktop',
    'Create sprint CRUD operations',
    'Build form for creating new sprints',
    'Develop list view showing all sprints',
    'Implement sprint update and delete functionality',
    'Create Kanban-style task board component',
    'Add drag-and-drop between columns',
    'Build modal dialog for task creation',
    'Add filters for task status, assignee, and priority',
    'Implement API calls to update task status',
    'Create dropdown for assigning tasks to team members',
    'Build notification center component',
    'Setup email service integration',
    'Create user preferences for notification types',
    'Add toast notifications for user actions',
    'Create comprehensive reporting dashboard',
    'Implement chart visualization for sprint metrics',
    'Generate automatic burndown charts from sprint data',
    'Implement PDF export for reports and documents',
    'Create admin page for user management',
    'Implement role-based access control logic',
    'Add team management with member assignment',
    'Create email-based user invitation system',
    'Build user profile editing page',
    'Create settings page with user preferences',
    'Setup GitHub Actions for automated CI/CD',
    'Configure Jest and React Testing Library',
    'Implement automated database backup scripts',
    'Create Swagger documentation for all APIs',
    'Write JSDoc comments for all components',
    'Add global error handling middleware',
    'Implement Winston logger for application logs',
    'Create dashboard for system health monitoring',
    'Add performance metrics collection',
    'Add database query optimization and indexing'
  ]

  let taskCount = 0
  const tasks: any[] = []

  // Create tasks for sprints
  for (const sprint of sprints) {
    const numTasks = Math.floor(Math.random() * 5) + 8 // 8-12 tasks per sprint
    for (let i = 0; i < numTasks; i++) {
      const randomIndex = Math.floor(Math.random() * taskTitles.length)
      const randomAssignee = users[Math.floor(Math.random() * users.length)]

      // Determine status based on sprint date
      let status: TaskStatus
      const now = new Date()

      if (sprint.endDate < now) {
        // Past sprints should have mostly DONE tasks
        const rand = Math.random()
        if (rand < 0.7) status = TaskStatus.DONE
        else if (rand < 0.85) status = TaskStatus.IN_PROGRESS
        else if (rand < 0.95) status = TaskStatus.TODO
        else status = TaskStatus.BLOCKED
      } else if (sprint.startDate <= now && sprint.endDate >= now) {
        // Active sprint (Sprint 1) mix of statuses
        const rand = Math.random()
        if (rand < 0.3) status = TaskStatus.DONE
        else if (rand < 0.6) status = TaskStatus.IN_PROGRESS
        else if (rand < 0.9) status = TaskStatus.TODO
        else status = TaskStatus.BLOCKED
      } else {
        // Future sprints mostly TODO
        const rand = Math.random()
        status = rand > 0.8 ? TaskStatus.IN_PROGRESS : TaskStatus.TODO
      }

      const task = await prisma.task.create({
        data: {
          sprintId: sprint.id,
          title: `${taskTitles[randomIndex]} - ${i + 1}`,
          description: taskDescriptions[randomIndex],
          status,
          assignments: {
            create: [{ userId: randomAssignee.id }]
          },
          createdAt: new Date(sprint.startDate.getTime() + Math.random() * (sprint.endDate.getTime() - sprint.startDate.getTime()))
        }
      })
      tasks.push(task)
      taskCount++
    }
  }

  console.log(`✅ Created ${taskCount} tasks`)

  // ============================================
  // 7. CREATE EVIDENCE FILES
  // ============================================
  console.log('\n📎 Creating evidence files...')

  let evidenceCount = 0
  const validEvidenceStatuses: DeliverableStatus[] = [DeliverableStatus.COMPLETED, DeliverableStatus.IN_PROGRESS, DeliverableStatus.REVIEW]
  for (const deliverable of deliverables) {
    if (validEvidenceStatuses.includes(deliverable.status)) {
      const numEvidence = Math.floor(Math.random() * 2) + 1
      for (let i = 0; i < numEvidence; i++) {
        await prisma.evidence.create({
          data: {
            deliverableId: deliverable.id,
            uploaderId: users[Math.floor(Math.random() * users.length)].id,
            fileName: `${deliverable.title.replace(/\s+/g, '_')}_v${i + 1}.pdf`,
            fileUrl: `/uploads/evidence/${deliverable.id}/document_v${i + 1}.pdf`,
            fileType: 'application/pdf',
            createdAt: new Date(deliverable.dueDate!.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }
        })
        evidenceCount++
      }
    }
  }

  console.log(`✅ Created ${evidenceCount} evidence files`)

  // ============================================
  // 8. CREATE COMMENTS
  // ============================================
  console.log('\n💬 Creating comments...')

  const commentTemplates = [
    'Great work on this! Just needs a small adjustment on {subject}.',
    'This looks good. Let\'s get {subject} finalized.',
    'I reviewed {subject} and it meets the requirements.',
    'Can we add {subject} to this?',
    'This is ready for review. Good job on {subject}!',
    '{subject} is looking solid. Nice implementation!',
    'We should schedule a review for {subject}.',
    'Excellent progress on {subject}. Keep it up!',
    'This {subject} implementation is clean and efficient.',
    'Let\'s discuss {subject} in the next standup.',
    'Approved! The {subject} work looks great.',
    'I have feedback on {subject} - let\'s sync up.',
    'Ready to merge once {subject} is complete.',
    'Outstanding work on {subject} quality!',
    'This {subject} enhancement will improve user experience.'
  ]

  const subjects = ['implementation', 'testing', 'documentation', 'design', 'code', 'architecture', 'approach', 'solution', 'feature', 'component']

  let commentCount = 0

  // Comments on tasks
  for (let i = 0; i < Math.min(15, Math.floor(tasks.length / 3)); i++) {
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)]
    const randomAuthor = users[Math.floor(Math.random() * users.length)]
    const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)]
    const subject = subjects[Math.floor(Math.random() * subjects.length)]

    await prisma.comment.create({
      data: {
        taskId: randomTask.id,
        authorId: randomAuthor.id,
        content: template.replace('{subject}', subject),
        createdAt: new Date(randomTask.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    })
    commentCount++
  }

  // Comments on deliverables
  for (let i = 0; i < Math.min(10, Math.floor(deliverables.length / 1.5)); i++) {
    const randomDeliverable = deliverables[Math.floor(Math.random() * deliverables.length)]
    const randomAuthor = users[Math.floor(Math.random() * users.length)]
    const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)]
    const subject = subjects[Math.floor(Math.random() * subjects.length)]

    await prisma.comment.create({
      data: {
        deliverableId: randomDeliverable.id,
        authorId: randomAuthor.id,
        content: template.replace('{subject}', subject),
        createdAt: new Date(randomDeliverable.dueDate!.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      }
    })
    commentCount++
  }

  console.log(`✅ Created ${commentCount} comments`)

  // ============================================
  // 9. CREATE MEETING LOGS
  // ============================================
  console.log('\n📋 Creating meeting logs...')

  let meetingCount = 0

  for (let i = 0; i < sprints.length; i++) {
    const sprint = sprints[i]
    // 2-3 meetings per sprint
    const numMeetings = Math.floor(Math.random() * 2) + 2

    for (let j = 0; j < numMeetings; j++) {
      const meetingDate = new Date(
        sprint.startDate.getTime() +
        (j * (sprint.endDate.getTime() - sprint.startDate.getTime()) / numMeetings)
      )

      await prisma.meetingLog.create({
        data: {
          sprintId: sprint.id,
          title: j === 0 ? `Sprint ${sprint.number} Kickoff` : `Sprint ${sprint.number} Standup ${j}`,
          date: meetingDate,
          fileUrl: `/uploads/meetings/sprint_${sprint.number}_meeting_${j + 1}.pdf`,
          uploaderId: users[Math.floor(Math.random() * users.length)].id,
          createdAt: new Date(meetingDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        }
      })
      meetingCount++
    }
  }

  // Phase kickoff meetings
  for (const phase of phases) {
    await prisma.meetingLog.create({
      data: {
        phaseId: phase.id,
        title: `${phase.name} Kickoff`,
        date: phase.startDate!,
        fileUrl: `/uploads/meetings/phase_${phase.type}_kickoff.pdf`,
        uploaderId: users[Math.floor(Math.random() * users.length)].id,
        createdAt: phase.startDate!
      }
    })
    meetingCount++
  }

  console.log(`✅ Created ${meetingCount} meeting logs`)

  // ============================================
  // 10. CREATE ACTIVITY LOGS
  // ============================================
  console.log('\n📊 Creating activity logs...')

  let activityCount = 0

  // Log task creations
  for (const task of tasks.slice(0, 30)) {
    await prisma.activityLog.create({
      data: {
        userId: users[Math.floor(Math.random() * users.length)].id,
        action: 'TASK_CREATED',
        entityType: 'Task',
        entityId: task.id,
        details: JSON.stringify({ title: task.title, status: task.status }),
        createdAt: task.createdAt
      }
    })
    activityCount++
  }

  // Log deliverable status changes
  for (const deliverable of deliverables) {
    await prisma.activityLog.create({
      data: {
        userId: users[Math.floor(Math.random() * users.length)].id,
        action: 'DELIVERABLE_STATUS_CHANGED',
        entityType: 'Deliverable',
        entityId: deliverable.id,
        details: JSON.stringify({
          title: deliverable.title,
          status: deliverable.status,
          previousStatus: DeliverableStatus.NOT_STARTED
        }),
        createdAt: deliverable.createdAt
      }
    })
    activityCount++
  }

  // Log evidence uploads
  const evidences = await prisma.evidence.findMany()
  for (const evidence of evidences.slice(0, 20)) {
    await prisma.activityLog.create({
      data: {
        userId: evidence.uploaderId,
        action: 'EVIDENCE_UPLOADED',
        entityType: 'Evidence',
        entityId: evidence.id,
        details: JSON.stringify({ fileName: evidence.fileName }),
        createdAt: evidence.createdAt
      }
    })
    activityCount++
  }

  console.log(`✅ Created ${activityCount} activity logs`)

  // ============================================
  // 11. CREATE NOTIFICATIONS
  // ============================================
  console.log('\n🔔 Creating notifications...')

  let notificationCount = 0

  for (const user of users) {
    // Each user gets 3-5 notifications
    const numNotifications = Math.floor(Math.random() * 3) + 3

    for (let i = 0; i < numNotifications; i++) {
      const notificationTypes = [
        'Task assigned to you',
        'Sprint started',
        'Deliverable approved',
        'Comment added to your task',
        'Meeting scheduled',
        'Project milestone reached',
        'Phase completed'
      ]

      const isRead = Math.random() > 0.3

      await prisma.notification.create({
        data: {
          userId: user.id,
          message: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
          link: `/sprints/${sprints[Math.floor(Math.random() * sprints.length)].id}`,
          isRead,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      })
      notificationCount++
    }
  }

  console.log(`✅ Created ${notificationCount} notifications`)

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60))
  console.log('✨ DATABASE SEEDING COMPLETE!')
  console.log('='.repeat(60))
  console.log('\n📊 Summary:')
  console.log(`   👥 Users: ${users.length}`)
  console.log(`   📦 Projects: 1`)
  console.log(`   🎯 Phases: ${phases.length}`)
  console.log(`   🔄 Sprints: ${sprints.length}`)
  console.log(`   ✏️  Tasks: ${taskCount}`)
  console.log(`   📄 Deliverables: ${deliverables.length}`)
  console.log(`   📎 Evidence Files: ${evidenceCount}`)
  console.log(`   💬 Comments: ${commentCount}`)
  console.log(`   📋 Meeting Logs: ${meetingCount}`)
  console.log(`   📊 Activity Logs: ${activityCount}`)
  console.log(`   🔔 Notifications: ${notificationCount}`)
  console.log('\n📅 Timeline:')
  console.log(`   Project Start: ${project.startDate.toDateString()}`)
  console.log(`   Project End: ${project.endDate?.toDateString()}`)
  console.log(`   Duration: 19 months`)
  console.log(`   Current Sprint: Sprint 1 (Active)`)
  console.log('\n🔐 Default Credentials:')
  users.forEach(user => {
    console.log(`   Email: ${user.email}, Password: password123, Role: ${user.role}`)
  })
  console.log('\n✅ Ready for testing!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
