import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
      select: {
        access_token: true,
        refresh_token: true,
        expires_at: true,
      },
    })

    if (!account?.access_token) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 })
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    )

    // Set credentials
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })

    // Check if token needs refresh
    if (account.expires_at && account.expires_at * 1000 < Date.now()) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken()
        await prisma.account.update({
          where: {
            provider_providerAccountId: {
              provider: 'google',
              providerAccountId: session.user.id,
            },
          },
          data: {
            access_token: credentials.access_token,
            expires_at: Math.floor((Date.now() + (credentials.expiry_date || 3600 * 1000)) / 1000),
            refresh_token: credentials.refresh_token || account.refresh_token,
          },
        })
      } catch (error) {
        console.error('Error refreshing token:', error)
        return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
      }
    }

    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Get list of calendars
    const { data } = await calendar.calendarList.list()

    return NextResponse.json({
      calendars: data.items?.map(calendar => ({
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        primary: calendar.primary || false,
      })) || [],
      hasIntegration: true,
    })
  } catch (error) {
    console.error('Error fetching calendars:', error)
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 })
  }
}
