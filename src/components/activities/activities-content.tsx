'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ActivityCard } from "@/components/activity/activity-card"
import { ErrorBoundary } from '@/components/error-boundary'

interface Activity {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
  location?: string
  capacity: number
  currentParticipants: number
  status: string
  participants: any[]
  user: {
    name: string | null
    image: string | null
  }
}

interface ActivitiesContentProps {
  activities: Activity[]
  title: string
  createLabel: string
  errorLabel: string
}

export function ActivitiesContent({ activities, title, createLabel, errorLabel }: ActivitiesContentProps) {
  return (
    <ErrorBoundary fallback={errorLabel}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>
        <Link href="/activities/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {createLabel}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            participantCount={activity.participants.length}
          />
        ))}
      </div>
    </ErrorBoundary>
  )
}
