import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EventTemplate } from '@/components/event/templates';
import { Metadata, ResolvingMetadata } from 'next';

interface SharedEventPageProps {
  params: {
    id: string;
  };
  searchParams: {
    design?: string;
  };
}

export async function generateMetadata(
  { params, searchParams }: SharedEventPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { title: true, description: true },
  });

  if (!event) return { title: 'Event Not Found' };

  return {
    title: event.title,
    description: event.description || `Join us for ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.description || `Join us for ${event.title}`,
    },
  };
}

export default async function SharedEventPage({ params, searchParams }: SharedEventPageProps) {
  const event = await prisma.event.findUnique({
    where: {
      id: params.id,
    },
    include: {
      location: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!event || event.visibility === 'PRIVATE') {
    notFound();
  }

  // Convert date strings to Date objects
  const eventWithDates = {
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <EventTemplate 
            event={eventWithDates} 
            design={searchParams.design || 'modern'} 
            userPreferences={{ dateFormat: 'MMMM do yyyy', timeFormat: '12h' }}
          />
          <div className="mt-8 text-center text-sm text-gray-500">
            Created by {event.user.name || 'Anonymous'}
          </div>
        </div>
      </div>
    </div>
  );
}
