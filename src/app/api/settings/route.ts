import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  profileSettingsSchema,
  eventSettingsSchema,
  notificationSettingsSchema,
  privacySettingsSchema,
  displaySettingsSchema,
  securitySettingsSchema,
  integrationsSettingsSchema,
} from '@/lib/validations/settings'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    if (!user.settings) {
      // Create default settings if they don't exist
      const defaultSettings = await db.userSettings.create({
        data: {
          userId: user.id,
          profile: {},
          event: {},
          notification: {},
          privacy: {},
          display: {},
          security: {},
          integrations: {},
        },
      })

      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(user.settings)
  } catch (error) {
    console.error('[SETTINGS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const { type, ...data } = json

    let validatedData

    switch (type) {
      case 'profile':
        validatedData = profileSettingsSchema.parse(data)
        break
      case 'event':
        validatedData = eventSettingsSchema.parse(data)
        break
      case 'notification':
        validatedData = notificationSettingsSchema.parse(data)
        break
      case 'privacy':
        validatedData = privacySettingsSchema.parse(data)
        break
      case 'display':
        validatedData = displaySettingsSchema.parse(data)
        break
      case 'security':
        validatedData = securitySettingsSchema.parse(data)
        break
      case 'integrations':
        validatedData = integrationsSettingsSchema.parse(data)
        break
      default:
        return new NextResponse('Invalid settings type', { status: 400 })
    }

    const settings = await db.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        [type]: validatedData,
      },
      update: {
        [type]: validatedData,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('[SETTINGS_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
