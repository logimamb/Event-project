'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Overview } from '@/components/dashboard/overview'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TeamSection } from '@/components/dashboard/team-section'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  User,
  Home,
  Calendar as CalendarIcon,
  Settings,
  Users,
  LogOut,
  Plus,
  BarChart,
  Clock,
  Bell,
  Menu
} from 'lucide-react'

const quickLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardContent() {
  const t = useTranslations('Dashboard')
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <BarChart className="h-6 w-6" />
          <span>Event Manager</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4">
          <div className="py-2">
            <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Quick Links</h4>
            <nav className="space-y-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Separator />
          <div className="py-2">
            <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Account</h4>
            <div className="space-y-4 px-2">
              <div className="flex items-center gap-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/api/auth/signout">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="sticky top-0 z-50 flex lg:hidden items-center justify-between p-4 border-b bg-background">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <BarChart className="h-6 w-6" />
          <span>Event Manager</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full lg:pl-64">
          <div className="container p-4 lg:p-8 mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('welcome')}</h2>
                <p className="text-muted-foreground">
                  {t('welcomeMessage')}
                </p>
              </div>
              <Button className="flex items-center gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                {t('createEvent')}
              </Button>
            </div>

            <div className="grid gap-4 md:gap-6">
              {/* Overview and Calendar Row */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Overview Section */}
                <Card className="col-span-1 lg:col-span-4">
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Overview</h3>
                      <Badge variant="secondary">Last 30 days</Badge>
                    </div>
                    <div className="h-[300px] lg:h-[350px]">
                      <Overview />
                    </div>
                  </div>
                </Card>

                {/* Calendar Section */}
                <Card className="col-span-1 lg:col-span-3">
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Calendar</h3>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/calendar">View All</Link>
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Events and Activity Row */}
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Recent Events Section */}
                <Card className="col-span-1 lg:col-span-4">
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">Recent Events</h3>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/events">View All</Link>
                      </Button>
                    </div>
                    <RecentEvents />
                  </div>
                </Card>

                {/* Recent Activity Section */}
                <Card className="col-span-1 lg:col-span-3">
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">Activity</h3>
                      </div>
                      <Badge variant="secondary" className="rounded-full">5 new</Badge>
                    </div>
                    <RecentActivity />
                  </div>
                </Card>
              </div>

              {/* Team Section */}
              <Card className="col-span-1">
                <div className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-lg">Team Members</h3>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/teams">Manage Team</Link>
                    </Button>
                  </div>
                  <TeamSection />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
