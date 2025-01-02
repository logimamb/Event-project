"use client"

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Calendar, Eye, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventSettingsProps {
  event: {
    id: string
    status: string
    visibility: string
    priority: string
  }
  onUpdate?: () => void
}

export function EventSettings({ event, onUpdate }: EventSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSettingChange = async (
    setting: 'status' | 'visibility' | 'priority',
    value: string
  ) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/events/' + event.id + '/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [setting]: value }),
      })

      if (!response.ok) {
        throw new Error('Failed to update event settings')
      }

      toast({
        title: 'Settings updated',
        description: 'Event settings have been successfully updated.',
      })

      onUpdate?.()
    } catch (error) {
      console.error('Error updating event settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update event settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'text-yellow-500'
      case 'PUBLISHED':
        return 'text-green-500'
      case 'CANCELLED':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'text-blue-500'
      case 'MEDIUM':
        return 'text-yellow-500'
      case 'HIGH':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Event Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Setting */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Status
          </label>
          <Select
            disabled={isLoading}
            value={event.status}
            onValueChange={(value) => handleSettingChange('status', value)}
          >
            <SelectTrigger className={cn('w-full', getStatusColor(event.status))}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visibility Setting */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visibility
          </label>
          <Select
            disabled={isLoading}
            value={event.visibility}
            onValueChange={(value) => handleSettingChange('visibility', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="PRIVATE">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Setting */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Priority
          </label>
          <Select
            disabled={isLoading}
            value={event.priority}
            onValueChange={(value) => handleSettingChange('priority', value)}
          >
            <SelectTrigger className={cn('w-full', getPriorityColor(event.priority))}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Warning for Cancelled Status */}
        {event.status === 'CANCELLED' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-500">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Event is cancelled</p>
              <p className="text-red-500/80">
                Cancelled events are not visible to participants and cannot receive new registrations.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
