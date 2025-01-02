'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AttendeeAnalyticsProps {
  dateRange: DateRange | null
}

const engagementMetrics = [
  { subject: 'Participation', A: 85, fullMark: 100 },
  { subject: 'Feedback', A: 78, fullMark: 100 },
  { subject: 'Interaction', A: 92, fullMark: 100 },
  { subject: 'Punctuality', A: 88, fullMark: 100 },
  { subject: 'Completion', A: 95, fullMark: 100 },
]

const attendanceByTime = [
  { time: '9 AM', count: 45 },
  { time: '10 AM', count: 85 },
  { time: '11 AM', count: 120 },
  { time: '12 PM', count: 95 },
  { time: '1 PM', count: 75 },
  { time: '2 PM', count: 90 },
  { time: '3 PM', count: 110 },
  { time: '4 PM', count: 85 },
  { time: '5 PM', count: 65 },
]

const topAttendees = [
  {
    name: 'Sarah Johnson',
    events: 15,
    engagement: 95,
    avatar: '/avatars/sarah.jpg',
  },
  {
    name: 'Michael Chen',
    events: 12,
    engagement: 92,
    avatar: '/avatars/michael.jpg',
  },
  {
    name: 'Emma Davis',
    events: 10,
    engagement: 88,
    avatar: '/avatars/emma.jpg',
  },
]

export function AttendeeAnalytics({ dateRange }: AttendeeAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Engagement Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
            <CardDescription>
              Key engagement metrics across all events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={engagementMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Engagement"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attendance by Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Time</CardTitle>
            <CardDescription>
              Distribution of attendance throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceByTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" name="Attendees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Attendees */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Attendees</CardTitle>
            <CardDescription>Most engaged participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topAttendees.map((attendee, index) => (
                <div
                  key={attendee.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={attendee.avatar} alt={attendee.name} />
                      <AvatarFallback>
                        {attendee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {attendee.events} events attended
                      </p>
                    </div>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {attendee.engagement}% engaged
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 
