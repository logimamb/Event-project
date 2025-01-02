'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Users,
  Activity,
  Star,
  Clock,
  Award,
  Target,
  CheckCircle,
  User,
  CalendarDays,
  ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface AccountStats {
  overview: {
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
      createdAt: string
    }
    joinDate: string
    totalEvents: number
    totalActivities: number
    totalParticipations: number
    eventsJoinedCount: number
    activitiesJoinedCount: number
    averageParticipantsInEvents: number
    averageActivitiesPerEvent: number
  }
  eventStats: {
    total: number
    byStatus: Array<{
      status: string
      _count: number
    }>
    recentEvents: Array<{
      id: string
      title: string
      createdAt: string
      _count: {
        members: number
        activities: number
      }
    }>
    joinedEvents: Array<{
      id: string
      title: string
      joinedAt: string
      _count: {
        members: number
        activities: number
      }
    }>
  }
  activityStats: {
    total: number
    byStatus: Array<{
      status: string
      _count: number
    }>
    recentActivities: Array<{
      id: string
      title: string
      createdAt: string
      event: {
        title: string
      }
      _count: {
        participants: number
      }
    }>
    joinedActivities: Array<{
      id: string
      activity: {
        id: string
        title: string
        event: {
          title: string
        }
      }
      createdAt: string
    }>
  }
}

interface Metric {
  title: string
  value: string | number
  icon: React.ElementType
  description: string
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'pink' | 'orange' | 'cyan' | 'indigo'
}

const colorVariants = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  pink: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
}

export function AccountStatsClient() {
  const t = useTranslations('account')
  const [data, setData] = useState<AccountStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/account-stats')
        if (!response.ok) throw new Error('Failed to fetch account stats')
        const statsData = await response.json()
        setData(statsData)
      } catch (error) {
        console.error('Error fetching account stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metrics: Metric[] = [
    {
      title: t('stats.totalEvents'),
      value: data.overview.totalEvents,
      icon: Calendar,
      description: t('stats.totalEventsDescription'),
      color: 'blue'
    },
    {
      title: t('stats.totalActivities'),
      value: data.overview.totalActivities,
      icon: Activity,
      description: t('stats.totalActivitiesDescription'),
      color: 'green'
    },
    {
      title: t('stats.totalParticipations'),
      value: data.overview.totalParticipations,
      icon: Users,
      description: t('stats.totalParticipationsDescription'),
      color: 'purple'
    },
    {
      title: t('stats.eventsJoined'),
      value: data.overview.eventsJoinedCount,
      icon: CalendarDays,
      description: t('stats.eventsJoinedDescription'),
      color: 'yellow'
    },
    {
      title: t('stats.activitiesJoined'),
      value: data.overview.activitiesJoinedCount,
      icon: Target,
      description: t('stats.activitiesJoinedDescription'),
      color: 'pink'
    },
    {
      title: t('stats.avgParticipants'),
      value: data.overview.averageParticipantsInEvents.toFixed(1),
      icon: Users,
      description: t('stats.avgParticipantsDescription'),
      color: 'orange'
    },
    {
      title: t('stats.avgActivities'),
      value: data.overview.averageActivitiesPerEvent.toFixed(1),
      icon: Activity,
      description: t('stats.avgActivitiesDescription'),
      color: 'cyan'
    },
    {
      title: t('stats.memberSince'),
      value: format(new Date(data.overview.joinDate), 'MMM yyyy'),
      icon: User,
      description: t('stats.memberSinceDescription'),
      color: 'indigo'
    }
  ]

  return (
    <div className="space-y-8">
      {/* User Overview */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-auto">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={data.overview.user.image || undefined} />
                <AvatarFallback>{data.overview.user.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{data.overview.user.name}</h2>
                <p className="text-muted-foreground">{data.overview.user.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('stats.joinedOn', { date: format(new Date(data.overview.joinDate), 'PPP') })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn('p-2 rounded-lg', colorVariants[metric.color])}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-muted-foreground">{metric.title}</h3>
                <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Events by Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.eventsByStatus')}</CardTitle>
            <CardDescription>{t('stats.eventsByStatusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.eventStats.byStatus}
                    dataKey="_count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    label
                  >
                    {data.eventStats.byStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activities by Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.activitiesByStatus')}</CardTitle>
            <CardDescription>{t('stats.activitiesByStatusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.activityStats.byStatus}
                    dataKey="_count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    label
                  >
                    {data.activityStats.byStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.recentEvents')}</CardTitle>
            <CardDescription>{t('stats.recentEventsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.eventStats.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.createdAt), 'PPp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{event._count.members}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{event._count.activities}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.recentActivities')}</CardTitle>
            <CardDescription>{t('stats.recentActivitiesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.activityStats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.event.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.createdAt), 'PPp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{activity._count.participants}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
