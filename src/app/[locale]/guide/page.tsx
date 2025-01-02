import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Metadata } from 'next'
import { Lightbulb } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Getting Started Guide | Event Manager',
  description: 'Step-by-step guide on how to use the Event Manager platform',
}

export default function GuidePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 prose dark:prose-invert max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Getting Started Guide</h1>
        
        <div className="bg-muted p-4 rounded-lg mb-8">
          <p className="text-sm text-muted-foreground">
            New to Event Manager? This guide will walk you through everything you need to know to get started.
            Follow these steps to create and manage your first event.
          </p>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Create Your Account</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Click on the "Sign Up" button in the top right corner</li>
            <li>Fill in your details: name, email, and password</li>
            <li>Verify your email address through the confirmation link</li>
            <li>Complete your profile with additional information (optional)</li>
          </ul>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 flex gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Pro Tip: Add a profile picture and bio to make your events more personalized and trustworthy.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. Create Your First Event</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Navigate to the "Events" section in the dashboard</li>
            <li>Click "Create New Event"</li>
            <li>Fill in event details:
              <ul className="list-circle pl-6 mt-2 space-y-1">
                <li>Title - Make it clear and descriptive</li>
                <li>Description - Include all important details</li>
                <li>Date and Time - Set start and end times</li>
                <li>Location - Physical address or virtual meeting link</li>
                <li>Capacity - Set maximum number of attendees</li>
              </ul>
            </li>
            <li>Configure virtual access settings if needed</li>
            <li>Set up accessibility options</li>
            <li>Save your event</li>
          </ul>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 flex gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Pro Tip: Use tags to categorize your event and make it more discoverable.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. Add Activities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Within your event, go to the "Activities" tab</li>
            <li>Click "Add Activity"</li>
            <li>Define activity details:
              <ul className="list-circle pl-6 mt-2 space-y-1">
                <li>Name and description</li>
                <li>Time slot and duration</li>
                <li>Capacity and prerequisites</li>
                <li>Required materials or equipment</li>
                <li>Assigned staff or speakers</li>
              </ul>
            </li>
            <li>Set activity-specific accessibility options</li>
            <li>Save the activity</li>
          </ul>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 flex gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Pro Tip: Create a diverse range of activities to cater to different interests and skill levels.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">4. Manage Your Event</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the dashboard to:
              <ul className="list-circle pl-6 mt-2 space-y-1">
                <li>Monitor registrations and attendance</li>
                <li>Track activity signups</li>
                <li>Manage waiting lists</li>
                <li>View analytics and insights</li>
              </ul>
            </li>
            <li>Send updates and announcements to participants</li>
            <li>Handle virtual access settings</li>
            <li>Process refunds or cancellations if needed</li>
          </ul>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 flex gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Pro Tip: Regular communication with attendees helps maintain engagement and reduces no-shows.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">5. Share Your Event</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use sharing options:
              <ul className="list-circle pl-6 mt-2 space-y-1">
                <li>Generate shareable links</li>
                <li>Send email invitations</li>
                <li>Share on social media</li>
                <li>Create QR codes for easy access</li>
              </ul>
            </li>
            <li>Monitor sharing analytics</li>
            <li>Track registration sources</li>
            <li>Adjust promotion strategy based on data</li>
          </ul>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 flex gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Pro Tip: Encourage early registrations by offering early-bird discounts or exclusive benefits.
            </p>
          </div>
        </section>

        <div className="bg-muted p-6 rounded-lg mt-8">
          <h3 className="font-semibold mb-2">Need More Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Check out these additional resources:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/help"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Visit Help Center
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Platform Overview
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 
