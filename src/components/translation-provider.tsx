'use client'

import { createContext, useContext } from 'react'
import { translations } from '@/lib/translations'

export type TranslationType = typeof translations

export const TranslationContext = createContext<{
  t: (key: string) => string
  translations: TranslationType
}>({
  t: (key: string) => key,
  translations,
})

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const t = (key: string) => {
    const keys = key.split('.')
    let current: any = translations
    for (const k of keys) {
      if (current[k] === undefined) {
        return key
      }
      current = current[k]
    }
    return current
  }

  return (
    <TranslationContext.Provider value={{ t, translations }}>
      {children}
    </TranslationContext.Provider>
  )
}
