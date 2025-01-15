'use client'

import { StatsCard } from '@/components/stats-card'
import { ActivityStats } from '@/components/activity-stats'
import { Calendar, ListTodo, Users, TrendingUp, Star, UserPlus, Clock, ArrowRight, Search, Bell, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { ShareEventDialog } from '@/components/ShareEventDialog'
import { ShareActivityDialog } from '@/components/ShareActivityDialog'
import { useTranslations } from 'next-intl'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DashboardContentProps {
  stats: any // TODO: Add proper type
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function DashboardContent({ stats }: DashboardContentProps) {

  const t = useTranslations('dashboard')
  const eventsT = useTranslations('events')
  const activitiesT = useTranslations('activities')


  // const mainStats = [
  //   {
  //     id: 'totalEvents',
  //     value: stats.totalEvents,
  //     icon: Calendar,
  //     color: 'blue',
  //     label: t('stats.totalEvents')
  //   },
  //   {
  //     id: 'totalActivities',
  //     value: stats.totalActivities,
  //     icon: ListTodo,
  //     color: 'green',
  //     label: 'Total Activities'
  //   },
  //   {
  //     id: 'activeParticipants',
  //     value: stats.totalParticipants,
  //     icon: Users,
  //     color: 'purple',
  //     label: 'Active Participants'
  //   },
  //   {
  //     id: 'completionRate',
  //     value: stats.completionRate,
  //     icon: TrendingUp,
  //     color: 'yellow',
  //     label: 'Completion Rate'
  //   },
  // ]

  // const userStats = [
  //   {
  //     id: 'eventsCreated',
  //     value: stats.userStats.totalCreatedEvents,
  //     icon: Star,
  //     color: 'orange',
  //     label: 'Events Created'
  //   },
  //   {
  //     id: 'eventsJoined',
  //     value: stats.userStats.totalJoinedEvents,
  //     icon: UserPlus,
  //     color: 'indigo',
  //     label: 'Events Joined'
  //   },
  //   {
  //     id: 'upcomingEvents',
  //     value: stats.userStats.upcomingEvents,
  //     icon: Clock,
  //     color: 'pink',
  //     label: 'Upcoming Events'
  //   },
  // ]

  const mainStats = [
        {
          id: 'totalEvents',
          value: stats.totalEvents,
          icon: Calendar,
          color: 'blue',
          label: t('stats.totalEvents')
        },
        {
          id: 'totalActivities',
          value: stats.totalActivities,
          icon: ListTodo,
          color: 'green',
          label: t('stats.totalActivities')
        },
        {
          id: 'totalParticipants',
          value: stats.totalParticipants,
          icon: Users,
          color: 'purple',
          label: t('stats.totalParticipants')
        },
        {
          id: 'completionRate',
          value: stats.completionRate,
          icon: TrendingUp,
          color: 'yellow',
          label: t('stats.completionRate')
        }
      ]
    
      const userStats = [
        {
          id: 'eventsCreated',
          value: stats.userStats.totalCreatedEvents,
          icon: Star,
          color: 'orange',
          label: t('stats.eventsCreated')
        },
        {
          id: 'eventsJoined',
          value: stats.userStats.totalJoinedEvents,
          icon: UserPlus,
          color: 'indigo',
          label: t('stats.eventsJoined')
        },
        {
          id: 'totalActivities',
          value: stats.userStats.totalActivities,
          icon: Clock,
          color: 'blue',
          label: t('stats.totalActivities')
        }
      ]

  return (
    <motion.div 
      className="space-y-8 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            {t('welcomeBack')}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            {t('dashboardDescription')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('searchPlaceholder')} 
              className="pl-10 w-[250px] bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 transition-colors"
            />
          </div>
          <Button variant="outline" size="icon" className="relative border-primary/20 hover:border-primary/40 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse" />
          </Button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div 
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
      >
        {mainStats.map((stat) => (
          <motion.div key={stat.id} variants={item}>
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="overflow-hidden backdrop-blur-sm bg-gradient-to-br from-card/50 to-card/30 border-primary/20">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              {t('quickActions')}
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/events/create" className="group">
                <Button 
                  className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary" 
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent group-hover:scale-110 transition-transform duration-300" />
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('createEvent')}
                  </div>
                </Button>
              </Link>
              <Link href="/activities/new" className="group">
                <Button 
                  className="w-full relative overflow-hidden border-primary/20 hover:border-primary/40" 
                  variant="outline" 
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent group-hover:scale-110 transition-transform duration-300" />
                  <div className="relative flex items-center">
                    <ListTodo className="w-4 h-4 mr-2" />
                    {t('createActivity')}
                  </div>
                </Button>
              </Link>
              <Link href="/events" className="group">
                <Button 
                  className="w-full relative overflow-hidden border-primary/20 hover:border-primary/40" 
                  variant="outline" 
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent group-hover:scale-110 transition-transform duration-300" />
                  <div className="relative flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {t('manageEvents')}
                  </div>
                </Button>
              </Link>
              <Link href="/activities" className="group">
                <Button 
                  className="w-full relative overflow-hidden border-primary/20 hover:border-primary/40" 
                  variant="outline" 
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent group-hover:scale-110 transition-transform duration-300" />
                  <div className="relative flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t('manageActivities')}
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* User Stats */}
      <motion.div variants={item}>
        <Card className="p-6 backdrop-blur-sm bg-card/50 border-primary/10">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            {t('userActivityOverview')}
            <div className="h-1 w-1 rounded-full bg-primary" />
          </h2>
          <motion.div 
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
          >
            {userStats.map((stat) => (
              <motion.div key={stat.id} variants={item}>
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </motion.div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Events */}
        <motion.div variants={item}>
          <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card/30 border-primary/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {t('recentEvents')}
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {stats.recentEvents.length}
                  </span>
                </h2>
                <Link href="/events">
                  <Button variant="ghost" size="sm" className="group text-primary hover:text-primary/80">
                    {t('viewAll')}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentEvents.map((event: any) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm hover:border-primary/20 transition-colors group"
                  >
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event._count.activities} {t('activities')} · {event._count.members} {t('members')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShareEventDialog event={event} />
                      <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
                        <Link href={`/events/${event.id}`}>
                          {t('view')}
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {stats.recentEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('noRecentEvents')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div variants={item}>
          <Card className="overflow-hidden border-primary/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {t('recentActivities')}
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {stats.recentActivities?.length || 0}
                  </span>
                </h2>
                <Link href="/activities">
                  <Button variant="ghost" size="sm" className="group">
                    {t('viewAll')}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentActivities?.map((activity: any) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors group"
                  >
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.event?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShareActivityDialog activity={activity} size="icon" />
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/activities/${activity.id}`}>
                          {t('view')}
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {(!stats.recentActivities || stats.recentActivities.length === 0) && (
                  <div className="text-center py-8">
                    <ListTodo className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('noRecentActivities')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

        {/* Activity Stats */}
        <motion.div variants={item}>
          <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card/30 border-primary/20">
            <div className="p-6">
              <ActivityStats initialStats={stats.activityStats} />
            </div>
          </Card>
        </motion.div>
    </motion.div>
  )
} 





// 'use client'

// import { StatsCard } from '@/components/stats-card'
// import { ActivityStats } from '@/components/activity-stats'
// import { Calendar, ListTodo, Users, TrendingUp, Star, UserPlus, Clock, ArrowRight, Search, Bell, Share2 } from 'lucide-react'
// import Link from 'next/link'
// import { Button } from '@/components/ui/button'
// import { Card } from '@/components/ui/card'
// import { motion } from 'framer-motion'
// import { useTranslations } from 'next-intl'

// interface DashboardContentProps {
//   stats: any // TODO: Add proper type
// }

// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1
//     }
//   }
// }

// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0 }
// }

// export function DashboardContent({ stats }: DashboardContentProps) {
//   const t = useTranslations('dashboard')
//   const eventsT = useTranslations('events')
//   const activitiesT = useTranslations('activities')

//   const mainStats = [
//     {
//       id: 'totalEvents',
//       value: stats.totalEvents,
//       icon: Calendar,
//       color: 'blue',
//       label: t('stats.totalEvents')
//     },
//     {
//       id: 'totalActivities',
//       value: stats.totalActivities,
//       icon: ListTodo,
//       color: 'green',
//       label: t('stats.totalActivities')
//     },
//     {
//       id: 'totalParticipants',
//       value: stats.totalParticipants,
//       icon: Users,
//       color: 'purple',
//       label: t('stats.totalParticipants')
//     },
//     {
//       id: 'completionRate',
//       value: stats.completionRate,
//       icon: TrendingUp,
//       color: 'yellow',
//       label: t('stats.completionRate')
//     }
//   ]

//   const userStats = [
//     {
//       id: 'eventsCreated',
//       value: stats.userStats.totalCreatedEvents,
//       icon: Star,
//       color: 'orange',
//       label: t('stats.eventsCreated')
//     },
//     {
//       id: 'eventsJoined',
//       value: stats.userStats.totalJoinedEvents,
//       icon: UserPlus,
//       color: 'indigo',
//       label: t('stats.eventsJoined')
//     },
//     {
//       id: 'totalActivities',
//       value: stats.userStats.totalActivities,
//       icon: Clock,
//       color: 'blue',
//       label: t('stats.totalActivities')
//     }
//   ]

//   return (
//     <motion.div
//       variants={container}
//       initial="hidden"
//       animate="show"
//       className="space-y-8 p-8"
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="space-y-1">
//           <h1 className="text-3xl font-bold tracking-tight">{t('welcomeBack')}</h1>
//           <p className="text-muted-foreground">{t('dashboardDescription')}</p>
//         </div>
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon" className="rounded-full">
//             <Search className="w-5 h-5" />
//           </Button>
//           <Button variant="ghost" size="icon" className="rounded-full">
//             <Bell className="w-5 h-5" />
//           </Button>
//         </div>
//       </div>

//       {/* Main Stats */}
//       <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
//         {mainStats.map((stat) => {
//           const Icon = stat.icon
//           return (
//             <motion.div key={stat.id} variants={item}>
//               <StatsCard
//                 title={stat.label}
//                 value={stat.value}
//                 icon={Icon}
//                 color={stat.color}
//                 description={t('stats.lastThirtyDays')}
//               />
//             </motion.div>
//           )
//         })}
//       </div>

//       {/* User Stats and Quick Actions */}
//       <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
//         {/* User Stats */}
//         <div className="lg:col-span-4 grid gap-6 grid-cols-1 md:grid-cols-3">
//           {userStats.map((stat) => {
//             const Icon = stat.icon
//             return (
//               <motion.div key={stat.id} variants={item}>
//                 <StatsCard
//                   title={stat.label}
//                   value={stat.value}
//                   icon={Icon}
//                   color={stat.color}
//                   description={t('stats.yourActivity')}
//                 />
//               </motion.div>
//             )
//           })}
//         </div>

//         {/* Quick Actions */}
//         <motion.div variants={item} className="lg:col-span-2">
//           <Card className="h-full">
//             <div className="p-6 space-y-4">
//               <h2 className="text-xl font-semibold">{t('quickActions')}</h2>
//               <div className="space-y-2">
//                 <Link href="/events/new" className="w-full">
//                   <Button className="w-full justify-start" variant="outline">
//                     <Calendar className="w-4 h-4 mr-2" />
//                     {eventsT('createNew')}
//                     <ArrowRight className="w-4 h-4 ml-auto" />
//                   </Button>
//                 </Link>
//                 <Link href="/events" className="w-full">
//                   <Button className="w-full justify-start" variant="outline">
//                     <ListTodo className="w-4 h-4 mr-2" />
//                     {eventsT('manageEvents')}
//                     <ArrowRight className="w-4 h-4 ml-auto" />
//                   </Button>
//                 </Link>
//                 <Link href="/activities" className="w-full">
//                   <Button className="w-full justify-start" variant="outline">
//                     <Clock className="w-4 h-4 mr-2" />
//                     {activitiesT('manageActivities')}
//                     <ArrowRight className="w-4 h-4 ml-auto" />
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </Card>
//         </motion.div>
//       </div>

//       {/* Activity Stats */}
//       <motion.div variants={item}>
//         <Card className="overflow-hidden bg-gradient-to-br from-card/50 to-card/30 border-primary/20">
//           <div className="p-6">
//             <ActivityStats initialStats={stats.activityStats} />
//           </div>
//         </Card>
//       </motion.div>
//     </motion.div>
//   )
// }