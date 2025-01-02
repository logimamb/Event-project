import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export function TestimonialForm() {
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error('Please sign in to submit a testimonial')
      return
    }

    if (!content.trim()) {
      toast.error('Please enter your feedback')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, rating }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit testimonial')
      }

      toast.success('Thank you for your feedback!')
      setContent('')
      setRating(5)
    } catch (error) {
      toast.error('Failed to submit testimonial. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            {star <= rating ? (
              <StarIcon className="h-8 w-8 text-yellow-400" />
            ) : (
              <StarOutline className="h-8 w-8 text-gray-300" />
            )}
          </button>
        ))}
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience with us..."
        className="min-h-[100px]"
        required
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !session}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
      </Button>
      {!session && (
        <p className="text-sm text-gray-500 text-center">
          Please sign in to submit a testimonial
        </p>
      )}
    </form>
  )
}
