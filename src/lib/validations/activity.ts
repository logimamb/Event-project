import * as z from 'zod'

export const activitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startTime: z.union([
    z.string().transform((val) => new Date(val)),
    z.date()
  ]).refine((date) => !isNaN(date.getTime()), {
    message: "Invalid date format"
  }),
  endTime: z.union([
    z.string().transform((val) => new Date(val)),
    z.date()
  ]).refine((date) => !isNaN(date.getTime()), {
    message: "Invalid date format"
  }),
  eventId: z.string().min(1, 'Event ID is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING')
})

export type ActivityFormData = z.infer<typeof activitySchema>