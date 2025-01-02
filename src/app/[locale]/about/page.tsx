import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  Shield, 
  Globe, 
  Award,
  Heart,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Event Management',
    description: 'Create and manage events of any size with powerful tools and intuitive interfaces.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work seamlessly with team members, assign roles, and coordinate activities efficiently.'
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Enterprise-grade security with role-based access control and data encryption.'
  },
  {
    icon: Globe,
    title: 'Global Accessibility',
    description: 'Support for multiple languages and time zones for worldwide event coordination.'
  }
]

const values = [
  {
    icon: Heart,
    title: 'User-Centric',
    description: 'We put our users first in everything we do, from design to support.'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Constantly improving and adding new features based on user feedback.'
  },
  {
    icon: Clock,
    title: 'Reliability',
    description: '99.9% uptime guarantee with real-time synchronization and backups.'
  },
  {
    icon: CheckCircle,
    title: 'Quality',
    description: 'Rigorous testing and quality assurance for a seamless experience.'
  }
]

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            About EventSync
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering organizations to create, manage, and deliver exceptional events 
            with powerful tools and intuitive interfaces.
          </p>
        </section>

        {/* Mission Statement */}
        <Card className="p-8 mb-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            To simplify event management and enhance collaboration by providing 
            innovative tools that bring people together and create memorable experiences.
          </p>
        </Card>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index} 
                  className="p-6 flex flex-col items-center text-center"
                  tabIndex={0}
                >
                  <Icon className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card 
                  key={index} 
                  className="p-6 flex flex-col items-center text-center"
                  tabIndex={0}
                >
                  <Icon className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-6">
              We're a diverse team of developers, designers, and event management 
              experts passionate about creating the best event management platform.
            </p>
            <Button asChild>
              <Link href="/team">
                Meet Our Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </section>

        {/* Awards & Recognition */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Awards & Recognition
          </h2>
          <Card className="p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Best Event Platform 2023</h3>
                  <p className="text-sm text-muted-foreground">TechAwards</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Innovation in Tech 2023</h3>
                  <p className="text-sm text-muted-foreground">EventTech Global</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">User Experience Excellence</h3>
                  <p className="text-sm text-muted-foreground">UX Awards</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join thousands of organizations already using EventSync to manage their events.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/register">
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
} 
