import twilio from 'twilio';
import prisma from './db';
import { sendEmail } from './email';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendNotification(
  userId: string,
  type: string,
  eventId?: string,
  activityId?: string
) {
  try {
    // Get user's notification settings
    const settings = await prisma.notificationSettings.findMany({
      where: {
        userId,
        type,
        enabled: true,
        OR: [
          { eventId: eventId || null },
          { activityId: activityId || null },
        ],
      },
      include: {
        user: true,
        event: true,
        activity: true,
      },
    });

    // Get event or activity details
    const event = eventId ? await prisma.event.findUnique({
      where: { id: eventId },
    }) : null;

    const activity = activityId ? await prisma.activity.findUnique({
      where: { id: activityId },
    }) : null;

    for (const setting of settings) {
      const { user, channel } = setting;
      const item = event || activity;
      
      if (!item || !user) continue;

      const message = `Reminder: ${item.title} starts in ${setting.timing} minutes.`;

      // Send email notification
      if (channel.includes('EMAIL') && user.email) {
        await sendEmail({
          to: user.email,
          subject: `Reminder: ${item.title}`,
          text: message,
          html: `
            <h2>Event Reminder</h2>
            <p>${message}</p>
            <p>Title: ${item.title}</p>
            <p>Start Time: ${item.startDate || item.startTime}</p>
            ${item.description ? `<p>Description: ${item.description}</p>` : ''}
          `,
        });
      }

      // Send SMS notification
      if (channel.includes('SMS') && user.phoneNumber) {
        await twilioClient.messages.create({
          body: message,
          to: user.phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER,
        });
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
}

export async function scheduleNotifications(
  userId: string,
  type: string,
  startTime: Date,
  eventId?: string,
  activityId?: string
) {
  try {
    const settings = await prisma.notificationSettings.findMany({
      where: {
        userId,
        type,
        enabled: true,
        OR: [
          { eventId: eventId || null },
          { activityId: activityId || null },
        ],
      },
    });

    for (const setting of settings) {
      const notificationTime = new Date(startTime.getTime() - setting.timing * 60000);
      
      // Here you would integrate with your preferred job scheduler
      // For example, using Bull queue or similar
      // This is a placeholder for the actual implementation
      console.log(`Scheduled notification for ${notificationTime.toISOString()}`);
      
      // Example scheduling logic:
      // await scheduleQueue.add({
      //   userId,
      //   type,
      //   eventId,
      //   activityId,
      //   scheduledFor: notificationTime,
      // });
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
} 