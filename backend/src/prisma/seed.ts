import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create subscription plans
  const premiumPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Premium Pitcher',
      priceMonthly: 29.00,
      reducedFeePercentage: 5.00, // 5% instead of 10%
      features: [
        'Reduced platform fees (5% instead of 10%)',
        'Priority booking requests',
        'Advanced analytics',
        'Direct messaging with decision makers'
      ],
      isActive: true
    }
  })

  // Create sample admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pitchline.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true
    }
  })

  // Create sample decision maker
  const dmPasswordHash = await bcrypt.hash('password123', 12)
  const decisionMaker = await prisma.user.create({
    data: {
      email: 'john.doe@techcorp.com',
      passwordHash: dmPasswordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: 'decision_maker',
      phone: '+1-555-0123',
      timezone: 'America/Los_Angeles',
      isVerified: true
    }
  })

  // Create decision maker profile
  await prisma.decisionMakerProfile.create({
    data: {
      userId: decisionMaker.id,
      title: 'VP of Product',
      company: 'TechCorp',
      industry: 'Technology',
      bio: '15+ years in product management at scale. Expert in B2B SaaS, product strategy, and go-to-market planning. Previously led product teams at major tech companies including Google and Microsoft.',
      expertiseAreas: ['Product Strategy', 'B2B SaaS', 'Go-to-Market', 'Team Leadership', 'Data Analytics'],
      yearsExperience: 15,
      hourlyRate: 100.00,
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      isActive: true
    }
  })

  // Create availability slots for decision maker (Mon-Fri, 9 AM - 5 PM PST)
  const availabilitySlots = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
  ]

  for (const slot of availabilitySlots) {
    await prisma.availabilitySlot.create({
      data: {
        decisionMakerId: decisionMaker.id,
        ...slot,
        isActive: true
      }
    })
  }

  // Create sample pitcher
  const pitcherPasswordHash = await bcrypt.hash('password123', 12)
  const pitcher = await prisma.user.create({
    data: {
      email: 'jane.smith@startup.com',
      passwordHash: pitcherPasswordHash,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'pitcher',
      phone: '+1-555-0456',
      timezone: 'America/New_York',
      isVerified: true
    }
  })

  // Create another decision maker
  const dm2PasswordHash = await bcrypt.hash('password123', 12)
  const decisionMaker2 = await prisma.user.create({
    data: {
      email: 'sarah.wilson@fintech.com',
      passwordHash: dm2PasswordHash,
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'decision_maker',
      phone: '+1-555-0789',
      timezone: 'America/New_York',
      isVerified: true
    }
  })

  await prisma.decisionMakerProfile.create({
    data: {
      userId: decisionMaker2.id,
      title: 'Chief Marketing Officer',
      company: 'FinTech Innovations',
      industry: 'Financial Services',
      bio: '12+ years driving growth at scale. Expert in digital marketing, customer acquisition, and brand strategy. Led marketing teams that achieved 10x growth.',
      expertiseAreas: ['Digital Marketing', 'Customer Acquisition', 'Brand Strategy', 'Growth Hacking', 'Performance Marketing'],
      yearsExperience: 12,
      hourlyRate: 100.00,
      linkedinUrl: 'https://linkedin.com/in/sarahwilson',
      isActive: true
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`
📊 Created:
- ${await prisma.user.count()} users
- ${await prisma.decisionMakerProfile.count()} decision maker profiles
- ${await prisma.availabilitySlot.count()} availability slots
- ${await prisma.subscriptionPlan.count()} subscription plans

🔐 Test Accounts:
Admin: admin@pitchline.com / admin123
Decision Maker: john.doe@techcorp.com / password123
Decision Maker: sarah.wilson@fintech.com / password123
Pitcher: jane.smith@startup.com / password123
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })