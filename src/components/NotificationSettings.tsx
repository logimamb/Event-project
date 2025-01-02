import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Switch } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { useTranslations } from '@/lib/use-translations';

interface NotificationSettingsProps {
  eventId?: string;
  activityId?: string;
}

export default function NotificationSettings({ eventId, activityId }: NotificationSettingsProps) {
  const { data: session } = useSession();
  const t = useTranslations();
  const [settings, setSettings] = useState({
    email: {
      enabled: false,
      timing: 30,
    },
    sms: {
      enabled: false,
      timing: 30,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const params = new URLSearchParams();
        if (eventId) params.append('eventId', eventId);
        if (activityId) params.append('activityId', activityId);

        const response = await fetch(`/api/notifications/settings?${params}`);
        const data = await response.json();

        const emailSettings = data.find((s: any) => s.channel.includes('EMAIL')) || {};
        const smsSettings = data.find((s: any) => s.channel.includes('SMS')) || {};

        setSettings({
          email: {
            enabled: emailSettings.enabled || false,
            timing: emailSettings.timing || 30,
          },
          sms: {
            enabled: smsSettings.enabled || false,
            timing: smsSettings.timing || 30,
          },
        });
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast.error(t('Failed to load notification settings'));
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchSettings();
    }
  }, [session, eventId, activityId]);

  const handleSettingChange = async (type: 'email' | 'sms', field: 'enabled' | 'timing', value: boolean | number) => {
    try {
      const newSettings = {
        ...settings,
        [type]: {
          ...settings[type],
          [field]: value,
        },
      };

      setSettings(newSettings);

      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventId ? 'EVENT_START' : 'ACTIVITY_START',
          channel: [type.toUpperCase()],
          timing: newSettings[type].timing,
          enabled: newSettings[type].enabled,
          eventId,
          activityId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast.success(t('Notification settings updated'));
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error(t('Failed to update notification settings'));
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium">{t('Notification Settings')}</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{t('Email Notifications')}</h4>
            <p className="text-sm text-gray-500">{t('Receive updates via email')}</p>
          </div>
          <Switch
            checked={settings.email.enabled}
            onChange={(enabled) => handleSettingChange('email', 'enabled', enabled)}
            className={`${
              settings.email.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                settings.email.enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {settings.email.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700">
              {t('Notify me before (minutes)')}
            </label>
            <select
              value={settings.email.timing}
              onChange={(e) => handleSettingChange('email', 'timing', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value={15}>15 {t('minutes')}</option>
              <option value={30}>30 {t('minutes')}</option>
              <option value={60}>1 {t('hour')}</option>
              <option value={1440}>1 {t('day')}</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{t('SMS Notifications')}</h4>
            <p className="text-sm text-gray-500">{t('Receive updates via SMS')}</p>
          </div>
          <Switch
            checked={settings.sms.enabled}
            onChange={(enabled) => handleSettingChange('sms', 'enabled', enabled)}
            className={`${
              settings.sms.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                settings.sms.enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {settings.sms.enabled && (
          <div className="ml-4">
            <label className="block text-sm font-medium text-gray-700">
              {t('Notify me before (minutes)')}
            </label>
            <select
              value={settings.sms.timing}
              onChange={(e) => handleSettingChange('sms', 'timing', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value={15}>15 {t('minutes')}</option>
              <option value={30}>30 {t('minutes')}</option>
              <option value={60}>1 {t('hour')}</option>
              <option value={1440}>1 {t('day')}</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
} 