'use client'

import { Activity } from '@/types'
import { ActivityList } from '../activity-list'
import { useState } from 'react'

interface ActivityListContainerProps {
  initialActivities: (Activity & {
    formattedStartDate: string
    formattedEndDate: string
  })[]
  eventId: string
}

export function ActivityListContainer({ initialActivities, eventId }: ActivityListContainerProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (id: string, status: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setActivities(prev =>
        prev.map(activity =>
          activity.id === id ? { ...activity, status } : activity
        )
      )
    } catch (error) {
      console.error('Error updating activity status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete activity')
      }

      setActivities(prev => prev.filter(activity => activity.id !== id))
    } catch (error) {
      console.error('Error deleting activity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ActivityList
      activities={activities}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  )
}
