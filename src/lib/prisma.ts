import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export { prisma }

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('Successfully connected to database')
    return true
  } catch (error) {
    console.error('Failed to connect to database:', error)
    return false
  }
}

export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('Successfully disconnected from database')
    return false
  } catch (error) {
    console.error('Failed to disconnect from database:', error)
    return false
  }
}

// Handle process termination gracefully
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', async () => {
    await disconnectFromDatabase()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await disconnectFromDatabase()
    process.exit(0)
  })
}