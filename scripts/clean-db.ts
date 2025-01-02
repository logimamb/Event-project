import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    // Delete in order to respect foreign key constraints
    console.log('Cleaning database...')

    // Delete activities first (they reference events)
    await prisma.activity.deleteMany()
    console.log('✓ Deleted all activities')

    // Delete virtual access and accessibility (they reference events)
    await prisma.virtualAccess.deleteMany()
    console.log('✓ Deleted all virtual access records')

    await prisma.accessibility.deleteMany()
    console.log('✓ Deleted all accessibility records')

    // Delete events
    await prisma.event.deleteMany()
    console.log('✓ Deleted all events')

    // Delete sessions and accounts (they reference users)
    await prisma.session.deleteMany()
    console.log('✓ Deleted all sessions')

    await prisma.account.deleteMany()
    console.log('✓ Deleted all accounts')

    // Delete verification tokens
    await prisma.verificationToken.deleteMany()
    console.log('✓ Deleted all verification tokens')

    // Finally, delete users
    await prisma.user.deleteMany()
    console.log('✓ Deleted all users')

    console.log('Database cleaned successfully!')
  } catch (error) {
    console.error('Error cleaning database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase() 