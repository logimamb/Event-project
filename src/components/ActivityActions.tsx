'use client'

import { useState } from 'react'
import { MoreVertical, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { toast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ActivityActionsProps {
  activityId: string
  status: string
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}

const statusTransitions = {
  'PENDING': {
    icon: AlertCircle,
    next: 'IN_PROGRESS',
    label: 'Start Activity',
    color: 'text-blue-500 dark:text-blue-400',
    bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
  },
  'IN_PROGRESS': {
    icon: CheckCircle2,
    next: 'COMPLETED',
    label: 'Complete Activity',
    color: 'text-green-500 dark:text-green-400',
    bgHover: 'hover:bg-green-50 dark:hover:bg-green-500/10',
  },
  'COMPLETED': {
    icon: Clock,
    next: 'PENDING',
    label: 'Restart Activity',
    color: 'text-yellow-500 dark:text-yellow-400',
    bgHover: 'hover:bg-yellow-50 dark:hover:bg-yellow-500/10',
  },
}

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
}

export function ActivityActions({ activityId, status, onStatusChange, onDelete }: ActivityActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true)
    try {
      await onStatusChange(activityId, newStatus)
      toast({
        title: 'Status updated',
        description: 'The activity status has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update the activity status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const handleDelete = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true)
      return
    }

    setIsLoading(true)
    try {
      await onDelete(activityId)
      toast({
        title: 'Activity deleted',
        description: 'The activity has been successfully deleted.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the activity. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsOpen(false)
      setShowConfirmDelete(false)
    }
  }

  const transition = statusTransitions[status as keyof typeof statusTransitions]

  return (
    <DropdownMenu 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setShowConfirmDelete(false)
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "relative h-8 w-8 rounded-full",
            isLoading && "cursor-not-allowed"
          )}
          disabled={isLoading}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoading ? 'loading' : 'icon'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <MoreVertical className="h-4 w-4" />
            </motion.div>
          </AnimatePresence>

          {/* Loading spinner */}
          {isLoading && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              style={{ borderTopColor: 'var(--primary)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent 
            align="end"
            className="w-56"
            asChild
            forceMount
          >
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(transition.next)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer transition-colors",
                  transition.color,
                  transition.bgHover
                )}
              >
                <transition.icon className="w-4 h-4" />
                <span>{transition.label}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleDelete}
                className={cn(
                  "flex items-center gap-2 cursor-pointer transition-colors",
                  showConfirmDelete 
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
                    : "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                )}
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {showConfirmDelete ? 'Click again to confirm' : 'Delete Activity'}
                </span>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  )
} 
