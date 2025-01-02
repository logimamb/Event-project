import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Validate required environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email configuration missing: SMTP credentials not found')
    }

    // Create transporter with Gmail configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Log that we're attempting to send email (without sensitive data)
    console.log('Attempting to send email:', {
      to,
      subject,
      from: process.env.SMTP_USER,
    })

    // Send email
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    })

    console.log('Email sent successfully:', {
      messageId: result.messageId,
      response: result.response,
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Failed to send email:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        throw new Error('Email authentication failed: Please check your Gmail app password')
      }
      if (error.message.includes('connect')) {
        throw new Error('Failed to connect to Gmail: Please check your network connection')
      }
      throw error
    }

    throw new Error('Failed to send email: Unknown error occurred')
  }
} 