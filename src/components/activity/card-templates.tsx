'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

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

export const activityCardTemplates: CardTemplate[] = [
  {
    id: 'fitness-theme',
    name: 'Fitness Theme',
    description: 'Energetic design for fitness activities',
    previewImage: '/card-templates/fitness-theme.png',
    background: 'bg-gradient-to-br from-orange-500 to-rose-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'learning-focus',
    name: 'Learning Focus',
    description: 'Clean design for educational activities',
    previewImage: '/card-templates/learning-focus.png',
    background: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'creative-workshop',
    name: 'Creative Workshop',
    description: 'Artistic design for creative activities',
    previewImage: '/card-templates/creative-workshop.png',
    background: 'bg-gradient-to-br from-purple-500 to-pink-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'outdoor-adventure',
    name: 'Outdoor Adventure',
    description: 'Nature-inspired design for outdoor activities',
    previewImage: '/card-templates/outdoor-adventure.png',
    background: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'team-building',
    name: 'Team Building',
    description: 'Collaborative design for group activities',
    previewImage: '/card-templates/team-building.png',
    background: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'tech-workshop',
    name: 'Tech Workshop',
    description: 'Modern design for technology activities',
    previewImage: '/card-templates/tech-workshop.png',
    background: 'bg-gradient-to-br from-slate-900 to-slate-800',
    textColor: 'text-white',
    accentColor: 'bg-white/10',
    pattern: 'pattern-circuit-board opacity-5'
  },
  {
    id: 'wellness-zen',
    name: 'Wellness & Zen',
    description: 'Calming design for wellness activities',
    previewImage: '/card-templates/wellness-zen.png',
    background: 'bg-gradient-to-br from-teal-400 to-teal-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'art-culture',
    name: 'Art & Culture',
    description: 'Artistic design for cultural activities',
    previewImage: '/card-templates/art-culture.png',
    background: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'food-cooking',
    name: 'Food & Cooking',
    description: 'Warm design for culinary activities',
    previewImage: '/card-templates/food-cooking.png',
    background: 'bg-gradient-to-br from-red-500 to-orange-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'music-performance',
    name: 'Music & Performance',
    description: 'Dynamic design for performance activities',
    previewImage: '/card-templates/music-performance.png',
    background: 'bg-gradient-to-br from-violet-500 to-purple-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'business-pro',
    name: 'Business Pro',
    description: 'Professional design for business activities',
    previewImage: '/card-templates/business-pro.png',
    background: 'bg-gradient-to-br from-gray-900 to-gray-800',
    textColor: 'text-white',
    accentColor: 'bg-white/10'
  },
  {
    id: 'gaming-esports',
    name: 'Gaming & Esports',
    description: 'Gaming-inspired design for digital activities',
    previewImage: '/card-templates/gaming-esports.png',
    background: 'bg-gradient-to-br from-purple-600 to-blue-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20',
    pattern: 'pattern-hexagons opacity-10'
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Serene design for mindfulness activities',
    previewImage: '/card-templates/mindfulness.png',
    background: 'bg-gradient-to-br from-sky-400 to-blue-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'social-networking',
    name: 'Social Networking',
    description: 'Modern design for social activities',
    previewImage: '/card-templates/social-networking.png',
    background: 'bg-gradient-to-br from-pink-500 to-rose-600',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  },
  {
    id: 'hobby-craft',
    name: 'Hobby & Craft',
    description: 'Creative design for hobby activities',
    previewImage: '/card-templates/hobby-craft.png',
    background: 'bg-gradient-to-br from-amber-400 to-orange-500',
    textColor: 'text-white',
    accentColor: 'bg-white/20'
  }
]

interface CardTemplatePickerProps {
  value: string
  onChange: (value: string) => void
}

export function ActivityCardTemplatePicker({ value, onChange }: CardTemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activityCardTemplates.map((template) => (
        <button
          key={template.id}
          onClick={() => onChange(template.id)}
          className={cn(
            "relative aspect-video rounded-lg p-4 w-full transition-all",
            "hover:scale-105 hover:shadow-lg",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            template.background,
            template.pattern
          )}
        >
          <div className="absolute inset-0 rounded-lg border border-white/10" />
          {value === template.id && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <div className={cn("font-semibold mb-1", template.textColor)}>
            {template.name}
          </div>
          <div className={cn("text-sm opacity-80", template.textColor)}>
            {template.description}
          </div>
        </button>
      ))}
    </div>
  )
}
