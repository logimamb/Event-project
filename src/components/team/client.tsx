'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
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
  Users
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TeamMember {
  id: string
  user?: {
    id: string
    name: string | null
    email: string | null
    image: string | null
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
}

interface ApiResponse {
  eventMembers: TeamMember[];
  activityParticipants: TeamMember[];
}

interface FilterState {
  search: string;
  role: string;
  entityId: string;
  dateRange: DateRange | undefined;
  type: 'all' | 'event' | 'activity';
}

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, message: string) => void;
}

interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, entityId: string) => void;
}

function MessageDialog({ isOpen, onClose, onSend }: MessageDialogProps) {
  const t = useTranslations('team')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    onSend(subject, message)
    setSubject('')
    setMessage('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('sendMessage')}</DialogTitle>
          <DialogDescription>{t('messageDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder={t('subject')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            placeholder={t('message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleSubmit}>{t('send')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InviteDialog({ isOpen, onClose, onInvite }: InviteDialogProps) {
  const t = useTranslations('team')
  const [email, setEmail] = useState('')
  const [entityId, setEntityId] = useState('')
  const [entities, setEntities] = useState<Array<{ id: string; title: string; type: string }>>([])

  useEffect(() => {
    fetchEntities()
  }, [])

  const fetchEntities = async () => {
    try {
      const [eventsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/activities')
      ])
      
      const events = await eventsResponse.json()
      const activities = await activitiesResponse.json()

      setEntities([
        ...events.map((e: any) => ({ ...e, type: 'event' })),
        ...activities.map((a: any) => ({ ...a, type: 'activity' }))
      ])
    } catch (error) {
      console.error('Error fetching entities:', error)
    }
  }

  const handleSubmit = () => {
    onInvite(email, entityId)
    setEmail('')
    setEntityId('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('invite')}</DialogTitle>
          <DialogDescription>{t('inviteDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select value={entityId} onValueChange={setEntityId}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectEntity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('selectEntity')}</SelectItem>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.title} ({t(entity.type)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} disabled={!email || !entityId}>
            {t('invite')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TeamClient() {
  const t = useTranslations('team')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: 'all',
    entityId: 'all',
    dateRange: undefined,
    type: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team')
      if (!response.ok) {
        throw new Error(t('errors.fetchFailed'))
      }
      const data: ApiResponse = await response.json()
      
      // Transform and tag members by type
      const eventMembers = data.eventMembers.map(member => ({
        ...member,
        type: 'event' as const
      }))
      
      const activityMembers = data.activityParticipants.map(member => ({
        ...member,
        type: 'activity' as const,
        role: member.status || 'participant'
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

  const handleInvite = async (email: string, entityId: string) => {
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, entityId }),
      })

      if (!response.ok) throw new Error('Failed to send invitation')

      toast({
        title: t('notifications.inviteSent'),
        variant: 'default',
      })
      setIsInviteDialogOpen(false)
      fetchTeamMembers()
    } catch (error) {
      console.error('Error inviting member:', error)
      toast({
        title: t('notifications.inviteError'),
        description: String(error),
        variant: 'destructive',
      })
    }
  }

  const handleSendMessage = async (subject: string, message: string) => {
    if (!selectedMember) return

    try {
      const response = await fetch(`/api/team/${selectedMember.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      toast({
        title: t('notifications.messageSent'),
        variant: 'default',
      })
      setIsMessageDialogOpen(false)
      setSelectedMember(null)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: t('notifications.messageError'),
        description: String(error),
        variant: 'destructive',
      })
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    // Search filter
    const searchLower = filters.search.toLowerCase()
    const name = member.user?.name || member.name || ''
    const email = member.user?.email || member.email || ''
    const entityTitle = member.event?.title || member.activity?.title || ''
    
    const matchesSearch = 
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      entityTitle.toLowerCase().includes(searchLower)

    // Type filter
    const matchesType = 
      filters.type === 'all' || 
      member.type === filters.type

    // Role filter
    const matchesRole = 
      filters.role === 'all' || 
      (member.role?.toLowerCase() === filters.role.toLowerCase())

    // Entity filter
    const matchesEntity = 
      filters.entityId === 'all' || 
      member.event?.id === filters.entityId ||
      member.activity?.id === filters.entityId

    // Date range filter
    const matchesDateRange = !filters.dateRange?.from || !filters.dateRange?.to || (
      new Date(member.joinedAt) >= filters.dateRange.from &&
      new Date(member.joinedAt) <= filters.dateRange.to
    )

    return matchesSearch && matchesType && matchesRole && matchesEntity && matchesDateRange
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
        return 'bg-yellow-500'
      case 'admin':
        return 'bg-red-500'
      case 'moderator':
        return 'bg-purple-500'
      case 'accepted':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'declined':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  const uniqueRoles = Array.from(new Set(teamMembers.map(member => member.role).filter(Boolean)))

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              className="pl-8"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
          <Button
            variant="default"
            onClick={() => setIsInviteDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('invite')}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('type')}</label>
              <Select
                value={filters.type}
                onValueChange={(value: 'all' | 'event' | 'activity') => 
                  setFilters(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="event">{t('eventMembers')}</SelectItem>
                  <SelectItem value="activity">{t('activityParticipants')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('role')}</label>
              <Select
                value={filters.role}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRoles')}</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role?.toLowerCase() || ''}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('dateRange')}</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onChange={(range) => 
                  setFilters(prev => ({ ...prev, dateRange: range }))
                }
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '',
                role: 'all',
                entityId: 'all',
                dateRange: undefined,
                type: 'all'
              })}
            >
              {t('resetFilters')}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user?.image || undefined} />
                  <AvatarFallback>
                    {getInitials(member.user?.name || member.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {member.user?.name || member.name || t('anonymous')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.user?.email || member.email || t('noEmail')}
                  </p>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    setSelectedMember(member)
                    setIsMessageDialogOpen(true)
                  }}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t('sendMessage')}
                  </DropdownMenuItem>
                  {member.type === 'event' && (
                    <DropdownMenuItem>
                      <UserCog className="mr-2 h-4 w-4" />
                      {t('manageRole')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('remove')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className={getRoleColor(member.role)}>
                {member.role || t('member')}
              </Badge>
              <Badge variant="outline">
                {member.type === 'event' ? t('eventMember') : t('activityParticipant')}
              </Badge>
              {member.event && (
                <Badge variant="outline">
                  {t('event')}: {member.event.title}
                </Badge>
              )}
              {member.activity && (
                <Badge variant="outline">
                  {t('activity')}: {member.activity.title}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('noResults')}</p>
        </div>
      )}

      <MessageDialog 
        isOpen={isMessageDialogOpen}
        onClose={() => {
          setIsMessageDialogOpen(false)
          setSelectedMember(null)
        }}
        onSend={handleSendMessage}
      />

      <InviteDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  )
}
