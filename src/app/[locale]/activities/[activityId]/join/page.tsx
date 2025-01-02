import { Metadata } from 'next'
import { JoinActivityForm } from './join-activity-form'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Join Activity | Event Manager',
  description: 'Join an existing activity using an invitation code.',
}

export default function JoinActivityPage() {
  return (
    <div className="container relative max-w-3xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Join Activity
          </h1>
          <p className="text-xl text-muted-foreground">
            Enter the invitation code to join an existing activity.
          </p>
        </div>
      </div>
      <Separator className="my-8" />
      <Card className="p-6">
        <JoinActivityForm />
      </Card>
    </div>
  )
} 