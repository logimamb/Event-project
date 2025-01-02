'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  requestNotificationPermission, 
  showBrowserNotification, 
  checkNotificationSupport,
  getCurrentPermissionStatus,
  type NotificationPermissionStatus 
} from '@/lib/browser-notifications'

interface NotificationSettings {
  sound: boolean
  desktop: boolean
}

export function useNotifications() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<NotificationSettings>({
    sound: true,
    desktop: true
  })
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    const supported = checkNotificationSupport()
    setIsSupported(supported)

    if (supported) {
      // Get current permission status
      const currentStatus = getCurrentPermissionStatus()
      setPermissionStatus(currentStatus)
    }
  }, [])

  const requestPermissions = async () => {
    if (!isSupported) return false

    try {
      const permission = await requestNotificationPermission()
      setPermissionStatus(permission)
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permissions:', error)
      return false
    }
  }

  const sendNotification = (title: string, options: { body: string, icon?: string }) => {
    if (!isSupported || permissionStatus !== 'granted') return false

    try {
      showBrowserNotification({
        title,
        ...options
      })
      return true
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }))
  }

  return {
    isSupported,
    permissionStatus,
    settings,
    requestPermissions,
    sendNotification,
    updateSettings
  }
}
