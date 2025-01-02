import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  children: ReactNode
  description?: string
  required?: boolean
  error?: string | null
  name: string
  type?: string
  defaultValue?: string
  disabled?: boolean
}

export function FormField({
  label,
  children,
  description,
  required,
  error,
  name,
  ...props
}: FormFieldProps) {
  const id = name || label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${id}-error`
  const descriptionId = `${id}-description`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {description && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </span>
        )}
      </div>
      
      <div
        className={cn(
          'relative rounded-md',
          error && 'animate-shake'
        )}
        aria-describedby={
          error
            ? errorId
            : description
            ? descriptionId
            : undefined
        }
        aria-invalid={error ? "true" : "false"}
        aria-required={required}
      >
        {children}

        {/* Error indicator */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          id={errorId}
          className="text-sm font-medium text-red-500 dark:text-red-400"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
} 
