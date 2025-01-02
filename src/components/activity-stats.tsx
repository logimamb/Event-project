'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
// import { useTranslations } from '@/lib/use-translations'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ActivityStateStats } from '@/actions/dashboard'
import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle, RefreshCw } from 'lucide-react'
import { getDashboardStats } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ActivityStatsProps {
  initialStats: ActivityStateStats
}

const statVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
}

const progressVariants = {
  initial: { width: 0 },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 0.8, ease: 'easeOut' },
  }),
}

const statColors = {
  pending: {
    background: 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/50 dark:border-amber-700/30',
    progress: 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500',
  },
  inProgress: {
    background: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200/50 dark:border-blue-700/30',
    progress: 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500',
  },
  completed: {
    background: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/50 dark:border-emerald-700/30',
    progress: 'bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500',
  },
  cancelled: {
    background: 'bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10',
    text: 'text-rose-700 dark:text-rose-300',
    icon: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200/50 dark:border-rose-700/30',
    progress: 'bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-400 dark:to-rose-500',
  },
}

export function ActivityStats({ initialStats }: ActivityStatsProps) {
  const t = useTranslations('dashboard')
  const [stats, setStats] = useState<ActivityStateStats>(initialStats)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStats = async () => {
    try {
      setIsRefreshing(true)
      const newStats = await getDashboardStats()
      setStats(newStats.activityStats)
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const onFocus = () => refreshStats()
    window.addEventListener('focus', onFocus)
    const interval = setInterval(refreshStats, 60000)

    return () => {
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
    }
  }, [])

  const completionRate = stats.total ? (stats.completed / stats.total) * 100 : 0

  const activityStates = [
    {
      label: t('activityOverviewCard.pending'),
      value: stats.pending,
      icon: Clock,
      color: 'pending' as const,
      percentage: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0,
    },
    {
      label: t('activityOverviewCard.inProgress'),
      value: stats.inProgress,
      icon: Loader2,
      color: 'inProgress' as const,
      percentage: stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0,
    },
    {
      label: t('activityOverviewCard.completed'),
      value: stats.completed,
      icon: CheckCircle2,
      color: 'completed' as const,
      percentage: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0,
    },
    {
      label: t('activityOverviewCard.cancelled'),
      value: stats.cancelled,
      icon: XCircle,
      color: 'cancelled' as const,
      percentage: stats.total ? Math.round((stats.cancelled / stats.total) * 100) : 0,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            {t('activityOverviewCard.title')}
          </h3>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {stats.total} total
          </span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={refreshStats}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  isRefreshing && "animate-spin"
                )} />
                <span className="sr-only">Refresh stats</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh statistics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Activity States Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {activityStates.map((stat) => (
          <motion.div
            key={stat.label}
            variants={statVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'p-4 rounded-lg border',
              statColors[stat.color].background,
              statColors[stat.color].border,
              'hover:shadow-lg hover:shadow-current/5 transition-all duration-300'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'p-2 rounded-xl',
                  'bg-gradient-to-br from-white/80 to-white/50 dark:from-gray-900/80 dark:to-gray-900/50',
                  'shadow-lg shadow-current/10',
                  'ring-1 ring-inset ring-current/20 backdrop-blur-sm'
                )}>
                  <stat.icon className={cn('h-4 w-4', statColors[stat.color].icon)} />
                </div>
                <span className={cn('font-medium', statColors[stat.color].text)}>
                  {stat.label}
                </span>
              </div>
              <span className={cn('text-2xl font-bold tracking-tight', statColors[stat.color].text)}>
                {stat.value}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium">{stat.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', statColors[stat.color].progress)}
                  initial="initial"
                  animate="animate"
                  variants={progressVariants}
                  custom={stat.percentage}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total Activities Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 backdrop-blur-sm rounded-lg border border-primary-200/50 dark:border-primary-700/30 p-6 text-center"
      >
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {t('totalActivities')}
        </h3>
        <p className="text-3xl font-bold text-primary mb-2">
          {stats.total}
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            {t('completionRate')}: {completionRate.toFixed(1)}%
          </span>
        </div>
      </motion.div>
    </div>
  )
} 
