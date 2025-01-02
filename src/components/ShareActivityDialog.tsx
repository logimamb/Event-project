'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ShareIcon, MailIcon, QrCodeIcon, CopyIcon, CheckIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Activity } from '@/types'
import { shareActivity } from '@/app/actions/activities'
import { useTranslations } from '@/lib/use-translations'
import QRCode from 'qrcode.react'
import { cn, generateShareableUrl } from '@/lib/utils'

interface ShareActivityDialogProps {
  activity: Activity
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ShareActivityDialog({ 
  activity, 
  variant = 'outline',
  size = 'sm',
  className 
}: ShareActivityDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [includeAccessibility, setIncludeAccessibility] = useState(true)
  const { toast } = useToast()
  const { t } = useTranslations()

  const shareableUrl = generateShareableUrl('activity', activity.id, activity.shareableSlug)

  // Reset form state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setMessage('')
      setIncludeAccessibility(true)
      setIsCopied(false)
    }
  }, [isOpen])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: t('success'),
        description: t('linkCopied'),
        role: 'status',
        'aria-live': 'polite',
      })
    } catch (error) {
      toast({
        title: t('error'),
        description: t('copyFailed'),
        variant: 'destructive',
        role: 'alert',
      })
    }
  }

  const handleShare = async (type: 'email' | 'link' | 'qr') => {
    setIsLoading(true)
    try {
      const shareData = {
        type,
        email,
        message,
        includeAccessibility,
      }

      await shareActivity(activity.id, shareData)

      toast({
        title: t('success'),
        description: type === 'email' ? t('emailSent') : t('shareLinkCreated'),
        role: 'status',
        'aria-live': 'polite',
      })

      if (type === 'email') {
        setEmail('')
        setMessage('')
      }
      setIsOpen(false)
    } catch (error) {
      toast({
        title: t('error'),
        description: t('shareFailed'),
        variant: 'destructive',
        role: 'alert',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          aria-label={t('shareActivity')}
        >
          <ShareIcon className="h-4 w-4" aria-hidden="true" />
          {size !== 'icon' && <span>{t('share')}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md"
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-description"
        role="dialog"
      >
        <DialogHeader>
          <DialogTitle id="share-dialog-title">{t('shareActivity')}</DialogTitle>
          <DialogDescription id="share-dialog-description">
            {t('shareActivityDescription')}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="link" className="w-full" role="tablist">
          <TabsList className="grid w-full grid-cols-3" aria-label={t('shareOptions')}>
            <TabsTrigger value="link" role="tab" aria-controls="link-tab">
              <ShareIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('link')}
            </TabsTrigger>
            <TabsTrigger value="email" role="tab" aria-controls="email-tab">
              <MailIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('email')}
            </TabsTrigger>
            <TabsTrigger value="qr" role="tab" aria-controls="qr-tab">
              <QrCodeIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('qrCode')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="link" role="tabpanel" id="link-tab" className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={shareableUrl}
                readOnly
                className="flex-1"
                aria-label={t('shareableLink')}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                disabled={isCopied}
                aria-label={isCopied ? t('linkCopied') : t('copyLink')}
              >
                {isCopied ? (
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <CopyIcon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-accessibility"
                checked={includeAccessibility}
                onCheckedChange={setIncludeAccessibility}
                aria-label={t('includeAccessibility')}
              />
              <Label htmlFor="include-accessibility" className="cursor-pointer">
                {t('includeAccessibility')}
              </Label>
            </div>
            <Button
              onClick={() => handleShare('link')}
              disabled={isLoading}
              className="w-full"
              aria-busy={isLoading}
            >
              {t('createShareableLink')}
            </Button>
          </TabsContent>
          <TabsContent value="email" role="tabpanel" id="email-tab" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  aria-required="true"
                  aria-invalid={email !== '' && !email.includes('@')}
                  aria-describedby="email-error"
                />
                {email !== '' && !email.includes('@') && (
                  <p id="email-error" className="text-sm text-red-500" role="alert">
                    {t('invalidEmail')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t('message')}</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('optionalMessage')}
                  aria-label={t('message')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-accessibility-email"
                  checked={includeAccessibility}
                  onCheckedChange={setIncludeAccessibility}
                  aria-label={t('includeAccessibility')}
                />
                <Label htmlFor="include-accessibility-email" className="cursor-pointer">
                  {t('includeAccessibility')}
                </Label>
              </div>
            </div>
            <Button
              onClick={() => handleShare('email')}
              disabled={isLoading || !email || !email.includes('@')}
              className="w-full"
              aria-busy={isLoading}
            >
              <MailIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('sendEmail')}
            </Button>
          </TabsContent>
          <TabsContent value="qr" role="tabpanel" id="qr-tab" className="space-y-4">
            <div 
              className="flex justify-center p-4 bg-white rounded-lg"
              role="img"
              aria-label={t('activityQrCode')}
            >
              <QRCode
                value={shareableUrl}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <Button
              onClick={() => handleShare('qr')}
              disabled={isLoading}
              className="w-full"
              aria-busy={isLoading}
            >
              <QrCodeIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('downloadQrCode')}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 