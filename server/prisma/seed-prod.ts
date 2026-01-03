import 'dotenv/config'
import { PrismaClient, Role, PhaseType, DeliverableStatus, DeliverableStage } from '../src/generated/client.js'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in your environment variables.")
}

// 2. Explicitly pass the datasource URL to the constructor
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})


// Configuration - Customize these for your deployment
const TEAM_LEAD_EMAIL = process.env.SEED_TEAM_LEAD_EMAIL || 'teamlead@nexus.app'
const TEAM_LEAD_NAME = process.env.SEED_TEAM_LEAD_NAME || 'Team Lead'
const TEAM_LEAD_PASSWORD = process.env.SEED_TEAM_LEAD_PASSWORD || 'changeme123'

const PROJECT_NAME = process.env.SEED_PROJECT_NAME || 'Capstone Project'
const PROJECT_DESCRIPTION = process.env.SEED_PROJECT_DESCRIPTION || 'Our capstone project'
const PROJECT_REPO_URL = process.env.SEED_PROJECT_REPO_URL || ''

async function main() {
    console.log('🌱 Starting PRODUCTION database seeding...')
    console.log('⚠️  This script is idempotent - it will not overwrite existing data.\n')

    // ============================================
    // 1. CREATE TEAM LEAD (Idempotent)
    // ============================================
    console.log('👤 Setting up Team Lead...')

    const existingUser = await prisma.user.findUnique({
        where: { email: TEAM_LEAD_EMAIL }
    })

    if (existingUser) {
        console.log(`   ✓ Team Lead already exists: ${existingUser.email}`)
    } else {
        const hashedPassword = await bcrypt.hash(TEAM_LEAD_PASSWORD, 10)

        const teamLead = await prisma.user.create({
            data: {
                email: TEAM_LEAD_EMAIL,
                name: TEAM_LEAD_NAME,
                passwordHash: hashedPassword,
                role: Role.TEAM_LEAD
            }
        })

        console.log(`   ✓ Team Lead created: ${teamLead.email}`)
        console.log(`   ⚠️  IMPORTANT: Change the password after first login!`)
    }

    // ============================================
    // 2. CREATE PROJECT (Singleton Check)
    // ============================================
    console.log('\n📦 Setting up Project...')

    const existingProject = await prisma.project.findFirst()

    if (existingProject) {
        console.log(`   ✓ Project already exists: "${existingProject.name}"`)
        console.log('\n✅ Production seed complete (no changes needed).')
        return
    }

    // Create project with WSF phases and default deliverables
    const project = await prisma.project.create({
        data: {
            name: PROJECT_NAME,
            description: PROJECT_DESCRIPTION,
            repositoryUrl: PROJECT_REPO_URL || undefined,
            startDate: new Date(),
            phases: {
                create: [
                    {
                        type: PhaseType.WATERFALL,
                        name: 'Planning & Design',
                        description: 'Requirements gathering, stakeholder analysis, system architecture design, and UI/UX mockups',
                        deliverables: {
                            create: [
                                {
                                    title: 'Project Proposal',
                                    description: 'Project scope, objectives, and stakeholder requirements',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.PLANNING
                                },
                                {
                                    title: 'Requirements Specification',
                                    description: 'Functional and non-functional requirements document',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.PLANNING
                                },
                                {
                                    title: 'System Architecture Design',
                                    description: 'High-level system architecture and technical design',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.DESIGN
                                },
                                {
                                    title: 'UI/UX Mockups',
                                    description: 'Wireframes and high-fidelity mockups for user interfaces',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.DESIGN
                                }
                            ]
                        }
                    },
                    {
                        type: PhaseType.SCRUM,
                        name: 'Development & Iteration',
                        description: 'Sprint-based development with iterative delivery and continuous integration',
                        deliverables: {
                            create: [
                                {
                                    title: 'Sprint Code Deliverables',
                                    description: 'Working code from development sprints',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.DEVELOPMENT
                                },
                                {
                                    title: 'API Documentation',
                                    description: 'OpenAPI/Swagger documentation for backend APIs',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.DEVELOPMENT
                                }
                            ]
                        }
                    },
                    {
                        type: PhaseType.FALL,
                        name: 'Testing, Deployment & Closure',
                        description: 'QA testing, user acceptance testing, production deployment, and project closure',
                        deliverables: {
                            create: [
                                {
                                    title: 'Test Plan & Results',
                                    description: 'QA testing procedures and test results documentation',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.TESTING
                                },
                                {
                                    title: 'User Manual',
                                    description: 'End-user guide and documentation',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.DEPLOYMENT
                                },
                                {
                                    title: 'Final Report',
                                    description: 'Project conclusion, lessons learned, and final metrics',
                                    status: DeliverableStatus.NOT_STARTED,
                                    stage: DeliverableStage.DEPLOYMENT
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    console.log(`   ✓ Project created: "${project.name}"`)
    console.log('   ✓ Created 3 WSF phases with default deliverables')

    console.log('\n✅ Production seed complete!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        // Important: Close the connection
        await prisma.$disconnect()
    })