'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { TeamParticipants } from '@/components/team/team-participants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { notFound } from 'next/navigation'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Users, Calendar, Settings } from 'lucide-react'

interface TeamPageProps {
  params: {
    teamId: string
  }
}

export default function TeamPage({ params }: TeamPageProps) {
  const router = useRouter()
  const t = useTranslations('teams')
  const { toast } = useToast()
  const [team, setTeam] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/teams/${params.teamId}`)
      .then(res => res.json())
      .then(data => {
        setTeam(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching team:', error)
        setIsLoading(false)
      })
  }, [params.teamId])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!team) {
    return notFound()
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground">{team.description}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/teams/${params.teamId}/settings`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('settings')}
          </Button>
        </div>

        <Tabs defaultValue="participants">
          <TabsList>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              {t('participants')}
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              {t('calendar')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="mt-6">
            <TeamParticipants teamId={params.teamId} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t('teamCalendar')}</h2>
              {/* Calendar component will go here */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
