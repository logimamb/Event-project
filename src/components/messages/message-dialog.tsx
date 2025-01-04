'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface MessageDialogProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
}

export function MessageDialog({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}: MessageDialogProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both subject and message fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          subject,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast({
        title: 'Success',
        description: 'Message sent successfully!',
      })

      // Reset form and close dialog
      setSubject('')
      setMessage('')
      onClose()
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message to {recipientName}</DialogTitle>
          <DialogDescription>
            Send a direct message to this team member. They will receive it via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
              disabled={isSending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
