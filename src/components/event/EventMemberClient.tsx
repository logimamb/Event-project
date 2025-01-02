'use client'

import { useState } from 'react'
import { MemberManagement } from './MemberManagement'
import { useToast } from '@/hooks/use-toast'
import { User } from '@prisma/client'

interface EventMemberClientProps {
  eventId: string
  initialEventMembers: User[]
}

export function EventMemberClient({ eventId, initialEventMembers }: EventMemberClientProps) {
  const { toast } = useToast()
  const [eventMembers, setEventMembers] = useState<User[]>(initialEventMembers)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddMember = async (email: string) => {
    if (!email) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          role: 'MEMBER'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add member')
      }

      const newMember = await response.json()
      setEventMembers(prev => [...prev, newMember.user])

      toast({
        title: 'Success',
        description: 'Member added successfully',
      })
    } catch (error) {
      console.error('Error adding member:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add member',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/members/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      setEventMembers(prev => prev.filter(member => member.id !== userId))

      toast({
        title: 'Success',
        description: 'Member removed successfully',
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MemberManagement
      eventId={eventId}
      members={eventMembers}
      onAddMember={handleAddMember}
      onRemoveMember={handleRemoveMember}
      isLoading={isLoading}
    />
  )
}
