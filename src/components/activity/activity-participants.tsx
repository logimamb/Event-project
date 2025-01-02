import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { UserPlus2, UserMinus2, Users } from 'lucide-react'
import { AddParticipantForm } from './add-participant-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ActivityParticipant {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WAITLISTED'
  uniqueCode?: string
  qrCode?: string
  email: string
  name?: string | null
  user?: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
}

interface ActivityParticipantsProps {
  activityId: string
  capacity: number
  currentParticipants: number
  initialParticipants: ActivityParticipant[]
  onParticipantChange?: (newCount: number) => void
}

export function ActivityParticipants({
  activityId,
  capacity,
  currentParticipants: initialCurrentParticipants,
  initialParticipants,
  onParticipantChange
}: ActivityParticipantsProps) {
  const { data: session } = useSession()
  const [participants, setParticipants] = useState<ActivityParticipant[]>(initialParticipants)
  const [currentParticipants, setCurrentParticipants] = useState(initialCurrentParticipants)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleParticipantAdded = async () => {
    try {
      // Refresh participants list
      const res = await fetch(`/api/activities/${activityId}/participants`)
      const data = await res.json()
      setParticipants(data)
      
      // Get updated activity details
      const activityRes = await fetch(`/api/activities/${activityId}`)
      const activityData = await activityRes.json()
      setCurrentParticipants(activityData.currentParticipants)
      onParticipantChange?.(activityData.currentParticipants)
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error refreshing participants:', error)
    }
  }

  const isParticipating = participants.some(
    p => p.user?.id === session?.user?.id && ['ACCEPTED', 'WAITLISTED'].includes(p.status)
  )

  const handleJoin = async () => {
    if (!session?.user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to join activities',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/activities/${activityId}/participants`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to join activity')
      }

      const data = await response.json()
      
      // Add the new participant to the list
      setParticipants(prev => [...prev, {
        id: data.id,
        status: data.status,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        }
      }])

      // Update participant count if accepted
      if (data.status === 'ACCEPTED') {
        const newCount = currentParticipants + 1
        setCurrentParticipants(newCount)
        onParticipantChange?.(newCount)
      }

      toast({
        title: 'Success',
        description: data.status === 'WAITLISTED' 
          ? 'You have been added to the waitlist'
          : 'You have joined the activity',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join activity',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeave = async () => {
    try {
      setIsLoading(true)
      const participant = participants.find(p => p.user?.id === session?.user?.id)
      const wasAccepted = participant?.status === 'ACCEPTED'

      const response = await fetch(`/api/activities/${activityId}/participants`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to leave activity')
      }

      // Remove the participant from the list
      setParticipants(prev => 
        prev.filter(p => p.user?.id !== session?.user?.id)
      )

      // Update participant count if they were accepted
      if (wasAccepted) {
        const newCount = currentParticipants - 1
        setCurrentParticipants(newCount)
        onParticipantChange?.(newCount)
      }

      toast({
        title: 'Success',
        description: 'You have left the activity',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave activity',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeColor = (status: ActivityParticipant['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-500'
      case 'WAITLISTED':
        return 'bg-yellow-500'
      case 'PENDING':
        return 'bg-blue-500'
      case 'DECLINED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Participants ({currentParticipants}/{capacity})
          </h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus2 className="mr-2 h-4 w-4" />
              Add Participant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Participant</DialogTitle>
              <DialogDescription>
                Invite someone to participate in this activity. They will receive an email with their unique code and QR code.
              </DialogDescription>
            </DialogHeader>
            <AddParticipantForm
              activityId={activityId}
              capacity={capacity}
              currentParticipants={currentParticipants}
              onParticipantAdded={handleParticipantAdded}
            />
          </DialogContent>
        </Dialog>
        {session?.user && (
          <Button
            onClick={isParticipating ? handleLeave : handleJoin}
            disabled={isLoading}
            variant={isParticipating ? "destructive" : "default"}
          >
            {isLoading ? (
              "Loading..."
            ) : isParticipating ? (
              <>
                <UserMinus2 className="mr-2 h-4 w-4" />
                Leave
              </>
            ) : (
              <>
                <UserPlus2 className="mr-2 h-4 w-4" />
                Join
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              {participant.user ? (
                <Avatar>
                  <AvatarImage src={participant.user.image || undefined} />
                  <AvatarFallback>
                    {participant.user.name?.[0] || participant.user.email?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>
                    {participant.name?.[0] || participant.email[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-medium">
                  {participant.user?.name || participant.name || 'Unnamed Participant'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {participant.user?.email || participant.email}
                </p>
                {participant.uniqueCode && (
                  <p className="text-xs text-muted-foreground">
                    Code: {participant.uniqueCode}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {participant.qrCode && (
                <img 
                  src={participant.qrCode} 
                  alt="Participant QR Code" 
                  className="h-8 w-8"
                />
              )}
              <Badge className={getStatusBadgeColor(participant.status)}>
                {participant.status}
              </Badge>
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <p className="text-center text-muted-foreground">
            No participants yet. Add someone to get started!
          </p>
        )}
      </div>
    </div>
  )
}
