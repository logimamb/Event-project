'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from '@/components/ui/use-toast'
import { feedbackSchema } from '@/lib/validations/feedback'
import { StarRating } from './star-rating'

interface FeedbackFormProps {
  eventId?: string
  onSuccess?: () => void
}

export function FeedbackForm({ eventId, onSuccess }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      content: '',
      rating: 5,
      eventId,
      type: 'GENERAL',
    },
  })

  async function onSubmit(data: z.infer<typeof feedbackSchema>) {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      toast({
        title: 'Success',
        description: 'Thank you for your feedback!',
      })

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        aria-label="Feedback form"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Feedback</FormLabel>
              <FormDescription>
                Select the category that best matches your feedback
              </FormDescription>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger aria-label="Select feedback type">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GENERAL">General Feedback</SelectItem>
                  <SelectItem value="EVENT">Event Feedback</SelectItem>
                  <SelectItem value="BUG_REPORT">Report a Bug</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormDescription>
                How would you rate your overall experience?
              </FormDescription>
              <FormControl>
                <StarRating
                  value={field.value}
                  onChange={field.onChange}
                  aria-label="Rate your experience from 1 to 5 stars"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormDescription>
                Share your thoughts, suggestions, or report any issues you've encountered
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts..."
                  {...field}
                  aria-label="Enter your feedback"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          aria-label={isSubmitting ? "Submitting feedback..." : "Submit feedback"}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </Form>
  )
}
