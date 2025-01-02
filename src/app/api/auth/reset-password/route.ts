import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = resetPasswordSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal whether a user exists
      return NextResponse.json({
        message: 'If an account exists with that email, we sent a password reset link.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    // Store reset token in database
    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token: hashedResetToken,
        expires: resetTokenExpiry,
      },
    })

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${resetToken}`
    // await sendResetPasswordEmail(user.email!, resetUrl)

    return NextResponse.json({
      message: 'If an account exists with that email, we sent a password reset link.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
