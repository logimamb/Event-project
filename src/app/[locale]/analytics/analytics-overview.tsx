'use client'

import { Card } from '@/components/ui/card'
import { AnalyticsData } from '@/actions/analytics'
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { motion } from 'framer-motion'
import { StatsCard } from '@/components/stats-card'
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  Star,
  MapPin,
} from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface AnalyticsOverviewProps {
  data: AnalyticsData
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const t = useTranslations('analytics')

  const mainStats = [
    {
      title: t('stats.totalEvents'),
      value: data.totalEvents,
      icon: Calendar,
      description: t('stats.totalEventsDescription'),
      trend: data.growthRate,
    },
    {
      title: t('stats.totalAttendees'),
      value: data.totalAttendees,
      icon: Users,
      description: t('stats.totalAttendeesDescription'),
    },
    {
      title: t('stats.averageAttendance'),
      value: data.averageAttendance,
      icon: TrendingUp,
      description: t('stats.averageAttendanceDescription'),
    },
    {
      title: t('stats.averageDuration'),
      value: data.averageDuration,
      icon: Clock,
      description: t('stats.averageDurationDescription'),
    },
    {
      title: t('stats.completionRate'),
      value: `${Math.round(data.successRate)}%`,
      icon: CheckCircle,
      description: t('stats.completionRateDescription'),
    },
    {
      title: t('stats.activeEvents'),
      value: data.activeEvents,
      icon: Activity,
      description: t('stats.activeEventsDescription'),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              trend={stat.trend}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('charts.eventStatus')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.eventsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.eventsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('charts.activityProgress')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activityProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Engagement Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('charts.attendeeEngagement')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.attendeeEngagement}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="Metrics" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Event Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('charts.eventTrends')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.eventTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('tables.recentEvents')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">{t('tables.eventTitle')}</th>
                <th className="pb-2">{t('tables.startDate')}</th>
                <th className="pb-2">{t('tables.attendees')}</th>
                <th className="pb-2">{t('tables.status')}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.map((event) => (
                <tr key={event.id} className="border-b last:border-0">
                  <td className="py-3">{event.title}</td>
                  <td className="py-3">
                    {new Date(event.startDate).toLocaleDateString()}
                  </td>
                  <td className="py-3">{event.attendeeCount}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      event.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Locations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('tables.topLocations')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.topLocations.map((location, index) => (
            <div
              key={location.location || 'online'}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">{location.location || 'Online'}</p>
                <p className="text-sm text-gray-500">
                  {t('tables.eventsCount', { count: location.count })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
