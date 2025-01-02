import { useState } from 'react'
import { Event, WaitingListEntry } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslations } from '@/hooks/use-translations'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserPlus, 
  UserMinus, 
  Users, 
  Mail, 
  Bell, 
  BellOff,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface WaitingListManagerProps {
  event: Event
  onJoin?: (email: string, notify: boolean) => Promise<void>
  onLeave?: (email: string) => Promise<void>
  onInvite?: (entry: WaitingListEntry) => Promise<void>
}

export function WaitingListManager({ 
  event, 
  onJoin, 
  onLeave,
  onInvite 
}: WaitingListManagerProps) {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [notify, setNotify] = useState(true)
  const [sortBy, setSortBy] = useState<'position' | 'date'>('position')
  const [isLoading, setIsLoading] = useState(false)

  const sortedWaitingList = [...event.waitingList].sort((a, b) => {
    if (sortBy === 'position') {
      return a.position - b.position
    }
    return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
  })

  const handleJoin = async () => {
    if (!email) return
    setIsLoading(true)
    try {
      await onJoin?.(email, notify)
      setEmail('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeave = async (email: string) => {
    setIsLoading(true)
    try {
      await onLeave?.(email)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async (entry: WaitingListEntry) => {
    setIsLoading(true)
    try {
      await onInvite?.(entry)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('waitlist.title')}
          <span className="text-sm font-normal text-muted-foreground">
            ({sortedWaitingList.length} {t('waitlist.position', { count: sortedWaitingList.length })})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Join Waiting List Form */}
        <div className="space-y-4 mb-8">
          <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('waitlist.join.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label={t('waitlist.join.placeholder')}
              />
            </div>
            <div className="self-end">
              <Button
                onClick={handleJoin}
                disabled={!email || isLoading}
                className="w-full sm:w-auto"
                aria-label={t('waitlist.join')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t('waitlist.join')}
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notify}
              onCheckedChange={(checked) => setNotify(!!checked)}
              aria-label={t('waitlist.notification')}
            />
            <Label htmlFor="notify" className="text-sm">
              {notify ? <Bell className="h-4 w-4 inline mr-2" /> : <BellOff className="h-4 w-4 inline mr-2" />}
              {t('waitlist.notification')}
            </Label>
          </div>
        </div>

        {/* Waiting List */}
        {sortedWaitingList.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">{t('waitlist.list')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortBy(sortBy === 'position' ? 'date' : 'position')}
                aria-label={t('common.sort')}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortBy === 'position' ? t('waitlist.sort.position') : t('waitlist.sort.date')}
              </Button>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {sortedWaitingList.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        {entry.position}
                      </div>
                      <div>
                        <p className="font-medium">{entry.name || entry.email}</p>
                        {entry.name && (
                          <p className="text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 inline mr-1" />
                            {entry.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.status === 'waiting' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInvite(entry)}
                            disabled={isLoading}
                            aria-label={t('waitlist.invite')}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t('waitlist.invite')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLeave(entry.email)}
                            disabled={isLoading}
                            aria-label={t('waitlist.remove')}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {entry.status === 'invited' && (
                        <div className="flex items-center text-yellow-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {t('waitlist.status.invited')}
                        </div>
                      )}
                      {entry.status === 'registered' && (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('waitlist.status.registered')}
                        </div>
                      )}
                      {entry.status === 'removed' && (
                        <div className="flex items-center text-red-500">
                          <XCircle className="h-4 w-4 mr-1" />
                          {t('waitlist.status.removed')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedWaitingList.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('waitlist.empty')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
