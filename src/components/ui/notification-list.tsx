'use client'

import { useNotification } from '@/contexts/notification-context'
import { ScrollArea } from './scroll-area'
import { cn } from '@/lib/utils'

export function NotificationList() {
  const { notifications } = useNotification()

  if (notifications.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No notifications yet
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] w-full">
      <div className="space-y-2 p-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'rounded-lg p-4 text-sm',
              notification.type === 'success' && 'bg-green-50 text-green-800 dark:bg-green-900/10 dark:text-green-400',
              notification.type === 'error' && 'bg-red-50 text-red-800 dark:bg-red-900/10 dark:text-red-400',
              notification.type === 'info' && 'bg-blue-50 text-blue-800 dark:bg-blue-900/10 dark:text-blue-400'
            )}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
