import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Event Manager',
  description: 'Manage your events and calendar',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
