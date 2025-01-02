import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { sendEmail } from '@/lib/email'

export async function POST(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { email, name } = await req.json()

    // Check if activity exists and has capacity
    const activity = await prisma.activity.findUnique({
      where: { id: params.activityId },
      select: {
        id: true,
        title: true,
        capacity: true,
        currentParticipants: true,
        startTime: true,
        endTime: true,
        location: true,
      }
    })

    if (!activity) {
      return new NextResponse('Activity not found', { status: 404 })
    }

    if (activity.currentParticipants >= activity.capacity) {
      return new NextResponse('Activity is at full capacity', { status: 400 })
    }

    // Check if participant already exists
    const existingParticipant = await prisma.activityParticipant.findUnique({
      where: {
        activityId_email: {
          activityId: params.activityId,
          email: email,
        }
      }
    })

    if (existingParticipant) {
      return new NextResponse('Participant already exists', { status: 400 })
    }

    // Create participant with unique code
    const participant = await prisma.activityParticipant.create({
      data: {
        activityId: params.activityId,
        email,
        name,
        status: 'PENDING',
      }
    })

    // Generate QR code
    const qrCodeData = {
      participantId: participant.id,
      uniqueCode: participant.uniqueCode,
      activityId: params.activityId,
    }
    
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData))

    // Update participant with QR code
    await prisma.activityParticipant.update({
      where: { id: participant.id },
      data: { qrCode: qrCodeUrl }
    })

    // Increment participant count
    await prisma.activity.update({
      where: { id: params.activityId },
      data: { currentParticipants: { increment: 1 } }
    })

    // Send email invitation
    const emailHtml = `
      <h1>You've been invited to an activity!</h1>
      <p>Hello ${name || 'there'},</p>
      <p>You've been invited to participate in: ${activity.title}</p>
      <p>Details:</p>
      <ul>
        <li>Date: ${activity.startTime.toLocaleDateString()}</li>
        <li>Time: ${activity.startTime.toLocaleTimeString()} - ${activity.endTime.toLocaleTimeString()}</li>
        ${activity.location ? `<li>Location: ${activity.location}</li>` : ''}
      </ul>
      <p>Your unique participation code is: ${participant.uniqueCode}</p>
      <p>Please keep this code safe as you'll need it to check in.</p>
      <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
    `

    await sendEmail({
      to: email,
      subject: `Invitation to ${activity.title}`,
      html: emailHtml,
    })

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error inviting participant:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
