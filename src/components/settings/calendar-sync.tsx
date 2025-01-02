'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GoogleCalendar {
  id: string;
  name: string;
  synced: boolean;
}

export function CalendarSync() {
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchCalendars();
  }, []);

  async function fetchCalendars() {
    try {
      const response = await fetch('/api/calendars');
      if (!response.ok) throw new Error('Failed to fetch calendars');
      const data = await response.json();
      setCalendars(data.calendars);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendars",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    try {
      setSyncing(true);
      const response = await fetch('/api/calendars/sync', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to sync calendars');
      
      await fetchCalendars();
      
      toast({
        title: "Success",
        description: "Calendars synced successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync calendars",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleToggleCalendar(calendarId: string) {
    try {
      const response = await fetch(`/api/calendars/${calendarId}/toggle`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to toggle calendar');
      
      await fetchCalendars();
      
      toast({
        title: "Success",
        description: "Calendar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update calendar",
        variant: "destructive",
      });
    }
  }

  async function handleRemoveCalendar(calendarId: string) {
    try {
      const response = await fetch(`/api/calendars/${calendarId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove calendar');
      
      await fetchCalendars();
      
      toast({
        title: "Success",
        description: "Calendar removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove calendar",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return <div>Loading calendars...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Google Calendar Sync</h2>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-4">
          {calendars.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No calendars found. Click "Sync Now" to fetch your Google Calendars.</p>
            </div>
          ) : (
            calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{calendar.name}</p>
                    <p className="text-sm text-gray-500">
                      {calendar.synced ? 'Synced' : 'Not synced'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={calendar.synced ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleCalendar(calendar.id)}
                  >
                    {calendar.synced ? 'Synced' : 'Sync'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveCalendar(calendar.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
