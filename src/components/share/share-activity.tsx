'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'
import QRCode from 'qrcode.react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Facebook,
  Twitter,
  Linkedin,
  Share2,
  Copy,
  QrCode,
  Check,
  WhatsApp,
  Mail
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ShareActivityProps {
  activityId: string
  title: string
  description?: string
}

export function ShareActivity({ activityId, title, description }: ShareActivityProps) {
  const t = useTranslations('activities')
  const { toast } = useToast()
  const [showQRCode, setShowQRCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/en/activities/${activityId}`
  const inputRef = useRef<HTMLInputElement>(null)

  const shareText = `${title}${description ? ` - ${description}` : ''}`
  const encodedShareText = encodeURIComponent(shareText)
  const encodedShareUrl = encodeURIComponent(shareUrl)

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedShareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
    whatsapp: `https://wa.me/?text=${encodedShareText}%20${encodedShareUrl}`,
    email: `mailto:?subject=${encodedShareText}&body=${encodedShareUrl}`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: t('linkCopied'),
        description: t('linkCopiedDesc'),
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for browsers that don't support clipboard API
      if (inputRef.current) {
        inputRef.current.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          {t('share')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('shareActivity')}</DialogTitle>
          <DialogDescription>
            {t('shareActivityDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Input
            ref={inputRef}
            defaultValue={shareUrl}
            readOnly
            className="flex-1"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? t('copied') : t('copyLink')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex flex-col space-y-4 mt-4">
          <div className="flex justify-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(socialLinks.facebook, '_blank')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('shareOnFacebook')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(socialLinks.twitter, '_blank')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('shareOnTwitter')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(socialLinks.linkedin, '_blank')}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('shareOnLinkedIn')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(socialLinks.whatsapp, '_blank')}
                  >
                    <WhatsApp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('shareOnWhatsApp')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(socialLinks.email, '_blank')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('shareViaEmail')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowQRCode(!showQRCode)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              {showQRCode ? t('hideQRCode') : t('showQRCode')}
            </Button>
          </div>

          {showQRCode && (
            <div className="flex justify-center p-4 bg-background rounded-lg">
              <QRCode
                value={shareUrl}
                size={200}
                level="H"
                includeMargin
                className="rounded-lg"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
