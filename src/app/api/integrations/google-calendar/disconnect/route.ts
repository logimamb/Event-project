import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Update user's calendar sync settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        calendarSync: false,
        // calendarId: null,
      },
    })

    // Remove calendar account
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'google-calendar',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google Calendar Disconnect Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 