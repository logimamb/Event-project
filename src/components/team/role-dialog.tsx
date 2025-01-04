'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface RoleDialogProps {
  isOpen: boolean
  onClose: () => void
  member: {
    id: string
    name?: string | null
    type: 'event' | 'activity'
    role?: string
  }
  onRoleChange: () => void
}

const EVENT_ROLES = ['owner', 'admin', 'moderator', 'member']
const ACTIVITY_ROLES = ['accepted', 'pending', 'declined']

export function RoleDialog({
  isOpen,
  onClose,
  member,
  onRoleChange,
}: RoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(member.role || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const roles = member.type === 'event' ? EVENT_ROLES : ACTIVITY_ROLES

  const handleUpdateRole = async () => {
    if (!selectedRole) {
      toast({
        title: 'Validation Error',
        description: 'Please select a role',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUpdating(true)
      const locale = window.location.pathname.split('/')[1] || 'en'
      
      const response = await fetch(`/api/${locale}/team/manage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: member.id,
          type: member.type,
          role: selectedRole,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      toast({
        title: 'Success',
        description: 'Role updated successfully!',
      })

      onRoleChange()
      onClose()
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Role for {member.name}</DialogTitle>
          <DialogDescription>
            Change the role or status for this team member.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={isUpdating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
