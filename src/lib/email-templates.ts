import { Event } from '@/types'

interface EmailTemplateProps {
  event: Event
  token?: string
  message?: string
  includeAccessibility?: boolean
}

interface ActivityEmailTemplateProps {
  activity: any
  token: string
  message?: string
  includeAccessibility?: boolean
}

export function getEventEmailTemplate({
  event,
  token,
  message,
  includeAccessibility,
}: EmailTemplateProps): string {
  const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}/share${token ? `?token=${token}` : ''}`

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'TBD'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString()
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Invitation: ${event.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 0.875rem;
          color: #6c757d;
        }
        .accessibility {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>You're invited to ${event.title}</h1>
      </div>
      
      <div class="content">
        <p>${event.description || ''}</p>
        
        <h2>Event Details</h2>
        <p><strong>Date:</strong> ${formatDate(event.startDate)} - ${formatDate(event.endDate)}</p>
        <p><strong>Location:</strong> ${event.location?.name || 'TBD'}</p>
        ${event.location?.address ? `<p><strong>Address:</strong> ${event.location.address}</p>` : ''}
        ${event.category ? `<p><strong>Category:</strong> ${event.category.name}</p>` : ''}
        
        ${message ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
            <h3>Personal Message</h3>
            <p>${message}</p>
          </div>
        ` : ''}
        
        ${includeAccessibility && event.activities?.some(activity => activity.accessibility) ? `
          <div class="accessibility">
            <h3>Activities with Accessibility Features</h3>
            ${event.activities
              .filter(activity => activity.accessibility)
              .map(activity => `
                <div style="margin-bottom: 15px;">
                  <h4>${activity.title}</h4>
                  <p>${activity.accessibility.description}</p>
                  ${activity.accessibility.requirements ? `
                    <p><strong>Requirements:</strong> ${activity.accessibility.requirements}</p>
                  ` : ''}
                </div>
              `).join('')}
          </div>
        ` : ''}
        
        <a href="${shareableUrl}" class="button">
          View Event Details and Respond
        </a>
      </div>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        ${token ? `<p>This invitation link will expire in 7 days.</p>` : ''}
      </div>
    </body>
    </html>
  `
}

export function getActivityEmailTemplate({
  activity,
  token,
  message,
  includeAccessibility = true,
}: ActivityEmailTemplateProps): string {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/activities/${activity.id}/share?token=${token}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Activity Invitation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .content {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background: #6366f1;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .message {
            border-left: 4px solid #6366f1;
            padding-left: 15px;
            margin: 20px 0;
            font-style: italic;
          }
          .accessibility {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>You're Invited to Join an Activity</h1>
        </div>
        
        <div class="content">
          <h2>${activity.title}</h2>
          <p>${activity.description || 'No description provided.'}</p>
          
          ${activity.event ? `
            <p><strong>Part of Event:</strong> ${activity.event.title}</p>
            <p>${activity.event.description || ''}</p>
          ` : ''}
          
          ${message ? `
            <div class="message">
              <p>${message}</p>
            </div>
          ` : ''}
          
          <center>
            <a href="${inviteUrl}" class="button">Join Activity</a>
          </center>
          
          ${includeAccessibility && activity.accessibility ? `
            <div class="accessibility">
              <h3>Accessibility Information</h3>
              <p>${activity.accessibility.description}</p>
              ${activity.accessibility.requirements ? `
                <p><strong>Requirements:</strong> ${activity.accessibility.requirements}</p>
              ` : ''}
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>This invitation will expire in 7 days.</p>
          <p>If you didn't expect this invitation, you can safely ignore it.</p>
        </div>
      </body>
    </html>
  `
} 