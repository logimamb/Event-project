import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Twilio } from 'twilio';
import nodemailer from 'nodemailer';

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { contacts, method } = await req.json();
    const { eventId } = params;

    // Check if event exists and user has permission
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        location: true,
      }
    });

    if (!event) {
      return new NextResponse('Event not found or unauthorized', { status: 404 });
    }

    const invites = [];
    const errors = [];

    for (const contact of contacts) {
      try {
        // Create invite record
        const invite = await prisma.eventInvite.create({
          data: {
            eventId,
            contactId: contact.id,
            type: method,
          }
        });

        // Send invitation based on method
        if (method === 'EMAIL' && contact.email) {
          // Send email using Gmail
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: contact.email,
            subject: `Invitation: ${event.title}`,
            html: `
              <h1>You're invited to ${event.title}!</h1>
              <p>${event.description || ''}</p>
              <p>When: ${event.startDate.toLocaleString()}</p>
              ${event.location ? `<p>Where: ${event.location.address}</p>` : ''}
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}/invite/${invite.id}">
                Respond to Invitation
              </a>
            `,
          });
        } else if (method === 'SMS' && contact.phone) {
          await twilioClient.messages.create({
            body: `You're invited to ${event.title}! View and respond to the invitation here: ${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}/invite/${invite.id}`,
            to: contact.phone,
            from: process.env.TWILIO_PHONE_NUMBER,
          });
        }

        invites.push(invite);
      } catch (error) {
        console.error(`Failed to send invite to ${contact.name}:`, error);
        errors.push({
          contact: contact.name,
          error: 'Failed to send invitation',
        });
      }
    }

    return NextResponse.json({
      success: true,
      invites,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in event invite:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { inviteIds } = await req.json();
    const { eventId } = params;

    // Check if event exists and user has permission
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
    });

    if (!event) {
      return new NextResponse('Event not found or unauthorized', { status: 404 });
    }

    // Delete invites
    await prisma.eventInvite.deleteMany({
      where: {
        id: { in: inviteIds },
        eventId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Invites deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invites:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { inviteIds, action } = await req.json();
    const { eventId } = params;

    // Check if event exists and user has permission
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
    });

    if (!event) {
      return new NextResponse('Event not found or unauthorized', { status: 404 });
    }

    // Update invites based on action
    if (action === 'block') {
      await prisma.$transaction([
        // Update invite status
        prisma.eventInvite.updateMany({
          where: { id: { in: inviteIds }, eventId },
          data: { status: 'BLOCKED' },
        }),
        // Block contacts
        prisma.contact.updateMany({
          where: {
            invites: {
              some: {
                id: { in: inviteIds },
                eventId,
              },
            },
          },
          data: { blocked: true },
        }),
      ]);
    } else if (action === 'hide') {
      await prisma.$transaction([
        prisma.eventInvite.updateMany({
          where: { id: { in: inviteIds }, eventId },
          data: { status: 'HIDDEN' },
        }),
        prisma.contact.updateMany({
          where: {
            invites: {
              some: {
                id: { in: inviteIds },
                eventId,
              },
            },
          },
          data: { hidden: true },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: `Invites ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Error updating invites:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
