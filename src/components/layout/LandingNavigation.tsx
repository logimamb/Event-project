'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '../theme-toggle'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu, X, Calendar } from 'lucide-react'

const navigation = [
  {
    name: 'About',
    href: '/about',
  },
  {
    name: 'Features',
    href: '/#features',
  },
  {
    name: 'Pricing',
    href: '/pricing',
  },
  {
    name: 'Help',
    href: '/help',
  },
  {
    name: 'Contact',
    href: '/contact',
  },
] as const

export function LandingNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">EventHub</span>
          </Link>
          <div className="flex gap-6">
            <Link 
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link 
              href="/help"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Help
            </Link>
            <Link 
              href="/guide"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Guide
            </Link>
            <Link 
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
} 
