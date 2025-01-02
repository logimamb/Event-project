'use client'

import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface UpdateSettingsData {
  type: 'profile' | 'event' | 'notification' | 'privacy' | 'display' | 'security' | 'integrations'
  data: any
}

export function useSettings() {
  const t = useTranslations('Settings')
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'))
    } finally {
      setIsLoading(false)
    }
  }

  // Update settings
  const updateSettings = async ({ type, data }: UpdateSettingsData) => {
    try {
      setIsUpdating(true)
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      
      toast({
        title: t('updateSuccess'),
        description: t('settingsUpdated'),
      })
    } catch (err) {
      console.error('Error updating settings:', err)
      toast({
        title: t('error'),
        description: t('updateError'),
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Fetch settings on mount
  useState(() => {
    fetchSettings()
  })

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    isUpdating,
    refetch: fetchSettings,
  }
}
