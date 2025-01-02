'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card } from './ui/card'
import { useTranslations } from 'next-intl'

interface StatsCardProps {
  id: string
  title: string
  value: number | string
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'indigo' | 'pink'
  description?: string
}

const colorVariants = {
  blue: {
    background: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200/50 dark:border-blue-700/30',
    ring: 'ring-blue-500/30',
    glow: 'after:bg-gradient-to-br after:from-blue-500/20 after:to-blue-600/10',
  },
  green: {
    background: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/50 dark:border-emerald-700/30',
    ring: 'ring-emerald-500/30',
    glow: 'after:bg-gradient-to-br after:from-emerald-500/20 after:to-emerald-600/10',
  },
  purple: {
    background: 'bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-800/10',
    text: 'text-violet-700 dark:text-violet-300',
    icon: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200/50 dark:border-violet-700/30',
    ring: 'ring-violet-500/30',
    glow: 'after:bg-gradient-to-br after:from-violet-500/20 after:to-violet-600/10',
  },
  yellow: {
    background: 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/50 dark:border-amber-700/30',
    ring: 'ring-amber-500/30',
    glow: 'after:bg-gradient-to-br after:from-amber-500/20 after:to-amber-600/10',
  },
  orange: {
    background: 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10',
    text: 'text-orange-700 dark:text-orange-300',
    icon: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200/50 dark:border-orange-700/30',
    ring: 'ring-orange-500/30',
    glow: 'after:bg-gradient-to-br after:from-orange-500/20 after:to-orange-600/10',
  },
  indigo: {
    background: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10',
    text: 'text-indigo-700 dark:text-indigo-300',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200/50 dark:border-indigo-700/30',
    ring: 'ring-indigo-500/30',
    glow: 'after:bg-gradient-to-br after:from-indigo-500/20 after:to-indigo-600/10',
  },
  pink: {
    background: 'bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10',
    text: 'text-pink-700 dark:text-pink-300',
    icon: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200/50 dark:border-pink-700/30',
    ring: 'ring-pink-500/30',
    glow: 'after:bg-gradient-to-br after:from-pink-500/20 after:to-pink-600/10',
  },
}


export function StatsCard({ id, value, icon: Icon, color }: StatsCardProps) {
  const t = useTranslations('dashboard')
  const colors = colorVariants[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-6',
        'transition-all duration-300',
        'hover:shadow-lg hover:shadow-current/5',
        'after:absolute after:inset-0 after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100',
        colors.background,
        colors.border,
        colors.glow
      )}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-muted-foreground"
          >
            {t(id)}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn('mt-2 text-3xl font-bold tracking-tight', colors.text)}
          >
            {value}
            {id === 'completionRate' && '%'}
          </motion.p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className={cn(
            'rounded-xl p-3',
            'bg-gradient-to-br from-white/80 to-white/50 dark:from-gray-900/80 dark:to-gray-900/50',
            'shadow-lg shadow-current/10',
            'ring-1 ring-inset backdrop-blur-sm',
            colors.ring
          )}
        >
          <Icon className={cn('h-6 w-6', colors.icon)} />
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-current to-current opacity-5 blur-2xl" />
      <div className="absolute left-0 bottom-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-gradient-to-br from-current to-current opacity-5 blur-2xl" />
    </motion.div>
  )
} 


// export function StatsCard({ title, value, icon: Icon, color, description }: StatsCardProps) {
//   const variant = colorVariants[color]

//   return (
//     <Card className={cn(
//       'relative overflow-hidden border transition-colors',
//       variant.border,
//       variant.background,
//       'after:absolute after:inset-0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500',
//       variant.glow,
//       'hover:border-transparent hover:ring-1',
//       variant.ring
//     )}>
//       <div className="relative p-6 z-10">
//         <div className="flex items-center space-x-4">
//           <div className={cn("p-3 rounded-full", variant.background)}>
//             <Icon className={cn("w-6 h-6", variant.icon)} />
//           </div>
//           <div>
//             <p className="text-sm text-muted-foreground">{title}</p>
//             <p className={cn("text-2xl font-semibold", variant.text)}>{value}</p>
//             {description && (
//               <p className="text-xs text-muted-foreground mt-1">{description}</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </Card>
//   )
// }
