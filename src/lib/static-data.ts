import { add } from 'date-fns'
import { Event, Activity } from '@/types'

export const activityStatuses = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const

export const priorityLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export const eventStatuses = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const sampleEvents: Event[] = [
  {
    id: 'evt-001',
    title: 'Annual Tech Conference 2024',
    description: 'Join us for our annual technology conference featuring keynote speakers, workshops, and networking opportunities.',
    startDate: add(new Date(), { days: 30 }),
    endDate: add(new Date(), { days: 32 }),
    location: 'Convention Center, San Francisco',
    status: 'upcoming',
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
    activities: [
      {
        id: 'act-001',
        title: 'Keynote: Future of AI',
        description: 'Opening keynote presentation on artificial intelligence and its impact on software development.',
        startDate: add(new Date(), { days: 30, hours: 9 }),
        endDate: add(new Date(), { days: 30, hours: 10, minutes: 30 }),
        status: 'pending',
        priority: 'high',
        progress: 0,
        assignedTo: 'John Smith',
        location: 'Main Hall',
        maxParticipants: 500,
        eventId: 'evt-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        accessibility: {
          signLanguageInterpreter: true,
          captioning: true,
          audioDescription: true,
          wheelchairAccessible: true,
        },
      },
      {
        id: 'act-002',
        title: 'Workshop: Cloud Architecture',
        description: 'Hands-on workshop covering modern cloud architecture patterns and best practices.',
        startDate: add(new Date(), { days: 30, hours: 11 }),
        endDate: add(new Date(), { days: 30, hours: 13 }),
        status: 'pending',
        priority: 'high',
        progress: 0,
        assignedTo: 'Michael Chang',
        location: 'Workshop Room A',
        maxParticipants: 50,
        eventId: 'evt-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: ['Basic cloud knowledge', 'Laptop required'],
        materials: ['Workshop slides', 'Code repository'],
        equipment: ['Laptop', 'Development environment'],
      },
    ],
  },
  {
    id: 'evt-002',
    title: 'Web Development Workshop',
    description: 'Intensive workshop covering modern web development practices, including React, Next.js, and TypeScript.',
    startDate: add(new Date(), { days: 14 }),
    endDate: add(new Date(), { days: 14, hours: 8 }),
    location: 'Tech Hub, New York',
    status: 'upcoming',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    activities: [
      {
        id: 'act-003',
        title: 'React Fundamentals',
        description: 'Introduction to React core concepts and modern development practices.',
        startDate: add(new Date(), { days: 14, hours: 9 }),
        endDate: add(new Date(), { days: 14, hours: 12 }),
        status: 'pending',
        priority: 'medium',
        progress: 0,
        assignedTo: 'Sarah Johnson',
        location: 'Training Room 1',
        maxParticipants: 30,
        eventId: 'evt-002',
        createdAt: new Date(),
        updatedAt: new Date(),
        prerequisites: ['JavaScript knowledge', 'Basic web development'],
        materials: ['Slides', 'Exercise files'],
        equipment: ['Laptop', 'Code editor'],
        accessibility: {
          captioning: true,
          wheelchairAccessible: true,
        },
      },
    ],
  },
  {
    id: 'evt-003',
    title: 'Developer Community Meetup',
    description: 'Monthly community meetup for developers to share experiences and learn from each other.',
    startDate: add(new Date(), { days: 7 }),
    endDate: add(new Date(), { days: 7, hours: 3 }),
    location: 'Community Space, Austin',
    status: 'upcoming',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    activities: [
      {
        id: 'act-004',
        title: 'Lightning Talks',
        description: 'Series of short presentations on various programming topics.',
        startDate: add(new Date(), { days: 7, hours: 18 }),
        endDate: add(new Date(), { days: 7, hours: 19 }),
        status: 'pending',
        priority: 'medium',
        progress: 0,
        assignedTo: 'Community Team',
        location: 'Main Room',
        maxParticipants: 100,
        eventId: 'evt-003',
        createdAt: new Date(),
        updatedAt: new Date(),
        accessibility: {
          signLanguageInterpreter: true,
          wheelchairAccessible: true,
        },
      },
    ],
  },
] 