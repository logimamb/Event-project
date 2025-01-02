import { google } from 'googleapis';
import { prisma } from './prisma';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/integrations/google-calendar/callback`
);

export async function getGoogleCalendarClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: 'google',
    },
  });

  if (!account) {
    console.log('No Google Calendar integration found for user');
    return null;
  }

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? Number(account.expires_at) * 1000 : undefined,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function getUserCalendars(userId: string) {
  try {
    const calendar = await getGoogleCalendarClient(userId);
    if (!calendar) return null;

    const response = await calendar.calendarList.list();

    return response.data.items?.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
    })) || [];
  } catch (error) {
    console.error('Error fetching user calendars:', error);
    throw error;
  }
}

interface GoogleCalendarEventData {
  title: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  location?: {
    address?: string;
  };
  calendarId?: string; // New optional parameter
}

export async function createGoogleCalendarEvent(userId: string, eventData: GoogleCalendarEventData) {
  try {
    const calendar = await getGoogleCalendarClient(userId);
    if (!calendar) return null;

    // If no calendarId is provided, first try to get user's calendars
    let targetCalendarId = eventData.calendarId;
    if (!targetCalendarId) {
      const calendars = await calendar.calendarList.list();
      // Use primary calendar if available, otherwise use the first calendar in the list
      targetCalendarId = calendars.data.items?.find(cal => cal.primary)?.id || 
                        calendars.data.items?.[0]?.id ||
                        'primary';
    }

    // Create event in Google Calendar
    const googleEvent = await calendar.events.insert({
      calendarId: targetCalendarId,
      requestBody: {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: new Date(eventData.startDate).toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(eventData.endDate).toISOString(),
          timeZone: 'UTC',
        },
        location: eventData.location?.address,
      },
    });

    return {
      ...googleEvent.data,
      calendarId: targetCalendarId
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
}

export async function updateGoogleCalendarEvent(userId: string, eventId: string, eventData: GoogleCalendarEventData, calendarId?: string) {
  try {
    const calendar = await getGoogleCalendarClient(userId);
    if (!calendar) return null;

    const googleEvent = await calendar.events.update({
      calendarId: calendarId || 'primary',
      eventId: eventId,
      requestBody: {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: new Date(eventData.startDate).toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(eventData.endDate).toISOString(),
          timeZone: 'UTC',
        },
        location: eventData.location?.address,
      },
    });

    return googleEvent.data;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
}

export async function deleteGoogleCalendarEvent(userId: string, eventId: string, calendarId?: string) {
  try {
    const calendar = await getGoogleCalendarClient(userId);
    if (!calendar) return;

    await calendar.events.delete({
      calendarId: calendarId || 'primary',
      eventId: eventId,
    });
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
}
