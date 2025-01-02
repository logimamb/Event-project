import DashboardLayout from '@/components/layout/DashboardLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Event Manager',
  description: 'Manage your account settings and preferences',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {children}
      </div>
    </DashboardLayout>
  )
}
