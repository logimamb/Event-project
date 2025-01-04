'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const messageFormSchema = z.object({
  receiverId: z.string({
    required_error: 'Please select a recipient',
  }),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['DIRECT', 'TEAM', 'ANNOUNCEMENT', 'TASK', 'EVENT', 'REMINDER', 'FEEDBACK']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  category: z.enum(['GENERAL', 'PROJECT', 'MEETING', 'TASK', 'EVENT', 'FEEDBACK', 'APPROVAL', 'REPORT', 'ANNOUNCEMENT', 'QUESTION']),
  dueDate: z.date().optional(),
  reminderDate: z.date().optional(),
  labels: z.array(z.string()).default([])
})

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface NewMessageDialogProps {
  users: User[]
  onMessageSent?: () => Promise<void>
}

export function NewMessageDialog({ users = [], onMessageSent }: NewMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('messages')
  const { data: session } = useSession()
  
  const otherUsers = users?.filter(user => user.id !== session?.user?.id) || []

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: '',
      content: '',
      type: 'DIRECT',
      priority: 'MEDIUM',
      category: 'GENERAL',
      receiverId: '',
      dueDate: undefined,
      reminderDate: undefined,
      labels: []
    }
  })

  async function onSubmit(values: z.infer<typeof messageFormSchema>) {
    try {
      setLoading(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: values.receiverId,
          subject: values.subject,
          content: values.content,
          type: values.type,
          priority: values.priority,
          category: values.category,
          dueDate: values.dueDate,
          reminderDate: values.reminderDate,
          labels: values.labels
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send message')
      }

      const newMessage = await response.json()
      console.log('New message created:', newMessage)

      form.reset()
      setOpen(false)
      toast.success(t('message_sent'))
      
      if (onMessageSent) {
        await onMessageSent()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(t('error_sending_message'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('new_message')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('new_message')}</DialogTitle>
          <DialogDescription>
            {t('new_message_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="receiverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('to')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('select_recipient')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {otherUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('subject')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('subject_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('content')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('content_placeholder')} 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DIRECT">{t('direct')}</SelectItem>
                        <SelectItem value="TEAM">{t('team')}</SelectItem>
                        <SelectItem value="ANNOUNCEMENT">{t('announcement')}</SelectItem>
                        <SelectItem value="TASK">{t('task')}</SelectItem>
                        <SelectItem value="EVENT">{t('event')}</SelectItem>
                        <SelectItem value="REMINDER">{t('reminder')}</SelectItem>
                        <SelectItem value="FEEDBACK">{t('feedback')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('priority')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">{t('low')}</SelectItem>
                        <SelectItem value="MEDIUM">{t('medium')}</SelectItem>
                        <SelectItem value="HIGH">{t('high')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('send')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
