import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell, Mail, MessageSquare } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

interface NotificationSetting {
  id: string
  type: 'EVENT_START' | 'EVENT_END' | 'ACTIVITY_START' | 'ACTIVITY_END' | 'REMINDER'
  channel: ('EMAIL' | 'SMS')[]
  timing: number
  enabled: boolean
}

interface NotificationSettingsProps {
  entityId: string
  entityType: 'event' | 'activity'
  initialSettings?: NotificationSetting[]
}

export function NotificationSettings({ 
  entityId, 
  entityType,
  initialSettings = []
}: NotificationSettingsProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings)
  const [phoneNumber, setPhoneNumber] = useState(session?.user?.phoneNumber || '')
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          entityType,
          settings
        }),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      })
    }
  }

  const handleVerifyPhone = async () => {
    try {
      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) throw new Error('Failed to send verification code')

      setShowVerification(true)
      toast({
        title: 'Verification Code Sent',
        description: 'Please check your phone for the verification code',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive',
      })
    }
  }

  const handleConfirmVerification = async () => {
    try {
      const response = await fetch('/api/verify-phone/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber,
          code: verificationCode 
        }),
      })

      if (!response.ok) throw new Error('Invalid verification code')

      setIsPhoneVerified(true)
      setShowVerification(false)
      toast({
        title: 'Success',
        description: 'Phone number verified successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid verification code',
        variant: 'destructive',
      })
    }
  }

  const toggleChannel = (settingId: string, channel: 'EMAIL' | 'SMS') => {
    setSettings(prev => prev.map(setting => {
      if (setting.id === settingId) {
        const channels = setting.channel.includes(channel)
          ? setting.channel.filter(c => c !== channel)
          : [...setting.channel, channel]
        return { ...setting, channel: channels }
      }
      return setting
    }))
  }

  const updateTiming = (settingId: string, timing: number) => {
    setSettings(prev => prev.map(setting => {
      if (setting.id === settingId) {
        return { ...setting, timing }
      }
      return setting
    }))
  }

  const toggleEnabled = (settingId: string) => {
    setSettings(prev => prev.map(setting => {
      if (setting.id === settingId) {
        return { ...setting, enabled: !setting.enabled }
      }
      return setting
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when you want to be notified
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phone Verification Section */}
        <div className="space-y-4">
          <Label>Phone Number for SMS Notifications</Label>
          <div className="flex gap-2">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              disabled={isPhoneVerified}
            />
            <Button 
              onClick={handleVerifyPhone}
              disabled={isPhoneVerified || !phoneNumber}
            >
              {isPhoneVerified ? 'Verified' : 'Verify'}
            </Button>
          </div>

          {showVerification && (
            <div className="flex gap-2">
              <Input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
              />
              <Button onClick={handleConfirmVerification}>
                Confirm
              </Button>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          {settings.map(setting => (
            <div 
              key={setting.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="font-medium">
                  {setting.type.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setting.channel.includes('EMAIL')}
                      onCheckedChange={() => toggleChannel(setting.id, 'EMAIL')}
                    />
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={setting.channel.includes('SMS')}
                      onCheckedChange={() => toggleChannel(setting.id, 'SMS')}
                      disabled={!isPhoneVerified}
                    />
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">SMS</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={setting.timing}
                    onChange={(e) => updateTiming(setting.id, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm">minutes before</span>
                </div>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={() => toggleEnabled(setting.id)}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSaveSettings} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
} 