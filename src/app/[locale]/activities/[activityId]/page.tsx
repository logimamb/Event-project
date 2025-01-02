'use client'

import { Metadata } from 'next'
import { ActivityDetails } from './activity-details'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { toast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ActivityParticipants } from '@/components/activity/activity-participants'

// import { DashboardLayout } from '@/components/layouts/dashboard-layout'

interface ActivityPageProps {
  params: {
    activityId: string
  }
}

interface ActivityFormData {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  location?: string
  capacity?: number
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

export default function ActivityPage({ params }: ActivityPageProps) {
  const router = useRouter()
  const t = useTranslations('activities')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activity, setActivity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${params.activityId}`)
      if (!response.ok) {
        throw new Error('Activity not found')
      }
      const data = await response.json()
      setActivity(data)
    } catch (error) {
      console.error('Error fetching activity:', error)
      notFound()
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchActivity()
  }, [params.activityId])

  async function handleDelete() {
    try {
      setIsDeleting(true)
      
      // First notify participants
      await fetch(`/api/activities/${params.activityId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'delete'
        })
      })

      // Then delete the activity
      const response = await fetch(`/api/activities/${params.activityId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete activity')
      }

      toast({
        title: t('deleteSuccess'),
        description: t('activityDeleted'),
      })

      router.push('/activities')
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast({
        title: t('error'),
        description: t('deleteError'),
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleUpdate(data: ActivityFormData) {
    try {
      setIsSubmitting(true)
      
      // First notify participants about the changes
      const changes = Object.entries(data)
        .filter(([key, value]) => activity[key] !== value)
        .map(([key, value]) => `${key}: ${activity[key]} → ${value}`)
        .join('\n')

      if (changes) {
        await fetch(`/api/activities/${params.activityId}/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'update',
            changes
          })
        })
      }

      // Then update the activity
      const response = await fetch(`/api/activities/${params.activityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update activity')
      }

      toast({
        title: t('updateSuccess'),
        description: t('activityUpdated'),
      })

      router.refresh()
      fetchActivity() // Refresh the activity data
    } catch (error) {
      console.error('Error updating activity:', error)
      toast({
        title: t('error'),
        description: t('updateError'),
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleParticipantChange = (newCount: number) => {
    setActivity(prev => ({
      ...prev,
      currentParticipants: newCount
    }))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!activity) {
    return notFound()
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <ActivityDetails 
          activity={activity}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
        />
        <div className="mt-8">
          <ActivityParticipants
            activityId={activity.id}
            capacity={activity.capacity}
            currentParticipants={activity.currentParticipants}
            initialParticipants={activity.participants}
            onParticipantChange={handleParticipantChange}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}