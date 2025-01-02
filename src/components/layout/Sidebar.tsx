'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Calendar, 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Settings, 
  BarChart3,
  X,
  Bell 
} from 'lucide-react'

interface SidebarProps {
  className?: string
  onClose?: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-blue-500',
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    color: 'text-green-500',
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: ListTodo,
    color: 'text-purple-500',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    color: 'text-orange-500',
  },
  {
    name: 'Account',
    href: '/account',
    icon: BarChart3,
    color: 'text-orange-500',
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
    color: 'text-pink-500',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    color: 'text-gray-500',
  },
] as const

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className={cn("w-64 bg-card border-r", className)}>
      {/* Close button for mobile */}
      <div className="lg:hidden absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-semibold">Event Manager</span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={onClose}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? 'text-primary' : item.color)} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </ScrollArea>

        {/* User profile */}
        <div className="p-4 mt-auto border-t">
          {/* <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
              </Button>
              <ThemeToggle />
            </div>
          </div> */}
          <Link href="/profile" className="flex items-center gap-3 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
              <AvatarFallback>
                {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {session?.user?.name || 'User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {session?.user?.email || 'user@example.com'}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
