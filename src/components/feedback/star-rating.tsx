'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  'aria-label'?: string
}

export function StarRating({ value, onChange, 'aria-label': ariaLabel }: StarRatingProps) {
  return (
    <div 
      className="flex gap-1" 
      role="radiogroup" 
      aria-label={ariaLabel || "Rating"}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          role="radio"
          aria-checked={rating === value}
          aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
        >
          <Star
            className={`w-6 h-6 ${
              rating <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  )
}
