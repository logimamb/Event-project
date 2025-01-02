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
  CalendarIcon,
  Users,
  User,
  Filter,
  Plus,
  Settings,
  Calendar as CalendarLucide,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from 'next-intl'
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TeamMember {
  id: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  name: string | null
  email: string | null
  role: string
  event: {
    id: string
    title: string
    type: string
    createdAt: string
  }
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
  } | null
  joinedAt: string
}

interface ApiResponse {
  eventMembers: TeamMember[];
  activityParticipants: TeamMember[];
}

interface MessageDialogProps {
  isOpen: boolean
  onClose: () => void
  onSend: (subject: string, message: string) => void
}

interface InviteDialogProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, eventId: string) => void
}

interface FilterState {
  search: string
  role: string
  eventId: string
  dateRange: DateRange | undefined
}

function MessageDialog({ isOpen, onClose, onSend }: MessageDialogProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const t = useTranslations('team.dialogs.message')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend(subject, message)
    setSubject('')
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">{t('subjectLabel')}</Label>
              <Input
                id="subject"
                placeholder={t('subjectPlaceholder')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="message">{t('messageLabel')}</Label>
              <Textarea
                id="message"
                placeholder={t('messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function InviteDialog({ isOpen, onClose, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [events, setEvents] = useState<{ id: string, title: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('team.dialogs.invite')

  useEffect(() => {
    if (isOpen) {
      fetchEvents()
    }
  }, [isOpen])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
      if (data.length > 0) {
        setSelectedEvent(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && selectedEvent) {
      onInvite(email, selectedEvent)
      setEmail('')
      setSelectedEvent('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="event">{t('eventLabel')}</Label>
              <select
                id="event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('sending') : t('sendInvite')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TeamClient() {
  const t = useTranslations('team')
  const commonT = useTranslations('common')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: 'all',
    eventId: 'all',
    dateRange: undefined
  })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t('errors.fetchFailed'))
      }
      const data: ApiResponse = await response.json()
      // Combine both event members and activity participants
      setTeamMembers([...data.eventMembers, ...data.activityParticipants])
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast({
        title: t('common:error'),
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async (email: string, eventId: string) => {
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventId }),
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

  const handleDeleteMember = async () => {
    if (!selectedMember) return

    try {
      const response = await fetch(`/api/team/${selectedMember.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove member')

      toast({
        title: t('notifications.memberRemoved'),
        variant: 'default',
      })
      fetchTeamMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: t('notifications.removeError'),
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/team/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const updatedMember = await response.json()
      setTeamMembers(teamMembers.map(m => m.id === memberId ? updatedMember : m))
      toast({
        title: t('notifications.roleUpdated'),
        variant: 'default',
      })
    } catch (error) {
      console.error('Failed to update role:', error)
      toast({
        title: t('notifications.roleError'),
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const searchLower = filters.search.toLowerCase()
    const name = member.user?.name || member.name || ''
    const email = member.user?.email || member.email || ''
    const eventTitle = member.event?.title || ''
    
    const matchesSearch = 
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      eventTitle.toLowerCase().includes(searchLower)

    const matchesRole = filters.role === 'all' || member.role.toLowerCase() === filters.role.toLowerCase()
    
    const matchesEvent = filters.eventId === 'all' || member.event?.id === filters.eventId

    const matchesDateRange = !filters.dateRange?.from || !filters.dateRange?.to || (
      member.joinedAt && 
      new Date(member.joinedAt) >= filters.dateRange.from &&
      new Date(member.joinedAt) <= filters.dateRange.to
    )

    return matchesSearch && matchesRole && matchesEvent && matchesDateRange
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('filters.title')}
          </Button>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('inviteMember')}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t('filters.role')}</Label>
              <Select
                value={filters.role}
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allRoles')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allRoles')}</SelectItem>
                  {['owner', 'admin', 'moderator', 'member', 'guest'].map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('filters.event')}</Label>
              <Select
                value={filters.eventId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, eventId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allEvents')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allEvents')}</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('filters.joinDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "P", { locale: fr })} -{" "}
                          {format(filters.dateRange.to, "P", { locale: fr })}
                        </>
                      ) : (
                        format(filters.dateRange.from, "P", { locale: fr })
                      )
                    ) : (
                      t('filters.selectDateRange')
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '',
                role: 'all',
                eventId: 'all',
                dateRange: undefined
              })}
            >
              {t('filters.reset')}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">{t('loading')}</div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {teamMembers.length === 0 ? t('createFirstMember') : t('noMembers')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.user?.image || undefined} />
                    <AvatarFallback>
                      {(member.user?.name || member.name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.user?.name || member.name || t('common:anonymous')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user?.email || member.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {t(`roles.${member.role.toLowerCase()}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t('joinedAt')} {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : t('unknown')}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('actions.title')}</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMember(member)
                        setIsMessageDialogOpen(true)
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {t('actions.message')}
                    </DropdownMenuItem>

                    {member.permissions?.canEdit && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Shield className="mr-2 h-4 w-4" />
                          {t('actions.changeRole')}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.id, 'OWNER')}
                              disabled={loading || member.role === 'OWNER'}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              {t('roles.owner')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.id, 'ADMIN')}
                              disabled={loading}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              {t('roles.admin')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.id, 'MODERATOR')}
                              disabled={loading}
                            >
                              <User className="mr-2 h-4 w-4" />
                              {t('roles.moderator')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.id, 'MEMBER')}
                              disabled={loading}
                            >
                              <User className="mr-2 h-4 w-4" />
                              {t('roles.member')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member.id, 'GUEST')}
                              disabled={loading}
                            >
                              <User className="mr-2 h-4 w-4" />
                              {t('roles.guest')}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    )}

                    {member.permissions?.canDelete && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedMember(member)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('actions.remove')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {member.event && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <CalendarLucide className="inline-block mr-1 h-4 w-4" />
                  {member.event.title}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <InviteDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvite={handleInvite}
      />

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onClose={() => {
          setIsMessageDialogOpen(false)
          setSelectedMember(null)
        }}
        onSend={handleSendMessage}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.remove.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.remove.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialogs.remove.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>
              {t('dialogs.remove.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
