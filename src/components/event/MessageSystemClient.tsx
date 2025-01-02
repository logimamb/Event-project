'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from '@/lib/use-translations'
import { formatDateTime } from '@/lib/utils'

interface Message {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface MessageSystemProps {
  eventId: string
  canSendMessages: boolean
  canManageMessages: boolean
}

export function MessageSystemClient({ 
  eventId, 
  canSendMessages, 
  canManageMessages 
}: MessageSystemProps) {
  const { t } = useTranslations()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    // Set up polling for new messages
    const interval = setInterval(loadMessages, 10000)
    return () => clearInterval(interval)
  }, [eventId])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/messages`)
      if (!response.ok) throw new Error('Failed to load messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session?.user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const message = await response.json()
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm(t('confirmDeleteMessage'))) return

    try {
      const response = await fetch(`/api/events/${eventId}/messages/${messageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete message')

      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      toast({
        title: 'Success',
        description: t('messageDeleted')
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: t('failedToDeleteMessage'),
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{t('messages')}</h2>
      
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollRef}
        className="h-[400px] pr-4 mb-4"
      >
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t('noMessages')}
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                {/* User Avatar */}
                {message.user.image ? (
                  <img
                    src={message.user.image}
                    alt={message.user.name || ''}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {message.user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                
                {/* Message Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{message.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                    {(canManageMessages || message.user.id === session?.user?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1">{message.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      {canSendMessages && (
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('typeMessage')}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {t('send')}
          </Button>
        </form>
      )}
    </Card>
  )
} 
