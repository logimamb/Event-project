import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Calendar</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Your Events</h2>
              <p className="text-gray-500">View and manage your upcoming events</p>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Sync with Google Calendar
              </button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {/* Calendar component will be added here */}
            <div className="h-[600px] border rounded-lg p-4">
              <p className="text-center text-gray-500">
                Calendar view will be implemented with react-big-calendar
              </p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
} 
