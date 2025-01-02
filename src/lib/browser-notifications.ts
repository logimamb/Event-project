'use client'

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied'

export interface BrowserNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return 'denied'
  }
}

export function showBrowserNotification(options: BrowserNotificationOptions): void {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted')
    return
  }

  try {
    new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
      data: options.data,
    })
  } catch (error) {
    console.error('Error showing notification:', error)
  }
}

export function checkNotificationSupport(): boolean {
  return 'Notification' in window
}

export function getCurrentPermissionStatus(): NotificationPermissionStatus {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission as NotificationPermissionStatus
}
