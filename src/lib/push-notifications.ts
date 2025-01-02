import { prisma } from '@/lib/prisma'
import webPush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@example.com'

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys must be set in environment variables')
}

webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY!,
  VAPID_PRIVATE_KEY!
)

interface PushNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationOptions
) {
  try {
    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
    return true
  } catch (error) {
    console.error('Error sending push notification:', error)
    return false
  }
}

export async function saveSubscription(
  userId: string,
  subscription: PushSubscription
) {
  try {
    await prisma.pushSubscription.create({
      data: {
        userId,
        subscription: JSON.stringify(subscription),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      }
    })
    return true
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return false
  }
}

export async function removeSubscription(
  userId: string,
  subscription: PushSubscription
) {
  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        subscription: { contains: subscription.endpoint }
      }
    })
    return true
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return false
  }
}

export async function testPushNotification(subscription: PushSubscription) {
  return sendPushNotification(subscription, {
    title: 'Test Notification',
    body: 'This is a test notification to verify your settings.',
    icon: '/icons/notification-icon.png',
    badge: '/icons/notification-badge.png',
    tag: 'test-notification',
  })
}
