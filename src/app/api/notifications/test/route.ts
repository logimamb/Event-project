import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPushNotification } from '@/lib/push-notifications'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { type, sound, volume } = await request.json()

    // Get user's notification settings
    const settings = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        notificationSound: true,
        notificationVolume: true,
        email: true,
        pushSubscriptions: true,
      },
    })

    if (!settings) {
      return new NextResponse('User settings not found', { status: 404 })
    }

    const results = {
      email: false,
      push: false,
    }

    // Send test email if enabled
    if (settings.emailNotifications && settings.email) {
      try {
        await sendEmail({
          to: settings.email,
          subject: 'Test Notification',
          text: 'This is a test notification to verify your email notification settings.',
          html: `
            <h1>Test Notification</h1>
            <p>This is a test notification to verify your email notification settings.</p>
            <p>If you received this email, your email notifications are working correctly.</p>
          `,
        })
        results.email = true
      } catch (error) {
        console.error('Error sending test email:', error)
      }
    }

    // Send test push notification if enabled
    if (settings.pushNotifications && settings.pushSubscriptions.length > 0) {
      try {
        const successfulPush = await Promise.all(
          settings.pushSubscriptions.map(sub =>
            sendPushNotification(JSON.parse(sub.subscription), {
              title: 'Test Notification',
              body: 'This is a test notification to verify your push notification settings.',
              icon: '/icons/notification-icon.png',
              badge: '/icons/notification-badge.png',
              tag: 'test-notification',
              sound: settings.notificationSound && sound,
              volume: settings.notificationVolume * (volume || 1),
            })
          )
        )
        results.push = successfulPush.some(Boolean)
      } catch (error) {
        console.error('Error sending test push notification:', error)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error sending test notifications:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
