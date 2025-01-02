import * as z from 'zod'

const locationSchema = z.object({
  name: z.string().optional(),
  country: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.coerce.date({
    required_error: 'Start date is required',
  }),
  endDate: z.coerce.date({
    required_error: 'End date is required',
  }),
  location: locationSchema.optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).default('DRAFT'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  maxAttendees: z.union([
    z.number().min(0).optional(),
    z.null(),
    z.undefined()
  ]).optional(),
  isPublic: z.boolean().optional().default(true),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PUBLIC'),
  
  // New fields
  categoryId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  coverImage: z.string().url().optional(),
  
  // Highlights
  highlights: z.array(
    z.object({
      text: z.string().min(1, 'Highlight text is required')
    })
  ).optional(),
  
  // Social sharing settings
  socialSharing: z.object({
    facebook: z.boolean().default(true),
    twitter: z.boolean().default(true),
    linkedin: z.boolean().default(true),
    customMessage: z.string().optional(),
  }).optional(),
})

export type EventFormValues = z.infer<typeof eventSchema> 