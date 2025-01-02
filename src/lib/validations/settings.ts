import * as z from 'zod'

// Profile Settings Schema
export const profileSettingsSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  organization: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal(''))
  })
})

// Event Settings Schema
export const eventSettingsSchema = z.object({
  defaultEventDuration: z.number().min(15).max(480),
  defaultEventVisibility: z.enum(['public', 'private', 'team']),
  autoAcceptInvites: z.boolean(),
  defaultReminders: z.array(z.object({
    type: z.enum(['email', 'notification']),
    time: z.number().min(0).max(10080) // max 7 days in minutes
  })),
  workingHours: z.object({
    enabled: z.boolean(),
    schedule: z.array(z.object({
      day: z.string(),
      start: z.string(),
      end: z.string()
    }))
  })
})

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  email: z.object({
    eventInvites: z.boolean(),
    eventReminders: z.boolean(),
    eventUpdates: z.boolean(),
    activityComments: z.boolean(),
    dailyDigest: z.boolean(),
    weeklyReport: z.boolean()
  }),
  push: z.object({
    enabled: z.boolean(),
    eventStart: z.boolean(),
    eventReminders: z.array(z.number()),
    mentions: z.boolean(),
    teamUpdates: z.boolean()
  }),
  sound: z.object({
    enabled: z.boolean(),
    volume: z.number().min(0).max(100),
    type: z.enum(['default', 'subtle', 'none'])
  })
})

// Privacy Settings Schema
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'team']),
  calendarVisibility: z.enum(['public', 'private', 'team']),
  activityVisibility: z.enum(['public', 'private', 'team']),
  showUpcomingEvents: z.boolean(),
  allowTagging: z.boolean(),
  allowComments: z.boolean()
})

// Display Settings Schema
export const displaySettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  density: z.enum(['comfortable', 'compact']),
  timeFormat: z.enum(['12h', '24h']),
  dateFormat: z.enum(['MMDDYYYY', 'DDMMYYYY', 'YYYYMMDD'])
})

// Security Settings Schema
export const securitySettingsSchema = z.object({
  twoFactorAuth: z.object({
    enabled: z.boolean(),
    method: z.enum(['app', 'sms', 'email'])
  }),
  loginNotifications: z.boolean(),
  sessionTimeout: z.number().min(15).max(240),
  trustedDevices: z.array(z.object({
    id: z.string(),
    name: z.string(),
    lastUsed: z.string()
  }))
})

// Integrations Settings Schema
export const integrationsSettingsSchema = z.object({
  googleCalendar: z.object({
    enabled: z.boolean(),
    syncFrequency: z.enum(['realtime', 'hourly', 'daily'])
  }),
  microsoftOutlook: z.object({
    enabled: z.boolean()
  }),
  slack: z.object({
    enabled: z.boolean(),
    channel: z.string().optional()
  }),
  zoom: z.object({
    enabled: z.boolean(),
    autoCreateMeeting: z.boolean()
  })
})
