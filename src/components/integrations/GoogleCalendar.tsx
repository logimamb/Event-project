'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  Settings,
  ExternalLink 
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export function GoogleCalendarIntegration() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [calendarSync, setCalendarSync] = useState(false)

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/integrations/google-calendar/status')
      if (response.ok) {
        const data = await response.json()
        setCalendarSync(data.connected)
        if (data.lastSynced) {
          setLastSynced(new Date(data.lastSynced))
        }
      }
    } catch (error) {
      console.error('Error checking calendar connection status:', error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/integrations/google-calendar/connect', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to connect')

      const data = await response.json()
      // Redirect to Google OAuth consent screen
      window.location.href = data.url
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to Google Calendar. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncStatus('syncing')
    try {
      const response = await fetch('/api/integrations/google-calendar/sync', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to sync')

      const data = await response.json()
      setLastSynced(new Date())
      setCalendarSync(true)
      setSyncStatus('idle')
      toast({
        title: 'Sync Complete',
        description: 'Your calendar has been synchronized successfully.',
      })
    } catch (error) {
      setSyncStatus('error')
      toast({
        title: 'Sync Error',
        description: 'Failed to sync calendar. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/integrations/google-calendar/disconnect', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      setCalendarSync(false)
      setLastSynced(null)
      toast({
        title: 'Disconnected',
        description: 'Google Calendar has been disconnected successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Google Calendar.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Google Calendar</h3>
            <p className="text-sm text-muted-foreground">
              Sync your events with Google Calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {calendarSync ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      {syncStatus === 'idle' && (
                        <Badge variant="outline" className="gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          Connected
                        </Badge>
                      )}
                      {syncStatus === 'syncing' && (
                        <Badge variant="outline" className="gap-2">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Syncing
                        </Badge>
                      )}
                      {syncStatus === 'error' && (
                        <Badge variant="outline" className="gap-2 text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          Error
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {lastSynced
                      ? `Last synced: ${lastSynced.toLocaleString()}`
                      : 'Not synced yet'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                aria-label="Sync calendar"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                aria-label="Disconnect Google Calendar"
              >
                <X className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              aria-label="Connect Google Calendar"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {calendarSync && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Calendar Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Manage your Google Calendar settings
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://calendar.google.com/calendar/r/settings', '_blank')}
              aria-label="Open Google Calendar settings"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Settings
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Recent Activity</h4>
            <ScrollArea className="h-[100px]">
              <div className="space-y-2 text-sm text-muted-foreground">
                {lastSynced && (
                  <p>• Last sync completed at {lastSynced.toLocaleString()}</p>
                )}
                <p>• Calendar connection established</p>
                <p>• Permissions granted for calendar access</p>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </Card>
  )
}
