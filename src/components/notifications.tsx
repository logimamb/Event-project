'use client'

import { useEffect } from 'react'
import { useNotifications, type NotificationType } from '@/store/notifications'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const icons: Record<NotificationType, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const variants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
}

const colors: Record<NotificationType, string> = {
  success: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  error: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
}

export function Notifications() {
  const { notifications, removeNotification } = useNotifications()

  useEffect(() => {
    // Clean up any notifications when component unmounts
    return () => {
      notifications.forEach((notification) => {
        removeNotification(notification.id)
      })
    }
  }, [])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const Icon = icons[notification.type]

          return (
            <motion.div
              key={notification.id}
              layout
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg',
                'border border-gray-200/20 backdrop-blur-sm',
                colors[notification.type]
              )}
              role="alert"
            >
              <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{notification.title}</p>
                {notification.message && (
                  <p className="mt-1 text-sm opacity-90">{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Dismiss notification"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
} 
