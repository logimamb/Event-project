import { PrismaClient } from '@prisma/client'
import { add } from 'date-fns'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          create: {
            theme: 'system',
            fontSize: 'medium',
            reduceMotion: false,
            highContrast: false,
            screenReaderOptimized: false,
            language: 'en',
            notificationPrefs: {
              email: true,
              push: true,
              eventReminders: true,
              invitationUpdates: true
            }
          }
        }
      }
    })

    // Create some tags
    const tags = await Promise.all([
      prisma.tag.create({
        data: {
          name: 'Conference',
          color: '#FF5733'
        }
      }),
      prisma.tag.create({
        data: {
          name: 'Workshop',
          color: '#33FF57'
        }
      })
    ])

    // Create an event with sharing features
    const event1 = await prisma.event.create({
      data: {
        title: 'Annual Tech Conference',
        description: 'Join us for our annual technology conference featuring industry experts.',
        startDate: add(new Date(), { days: 30 }),
        endDate: add(new Date(), { days: 32 }),
        location: {
          create: {
            name: 'Convention Center',
            address: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            postalCode: '94105'
          }
        },
        status: 'DRAFT',
        priority: 'HIGH',
        userId: user.id,
        visibility: 'PUBLIC',
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
            memberCode: `mem_${nanoid(10)}`
          }
        },
        capacity: 1000,
        tags: {
          connect: [{ id: tags[0].id }]
        },
        accessibility: {
          create: {
            signLanguageInterpreter: true,
            captioning: true,
            audioDescription: true,
            wheelchairAccessible: true,
            assistiveTechnology: ['Screen Reader', 'Speech-to-Text'],
            translationServices: ['Spanish', 'French'],
            accessibleMaterials: ['Braille', 'Large Print'],
            personalAssistance: true,
            dietaryAccommodations: true,
            parkingAccess: true,
            restroomAccess: true,
            sensoryConsiderations: true,
            notes: 'Please contact us for specific accommodation requests.'
          }
        },
        virtualAccess: {
          create: {
            streamingUrl: 'https://stream.example.com/conference',
            platformName: 'Zoom',
            accessInstructions: 'Click the link to join. Closed captions available.',
            technicalSupport: 'support@example.com'
          }
        },
        sharedLinks: {
          create: [
            {
              userId: user.id,
              token: nanoid(10),
              expiresAt: add(new Date(), { months: 1 }),
              isActive: true
            }
          ]
        },
        invitations: {
          create: [
            {
              userId: user.id,
              email: 'invited@example.com',
              token: nanoid(10),
              expiresAt: add(new Date(), { weeks: 1 }),
              message: 'Would love to have you join our conference!'
            }
          ]
        },
        waitingList: {
          create: [
            {
              email: 'waiting@example.com',
              name: 'Waiting User',
              position: 1,
              status: 'waiting'
            }
          ]
        },
        activities: {
          create: [
            {
              title: 'Registration and Check-in',
              description: 'Welcome attendees and distribute conference materials',
              startDate: add(new Date(), { days: 30, hours: 8 }),
              endDate: add(new Date(), { days: 30, hours: 10, minutes: 30 }),
              status: 'pending',
              priority: 'high',
              progress: 0,
              userId: user.id,
              assignedTo: 'Registration Team',
              location: 'Main Entrance',
              maxParticipants: 500,
              materials: ['Name badges', 'Conference guides'],
              equipment: ['Check-in tablets', 'Printers'],
              accessibility: {
                wheelchairAccessible: true,
                assistanceAvailable: true,
                signLanguageInterpreter: true
              }
            }
          ]
        }
      }
    })

    // Create attendees for the event
    await prisma.attendee.create({
      data: {
        email: 'attendee@example.com',
        name: 'John Doe',
        status: 'accepted',
        role: 'attendee',
        eventId: event1.id,
        accessibility: {
          requiresWheelchairAccess: true,
          dietaryRestrictions: 'Vegetarian',
          assistiveTechnologyNeeded: ['Screen Reader']
        }
      }
    })

    // Create default event categories
    const categories = [
      {
        name: 'Conference',
        description: 'Professional conferences and seminars',
        color: '#FF5733',
        icon: '🎤'
      },
      {
        name: 'Workshop',
        description: 'Interactive learning sessions',
        color: '#33FF57',
        icon: '🛠️'
      },
      {
        name: 'Social',
        description: 'Social gatherings and meetups',
        color: '#3357FF',
        icon: '🎉'
      },
      {
        name: 'Sports',
        description: 'Sports and fitness events',
        color: '#FFC300',
        icon: '⚽'
      }
    ];

    console.log('Start seeding...');
    
    for (const category of categories) {
      const existingCategory = await prisma.eventCategory.findUnique({
        where: { name: category.name }
      });

      if (!existingCategory) {
        await prisma.eventCategory.create({
          data: category
        });
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }

    console.log('Seeding finished.');

    console.log('Seed data created successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 