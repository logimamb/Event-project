import * as z from 'zod'

export const feedbackSchema = z.object({
  content: z.string().min(1, 'Feedback content is required'),
  rating: z.number().min(1).max(5),
  eventId: z.string().optional(),
  userId: z.string(),
  type: z.enum(['EVENT', 'GENERAL', 'BUG_REPORT']),
})

export type FeedbackFormValues = z.infer<typeof feedbackSchema>
