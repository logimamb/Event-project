import { LandingNavigation } from '@/components/layout/LandingNavigation'
import { ThemeProvider } from '@/components/theme-provider'

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <LandingNavigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EventHub. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
} 
