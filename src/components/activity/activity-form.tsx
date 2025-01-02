'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from 'next-auth/react';
import { ActivityDesignForm } from './activity-design-form';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  capacity: z.number().min(1).optional(),
  design: z.object({
    template: z.string(),
  }).optional(),
});

interface ActivityFormProps {
  activity?: Activity;
  eventId: string;
}

export function ActivityForm({ activity, eventId }: ActivityFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState<Date>(activity?.startDate || new Date());
  const [endDate, setEndDate] = useState<Date>(activity?.endDate || new Date());
  const [error, setError] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: activity?.title || '',
      description: activity?.description || '',
      location: {
        country: activity?.location?.country || '',
        city: activity?.location?.city || '',
        address: activity?.location?.address || '',
      },
      capacity: activity?.capacity || 1,
      design: activity?.design || { template: 'modern' },
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/activities', {
        method: activity ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate,
          endDate,
          eventId,
          id: activity?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      toast({
        title: activity ? "Activity updated" : "Activity created",
        description: activity ? "Your activity has been updated successfully." : "Your activity has been created successfully.",
      });

      router.refresh();
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error('Failed to save activity:', error);
      setError(error instanceof Error ? error.message : 'Failed to save activity');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Date and Time</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Start</FormLabel>
                  <DateTimePicker date={startDate} setDate={setStartDate} />
                </div>
                <div>
                  <FormLabel>End</FormLabel>
                  <DateTimePicker date={endDate} setDate={setEndDate} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <FormLabel>Location</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="design">
            <ActivityDesignForm
              initialDesign={form.getValues().design}
              onSave={(design) => form.setValue('design', design)}
              activity={{
                ...activity,
                title: form.getValues().title,
                description: form.getValues().description,
                startDate,
                endDate,
                location: form.getValues().location,
                capacity: form.getValues().capacity,
              }}
            />
          </TabsContent>
        </Tabs>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            {activity ? 'Update Activity' : 'Create Activity'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
