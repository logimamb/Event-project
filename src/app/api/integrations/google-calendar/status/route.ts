import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's calendar connection status
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    })

    // Get user's preferences for last sync time
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
      select: { calendarLastSync: true },
    })

    return NextResponse.json({
      connected: !!account,
      lastSynced: preferences?.calendarLastSync || null,
    })
  } catch (error) {
    console.error('Error checking Google Calendar status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
