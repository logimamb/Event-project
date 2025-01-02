import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's calendar credentials
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    })

    if (!account) {
      return new NextResponse('Calendar not connected', { status: 400 })
    }

    // Set up OAuth2 client with stored credentials
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      token_type: account.token_type,
      expiry_date: account.expires_at,
    })

    // Get user's events
    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
      include: {
        location: true,
      },
    })

    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Sync each event to Google Calendar
    for (const event of events) {
      try {
        await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: event.title,
            description: event.description || '',
            location: event.location?.address,
            start: {
              dateTime: event.startDate.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: event.endDate.toISOString(),
              timeZone: 'UTC',
            },
          },
        })
      } catch (eventError) {
        console.error(`Error syncing event ${event.id}:`, eventError)
        // Continue with other events even if one fails
      }
    }

    // Update user's preferences with sync status
    const preferences = await prisma.userPreferences.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        calendarLastSync: new Date(),
        calendarSyncEnabled: true,
      },
      create: {
        userId: session.user.id,
        calendarLastSync: new Date(),
        calendarSyncEnabled: true,
      },
    })

    return NextResponse.json({ 
      success: true,
      syncedEvents: events.length,
      lastSync: preferences.calendarLastSync?.toISOString(),
      syncEnabled: preferences.calendarSyncEnabled
    })
  } catch (error) {
    console.error('Google Calendar Sync Error:', error)
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    )
  }
}