import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const confirmSchema = z.object({
  phoneNumber: z.string().min(10),
  code: z.string().length(6)
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { phoneNumber, code } = confirmSchema.parse(body)

    // Find verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: session.user.id,
        phoneNumber,
        code,
        expiresAt: {
          gt: new Date()
        },
        used: false
      }
    })

    if (!verificationCode) {
      return new NextResponse('Invalid or expired verification code', { status: 400 })
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true }
    })

    // Update user's phone number
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phoneNumber }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error confirming verification code:', error)
    return new NextResponse(
      error instanceof z.ZodError 
        ? 'Invalid request data' 
        : 'Failed to confirm verification code',
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
} 