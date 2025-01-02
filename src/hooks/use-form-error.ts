import { useState } from 'react'
import { FieldError } from 'react-hook-form'

interface FormErrorReturn {
  formError: string | null
  setFormError: (error: string | null) => void
  ariaProps: {
    'aria-invalid'?: 'true'
    'aria-describedby'?: string
  }
}

export function useFormError(fieldName?: string): FormErrorReturn {
  const [formError, setFormError] = useState<string | null>(null)

  const ariaProps = formError
    ? {
        'aria-invalid': 'true' as const,
        'aria-describedby': fieldName ? `${fieldName}-error` : undefined,
      }
    : {}

  return {
    formError,
    setFormError,
    ariaProps,
  }
} 