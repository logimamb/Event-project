import { MessageSystemClient } from './MessageSystemClient'

interface MessageSystemProps {
  eventId: string
  canSendMessages: boolean
  canManageMessages: boolean
}

export function MessageSystem({ 
  eventId, 
  canSendMessages, 
  canManageMessages 
}: MessageSystemProps) {
  return (
    <MessageSystemClient
      eventId={eventId}
      canSendMessages={canSendMessages}
      canManageMessages={canManageMessages}
    />
  )
} 
