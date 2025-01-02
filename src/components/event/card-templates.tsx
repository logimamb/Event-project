'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface CardTemplate {
  id: string
  name: string
  description: string
  previewImage: string
  background: string
  textColor: string
  accentColor: string
  pattern?: string
}

export const cardTemplates: CardTemplate[] = [
  {
    id: 'elegant-gradient',
    name: 'Elegant Gradient',
    description: 'A sophisticated gradient from deep purple to rose',
    previewImage: '/card-templates/elegant-gradient.png',
    background: 'bg-gradient-to-br from-purple-500 to-pink-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean and minimal design with subtle accents',
    previewImage: '/card-templates/modern-minimal.png',
    background: 'bg-zinc-900',
    textColor: 'text-white',
    accentColor: 'bg-zinc-800'
  },
  {
    id: 'nature-vibes',
    name: 'Nature Vibes',
    description: 'Fresh and natural green gradient',
    previewImage: '/card-templates/nature-vibes.png',
    background: 'bg-gradient-to-br from-green-400 to-emerald-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calming blue tones inspired by the ocean',
    previewImage: '/card-templates/ocean-breeze.png',
    background: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm sunset colors with a modern touch',
    previewImage: '/card-templates/sunset-glow.png',
    background: 'bg-gradient-to-br from-orange-400 to-rose-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'geometric-pattern',
    name: 'Geometric Pattern',
    description: 'Modern geometric patterns with bold colors',
    previewImage: '/card-templates/geometric-pattern.png',
    background: 'bg-indigo-600',
    textColor: 'text-white',
    accentColor: 'bg-indigo-500',
    pattern: 'pattern-grid-lg opacity-10'
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    description: 'Elegant dark theme with gold accents',
    previewImage: '/card-templates/dark-luxury.png',
    background: 'bg-black',
    textColor: 'text-yellow-500',
    accentColor: 'bg-yellow-900/50'
  },
  {
    id: 'spring-bloom',
    name: 'Spring Bloom',
    description: 'Light and fresh spring colors',
    previewImage: '/card-templates/spring-bloom.png',
    background: 'bg-gradient-to-br from-pink-300 to-rose-400',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'tech-wave',
    name: 'Tech Wave',
    description: 'Futuristic design with neon accents',
    previewImage: '/card-templates/tech-wave.png',
    background: 'bg-slate-900',
    textColor: 'text-cyan-400',
    accentColor: 'bg-cyan-900/50',
    pattern: 'pattern-circuit-board opacity-5'
  },
  {
    id: 'marble-elegance',
    name: 'Marble Elegance',
    description: 'Sophisticated marble-inspired design',
    previewImage: '/card-templates/marble-elegance.png',
    background: 'bg-gradient-to-br from-gray-100 to-gray-200',
    textColor: 'text-gray-900',
    accentColor: 'bg-black/5'
  },
  {
    id: 'cosmic-night',
    name: 'Cosmic Night',
    description: 'Deep space inspired with star patterns',
    previewImage: '/card-templates/cosmic-night.png',
    background: 'bg-gradient-to-br from-purple-900 to-indigo-900',
    textColor: 'text-white',
    accentColor: 'bg-white/10',
    pattern: 'pattern-dots opacity-5'
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    description: 'Vibrant tropical colors and patterns',
    previewImage: '/card-templates/tropical-paradise.png',
    background: 'bg-gradient-to-br from-teal-400 to-emerald-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'retro-pop',
    name: 'Retro Pop',
    description: 'Fun and playful retro-inspired design',
    previewImage: '/card-templates/retro-pop.png',
    background: 'bg-yellow-400',
    textColor: 'text-purple-900',
    accentColor: 'bg-purple-900/10',
    pattern: 'pattern-zigzag opacity-10'
  },
  {
    id: 'winter-frost',
    name: 'Winter Frost',
    description: 'Cool and crisp winter-inspired theme',
    previewImage: '/card-templates/winter-frost.png',
    background: 'bg-gradient-to-br from-blue-100 to-blue-200',
    textColor: 'text-blue-900',
    accentColor: 'bg-white/40'
  },
  {
    id: 'urban-night',
    name: 'Urban Night',
    description: 'Modern urban design with bold contrasts',
    previewImage: '/card-templates/urban-night.png',
    background: 'bg-zinc-900',
    textColor: 'text-white',
    accentColor: 'bg-zinc-800',
    pattern: 'pattern-texture opacity-30'
  }
]

interface CardTemplatePickerProps {
  value: string
  onChange: (value: string) => void
}

export function CardTemplatePicker({ value, onChange }: CardTemplatePickerProps) {
  const t = useTranslations('events.templates')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cardTemplates.map((template) => (
        <div
          key={template.id}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg p-4 cursor-pointer transition-all hover:scale-105",
            "border-2",
            value === template.id ? "border-primary" : "border-transparent",
            template.background,
            template.pattern
          )}
          onClick={() => onChange(template.id)}
        >
          <div className="text-center">
            <h3 className="font-semibold mb-1">{t(`${template.id}.name`)}</h3>
            <p className="text-sm opacity-90">{t(`${template.id}.description`)}</p>
          </div>
          {value === template.id && (
            <div className="absolute inset-0 border-2 border-primary rounded-lg" />
          )}
        </div>
      ))}
    </div>
  )
}
