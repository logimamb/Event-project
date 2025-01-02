import React from 'react';
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from '@/lib/use-translations'
import { InvitationDesign } from '@prisma/client'
import InvitationDesignComponent from './invitation-design';

interface InvitationDesignFormProps {
  initialDesign?: any
  onSave: (design: any) => void
  event: any
}

const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Playfair Display',
  'Lato',
  'Poppins',
  'Dancing Script',
  'Oswald',
  'Quicksand',
]

const templates = [
  { id: 'default', name: 'Classic', preview: '/templates/classic.png' },
  { id: 'modern', name: 'Modern', preview: '/templates/modern.png' },
  { id: 'elegant', name: 'Elegant', preview: '/templates/elegant.png' },
  { id: 'playful', name: 'Playful', preview: '/templates/playful.png' },
  { id: 'corporate', name: 'Corporate', preview: '/templates/corporate.png' },
  { id: 'minimal', name: 'Minimal', preview: '/templates/minimal.png' },
  { id: 'festive', name: 'Festive', preview: '/templates/festive.png' },
  { id: 'formal', name: 'Formal', preview: '/templates/formal.png' },
]

const layoutOptions = [
  { id: 'centered', name: 'Centered' },
  { id: 'left-aligned', name: 'Left Aligned' },
  { id: 'right-aligned', name: 'Right Aligned' },
  { id: 'asymmetric', name: 'Asymmetric' },
]

export function InvitationDesignForm({ initialDesign, onSave, event }: InvitationDesignFormProps) {
  const { t } = useTranslations()
  const [design, setDesign] = useState<Partial<InvitationDesign>>(initialDesign || {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#4f46e5',
    fontFamily: 'Inter',
    template: 'default',
    layout: 'centered',
    fontSize: '16',
    borderRadius: '8',
    spacing: 'normal',
    headerImage: '',
    backgroundPattern: '',
    animation: 'none',
  })
  const [showColorPicker, setShowColorPicker] = useState({
    background: false,
    text: false,
    accent: false,
  })

  const handleDesignChange = (field: string, value: string | number) => {
    setDesign({ ...design, [field]: value })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement file upload logic
      // const logoUrl = await uploadFile(file)
      // setDesign({ ...design, logoUrl })
    }
  }

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement file upload logic
      // const headerImage = await uploadFile(file)
      // setDesign({ ...design, headerImage })
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Template Selection with Preview */}
        <div className="space-y-4">
          <Label>{t('invitation.template')}</Label>
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  design.template === template.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
                onClick={() => handleDesignChange('template', template.id)}
              >
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2 text-center">
                  {template.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color and Typography Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Colors */}
            <div>
              <Label>{t('invitation.colors')}</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded cursor-pointer border"
                    style={{ backgroundColor: design.backgroundColor }}
                    onClick={() => setShowColorPicker({ ...showColorPicker, background: !showColorPicker.background })}
                  />
                  <span className="text-sm">Background</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded cursor-pointer border"
                    style={{ backgroundColor: design.textColor }}
                    onClick={() => setShowColorPicker({ ...showColorPicker, text: !showColorPicker.text })}
                  />
                  <span className="text-sm">Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded cursor-pointer border"
                    style={{ backgroundColor: design.accentColor }}
                    onClick={() => setShowColorPicker({ ...showColorPicker, accent: !showColorPicker.accent })}
                  />
                  <span className="text-sm">Accent</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <Label>{t('invitation.typography')}</Label>
              <Select
                value={design.fontFamily}
                onValueChange={(value) => handleDesignChange('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('invitation.selectFont')} />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Label>{t('invitation.fontSize')}</Label>
                <Input
                  type="range"
                  min="12"
                  max="24"
                  value={design.fontSize}
                  onChange={(e) => handleDesignChange('fontSize', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Layout Options */}
          <div>
            <Label>{t('invitation.layout')}</Label>
            <Select
              value={design.layout}
              onValueChange={(value) => handleDesignChange('layout', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('invitation.selectLayout')} />
              </SelectTrigger>
              <SelectContent>
                {layoutOptions.map((layout) => (
                  <SelectItem key={layout.id} value={layout.id}>
                    {layout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Customization */}
          <div className="space-y-2">
            <Label>{t('invitation.additionalCustomization')}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">{t('invitation.borderRadius')}</Label>
                <Input
                  type="range"
                  min="0"
                  max="20"
                  value={design.borderRadius}
                  onChange={(e) => handleDesignChange('borderRadius', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm">{t('invitation.spacing')}</Label>
                <Select
                  value={design.spacing}
                  onValueChange={(value) => handleDesignChange('spacing', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8">
        <Label>{t('invitation.preview')}</Label>
        <div
          className="mt-2 p-6 rounded-lg border"
          style={{
            backgroundColor: design.backgroundColor,
            color: design.textColor,
            fontFamily: design.fontFamily,
            fontSize: `${design.fontSize}px`,
            borderRadius: `${design.borderRadius}px`,
          }}
        >
          <div className="aspect-video flex items-center justify-center">
            {t('invitation.previewContent')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>{t('logo')}</Label>
        <Input type="file" accept="image/*" onChange={handleLogoUpload} />
      </div>

      <div className="space-y-4">
        <Label>{t('headerImage')}</Label>
        <Input type="file" accept="image/*" onChange={handleHeaderImageUpload} />
      </div>

      <div className="space-y-4">
        <Label>{t('customCss')}</Label>
        <Input
          value={design.customCss || ''}
          onChange={(e) => handleDesignChange('customCss', e.target.value)}
          placeholder=".invitation { /* your custom styles */ }"
        />
      </div>

      <InvitationDesignComponent value={design.template} onChange={(value) => handleDesignChange('template', value)} event={event} />

      <Button onClick={() => onSave(design)}>{t('saveDesign')}</Button>
    </div>
  )
}
