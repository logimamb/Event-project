import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Twilio } from 'twilio'

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId')
  const activityId = searchParams.get('activityId')

  const where = {
    userId: session.user.id,
    ...(eventId && { eventId }),
    ...(activityId && { activityId }),
  }

  const settings = await prisma.notificationSettings.findMany({
    where,
    select: {
      id: true,
      type: true,
      channel: true,
      timing: true,
      enabled: true,
    },
  })

  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, channel, timing, enabled, eventId, activityId } = body

    // Validate phone number if SMS notifications are enabled
    if (channel.includes('SMS') && enabled) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phoneNumber: true },
      })

      if (!user?.phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number is required for SMS notifications' },
          { status: 400 }
        )
      }
    }

    const setting = await prisma.notificationSettings.upsert({
      where: {
        userId_eventId_activityId_type_channel: {
          userId: session.user.id,
          eventId: eventId ?? null,
          activityId: activityId ?? null,
          type,
          channel,
        },
      },
      update: {
        timing,
        enabled,
      },
      create: {
        userId: session.user.id,
        eventId,
        activityId,
        type,
        channel,
        timing,
        enabled,
      },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const settingId = searchParams.get('settingId')

    if (!settingId) {
      return NextResponse.json(
        { error: 'Setting ID is required' },
        { status: 400 }
      )
    }

    await prisma.notificationSettings.delete({
      where: {
        id: settingId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification setting:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification setting' },
      { status: 500 }
    )
  }
}
