import { ReactNode } from 'react'

interface EventLayoutProps {
  children: ReactNode
  params: {
    eventId: string
  }
}

export default function EventLayout({ children }: EventLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </main>
  )
} 