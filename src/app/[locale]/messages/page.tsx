'use client'

import { useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import useSWR from 'swr'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import {
  Inbox,
  Search,
  Send,
  Star,
  Archive,
  Filter,
  MessageSquare,
  Loader2,
  X
} from 'lucide-react'
import { NewMessageDialog } from '@/components/messages/new-message-dialog'
import { MessageItem } from '@/components/messages/message-item'
import { cn } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'
import toast from 'react-hot-toast'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const t = useTranslations('messages')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [showStarred, setShowStarred] = useState(false)

  const { data: messages = [], mutate: mutateMessages, error: messagesError, isLoading: messagesLoading } = useSWR(
    session?.user?.id ? '/api/messages' : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      onError: (error) => {
        console.error('Error fetching messages:', error)
        toast.error(t('error_loading_messages'))
      }
    }
  )

  console.log('Initial messages:', messages)

  const { data: users = [], error: usersError, isLoading: usersLoading } = useSWR(
    session?.user?.id ? '/api/users' : null,
    fetcher,
    {
      onError: (error) => {
        console.error('Error fetching users:', error)
        toast.error(t('error_loading_users'))
      }
    }
  )

  const handleMessageSent = useCallback(async () => {
    try {
      console.log('Message sent, refreshing data...')
      await mutateMessages()
      toast.success(t('message_sent'))
    } catch (error) {
      console.error('Error refreshing messages:', error)
      toast.error(t('error_refreshing_messages'))
    }
  }, [mutateMessages, t])

  const handleStarMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}/star`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to star message')
      }

      await mutateMessages()
    } catch (error) {
      console.error('Error starring message:', error)
      toast.error(t('error_starring_message'))
    }
  }

  const handleArchiveMessage = async (id: string) => {
    try {
      // Find the current message
      const currentMessage = messages.find(msg => msg.id === id)
      if (!currentMessage) return

      console.log('Archiving message:', id, 'Current archived status:', currentMessage.isArchived)

      // Optimistically update UI with toggled archive status
      const updatedMessages = messages.map(msg => 
        msg.id === id ? { ...msg, isArchived: !msg.isArchived } : msg
      )
      
      // Update local state immediately
      mutateMessages(updatedMessages, false)

      const response = await fetch(`/api/messages/${id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to archive message')
      }

      // Get the updated message from the response
      const updatedMessage = await response.json()
      console.log('Server response:', updatedMessage)
      
      // Update the local state with the server response
      const finalMessages = messages.map(msg => 
        msg.id === id ? updatedMessage : msg
      )
      
      mutateMessages(finalMessages, false)
      
      toast.success(updatedMessage.isArchived ? t('message_archived') : t('message_unarchived'))
    } catch (error) {
      console.error('Error archiving message:', error)
      // Revert optimistic update on error
      await mutateMessages()
      toast.error(t('error_archiving_message'))
    }
  }

  // First, apply all filters except user-specific ones
  const filteredMessages = messages.filter(message => {
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const sender = message.fromUser || message.sender || {}
      const receiver = message.toUser || message.receiver || {}
      const matchesSubject = message.subject?.toLowerCase().includes(searchLower)
      const matchesContent = message.content?.toLowerCase().includes(searchLower)
      const matchesSender = sender.name?.toLowerCase().includes(searchLower)
      const matchesReceiver = receiver.name?.toLowerCase().includes(searchLower)
      if (!matchesSubject && !matchesContent && !matchesSender && !matchesReceiver) {
        return false
      }
    }

    // Apply type filter
    if (selectedType && message.type !== selectedType) return false
    
    // Apply priority filter
    if (selectedPriority && message.priority !== selectedPriority) return false
    
    // Apply category filter
    if (selectedCategory && message.category !== selectedCategory) return false
    
    // Apply starred filter
    if (showStarred && !message.isStarred) return false
    
    // Apply archived filter - only show archived messages when showArchived is true
    if (!showArchived && message.isArchived) return false

    return true
  })

  // Then split into inbox and sent, maintaining the archive filter
  const inboxMessages = filteredMessages.filter(message => {
    const receiverId = message.toUser?.id || message.receiver?.id
    return receiverId === session?.user?.id
  })

  const sentMessages = filteredMessages.filter(message => {
    const senderId = message.fromUser?.id || message.sender?.id
    return senderId === session?.user?.id
  })

  // All messages should also respect the archive filter
  const allMessages = filteredMessages

  console.log('Message counts:', {
    total: messages.length,
    filtered: filteredMessages.length,
    inbox: inboxMessages.length,
    sent: sentMessages.length,
    all: allMessages.length,
    showArchived,
    archivedCount: messages.filter(m => m.isArchived).length
  })

  const loading = messagesLoading || usersLoading

  return (
    <DashboardLayout>
      <Tabs defaultValue="inbox" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="h-auto p-1 w-full sm:w-auto">
            <TabsTrigger value="inbox" className="gap-2 flex-1 sm:flex-none">
              <Inbox className="h-4 w-4 hidden sm:block" />
              <span className="truncate">
                {t('inbox')} ({inboxMessages.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2 flex-1 sm:flex-none">
              <Send className="h-4 w-4 hidden sm:block" />
              <span className="truncate">
                {t('sent')} ({sentMessages.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2 flex-1 sm:flex-none">
              <MessageSquare className="h-4 w-4 hidden sm:block" />
              <span className="truncate">
                {t('all')} ({allMessages.length})
              </span>
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowArchived(!showArchived)}
              className={cn(showArchived && "bg-muted")}
              title={showArchived ? t('hide_archived') : t('show_archived')}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowStarred(!showStarred)}
              className={cn(showStarred && "bg-muted")}
              title={showStarred ? t('show_all') : t('show_starred')}
            >
              <Star className="h-4 w-4" />
            </Button>
            <NewMessageDialog users={users} onMessageSent={handleMessageSent} className="flex-1 sm:flex-none" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search_placeholder')}
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4" />
                  <span className="truncate">
                    {t('filters')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('message_type')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedType || ''} onValueChange={(value) => setSelectedType(value || null)}>
                  <DropdownMenuRadioItem value="">{t('all')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="DIRECT">{t('direct')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="TEAM">{t('team')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ANNOUNCEMENT">{t('announcement')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="TASK">{t('task')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="EVENT">{t('event')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="REMINDER">{t('reminder')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="FEEDBACK">{t('feedback')}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('priority')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedPriority || ''} onValueChange={(value) => setSelectedPriority(value || null)}>
                  <DropdownMenuRadioItem value="">{t('all')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="LOW">{t('low')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="MEDIUM">{t('medium')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="HIGH">{t('high')}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('category')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || null)}>
                  <DropdownMenuRadioItem value="">{t('all')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="GENERAL">{t('general')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PROJECT">{t('project')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="MEETING">{t('meeting')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="TASK">{t('task')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="EVENT">{t('event')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="FEEDBACK">{t('feedback')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="APPROVAL">{t('approval')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="REPORT">{t('report')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ANNOUNCEMENT">{t('announcement')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="QUESTION">{t('question')}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {(selectedType || selectedPriority || selectedCategory) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedType(null)
                  setSelectedPriority(null)
                  setSelectedCategory(null)
                }}
                className="gap-2 hidden sm:flex"
              >
                <X className="h-4 w-4" />
                {t('clear_filters')}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <TabsContent value="inbox" className="m-0">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : inboxMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <Inbox className="h-12 w-12 mb-4" />
                  <p>{t('no_messages')}</p>
                </div>
              ) : (
                inboxMessages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    session={session}
                    onStar={() => handleStarMessage(message.id)}
                    onArchive={() => handleArchiveMessage(message.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="m-0">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : sentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <Send className="h-12 w-12 mb-4" />
                  <p>{t('no_messages')}</p>
                </div>
              ) : (
                sentMessages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    session={session}
                    onStar={() => handleStarMessage(message.id)}
                    onArchive={() => handleArchiveMessage(message.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="m-0">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : allMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p>{t('no_messages')}</p>
                </div>
              ) : (
                allMessages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    session={session}
                    onStar={() => handleStarMessage(message.id)}
                    onArchive={() => handleArchiveMessage(message.id)}
                  />
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Card>
      </Tabs>
    </DashboardLayout>
  )
}
