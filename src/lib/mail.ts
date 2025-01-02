import nodemailer from 'nodemailer'
import { Event, EventMember } from '@prisma/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

interface EventInvitationParams {
  to: string
  event: {
    title: string
    description: string
    startTime: Date
    endTime: Date
    location: string
  }
  invitedBy: {
    name: string
    email: string
  }
  memberCode: string
  acceptUrl: string
}

interface PasswordResetParams {
  to: string
  resetLink: string
}

// Create reusable transporter
const createTransporter = () => {
  const emailFrom = process.env.EMAIL_FROM
  const emailServer = process.env.EMAIL_SERVER

  console.log('Email Config:', {
    emailFrom: emailFrom,
    emailServer: emailServer ? 'Configured' : 'Missing'
  })

  if (!emailFrom || !emailServer) {
    console.error('Missing email configuration:', { emailFrom, emailServer })
    return null
  }

  const [host, port, user, pass] = emailServer.split(':')

  if (!host || !port || !user || !pass) {
    console.error('Invalid EMAIL_SERVER format. Expected format: host:port:user:pass')
    return null
  }

  console.log('Creating transporter with:', {
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass: pass ? '****' : 'Missing'
    }
  })

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  })
}

const transporter = createTransporter()

// Verify transporter if it exists
if (transporter) {
  transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP Verification Error:', error)
    } else {
      console.log('SMTP Server is ready to take our messages')
    }
  })
} else {
  console.error('Failed to create email transporter')
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  console.log('Attempting to send email:', { to, subject })

  if (!transporter) {
    console.error('Email sending is disabled due to missing configuration')
    return null
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    }

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })

    const info = await transporter.sendMail(mailOptions)
    console.log('Message sent successfully:', {
      messageId: info.messageId,
      response: info.response
    })
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendEventInvitation({
  to,
  event,
  invitedBy,
  memberCode,
  acceptUrl,
}: EventInvitationParams) {
  const emailFrom = process.env.EMAIL_FROM
  if (!emailFrom) {
    console.warn('EMAIL_FROM is not set. Skipping email sending.')
    return
  }

  const formattedStartTime = format(new Date(event.startTime), 'PPPp', { locale: fr })
  const formattedEndTime = format(new Date(event.endTime), 'PPPp', { locale: fr })

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Invitation à un événement</h2>
      
      <p>Bonjour,</p>
      
      <p>${invitedBy.name} (${invitedBy.email}) vous invite à participer à l'événement suivant :</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">${event.title}</h3>
        ${event.description ? `<p style="color: #4b5563;">${event.description}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Début :</strong> ${formattedStartTime}</p>
        <p style="margin: 5px 0;"><strong>Fin :</strong> ${formattedEndTime}</p>
        ${event.location ? `<p style="margin: 5px 0;"><strong>Lieu :</strong> ${event.location}</p>` : ''}
      </div>
      
      <p>Pour rejoindre l'événement, cliquez sur le lien ci-dessous :</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${acceptUrl}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Rejoindre l'événement
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 0.875rem;">
        Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br>
        ${acceptUrl}
      </p>
      
      <p style="color: #6b7280; font-size: 0.875rem; margin-top: 40px;">
        Code membre : ${memberCode}<br>
        Ce code peut être utilisé pour vérifier votre invitation si nécessaire.
      </p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: `Invitation à l'événement : ${event.title}`,
      html: emailContent,
      text: `Vous avez été invité à l'événement "${event.title}" par ${invitedBy.name}. Pour rejoindre l'événement, visitez : ${acceptUrl}`,
    })

    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendPasswordResetEmail({ to, resetLink }: PasswordResetParams) {
  const subject = 'Reset Your Password'
  const text = `
    Reset Your Password
    
    You requested to reset your password. Click the link below to set a new password:
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
  `
  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
      <p style="color: #666; margin: 20px 0;">You requested to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; margin: 20px 0;">This link will expire in 1 hour.</p>
      <p style="color: #999; font-size: 0.9em;">If you didn't request this, please ignore this email.</p>
    </div>
  `

  return sendEmail({ to, subject, text, html })
}

type EventWithTemplate = Event & {
  design: {
    template: string;
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
    };
  } | null;
}

interface TemplateData {
  eventTitle: string
  eventDescription: string
  startDate: string
  endDate: string
  location: string
  memberName: string
  inviteUrl: string
  colors: {
    primary?: string
    secondary?: string
    background?: string
  }
}

function getEmailTemplate(template: string, data: TemplateData): string {
  switch (template.toLowerCase()) {
    case 'modern':
      return getModernTemplate(data)
    case 'minimal':
      return getMinimalTemplate(data)
    case 'playful':
      return getPlayfulTemplate(data)
    default:
      return getDefaultTemplate(data)
  }
}

function getDefaultTemplate(data: TemplateData): string {
  const { eventTitle, eventDescription, startDate, endDate, location, memberName, inviteUrl, colors } = data
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: ${colors.primary || '#4F46E5'};
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: ${colors.background || '#F9FAFB'};
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background-color: ${colors.secondary || '#6366F1'};
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin-top: 20px;
            text-align: center;
          }
          .details {
            margin: 20px 0;
            padding: 15px;
            background-color: white;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${eventTitle}</h1>
        </div>
        <div class="content">
          <p>Hello ${memberName},</p>
          <p>You've been invited to ${eventTitle}!</p>
          
          <div class="details">
            <p><strong>Description:</strong><br>${eventDescription}</p>
            <p><strong>Start:</strong> ${startDate}</p>
            <p><strong>End:</strong> ${endDate}</p>
            <p><strong>Location:</strong> ${location}</p>
          </div>

          <p>Please click the button below to respond to this invitation:</p>
          <a href="${inviteUrl}" class="button">Respond to Invitation</a>
          
          <p style="margin-top: 30px;">
            If you're having trouble with the button, copy and paste this link into your browser:<br>
            ${inviteUrl}
          </p>
        </div>
      </body>
    </html>
  `
}

function getModernTemplate(data: TemplateData): string {
  const { eventTitle, eventDescription, startDate, endDate, location, memberName, inviteUrl, colors } = data
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: ${colors.background || '#F9FAFB'};
          }
          .container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: ${colors.primary || '#4F46E5'};
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 32px;
          }
          .button {
            display: inline-block;
            background-color: ${colors.secondary || '#6366F1'};
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            margin-top: 24px;
            text-align: center;
          }
          .details {
            margin: 24px 0;
            padding: 20px;
            background-color: ${colors.background || '#F9FAFB'};
            border-radius: 8px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6B7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${eventTitle}</h1>
          </div>
          <div class="content">
            <p>Hello ${memberName},</p>
            <p>You've been invited to join us for an exciting event!</p>
            
            <div class="details">
              <p><strong>Description</strong><br>${eventDescription}</p>
              <p><strong>When</strong><br>
                Start: ${startDate}<br>
                End: ${endDate}
              </p>
              <p><strong>Where</strong><br>${location}</p>
            </div>

            <p>We would be delighted to have you join us. Please click the button below to respond:</p>
            <a href="${inviteUrl}" class="button">Respond to Invitation</a>
          </div>
          
          <div class="footer">
            <p>Having trouble with the button?<br>
            Copy this link to your browser: ${inviteUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getMinimalTemplate(data: TemplateData): string {
  const { eventTitle, eventDescription, startDate, endDate, location, memberName, inviteUrl, colors } = data
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #374151;
            max-width: 540px;
            margin: 0 auto;
            padding: 16px;
          }
          .container {
            background-color: white;
            padding: 24px;
          }
          h1 {
            color: ${colors.primary || '#4F46E5'};
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 24px 0;
          }
          .details {
            border-left: 3px solid ${colors.secondary || '#6366F1'};
            padding-left: 16px;
            margin: 24px 0;
          }
          .button {
            display: inline-block;
            background-color: ${colors.primary || '#4F46E5'};
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
          }
          .footer {
            margin-top: 24px;
            font-size: 14px;
            color: #6B7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${eventTitle}</h1>
          <p>Hello ${memberName},</p>
          <p>You're invited to join us.</p>
          
          <div class="details">
            <p>${eventDescription}</p>
            <p>
              Start: ${startDate}<br>
              End: ${endDate}<br>
              Location: ${location}
            </p>
          </div>

          <a href="${inviteUrl}" class="button">Respond</a>
          
          <div class="footer">
            <p>Alternative link: ${inviteUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function getPlayfulTemplate(data: TemplateData): string {
  const { eventTitle, eventDescription, startDate, endDate, location, memberName, inviteUrl, colors } = data
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
            line-height: 1.6;
            color: #2D3748;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: ${colors.background || '#F9FAFB'};
          }
          .container {
            background-color: white;
            border-radius: 20px;
            border: 3px dashed ${colors.primary || '#4F46E5'};
            padding: 24px;
            position: relative;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          h1 {
            color: ${colors.primary || '#4F46E5'};
            font-size: 32px;
            margin: 0;
            transform: rotate(-2deg);
          }
          .content {
            background-color: ${colors.background || '#F9FAFB'};
            border-radius: 16px;
            padding: 24px;
            margin: 24px 0;
          }
          .details {
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 4px 4px 0 ${colors.secondary || '#6366F1'};
          }
          .button {
            display: inline-block;
            background-color: ${colors.primary || '#4F46E5'};
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: bold;
            transform: rotate(2deg);
            transition: transform 0.2s;
            margin: 20px 0;
          }
          .button:hover {
            transform: rotate(-2deg) scale(1.05);
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #6B7280;
            margin-top: 32px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ${eventTitle} 🎉</h1>
          </div>
          
          <div class="content">
            <p>Hey ${memberName}! 👋</p>
            <p>You're invited to something awesome! 🌟</p>
            
            <div class="details">
              <p>📝 <strong>What's happening:</strong><br>${eventDescription}</p>
              <p>🗓️ <strong>When:</strong><br>
                Start: ${startDate}<br>
                End: ${endDate}
              </p>
              <p>📍 <strong>Where:</strong><br>${location}</p>
            </div>

            <center>
              <a href="${inviteUrl}" class="button">Join the Fun! 🎈</a>
            </center>
          </div>
          
          <div class="footer">
            <p>Can't click the button? No worries!<br>
            Copy this link: ${inviteUrl}</p>
          </div>
        </div>
      </body>
    </html>
  `
}
