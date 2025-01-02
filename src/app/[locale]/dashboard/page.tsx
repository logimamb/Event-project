import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { getDashboardStats } from '@/actions/dashboard'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LoadingState } from '@/components/shared/loading-state'
import { DashboardContent } from './dashboard-content'

// Get locale from params instead of using useLocale hook
export default async function DashboardPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`)
  }

  try {
    const stats = await getDashboardStats()

    return (
      <DashboardLayout>
        <Suspense fallback={<LoadingState />}>
          <DashboardContent stats={stats} />
        </Suspense>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return (
      <DashboardLayout>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-red-600">Error loading dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </DashboardLayout>
    )
  }
}
