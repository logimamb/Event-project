'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Calendar, 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Settings, 
  BarChart3, 
  Menu, 
  X, 
  HelpCircle, 
  Info, 
  BookOpen,
  MessageSquare 
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '../theme-toggle'
import { LanguageSwitcher } from '../language-switcher'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FeedbackDialog } from '../feedback/feedback-dialog'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: ListTodo,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

const helpNavigation = [
  {
    name: 'Feedback',
    href: '#',
    icon: MessageSquare,
    component: FeedbackDialog,
  },
  {
    name: 'Help Center',
    href: '/help',
    icon: HelpCircle,
  },
  {
    name: 'Getting Started',
    href: '/guide',
    icon: BookOpen,
  },
  {
    name: 'About',
    href: '/about',
    icon: Info,
  },
] as const

export function Navigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Event Calendar
            </span>
          </Link>
          <div className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname.startsWith(item.href)
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 text-sm font-medium',
                      pathname.startsWith(item.href)
                        ? 'text-foreground'
                        : 'text-foreground/60'
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <div className="h-px bg-border" />
                <div className="space-y-4">
                  <p className="font-medium">Help & Resources</p>
                  <nav className="grid gap-2">
                    {helpNavigation.map((item) => (
                      item.component ? (
                        <item.component key={item.name}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            <item.icon className="mr-2 h-5 w-5" />
                            {item.name}
                          </Button>
                        </item.component>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center text-sm font-medium text-muted-foreground',
                            pathname === item.href && 'text-foreground'
                          )}
                        >
                          <item.icon className="mr-2 h-5 w-5" />
                          {item.name}
                        </Link>
                      )
                    ))}
                  </nav>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <div className="flex items-center space-x-2">
            <FeedbackDialog />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
