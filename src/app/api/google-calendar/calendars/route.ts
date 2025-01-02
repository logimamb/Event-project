import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user)
    
    if (!session?.user?.id) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has Google Calendar integration
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    })
    
    console.log('Google Account:', account ? {
      userId: account.userId,
      provider: account.provider,
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      expiresAt: account.expires_at
    } : 'No account found')

    if (!account) {
      return NextResponse.json({ calendars: [], hasIntegration: false })
    }

    // Convert expires_at to number if it's a BigInt
    const expiryDate = account.expires_at 
      ? Number(account.expires_at) * 1000 // Convert seconds to milliseconds
      : undefined

    // Set up OAuth2 client with the stored credentials
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: expiryDate,
    })

    console.log('Fetching calendars...')
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const response = await calendar.calendarList.list()
    console.log('Calendars found:', response.data.items?.length || 0)

    const calendars = response.data.items?.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
    })) || []

    return NextResponse.json({ calendars, hasIntegration: true })
  } catch (error) {
    console.error('Error fetching calendars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    )
  }
}
