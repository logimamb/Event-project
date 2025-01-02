'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { UserPlus } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddParticipantFormProps {
  activityId: string
  capacity: number
  currentParticipants: number
  onParticipantAdded: () => void
}

export function AddParticipantForm({
  activityId,
  capacity,
  currentParticipants,
  onParticipantAdded
}: AddParticipantFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  })

  async function onSubmit(data: FormData) {
    if (currentParticipants >= capacity) {
      toast({
        title: 'Error',
        description: 'Activity is at full capacity',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/activities/${activityId}/participants/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to add participant')
      }

      const result = await response.json()

      toast({
        title: 'Success',
        description: 'Participant invitation sent successfully',
      })

      form.reset()
      onParticipantAdded()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add participant',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="participant@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Participant name" />
              </FormControl>
              <FormDescription>
                The participant's name will be included in their invitation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            "Adding..."
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Participant
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
