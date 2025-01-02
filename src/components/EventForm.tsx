'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Event, Location } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from 'next-auth/react'
import { InvitationDesignForm } from './event/invitation-design-form'
import { useTranslations } from '@/lib/use-translations'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').optional(),
  googleCalendarId: z.string().optional(),
  highlights: z.array(z.object({
    text: z.string().min(1, 'Highlight text is required')
  })).optional(),
  isPublic: z.boolean().optional(),
  templateId: z.string().optional(),
});

interface EventFormProps {
  event?: Event & {
    location?: Location | null;
  };
  locale?: string;
  isEdit?: boolean;
}

export function EventForm({ event, locale = 'en', isEdit = false }: EventFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [startDate, setStartDate] = useState<Date>(event?.startDate || new Date())
  const [endDate, setEndDate] = useState<Date>(event?.endDate || new Date())
  const [calendars, setCalendars] = useState<{ id: string; summary: string; }[]>([])
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [googleCalendarId, setGoogleCalendarId] = useState<string>(event?.googleCalendarId || '')
  const [error, setError] = useState<string>('')
  const { t } = useTranslations(locale)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      location: {
        country: event?.location?.country || '',
        city: event?.location?.city || '',
        address: event?.location?.address || '',
      },
      capacity: event?.capacity || undefined,
      googleCalendarId: event?.googleCalendarId || '',
      highlights: event?.highlights || [{ text: '' }],
      isPublic: event?.isPublic ?? true,
      templateId: event?.templateId || '',
    },
  });

  useEffect(() => {
    async function fetchCalendars() {
      if (session?.user) {
        setIsLoadingCalendars(true);
        try {
          const response = await fetch('/api/google/calendars');
          const data = await response.json();
          if (data.error) {
            console.error('Error fetching calendars:', data.error);
            setCalendars([]);
          } else {
            setCalendars(data.calendars || []);
          }
        } catch (error) {
          console.error('Error fetching calendars:', error);
          setCalendars([]);
        } finally {
          setIsLoadingCalendars(false);
        }
      }
    }
    fetchCalendars();
  }, [session]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSaving(true);
    setError('');

    // Validate dates
    if (endDate < startDate) {
      setError('End date must be after start date');
      setIsSaving(false);
      return;
    }

    try {
      const endpoint = isEdit ? `/api/events/${event?.id}` : '/api/events';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate,
          endDate,
          googleCalendarId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save event');
      }

      const savedEvent = await response.json();
      
      toast({
        title: isEdit ? 'Event Updated' : 'Event Created',
        description: isEdit ? 'Your event has been updated successfully.' : 'Your event has been created successfully.',
      });

      router.push(`/${locale}/events/${savedEvent.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error instanceof Error ? error.message : 'Failed to save event');
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : 'Failed to save event',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleDesignSave = async (design: any) => {
    if (!event?.id) return;
    try {
      const response = await fetch(`/api/events/${event.id}/design`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design),
      });

      if (!response.ok) {
        throw new Error('Failed to save design');
      }

      toast({
        title: 'Design Updated',
        description: 'Invitation design has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save invitation design',
        variant: 'destructive',
      });
    }
  };

  return (
    <Tabs defaultValue="details" className="space-y-6">
      <TabsList className="w-full">
        <TabsTrigger value="details" className="flex-1">{t('eventDetails')}</TabsTrigger>
        <TabsTrigger value="design" className="flex-1">{t('invitationDesign')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('title')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('eventTitlePlaceholder')} />
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
                    <FormLabel>{t('description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('eventDescriptionPlaceholder')} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormItem>
                  <FormLabel>{t('startDate')}</FormLabel>
                  <DateTimePicker date={startDate} setDate={setStartDate} />
                </FormItem>

                <FormItem>
                  <FormLabel>{t('endDate')}</FormLabel>
                  <DateTimePicker date={endDate} setDate={setEndDate} />
                </FormItem>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('country')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('countryPlaceholder')} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('city')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('cityPlaceholder')} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('address')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('addressPlaceholder')} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maxAttendees')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" placeholder={t('maxAttendeesPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Highlights Section */}
              <div className="space-y-4">
                <FormLabel>{t('highlights')}</FormLabel>
                {form.getValues('highlights')?.map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`highlights.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input {...field} placeholder={t('highlightPlaceholder')} />
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const highlights = form.getValues('highlights') || [];
                                  form.setValue('highlights', highlights.filter((_, i) => i !== index));
                                }}
                              >
                                <span className="sr-only">{t('removeHighlight')}</span>
                                ×
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const highlights = form.getValues('highlights') || [];
                    form.setValue('highlights', [...highlights, { text: '' }]);
                  }}
                >
                  {t('addHighlight')}
                </Button>
              </div>

              <FormField
                control={form.control}
                name="googleCalendarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('googleCalendar')}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || "placeholder"}
                      disabled={isLoadingCalendars}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              isLoadingCalendars 
                                ? t('loadingCalendars')
                                : calendars.length === 0 
                                  ? t('noCalendarsAvailable')
                                  : t('selectCalendar')
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>
                          {isLoadingCalendars 
                            ? t('loadingCalendars')
                            : calendars.length === 0 
                              ? t('noCalendarsAvailable')
                              : t('selectCalendar')
                          }
                        </SelectItem>
                        {calendars && calendars.length > 0 && calendars.map((calendar: { id: string; summary: string }) => (
                          <SelectItem key={calendar.id} value={calendar.id}>
                            {calendar.summary}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isLoadingCalendars 
                        ? t('loadingGoogleCalendars')
                        : t('selectCalendarDescription')
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isSaving}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? t('updateEvent') : t('createEvent')}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="design">
        <InvitationDesignForm 
          initialDesign={event?.invitationDesign} 
          onSave={handleDesignSave}
          event={form.getValues()}
        />
      </TabsContent>
    </Tabs>
  )
}
