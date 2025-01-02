import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

const calendar = google.calendar('v3');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { eventId } = body;

    // Get the event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        location: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get the user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'No Google account connected' },
        { status: 400 }
      );
    }

    // Set up Google Calendar API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: account.access_token });

    // Create the event in Google Calendar
    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: 'UTC', // You might want to get this from user preferences
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: 'UTC',
      },
      location: event.location
        ? `${event.location.address}, ${event.location.city}, ${event.location.country}`
        : undefined,
    };

    const response = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      requestBody: googleEvent,
    });

    // Update the event with the Google Calendar event ID
    await prisma.event.update({
      where: { id: eventId },
      data: {
        calendarId: response.data.id,
        // googleCalendarEventId: response.data.id,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { eventId } = body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        location: true,
      },
    });

    if (!event || !event.calendarId) {
      return NextResponse.json(
        { error: 'Event not found or not synced with Google Calendar' },
        { status: 404 }
      );
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'No Google account connected' },
        { status: 400 }
      );
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: account.access_token });

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: 'UTC',
      },
      location: event.location
        ? `${event.location.address}, ${event.location.city}, ${event.location.country}`
        : undefined,
    };

    const response = await calendar.events.update({
      auth,
      calendarId: 'primary',
      eventId: event.calendarId,
      requestBody: googleEvent,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update Google Calendar event' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || !event.calendarId) {
      return NextResponse.json(
        { error: 'Event not found or not synced with Google Calendar' },
        { status: 404 }
      );
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'No Google account connected' },
        { status: 400 }
      );
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: account.access_token });

    await calendar.events.delete({
      auth,
      calendarId: 'primary',
      eventId: event.calendarId,
    });

    // Remove the Google Calendar event ID from the event
    await prisma.event.update({
      where: { id: eventId },
      data: {
        calendarId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete Google Calendar event' },
      { status: 500 }
    );
  }
} 