'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface JoinEventFormProps {
  eventId: string
  slug: string
}

export function JoinEventForm({ eventId, slug }: JoinEventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [notifyMe, setNotifyMe] = useState(true)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          email,
          notifyMe,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to join event')
      }

      toast({
        title: 'Success',
        description: 'You have successfully joined the event!',
      })

      router.refresh()
      router.push(`/events/${slug}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join event. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notifyMe}
              onCheckedChange={(checked) => setNotifyMe(checked as boolean)}
            />
            <Label htmlFor="notify" className="text-sm">
              Notify me about event updates
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Event'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
