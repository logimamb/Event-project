import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationSettingSchema = z.object({
  entityId: z.string(),
  entityType: z.enum(['event', 'activity']),
  settings: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['EVENT_START', 'EVENT_END', 'ACTIVITY_START', 'ACTIVITY_END', 'REMINDER']),
    channel: z.array(z.enum(['EMAIL', 'SMS'])),
    timing: z.number().min(1),
    enabled: z.boolean()
  }))
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { entityId, entityType, settings } = notificationSettingSchema.parse(body)

    // Delete existing settings
    await prisma.notificationSettings.deleteMany({
      where: {
        userId: session.user.id,
        [entityType === 'event' ? 'eventId' : 'activityId']: entityId
      }
    })

    // Create new settings
    const createdSettings = await Promise.all(
      settings.map(setting => 
        prisma.notificationSettings.create({
          data: {
            userId: session.user.id,
            [entityType === 'event' ? 'eventId' : 'activityId']: entityId,
            type: setting.type,
            channel: setting.channel,
            timing: setting.timing,
            enabled: setting.enabled
          }
        })
      )
    )

    return NextResponse.json(createdSettings)
  } catch (error) {
    console.error('Error saving notification settings:', error)
    return new NextResponse(
      error instanceof z.ZodError 
        ? 'Invalid request data' 
        : 'Internal server error',
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const entityId = searchParams.get('entityId')
    const entityType = searchParams.get('entityType')

    if (!entityId || !entityType) {
      return new NextResponse('Missing entityId or entityType', { status: 400 })
    }

    const settings = await prisma.notificationSettings.findMany({
      where: {
        userId: session.user.id,
        [entityType === 'event' ? 'eventId' : 'activityId']: entityId
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 