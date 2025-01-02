import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    console.log('Password reset requested for:', email)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    })

    console.log('User found:', user ? 'Yes' : 'No')

    // Always return the same response whether user exists or not
    // This prevents user enumeration
    const response = {
      success: true,
      message: "If an account exists with this email, you will receive a password reset link"
    }

    // If user doesn't exist, return success but don't send email
    if (!user) {
      console.log('No user found with email:', email)
      return NextResponse.json(response)
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    console.log('Generated reset token for user:', {
      email,
      tokenLength: resetToken.length,
      expiry: resetTokenExpiry
    })

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    console.log('Reset token saved to database')

    // Create reset link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`

    console.log('Reset link generated:', resetLink)

    // Send email
    try {
      await sendPasswordResetEmail({
        to: email,
        resetLink
      })
      console.log('Password reset email sent successfully')
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      throw emailError
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}
