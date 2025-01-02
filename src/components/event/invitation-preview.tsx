import React from 'react';
import { Event } from '@prisma/client';
import { EventTemplate } from './templates';
import { useSession } from 'next-auth/react';
import { ShareEvent } from './share-event';

interface InvitationPreviewProps {
  event: Event;
  design: string;
}

export const InvitationPreview: React.FC<InvitationPreviewProps> = ({ event, design }) => {
  const { data: session } = useSession();
  const [userPreferences, setUserPreferences] = React.useState<{ dateFormat?: string; timeFormat?: string }>();

  React.useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        setUserPreferences({
          dateFormat: data.dateFormat || 'MMMM do yyyy',
          timeFormat: data.timeFormat || '12h'
        });
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        setUserPreferences({
          dateFormat: 'MMMM do yyyy',
          timeFormat: '12h'
        });
      }
    };

    if (session?.user) {
      fetchUserPreferences();
    }
  }, [session?.user]);

  // Convert date strings to Date objects
  const eventWithDates = {
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate)
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Preview</h3>
        <ShareEvent event={event} design={design} />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <EventTemplate event={eventWithDates} design={design} userPreferences={userPreferences} />
      </div>
    </div>
  );
};
