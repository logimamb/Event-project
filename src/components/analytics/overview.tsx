'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  CheckCircle, 
  Star, 
  MapPin,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface AnalyticsOverviewProps {
  dateRange: DateRange | null
}

interface AnalyticsData {
  overview: {
    totalEvents: number
    upcomingEvents: number
    completedEvents: number
    totalParticipants: number
    totalActivities: number
    activeActivities: number
    completedActivities: number
    growthRates: {
      events: number
      participants: number
      activities: number
    }
  }
  charts: {
    popularLocations: Array<{ name: string; value: number }>
    eventsByStatus: Array<{ name: string; value: number }>
    activitiesByStatus: Array<{ name: string; value: number }>
    participationTrends: Array<{ date: string; participants: number }>
    topEvents: Array<{ name: string; participants: number; activities: number }>
  }
}

interface Metric {
  title: string
  value: string | number
  change: number
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

export function AnalyticsOverview({ dateRange }: AnalyticsOverviewProps) {
  const t = useTranslations('analytics')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const params = new URLSearchParams()
        if (dateRange?.from) {
          params.append('from', dateRange.from.toISOString())
        }
        if (dateRange?.to) {
          params.append('to', dateRange.to.toISOString())
        }

        const response = await fetch(`/api/analytics?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch analytics')
        
        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

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
      title: t('totalEvents'),
      value: data.overview.totalEvents,
      change: data.overview.growthRates.events,
      icon: Calendar,
      description: t('totalEventsDescription'),
      color: 'blue'
    },
    {
      title: t('upcomingEvents'),
      value: data.overview.upcomingEvents,
      change: 0, // No growth rate for upcoming events
      icon: Clock,
      description: t('upcomingEventsDescription'),
      color: 'green'
    },
    {
      title: t('totalParticipants'),
      value: data.overview.totalParticipants,
      change: data.overview.growthRates.participants,
      icon: Users,
      description: t('totalParticipantsDescription'),
      color: 'purple'
    },
    {
      title: t('totalActivities'),
      value: data.overview.totalActivities,
      change: data.overview.growthRates.activities,
      icon: Activity,
      description: t('totalActivitiesDescription'),
      color: 'yellow'
    },
    {
      title: t('activeActivities'),
      value: data.overview.activeActivities,
      change: 0, // No growth rate for active activities
      icon: Target,
      description: t('activeActivitiesDescription'),
      color: 'pink'
    },
    {
      title: t('completedActivities'),
      value: data.overview.completedActivities,
      change: 0, // No growth rate for completed activities
      icon: CheckCircle,
      description: t('completedActivitiesDescription'),
      color: 'orange'
    },
    {
      title: t('completedEvents'),
      value: data.overview.completedEvents,
      change: 0, // No growth rate for completed events
      icon: Award,
      description: t('completedEventsDescription'),
      color: 'cyan'
    },
    {
      title: t('participationRate'),
      value: `${((data.overview.totalParticipants / (data.overview.totalEvents || 1)) * 100).toFixed(1)}%`,
      change: 0, // No growth rate for participation rate
      icon: Star,
      description: t('participationRateDescription'),
      color: 'indigo'
    }
  ]

  return (
    <div className="space-y-8">
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
                <div className="flex items-center space-x-1">
                  <span className={cn(
                    "text-sm font-medium",
                    metric.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {metric.change}%
                  </span>
                  {metric.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
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
        {/* Participation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>{t('participationTrends')}</CardTitle>
            <CardDescription>{t('participationTrendsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.participationTrends}>
                  <defs>
                    <linearGradient id="participationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="participants"
                    stroke="#0088FE"
                    fillOpacity={1}
                    fill="url(#participationGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Events by Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('eventsByStatus')}</CardTitle>
            <CardDescription>{t('eventsByStatusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.eventsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {data.charts.eventsByStatus.map((_, index) => (
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

        {/* Popular Locations */}
        <Card>
          <CardHeader>
            <CardTitle>{t('popularLocations')}</CardTitle>
            <CardDescription>{t('popularLocationsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.popularLocations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {data.charts.popularLocations.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle>{t('topEvents')}</CardTitle>
            <CardDescription>{t('topEventsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.topEvents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participants" fill="#0088FE" name="Participants" />
                  <Bar dataKey="activities" fill="#00C49F" name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
