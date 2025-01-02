import { useEffect, useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Testimonial {
  id: string
  content: string
  rating: number
  isHidden: boolean
  user: {
    name: string | null
    image: string | null
  }
  createdAt: string
}

export function TestimonialsList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials')
      if (!response.ok) throw new Error('Failed to fetch testimonials')
      const data = await response.json()
      setTestimonials(data)
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Failed to load testimonials')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleHideTestimonial = async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}/visibility`, {
        method: 'PATCH',
      })
      if (!response.ok) throw new Error('Failed to update testimonial')
      await fetchTestimonials()
      toast.success('Testimonial visibility updated')
    } catch (error) {
      toast.error('Failed to update testimonial')
    }
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete testimonial')
      await fetchTestimonials()
      toast.success('Testimonial deleted')
    } catch (error) {
      toast.error('Failed to delete testimonial')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading testimonials...</div>
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No testimonials yet. Be the first to share your experience!
      </div>
    )
  }

  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className={`p-6 rounded-lg shadow-md bg-white ${
            testimonial.isHidden ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              {testimonial.user.image ? (
                <Image
                  src={testimonial.user.image}
                  alt={testimonial.user.name || 'User'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {testimonial.user.name?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium">
                {testimonial.user.name || 'Anonymous'}
              </h3>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            {isAdmin && (
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleHideTestimonial(testimonial.id)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title={testimonial.isHidden ? 'Show' : 'Hide'}
                >
                  <EyeSlashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteTestimonial(testimonial.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600">{testimonial.content}</p>
          <time className="text-sm text-gray-400 mt-2 block">
            {new Date(testimonial.createdAt).toLocaleDateString()}
          </time>
        </div>
      ))}
    </div>
  )
}
