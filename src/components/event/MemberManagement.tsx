'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { User } from '@prisma/client'
import { Search, UserPlus, X } from 'lucide-react'
import { useTranslations } from '@/lib/use-translations'

interface MemberManagementProps {
  eventId: string
  members: User[]
  onAddMember: (email: string) => Promise<void>
  onRemoveMember: (userId: string) => Promise<void>
}

export function MemberManagement({ 
  eventId, 
  members, 
  onAddMember, 
  onRemoveMember 
}: MemberManagementProps) {
  const { t } = useTranslations()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setIsLoading(true)
      setError('')
      await onAddMember(email)
      setEmail('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      setIsLoading(true)
      setError('')
      await onRemoveMember(userId)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{t('eventMembers')}</h2>

      {/* Add Member Form */}
      <form onSubmit={handleAddMember} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder={t('enterEmailToInvite')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('invite')}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </form>

      {/* Members List */}
      <div className="space-y-4">
        {members.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {t('noMembersYet')}
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name || ''}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {member.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(member.id)}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  )
} 
