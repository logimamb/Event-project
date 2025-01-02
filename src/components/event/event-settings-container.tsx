'use client'

import { EventSettings } from './event-settings'
import { useRouter } from 'next/navigation'

interface EventSettingsContainerProps {
  event: {
    id: string
    status: string
    visibility: string
    priority: string
  }
}

export function EventSettingsContainer({ event }: EventSettingsContainerProps) {
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <EventSettings
      event={event}
      onUpdate={handleUpdate}
    />
  )
}
