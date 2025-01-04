'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { 
  MoreVertical,
  Mail,
  Trash2,
  Shield,
  Crown,
  UserPlus,
  Search,
  UserCog,
  Filter,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Phone,
  CalendarDays,
  Building2,
  CalendarRange,
  Users2,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RoleDialog } from './role-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TeamMember {
  id: string
  user?: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    city?: string | null
    country?: string | null
    phoneNumber?: string | null
    timezone?: string | null
  } | null
  name?: string | null
  email?: string | null
  role?: string
  status?: string
  event?: {
    id: string
    title: string
    status: string
    createdAt: string
  }
  activity?: {
    id: string
    title: string
    status: string
    createdAt: string
  }
  permissions?: {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
  } | null
  joinedAt: string
  type: 'event' | 'activity'
  userId: string
}

interface ApiResponse {
  eventMembers: TeamMember[];
  activityParticipants: TeamMember[];
}

function TeamClient() {
  const t = useTranslations('team')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  // Message dialog state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Add new state for role management and removal
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  useEffect(() => {
    console.log('messageDialogOpen changed:', messageDialogOpen)
    console.log('selectedMember changed:', selectedMember)
  }, [messageDialogOpen, selectedMember])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/team')
      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }
      const data: ApiResponse = await response.json()
      
      const eventMembers = data.eventMembers.map(member => ({
        ...member,
        type: 'event' as const,
        role: member.role || 'member',
        // Ensure userId is properly set
        userId: member.userId || member.user?.id
      }))
      
      const activityMembers = data.activityParticipants.map(member => ({
        ...member,
        type: 'activity' as const,
        role: member.status || 'participant',
        // Ensure userId is properly set
        userId: member.userId || member.user?.id
      }))
      
      setTeamMembers([...eventMembers, ...activityMembers])
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast({
        title: t('errors.title'),
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (recipientId: string, recipientEmail: string) => {
    try {
      setIsSending(true)
      
      if (!messageSubject || !messageContent) {
        throw new Error('Please provide both subject and message')
      }

      if (!recipientId && !recipientEmail) {
        throw new Error('Unable to determine recipient contact information')
      }

      const locale = window.location.pathname.split('/')[1] || 'en'
      
      console.log('Sending POST request with data:', {
        recipientId,
        recipientEmail,
        subject: messageSubject,
        content: messageContent,
        message: messageContent,
        type: 'DIRECT',
        priority: 'MEDIUM',
        category: 'GENERAL'
      })

      const response = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          recipientEmail,
          subject: messageSubject,
          content: messageContent,
          type: 'DIRECT',
          priority: 'MEDIUM',
          category: 'GENERAL'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      console.log('Message sent successfully:', result)

      toast({
        title: 'Success',
        description: 'Message sent successfully!',
      })

      setMessageDialogOpen(false)
      setMessageSubject('')
      setMessageContent('')
      setSelectedMember(null)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/team/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          role: newRole,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      await fetchTeamMembers()
      setRoleDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Role updated successfully!',
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/member`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove member')
      }

      await fetchTeamMembers()
      setRemoveDialogOpen(false)
      toast({
        title: 'Success',
        description: 'Member removed successfully!',
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const searchLower = searchQuery.toLowerCase()
    const nameMatch = member.user?.name?.toLowerCase().includes(searchLower) || false
    const emailMatch = member.user?.email?.toLowerCase().includes(searchLower) || false
    const roleMatch = member.role?.toLowerCase().includes(searchLower) || false
    return nameMatch || emailMatch || roleMatch
  })

  return (
    <>
      <div className="flex flex-col space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-accent' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('invite')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Add your filter components here */}
            </div>
          </Card>
        )}

        {/* Team members list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredMembers.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Users2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('noMembers')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('startByInviting')}</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={member.user?.image || undefined} />
                      <AvatarFallback>
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.user?.name || t('unnamed')}
                        {member.role === 'owner' && (
                          <Crown className="inline-block h-4 w-4 ml-1 text-yellow-500" />
                        )}
                        {member.role === 'admin' && (
                          <Shield className="inline-block h-4 w-4 ml-1 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {member.type === 'event' ? t('event') : t('activity')}
                        </Badge>
                        <Badge>
                          {member.role || t('member')}
                        </Badge>
                      </div>
                      {/* Additional member details */}
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {member.user?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {member.user.city}
                            {member.user.country && `, ${member.user.country}`}
                          </div>
                        )}
                        {member.user?.timezone && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {member.user.timezone}
                          </div>
                        )}
                        {member.user?.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.user.phoneNumber}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {t('joined')} {format(new Date(member.joinedAt), 'PP')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member)
                          setMessageDialogOpen(true)
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {t('sendMessage')}
                      </DropdownMenuItem>
                      {member.permissions?.canEdit && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member)
                            setRoleDialogOpen(true)
                          }}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          {t('manageRole')}
                        </DropdownMenuItem>
                      )}
                      {member.permissions?.canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedMember(member)
                              setRemoveDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('remove')}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sendMessage')}</DialogTitle>
            <DialogDescription>
              {t('sendMessageTo')} {selectedMember?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder={t('subject')}
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder={t('message')}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMessageDialogOpen(false)}
              disabled={isSending}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={() => {
                if (selectedMember) {
                  sendMessage(selectedMember.userId, selectedMember.user?.email || '')
                }
              }}
              disabled={isSending}
            >
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <RoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        member={selectedMember}
        onUpdateRole={handleUpdateRole}
      />

      {/* Remove Member Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemove')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeDescription')} {selectedMember?.user?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedMember) {
                  handleRemoveMember(selectedMember.id)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default TeamClient
