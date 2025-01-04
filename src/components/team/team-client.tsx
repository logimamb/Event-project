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

export function TeamClient() {
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

  const handleSendMessage = async () => {
    console.log('handleSendMessage called')
    console.log('Current state:', {
      messageDialogOpen,
      selectedMember,
      messageSubject,
      messageContent,
      isSending
    })

    if (!selectedMember || !messageSubject.trim() || !messageContent.trim()) {
      console.log('Validation failed:', { selectedMember, messageSubject, messageContent })
      toast({
        title: 'Validation Error',
        description: 'Please fill in both subject and message fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      console.log('Sending message...')
      setIsSending(true)
      const locale = window.location.pathname.split('/')[1] || 'en'
      
      // Get the recipient details
      let recipientId = undefined
      let recipientEmail = undefined

      if (selectedMember.type === 'event') {
        // For event members, use the user ID from the user object
        recipientId = selectedMember.user?.id || selectedMember.userId
        recipientEmail = selectedMember.user?.email
      } else {
        // For activity participants, use the email directly if no user account exists
        if (selectedMember.user?.id) {
          recipientId = selectedMember.user.id
          recipientEmail = selectedMember.user.email
        } else {
          recipientEmail = selectedMember.email
        }
      }

      console.log('Selected member:', {
        type: selectedMember.type,
        userId: selectedMember.userId,
        user: selectedMember.user,
        recipientId,
        recipientEmail
      })

      if (!recipientId && !recipientEmail) {
        throw new Error('Unable to determine recipient contact information')
      }
      
      console.log('Sending POST request...')
      const response = await fetch(`/${locale}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          recipientEmail,
          subject: messageSubject,
          message: messageContent,
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Response error:', errorData)
        throw new Error(errorData.error || 'Failed to send message')
      }

      const result = await response.json()
      console.log('Message sent successfully:', result)
      
      toast({
        title: 'Success',
        description: 'Message sent successfully!',
      })

      // Reset form and close dialog
      setMessageSubject('')
      setMessageContent('')
      setMessageDialogOpen(false)
      setSelectedMember(null)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!selectedMember) return

    try {
      const locale = window.location.pathname.split('/')[1] || 'en'
      
      const response = await fetch(`/api/${locale}/team/manage`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: selectedMember.id,
          type: selectedMember.type,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove member')
      }

      toast({
        title: 'Success',
        description: 'Team member removed successfully!',
      })

      // Refresh the team members list
      fetchTeamMembers()
      setRemoveDialogOpen(false)
      setSelectedMember(null)
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove team member. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const searchLower = searchQuery.toLowerCase()
    const name = member.user?.name || member.name || ''
    const email = member.user?.email || member.email || ''
    const eventTitle = member.event?.title || ''
    const activityTitle = member.activity?.title || ''
    
    return name.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower) ||
           eventTitle.toLowerCase().includes(searchLower) ||
           activityTitle.toLowerCase().includes(searchLower)
  })

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string | undefined) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'admin':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      case 'moderator':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
      case 'accepted':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'declined':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
    }
  }

  const getTypeColor = (type: 'event' | 'activity') => {
    return type === 'event' 
      ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20'
      : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
  }

  const getTypeIcon = (type: 'event' | 'activity') => {
    return type === 'event' ? CalendarRange : Users2
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const TypeIcon = getTypeIcon(member.type)
            return (
              <Card key={member.id} className="group relative overflow-hidden border border-border/50 hover:border-border/100 transition-all duration-200">
                {/* Type indicator ribbon */}
                <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg shadow-sm border-l border-b border-border/50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-1.5 ${getTypeColor(member.type)}`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium capitalize">
                            {member.type}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.type === 'event' ? t('eventMember') : t('activityParticipant')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Main content */}
                <div className="p-6">
                  {/* Header section */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                        <AvatarImage src={member.user?.image || undefined} />
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(member.user?.name || member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {member.user?.name || member.name || t('anonymous')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.user?.email || member.email || t('noEmail')}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setSelectedMember(member)
                          setMessageDialogOpen(true)
                        }}>
                          <Mail className="mr-2 h-4 w-4" />
                          {t('sendMessage')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedMember(member)
                          setRoleDialogOpen(true)
                        }}>
                          <UserCog className="mr-2 h-4 w-4" />
                          {t('manageRole')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setSelectedMember(member)
                            setRemoveDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('remove')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Role and badges section */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getRoleColor(member.role)} transition-colors duration-200`}
                    >
                      {member.role || t('member')}
                    </Badge>
                    {member.event && (
                      <Badge variant="outline" className="bg-background">
                        <CalendarDays className="mr-1 h-3 w-3" />
                        {member.event.title}
                      </Badge>
                    )}
                    {member.activity && (
                      <Badge variant="outline" className="bg-background">
                        <Building2 className="mr-1 h-3 w-3" />
                        {member.activity.title}
                      </Badge>
                    )}
                  </div>

                  {/* Details section */}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Join Date */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="truncate">{format(new Date(member.joinedAt), 'MMM d, yyyy')}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{format(new Date(member.joinedAt), 'PPPp')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Location */}
                      {(member.user?.city || member.user?.country) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {[member.user.city, member.user.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Timezone */}
                      {member.user?.timezone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          <span className="truncate">{member.user.timezone}</span>
                        </div>
                      )}

                      {/* Phone */}
                      {member.user?.phoneNumber && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="truncate">{member.user.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    {(member.event?.status || member.activity?.status) && (
                      <div className="pt-2 mt-2 border-t border-border/50">
                        <Badge 
                          variant="outline" 
                          className="w-full justify-center bg-background"
                        >
                          {t('status')}: {member.event?.status || member.activity?.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('noResults')}</p>
          </div>
        )}
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Message to {selectedMember?.user?.name || selectedMember?.name || t('anonymous')}</DialogTitle>
            <DialogDescription>
              Send a direct message to this team member. They will receive it via email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                disabled={isSending}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Write your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="min-h-[150px]"
                disabled={isSending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMessageDialogOpen(false)
                setSelectedMember(null)
                setMessageSubject('')
                setMessageContent('')
              }}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              disabled={isSending || !messageSubject.trim() || !messageContent.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      {selectedMember && (
        <RoleDialog
          isOpen={roleDialogOpen}
          onClose={() => {
            setRoleDialogOpen(false)
            setSelectedMember(null)
          }}
          member={selectedMember}
          onRoleChange={fetchTeamMembers}
        />
      )}

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmRemoval')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('removeConfirmMessage', {
                name: selectedMember?.user?.name || selectedMember?.name || t('anonymous')
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRemoveDialogOpen(false)
              setSelectedMember(null)
            }}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
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
