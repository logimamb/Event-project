'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { toast } from 'sonner'

type NotificationContextType = {
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
  notifications: Array<{ id: string; message: string; type: string }>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: string }>>([])

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Use sonner toast for immediate feedback
    toast[type](message)
    
    // Also store in state if we need to show history
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification, notifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
