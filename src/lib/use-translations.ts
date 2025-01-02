import { useContext } from 'react'
import { TranslationContext } from '@/components/translation-provider'

export function useTranslations() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider')
  }
  return context
} 