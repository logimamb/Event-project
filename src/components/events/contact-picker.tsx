'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Contact2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface ContactPickerProps {
  onContactSelect: (contact: {
    name?: string
    email?: string
    tel?: string
  }) => void
  disabled?: boolean
}

export function ContactPicker({ onContactSelect, disabled }: ContactPickerProps) {
  const [isSupported, setIsSupported] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'contacts' in navigator && 'ContactsManager' in window
    }
    return false
  })

  const handlePickContact = async () => {
    try {
      const props = ['name', 'email', 'tel']
      const opts = { multiple: false }

      // @ts-ignore - The Contact Picker API types are not yet in TypeScript
      const contacts = await navigator.contacts.select(props, opts)
      
      if (contacts.length > 0) {
        const contact = contacts[0]
        const contactInfo = {
          name: contact.name?.[0],
          email: contact.email?.[0],
          tel: contact.tel?.[0]
        }
        onContactSelect(contactInfo)
      }
    } catch (error) {
      console.error('Error picking contact:', error)
      toast({
        title: 'Error',
        description: 'Failed to access contacts. Please enter details manually.',
        variant: 'destructive',
      })
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handlePickContact}
      disabled={disabled}
    >
      <Contact2 className="h-4 w-4" />
      Choose from Contacts
    </Button>
  )
}
