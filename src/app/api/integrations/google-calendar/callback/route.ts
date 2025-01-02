import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { oauth2Client } from '@/lib/google';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) {
      return new NextResponse('Missing authorization code', { status: 400 });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get primary calendar ID
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const { data: calendarList } = await calendar.calendarList.list();
    const primaryCalendar = calendarList.items?.find(cal => cal.primary);

    if (!primaryCalendar?.id) {
      throw new Error('Could not find primary calendar');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create or update calendar entry
    const userCalendar = await prisma.calendar.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: primaryCalendar.summary || 'Google Calendar',
        },
      },
      create: {
        userId: user.id,
        name: primaryCalendar.summary || 'Google Calendar',
      },
      update: {},
    });

    // Store tokens securely
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google-calendar',
          providerAccountId: user.id,
        },
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google-calendar',
        providerAccountId: user.id,
        access_token: tokens.access_token!,
        expires_at: Math.floor((tokens.expiry_date || 0) / 1000),
        refresh_token: tokens.refresh_token!,
        scope: tokens.scope!,
        token_type: tokens.token_type!,
      },
      update: {
        access_token: tokens.access_token!,
        expires_at: Math.floor((tokens.expiry_date || 0) / 1000),
        refresh_token: tokens.refresh_token!,
        scope: tokens.scope!,
        token_type: tokens.token_type!,
      },
    });

    // Redirect to settings page with success message
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: '/settings?integration=success',
      },
    });
  } catch (error) {
    console.error('Google Calendar Callback Error:', error);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: '/settings?integration=error',
      },
    });
  }
}