import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function ActivityNotFound() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Activity Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The activity you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/activities">
              Return to Activities
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
} 