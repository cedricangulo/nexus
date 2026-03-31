import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import {
  DeliverableStage,
  DeliverableStatus,
  EvidenceType,
  PhaseType,
  PrismaClient,
  Role,
  TaskStatus,
} from '../src/generated/client.js'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in your environment variables.')
}

const adapter = new PrismaPg(new Pool({ connectionString: databaseUrl }))
const prisma = new PrismaClient({ adapter })

const PROJECT_NAME = 'zian'
const PROJECT_DESCRIPTION =
  'Capstone demo dataset for planning, development, testing, and deployment workflows.'
const PROJECT_REPOSITORY_URL = 'https://github.com/nexus/zian'
const PROJECT_START = createDate(2026, 1, 1)
const PROJECT_END = createDate(2026, 8, 31)
const SEED_TEAM_LEAD_USER_ID = process.env.SEED_TEAM_LEAD_USER_ID
const SEED_MEMBER_USER_ID = process.env.SEED_MEMBER_USER_ID

function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function pick<T>(items: T[], index: number): T {
  return items[index % items.length]
}

function buildEvidenceUrl(stage: DeliverableStage, slug: string, index: number): string {
  const suffix = `${slug}-${index + 1}`

  switch (stage) {
    case DeliverableStage.PLANNING:
      return `https://docs.google.com/document/d/zian-${suffix}`
    case DeliverableStage.DESIGN:
      return `https://www.figma.com/file/zian-${suffix}`
    case DeliverableStage.DEVELOPMENT:
      return `https://github.com/nexus/zian/pull/${100 + index}`
    case DeliverableStage.TESTING:
      return `https://docs.google.com/spreadsheets/d/zian-${suffix}`
    case DeliverableStage.DEPLOYMENT:
      return `https://docs.google.com/document/d/zian-${suffix}`
    default:
      return `https://example.com/zian/${suffix}`
  }
}

function buildMeetingUrl(slug: string, index: number): string {
  return `https://docs.google.com/document/d/zian-meeting-${slug}-${index + 1}`
}

async function clearDemoData(): Promise<void> {
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.meetingLog.deleteMany()
  await prisma.evidence.deleteMany()
  await prisma.deviceToken.deleteMany()
  await prisma.taskAssignment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.deliverable.deleteMany()
  await prisma.sprint.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.project.deleteMany()
}

async function main(): Promise<void> {
  console.log('🌱 Seeding Zian demo data...')
  console.log('🧹 Clearing all non-user data first...')

  await clearDemoData()

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'asc' }, { email: 'asc' }],
  })

  if (users.length === 0) {
    throw new Error('No users found. Seed expects existing users to remain in place.')
  }

  const teamLead =
    (SEED_TEAM_LEAD_USER_ID && users.find((user) => user.id === SEED_TEAM_LEAD_USER_ID)) ||
    users.find((user) => user.role === Role.TEAM_LEAD) ||
    users[0]
  const member =
    (SEED_MEMBER_USER_ID && users.find((user) => user.id === SEED_MEMBER_USER_ID)) ||
    users.find((user) => user.id !== teamLead.id) ||
    teamLead
  const adviser = users.find((user) => user.role === Role.ADVISER) ?? member

  console.log(`👥 Using ${users.length} existing users`)

  const project = await prisma.project.create({
    data: {
      name: PROJECT_NAME,
      description: PROJECT_DESCRIPTION,
      repositoryUrl: PROJECT_REPOSITORY_URL,
      startDate: PROJECT_START,
      endDate: PROJECT_END,
    },
  })

  const [planningPhase, scrumPhase, fallPhase] = await Promise.all([
    prisma.phase.create({
      data: {
        projectId: project.id,
        type: PhaseType.WATERFALL,
        name: 'Planning & Design',
        description:
          'Stakeholder interviews, requirements mapping, wireframes, and architecture sign-off.',
        startDate: createDate(2026, 1, 1),
        endDate: createDate(2026, 2, 14),
      },
    }),
    prisma.phase.create({
      data: {
        projectId: project.id,
        type: PhaseType.SCRUM,
        name: 'Development & Iteration',
        description:
          'Ten two-week sprints for product build-out, reviews, and incremental delivery.',
        startDate: createDate(2026, 2, 15),
        endDate: createDate(2026, 7, 5),
      },
    }),
    prisma.phase.create({
      data: {
        projectId: project.id,
        type: PhaseType.FALL,
        name: 'Testing, Deployment & Closure',
        description:
          'Regression testing, UAT, release preparation, handoff, and final documentation.',
        startDate: createDate(2026, 7, 6),
        endDate: createDate(2026, 8, 31),
      },
    }),
  ])

  const deliverableSeed = [
    {
      phaseId: planningPhase.id,
      title: 'Project Charter & Scope Statement',
      description: 'Signed scope, success metrics, stakeholders, and constraints.',
      stage: DeliverableStage.PLANNING,
      status: DeliverableStatus.COMPLETED,
      dueDate: createDate(2026, 1, 8),
    },
    {
      phaseId: planningPhase.id,
      title: 'Stakeholder Requirements Matrix',
      description: 'Functional requirements mapped to stakeholders and acceptance criteria.',
      stage: DeliverableStage.PLANNING,
      status: DeliverableStatus.COMPLETED,
      dueDate: createDate(2026, 1, 20),
    },
    {
      phaseId: planningPhase.id,
      title: 'Wireframes & Information Architecture',
      description: 'Navigation flows, low-fidelity wireframes, and page hierarchy.',
      stage: DeliverableStage.DESIGN,
      status: DeliverableStatus.REVIEW,
      dueDate: createDate(2026, 2, 2),
    },
    {
      phaseId: planningPhase.id,
      title: 'Visual Design System',
      description: 'Typography, color system, components, and UI tokens.',
      stage: DeliverableStage.DESIGN,
      status: DeliverableStatus.IN_PROGRESS,
      dueDate: createDate(2026, 2, 10),
    },
    {
      phaseId: planningPhase.id,
      title: 'Technical Design Review',
      description: 'Architecture approval, risk log, and implementation approach.',
      stage: DeliverableStage.DESIGN,
      status: DeliverableStatus.NOT_STARTED,
      dueDate: createDate(2026, 2, 14),
    },
    {
      phaseId: scrumPhase.id,
      title: 'Sprint 1 Foundation Report',
      description: 'Environment setup, data model baseline, and initial scaffolding.',
      stage: DeliverableStage.DEVELOPMENT,
      status: DeliverableStatus.COMPLETED,
      dueDate: createDate(2026, 3, 1),
    },
    {
      phaseId: scrumPhase.id,
      title: 'Authentication & Roles Module',
      description: 'Login flow, role gating, and protected route handling.',
      stage: DeliverableStage.DEVELOPMENT,
      status: DeliverableStatus.COMPLETED,
      dueDate: createDate(2026, 3, 15),
    },
    {
      phaseId: scrumPhase.id,
      title: 'Core Dashboard MVP',
      description: 'Project summary, task metrics, notifications, and activity feed.',
      stage: DeliverableStage.DEVELOPMENT,
      status: DeliverableStatus.COMPLETED,
      dueDate: createDate(2026, 4, 12),
    },
    {
      phaseId: scrumPhase.id,
      title: 'Task Board & Collaboration Flow',
      description: 'Sprint board, comments, and assignment interactions.',
      stage: DeliverableStage.DEVELOPMENT,
      status: DeliverableStatus.REVIEW,
      dueDate: createDate(2026, 5, 10),
    },
    {
      phaseId: scrumPhase.id,
      title: 'Reporting & Analytics Package',
      description: 'Burndown charts, progress summaries, and export-ready metrics.',
      stage: DeliverableStage.DEVELOPMENT,
      status: DeliverableStatus.IN_PROGRESS,
      dueDate: createDate(2026, 6, 7),
    },
    {
      phaseId: scrumPhase.id,
      title: 'Feature Hardening Checklist',
      description: 'Performance, accessibility, and final bug cleanup items.',
      stage: DeliverableStage.DEVELOPMENT,
      status: DeliverableStatus.NOT_STARTED,
      dueDate: createDate(2026, 7, 5),
    },
    {
      phaseId: fallPhase.id,
      title: 'QA Test Plan & Regression Results',
      description: 'Test matrix, execution notes, and defect triage summary.',
      stage: DeliverableStage.TESTING,
      status: DeliverableStatus.COMPLETED,
      dueDate: createDate(2026, 7, 20),
    },
    {
      phaseId: fallPhase.id,
      title: 'UAT Feedback Log',
      description: 'Stakeholder walkthrough notes, issues, and approvals.',
      stage: DeliverableStage.TESTING,
      status: DeliverableStatus.IN_PROGRESS,
      dueDate: createDate(2026, 8, 5),
    },
    {
      phaseId: fallPhase.id,
      title: 'Deployment Runbook',
      description: 'Release steps, rollback plan, and environment verification checklist.',
      stage: DeliverableStage.DEPLOYMENT,
      status: DeliverableStatus.REVIEW,
      dueDate: createDate(2026, 8, 20),
    },
    {
      phaseId: fallPhase.id,
      title: 'Final Report & Handoff Deck',
      description: 'Outcome summary, lessons learned, and final presentation material.',
      stage: DeliverableStage.DEPLOYMENT,
      status: DeliverableStatus.NOT_STARTED,
      dueDate: createDate(2026, 8, 31),
    },
  ]

  const deliverables = await Promise.all(
    deliverableSeed.map((deliverable) =>
      prisma.deliverable.create({
        data: deliverable,
      }),
    ),
  )

  const sprintSeed = [
    {
      number: 1,
      goal: 'Foundation setup and repo scaffolding',
      startDate: createDate(2026, 2, 15),
      endDate: createDate(2026, 2, 28),
    },
    {
      number: 2,
      goal: 'Requirements alignment and access control',
      startDate: createDate(2026, 3, 1),
      endDate: createDate(2026, 3, 14),
    },
    {
      number: 3,
      goal: 'Dashboard shell and project visibility',
      startDate: createDate(2026, 3, 15),
      endDate: createDate(2026, 3, 28),
    },
    {
      number: 4,
      goal: 'Task management and collaboration flows',
      startDate: createDate(2026, 3, 29),
      endDate: createDate(2026, 4, 11),
    },
    {
      number: 5,
      goal: 'Deliverables review and evidence tracking',
      startDate: createDate(2026, 4, 12),
      endDate: createDate(2026, 4, 25),
    },
    {
      number: 6,
      goal: 'Reporting and metrics delivery',
      startDate: createDate(2026, 4, 26),
      endDate: createDate(2026, 5, 9),
    },
    {
      number: 7,
      goal: 'Testing, fixes, and accessibility cleanup',
      startDate: createDate(2026, 5, 10),
      endDate: createDate(2026, 5, 23),
    },
    {
      number: 8,
      goal: 'Performance hardening and security review',
      startDate: createDate(2026, 5, 24),
      endDate: createDate(2026, 6, 6),
    },
    {
      number: 9,
      goal: 'Release preparation and stakeholder feedback',
      startDate: createDate(2026, 6, 7),
      endDate: createDate(2026, 6, 20),
    },
    {
      number: 10,
      goal: 'Final polish and handoff',
      startDate: createDate(2026, 6, 21),
      endDate: createDate(2026, 7, 5),
    },
  ]

  const sprints = await Promise.all(
    sprintSeed.map((sprint) =>
      prisma.sprint.create({
        data: {
          projectId: project.id,
          ...sprint,
        },
      }),
    ),
  )

  const sprintByNumber = new Map(sprints.map((sprint) => [sprint.number, sprint]))

  const phaseTaskSeed = [
    {
      phaseId: planningPhase.id,
      title: 'Draft project charter and scope notes',
      description: 'Prepare the project framing document for adviser review.',
      status: TaskStatus.DONE,
      createdAt: createDate(2026, 1, 3),
    },
    {
      phaseId: planningPhase.id,
      title: 'Run stakeholder interview summaries',
      description: 'Capture needs, risks, and priorities from all project stakeholders.',
      status: TaskStatus.DONE,
      createdAt: createDate(2026, 1, 10),
    },
    {
      phaseId: planningPhase.id,
      title: 'Review wireframes with adviser',
      description: 'Collect feedback on navigation, hierarchy, and visual direction.',
      status: TaskStatus.IN_PROGRESS,
      createdAt: createDate(2026, 1, 24),
    },
    {
      phaseId: planningPhase.id,
      title: 'Finalize architecture sign-off checklist',
      description: 'Confirm non-functional requirements and implementation constraints.',
      status: TaskStatus.TODO,
      createdAt: createDate(2026, 2, 8),
    },
    {
      phaseId: fallPhase.id,
      title: 'Schedule UAT walkthrough session',
      description: 'Coordinate the final stakeholder review and defect triage meeting.',
      status: TaskStatus.IN_PROGRESS,
      createdAt: createDate(2026, 7, 10),
    },
    {
      phaseId: fallPhase.id,
      title: 'Prepare final report and defense deck',
      description: 'Assemble results, screenshots, charts, and presentation notes.',
      status: TaskStatus.TODO,
      createdAt: createDate(2026, 8, 15),
    },
    {
      phaseId: fallPhase.id,
      title: 'Collect adviser sign-off for closure',
      description: 'Track approvals needed to close the capstone project.',
      status: TaskStatus.BLOCKED,
      createdAt: createDate(2026, 8, 24),
    },
    {
      phaseId: fallPhase.id,
      title: 'Archive documentation bundle',
      description: 'Store release notes, reports, and handoff documents.',
      status: TaskStatus.TODO,
      createdAt: createDate(2026, 8, 28),
    },
  ]

  const sprintTaskSeed: Array<{
    sprintNumber: number
    title: string
    description: string
    status: TaskStatus
  }> = [
    { sprintNumber: 1, title: 'Set up monorepo and environment config', description: 'Create the baseline repo, environment files, and tooling.', status: TaskStatus.DONE },
    { sprintNumber: 1, title: 'Design database schema baseline', description: 'Confirm the initial Prisma models and relations.', status: TaskStatus.DONE },
    { sprintNumber: 1, title: 'Bootstrap authentication service', description: 'Lay down the login and session service skeleton.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 1, title: 'Configure linting and CI workflow', description: 'Add checks for code style, formatting, and type safety.', status: TaskStatus.TODO },
    { sprintNumber: 1, title: 'Build base application shell', description: 'Create the first shared layout and navigation frame.', status: TaskStatus.TODO },
    { sprintNumber: 1, title: 'Write seed utility helpers', description: 'Prepare reusable helpers for demo data generation.', status: TaskStatus.BLOCKED },
    { sprintNumber: 2, title: 'Finalize requirements matrix', description: 'Map stakeholders to user stories and acceptance criteria.', status: TaskStatus.DONE },
    { sprintNumber: 2, title: 'Define role-based access rules', description: 'Document permissions for members, leads, and advisers.', status: TaskStatus.DONE },
    { sprintNumber: 2, title: 'Review architecture diagrams', description: 'Validate service boundaries and data flow.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 2, title: 'Implement sign in and sign up endpoints', description: 'Add auth endpoints and secure credential handling.', status: TaskStatus.TODO },
    { sprintNumber: 2, title: 'Create navigation and layout primitives', description: 'Build shared UI pieces used throughout the app.', status: TaskStatus.TODO },
    { sprintNumber: 2, title: 'Prepare sprint ceremony notes', description: 'Track agenda, agenda outcomes, and blockers.', status: TaskStatus.TODO },
    { sprintNumber: 3, title: 'Implement session handling', description: 'Persist sessions and handle protected route checks.', status: TaskStatus.DONE },
    { sprintNumber: 3, title: 'Add profile management page', description: 'Let users update names and roles in the UI.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 3, title: 'Create project overview cards', description: 'Show quick status summaries for deliverables and tasks.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 3, title: 'Wire notification service', description: 'Prepare in-app notification delivery plumbing.', status: TaskStatus.TODO },
    { sprintNumber: 3, title: 'Build task data models', description: 'Connect task entities to the backend and frontend.', status: TaskStatus.DONE },
    { sprintNumber: 3, title: 'Add validation middleware', description: 'Enforce request validation and error reporting.', status: TaskStatus.BLOCKED },
    { sprintNumber: 4, title: 'Create sprint board view', description: 'Render a Kanban-style board for active work.', status: TaskStatus.DONE },
    { sprintNumber: 4, title: 'Add task create drawer', description: 'Build a drawer for adding and editing tasks.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 4, title: 'Implement drag and drop', description: 'Move tasks between columns and statuses.', status: TaskStatus.TODO },
    { sprintNumber: 4, title: 'Add assignee selector', description: 'Choose one or more collaborators per task.', status: TaskStatus.TODO },
    { sprintNumber: 4, title: 'Create comment timeline', description: 'Show task discussion history and reviewer notes.', status: TaskStatus.TODO },
    { sprintNumber: 4, title: 'Connect task status updates', description: 'Persist task status transitions to the backend.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 5, title: 'Add deliverable dashboard', description: 'Show deliverable status and due dates.', status: TaskStatus.DONE },
    { sprintNumber: 5, title: 'Create evidence link registry', description: 'Track supporting evidence as linked artifacts only.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 5, title: 'Implement review workflow', description: 'Support lead and adviser review comments.', status: TaskStatus.BLOCKED },
    { sprintNumber: 5, title: 'Add deliverable comments', description: 'Allow feedback on each deliverable record.', status: TaskStatus.TODO },
    { sprintNumber: 5, title: 'Surface approval badges', description: 'Show review states clearly in the UI.', status: TaskStatus.TODO },
    { sprintNumber: 5, title: 'Sync phase deliverables', description: 'Link deliverables to the appropriate phase.', status: TaskStatus.DONE },
    { sprintNumber: 6, title: 'Build analytics charts', description: 'Show sprint and project metrics visually.', status: TaskStatus.DONE },
    { sprintNumber: 6, title: 'Create burndown metric query', description: 'Prepare the data needed for trend charts.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 6, title: 'Add export summary action', description: 'Support quick report exports for the adviser.', status: TaskStatus.TODO },
    { sprintNumber: 6, title: 'Optimize task filters', description: 'Improve filtering and list responsiveness.', status: TaskStatus.DONE },
    { sprintNumber: 6, title: 'Implement admin activity feed', description: 'Show important project actions in chronological order.', status: TaskStatus.TODO },
    { sprintNumber: 6, title: 'Review performance bottlenecks', description: 'Check query counts, render weight, and load times.', status: TaskStatus.TODO },
    { sprintNumber: 7, title: 'Run regression test suite', description: 'Verify core flows after the latest features.', status: TaskStatus.DONE },
    { sprintNumber: 7, title: 'Fix mobile layout issues', description: 'Tune layouts for smaller screens.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 7, title: 'Complete accessibility audit', description: 'Check labels, contrast, and keyboard interactions.', status: TaskStatus.TODO },
    { sprintNumber: 7, title: 'Document QA findings', description: 'Summarize defects, risk areas, and next actions.', status: TaskStatus.DONE },
    { sprintNumber: 7, title: 'Triage user feedback', description: 'Review comments and note blockers from testers.', status: TaskStatus.BLOCKED },
    { sprintNumber: 7, title: 'Stabilize notification flow', description: 'Ensure alerts appear consistently across the app.', status: TaskStatus.TODO },
    { sprintNumber: 8, title: 'Harden permissions checks', description: 'Close gaps in role-based access and page guards.', status: TaskStatus.DONE },
    { sprintNumber: 8, title: 'Add audit log views', description: 'Expose a readable history of important actions.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 8, title: 'Implement notification preferences', description: 'Let users tune the alerts they receive.', status: TaskStatus.TODO },
    { sprintNumber: 8, title: 'Review deployment settings', description: 'Validate env vars, secrets, and rollout settings.', status: TaskStatus.DONE },
    { sprintNumber: 8, title: 'Patch edge-case failures', description: 'Fix remaining bugs found during testing.', status: TaskStatus.TODO },
    { sprintNumber: 8, title: 'Finalize code cleanup', description: 'Remove dead code and polish final implementation details.', status: TaskStatus.DONE },
    { sprintNumber: 9, title: 'Prepare deployment runbook', description: 'Document the release flow and rollback steps.', status: TaskStatus.DONE },
    { sprintNumber: 9, title: 'Confirm backup strategy', description: 'Check backup timing and recovery procedures.', status: TaskStatus.DONE },
    { sprintNumber: 9, title: 'Resolve release blockers', description: 'Close the last blocking issues before delivery.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 9, title: 'Review stakeholder feedback', description: 'Incorporate adviser and team feedback.', status: TaskStatus.TODO },
    { sprintNumber: 9, title: 'Update release notes', description: 'Summarize what changed in the latest build.', status: TaskStatus.TODO },
    { sprintNumber: 9, title: 'Schedule final demo rehearsal', description: 'Plan the demo and speaking points.', status: TaskStatus.TODO },
    { sprintNumber: 10, title: 'Finish final report draft', description: 'Write the last project report sections.', status: TaskStatus.DONE },
    { sprintNumber: 10, title: 'Complete defense deck', description: 'Prepare slides and presentation visuals.', status: TaskStatus.IN_PROGRESS },
    { sprintNumber: 10, title: 'Validate handoff checklist', description: 'Check deliverables and closure items.', status: TaskStatus.TODO },
    { sprintNumber: 10, title: 'Close remaining bugs', description: 'Make final fixes before the handoff.', status: TaskStatus.DONE },
    { sprintNumber: 10, title: 'Archive project artifacts', description: 'Store release notes, reports, and support files.', status: TaskStatus.TODO },
    { sprintNumber: 10, title: 'Obtain adviser sign-off', description: 'Gather final approval for project closure.', status: TaskStatus.TODO },
  ]

  const createdTasks: Array<{
    id: string
    title: string
    status: TaskStatus
    createdAt: Date
    phaseId: string
    sprintId: string | null
  }> = []

  for (const [index, task] of phaseTaskSeed.entries()) {
    const created = await prisma.task.create({
      data: {
        phaseId: task.phaseId,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        assignments: {
          create: [
            {
              userId: index % 2 === 0 ? teamLead.id : member.id,
            },
          ],
        },
      },
    })

    createdTasks.push({
      id: created.id,
      title: created.title,
      status: task.status,
      createdAt: task.createdAt,
      phaseId: task.phaseId,
      sprintId: null,
    })
  }

  for (const task of sprintTaskSeed) {
    const sprint = sprintByNumber.get(task.sprintNumber)

    if (!sprint) {
      throw new Error(`Missing sprint ${task.sprintNumber}`)
    }

    const taskIndex = createdTasks.length
    const createdAt = addDays(sprint.startDate, taskIndex % 10)
    const primaryAssignee = taskIndex % 2 === 0 ? member : teamLead
    const secondaryAssignee = taskIndex % 3 === 0 && member.id !== teamLead.id ? teamLead : null

    const created = await prisma.task.create({
      data: {
        phaseId: scrumPhase.id,
        sprintId: sprint.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt,
        assignments: {
          create: [
            { userId: primaryAssignee.id },
            ...(secondaryAssignee ? [{ userId: secondaryAssignee.id }] : []),
          ],
        },
      },
    })

    createdTasks.push({
      id: created.id,
      title: created.title,
      status: task.status,
      createdAt,
      phaseId: scrumPhase.id,
      sprintId: sprint.id,
    })
  }

  const evidenceSeed: Array<{
    deliverableId: string
    uploaderId: string
    type: EvidenceType
    fileName: string | null
    fileUrl: string
    createdAt: Date
  }> = []

  for (const [index, deliverable] of deliverables.entries()) {
    if (deliverable.status === DeliverableStatus.NOT_STARTED) {
      continue
    }

    const uploader = index % 2 === 0 ? teamLead : member
    const slug = slugify(deliverable.title)
    const evidenceCount = deliverable.status === DeliverableStatus.COMPLETED ? 2 : 1

    for (let evidenceIndex = 0; evidenceIndex < evidenceCount; evidenceIndex += 1) {
      evidenceSeed.push({
        deliverableId: deliverable.id,
        uploaderId: uploader.id,
        type: EvidenceType.LINK,
        fileName: `${deliverable.title} link ${evidenceIndex + 1}`,
        fileUrl: buildEvidenceUrl(deliverable.stage, slug, evidenceIndex),
        createdAt: addDays(deliverable.dueDate ?? PROJECT_START, -7 + evidenceIndex),
      })
    }
  }

  const evidences = await Promise.all(
    evidenceSeed.map((evidence) => prisma.evidence.create({ data: evidence })),
  )

  const meetingSeed: Array<{
    title: string
    date: Date
    fileUrl: string
    uploaderId: string
    sprintId: string | null
    phaseId: string | null
  }> = []

  for (const sprint of sprints) {
    const sprintSlug = slugify(`sprint-${sprint.number}`)

    meetingSeed.push({
      title: `Sprint ${sprint.number} Kickoff`,
      date: sprint.startDate,
      fileUrl: buildMeetingUrl(`${sprintSlug}-kickoff`, 0),
      uploaderId: teamLead.id,
      sprintId: sprint.id,
      phaseId: null,
    })

    meetingSeed.push({
      title: `Sprint ${sprint.number} Standup Review`,
      date: addDays(sprint.startDate, 6),
      fileUrl: buildMeetingUrl(`${sprintSlug}-review`, 1),
      uploaderId: member.id,
      sprintId: sprint.id,
      phaseId: null,
    })
  }

  meetingSeed.push(
    {
      title: 'Planning Phase Kickoff',
      date: planningPhase.startDate ?? PROJECT_START,
      fileUrl: buildMeetingUrl('planning-kickoff', 0),
      uploaderId: teamLead.id,
      sprintId: null,
      phaseId: planningPhase.id,
    },
    {
      title: 'Development Phase Kickoff',
      date: scrumPhase.startDate ?? PROJECT_START,
      fileUrl: buildMeetingUrl('development-kickoff', 1),
      uploaderId: adviser.id,
      sprintId: null,
      phaseId: scrumPhase.id,
    },
    {
      title: 'Closure Phase Kickoff',
      date: fallPhase.startDate ?? PROJECT_END,
      fileUrl: buildMeetingUrl('closure-kickoff', 2),
      uploaderId: teamLead.id,
      sprintId: null,
      phaseId: fallPhase.id,
    },
  )

  const meetings = await Promise.all(
    meetingSeed.map((meeting) => prisma.meetingLog.create({ data: meeting })),
  )

  const deviceTokenSeed = users.map((user, index) => ({
    userId: user.id,
    token: `zian-${slugify(user.email)}-${index + 1}`,
    platform: pick(['web', 'android', 'ios'], index),
  }))

  await prisma.deviceToken.createMany({
    data: deviceTokenSeed,
    skipDuplicates: true,
  })

  const commentsSeed: Array<{
    content: string
    authorId: string
    taskId: string | null
    deliverableId: string | null
    createdAt: Date
  }> = []

  const blockedTaskNotes = [
    'Blocked until the API contract is finalized.',
    'Waiting on adviser approval before continuing.',
    'Needs the final requirements matrix before implementation.',
    'Held up by a missing design decision from review.',
    'Paused until test feedback is merged into the backlog.',
  ]

  const blockedTasks = createdTasks.filter((task) => task.status === TaskStatus.BLOCKED)
  for (const [index, task] of blockedTasks.entries()) {
    commentsSeed.push({
      content: blockedTaskNotes[index % blockedTaskNotes.length],
      authorId: adviser.id,
      taskId: task.id,
      deliverableId: null,
      createdAt: addDays(task.createdAt, 1),
    })
  }

  for (const [index, deliverable] of deliverables.entries()) {
    if (deliverable.status === DeliverableStatus.NOT_STARTED) {
      continue
    }

    const author = index % 2 === 0 ? teamLead : member
    const note =
      deliverable.status === DeliverableStatus.REVIEW
        ? 'Reviewed and ready for the next revision pass.'
        : deliverable.status === DeliverableStatus.IN_PROGRESS
          ? 'In progress. Keep the updates flowing.'
          : 'Looks complete and aligns with the current milestone.'

    commentsSeed.push({
      content: `${deliverable.title}: ${note}`,
      authorId: author.id,
      taskId: null,
      deliverableId: deliverable.id,
      createdAt: addDays(deliverable.dueDate ?? PROJECT_START, -3),
    })
  }

  for (const [index, task] of createdTasks.slice(0, 12).entries()) {
    commentsSeed.push({
      content:
        task.status === TaskStatus.DONE
          ? 'Great work. This is ready for the next milestone.'
          : 'Good progress. Please keep this moving.',
      authorId: index % 2 === 0 ? member.id : teamLead.id,
      taskId: task.id,
      deliverableId: null,
      createdAt: addDays(task.createdAt, 2),
    })
  }

  await Promise.all(commentsSeed.map((comment) => prisma.comment.create({ data: comment })))

  const activitySeed: Array<{
    userId: string
    action: string
    entityType: string
    entityId: string
    details: string | null
    createdAt: Date
  }> = []

  activitySeed.push({
    userId: teamLead.id,
    action: 'PROJECT_CREATED',
    entityType: 'Project',
    entityId: project.id,
    details: JSON.stringify({ name: project.name }),
    createdAt: PROJECT_START,
  })

  for (const phase of [planningPhase, scrumPhase, fallPhase]) {
    activitySeed.push({
      userId: teamLead.id,
      action: 'PHASE_CREATED',
      entityType: 'Phase',
      entityId: phase.id,
      details: JSON.stringify({ name: phase.name, type: phase.type }),
      createdAt: phase.startDate ?? PROJECT_START,
    })
  }

  for (const task of createdTasks) {
    activitySeed.push({
      userId: teamLead.id,
      action: task.status === TaskStatus.BLOCKED ? 'TASK_BLOCKED' : 'TASK_CREATED',
      entityType: 'Task',
      entityId: task.id,
      details: JSON.stringify({ title: task.title, status: task.status }),
      createdAt: task.createdAt,
    })
  }

  for (const deliverable of deliverables) {
    activitySeed.push({
      userId: member.id,
      action: 'DELIVERABLE_STATUS_CHANGED',
      entityType: 'Deliverable',
      entityId: deliverable.id,
      details: JSON.stringify({ title: deliverable.title, status: deliverable.status }),
      createdAt: deliverable.dueDate ?? PROJECT_START,
    })
  }

  for (const evidence of evidences) {
    activitySeed.push({
      userId: evidence.uploaderId,
      action: 'EVIDENCE_LINKED',
      entityType: 'Evidence',
      entityId: evidence.id,
      details: JSON.stringify({ fileUrl: evidence.fileUrl }),
      createdAt: evidence.createdAt,
    })
  }

  for (const meeting of meetings) {
    activitySeed.push({
      userId: meeting.uploaderId,
      action: 'MEETING_LOGGED',
      entityType: 'MeetingLog',
      entityId: meeting.id,
      details: JSON.stringify({ title: meeting.title }),
      createdAt: meeting.date,
    })
  }

  await Promise.all(activitySeed.map((entry) => prisma.activityLog.create({ data: entry })))

  const notificationSeed: Array<{
    userId: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: Date
  }> = []

  for (const [index, user] of users.entries()) {
    const sprint = pick(sprints, index)
    const deliverable = pick(deliverables, index)

    notificationSeed.push(
      {
        userId: user.id,
        message: `Sprint ${sprint.number} is ready for review.`,
        link: `/sprints/${sprint.id}`,
        isRead: index % 2 === 0,
        createdAt: addDays(sprint.startDate, 1),
      },
      {
        userId: user.id,
        message: `${deliverable.title} moved to ${deliverable.status.toLowerCase()}.`,
        link: `/deliverables/${deliverable.id}`,
        isRead: index % 3 === 0,
        createdAt: addDays(deliverable.dueDate ?? PROJECT_START, -1),
      },
      {
        userId: user.id,
        message: 'A new project comment was added.',
        link: '/notifications',
        isRead: false,
        createdAt: addDays(PROJECT_START, index + 2),
      },
      {
        userId: user.id,
        message: 'Final handoff checklist updated.',
        link: '/projects/zian',
        isRead: index % 4 === 0,
        createdAt: addDays(PROJECT_END, -7),
      },
    )
  }

  await Promise.all(notificationSeed.map((notification) => prisma.notification.create({ data: notification })))

  console.log('✅ Seed complete')
  console.log(`📦 Project: ${project.name}`)
  console.log(`👥 Users kept: ${users.length}`)
  console.log(`🎯 Phases: 3`)
  console.log(`🔄 Sprints: ${sprints.length}`)
  console.log(`✏️ Tasks: ${createdTasks.length}`)
  console.log(`📄 Deliverables: ${deliverables.length}`)
  console.log(`🔗 Evidence links: ${evidences.length}`)
  console.log(`💬 Comments: ${commentsSeed.length}`)
  console.log(`📋 Meeting logs: ${meetings.length}`)
  console.log(`📊 Activity logs: ${activitySeed.length}`)
  console.log(`🔔 Notifications: ${notificationSeed.length}`)
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
