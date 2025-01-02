import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'

const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  categories: z.array(z.string()).optional(),
})

interface Category {
  id: string
  name: string
}

interface NewsletterSubscriptionProps {
  categories: Category[]
  onSubscribe: (data: z.infer<typeof subscriptionSchema>) => Promise<void>
}

export function NewsletterSubscription({
  categories,
  onSubscribe,
}: NewsletterSubscriptionProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      email: '',
      categories: [],
    },
  })

  const handleSubmit = async (data: z.infer<typeof subscriptionSchema>) => {
    try {
      setIsSubmitting(true)
      await onSubscribe(data)
      form.reset()
      toast({
        title: 'Success',
        description: 'You have been subscribed to our newsletter',
      })
    } catch (error) {
      console.error('Subscription failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to subscribe to newsletter',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Subscribe to our Newsletter
        </h2>
        <p className="text-muted-foreground">
          Stay updated with the latest events and activities
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categories"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Event Categories</FormLabel>
                  <FormDescription>
                    Select the types of events you're interested in
                  </FormDescription>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  const value = field.value || []
                                  return checked
                                    ? field.onChange([...value, category.id])
                                    : field.onChange(
                                        value.filter((id) => id !== category.id)
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {category.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </Form>
    </div>
  )
} 
