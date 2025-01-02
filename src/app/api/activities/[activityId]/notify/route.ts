import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(
  req: Request,
  { params }: { params: { activityId: string } }
) {
  try {
    const { type, changes } = await req.json()
    const activityId = params.activityId

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    // Get all participant emails
    const participantEmails = activity.participants.map(participant => 
      participant.user?.email || participant.email
    ).filter(Boolean) as string[]

    let subject = ""
    let content = ""

    switch (type) {
      case "update":
        subject = `Activity "${activity.title}" has been updated`
        content = `The activity "${activity.title}" has been updated with the following changes:\n\n${changes}`
        break
      case "delete":
        subject = `Activity "${activity.title}" has been cancelled`
        content = `The activity "${activity.title}" has been cancelled.`
        break
      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        )
    }

    // Send email to all participants
    await Promise.all(
      participantEmails.map(email =>
        sendEmail({
          to: email,
          subject,
          html: content.replace(/\n/g, "<br>")
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending notifications:", error)
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    )
  }
}
