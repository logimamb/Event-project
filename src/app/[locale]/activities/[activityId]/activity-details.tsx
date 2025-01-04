'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ActivityParticipants } from '@/components/activity/activity-participants'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Share2,
  Copy,
} from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils'
import { ShareActivityDialog } from '@/components/ShareActivityDialog'

interface ActivityDetailsProps {
  activity: {
    id: string
    title: string
    description: string
    startTime: Date
    endTime: Date
    location: string
    capacity: number
    currentParticipants: number
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    event: {
      id: string
      title: string
      location: string | null
    }
    user: {
      id: string
      name: string | null
      image: string | null
    }
    participants: {
      id: string
      status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WAITLISTED'
      user: {
        id: string
        name: string | null
        email: string | null
        image: string | null
      }
    }[]
    shareableSlug: string
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
      }
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Clock,
      }
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
      }
    default:
      return {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock,
      }
  }
}

export function ActivityDetails({ 
  activity,
  handleDelete,
  handleUpdate,
  isSubmitting,
  isDeleting 
}: ActivityDetailsProps & {
  handleDelete: () => Promise<void>
  handleUpdate: (data: any) => Promise<void>
  isSubmitting: boolean
  isDeleting: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleStatusUpdate = async (newStatus: ActivityDetailsProps['activity']['status']) => {
    try {
      setIsUpdatingStatus(true)
      await handleUpdate({ status: newStatus })
      
      toast({
        title: 'Status updated',
        description: `Activity has been marked as ${newStatus.toLowerCase()}.`,
      })
    } catch (error) {
      console.error('Failed to update activity status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update activity status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCopyInviteLink = async () => {
    try {
      const inviteLink = `${window.location.origin}/activities/join/${activity.shareableSlug}`
      await navigator.clipboard.writeText(inviteLink)
      
      toast({
        title: 'Link Copied!',
        description: 'The invite link has been copied to your clipboard.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy invite link',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) {
      return 'Invalid date'
    }
    return format(d, 'MMMM d, yyyy')
  }

  const formatTime = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) {
      return 'Invalid time'
    }
    return format(d, 'h:mm a')
  }

  const formatLocation = (location: string) => {
    if (!location) return 'Unknown Location'
    const formattedLocation = location.replace(',', ', ')
    return formattedLocation.charAt(0).toUpperCase() + formattedLocation.slice(1)
  }

  const statusInfo = getStatusBadge(activity.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <ShareActivityDialog 
                activity={activity}
                size="sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/activities/${activity.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Activity
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Activity
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      activity and remove it from the event.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{activity.title}</h1>
            <Badge className={cn("flex items-center gap-1", statusInfo.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{activity.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {activity.status !== 'COMPLETED' && activity.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isUpdatingStatus}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
          )}
          {activity.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('CANCELLED')}
              disabled={isUpdatingStatus}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Activity
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleCopyInviteLink}
            disabled={isSubmitting}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Activity
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Details</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-muted-foreground">
                  {formatDate(activity.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-muted-foreground">
                  {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">{formatLocation(activity.location)}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-muted-foreground">{activity.capacity} participants</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Event & Creator Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Associated Event</h3>
              <Link
                href={`/events/${activity.event.id}`}
                className="block p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <p className="font-medium">{activity.event.title}</p>
                {activity.event.location && (
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formatLocation(activity.event.location)}
                  </p>
                )}
              </Link>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Created By</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={activity.user.image || undefined} />
                  <AvatarFallback>{activity.user.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{activity.user.name || 'Unknown User'}</p>
                  <p className="text-sm text-muted-foreground">Activity Creator</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <ActivityParticipants
          activityId={activity.id}
          capacity={activity.capacity}
          currentParticipants={activity.currentParticipants}
          initialParticipants={activity.participants}
        />
      </div>

      {activity.shareableSlug && (
        <div className="mt-4">
          <p className="text-sm font-medium">Invite Code</p>
          <div className="flex items-center gap-2">
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
              {activity.shareableSlug}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(activity.shareableSlug || '')
                toast({
                  title: 'Copied!',
                  description: 'Invite code copied to clipboard',
                })
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 