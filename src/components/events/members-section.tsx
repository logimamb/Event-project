'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddMemberDialog } from './add-member-dialog'
import { MemberQRCode } from './member-qr-code'
import { toast } from '@/components/ui/use-toast'
import { Member } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Copy, Users, Crown, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface MembersSectionProps {
  eventId: string
  isCreator: boolean
  isAdmin: boolean
}

export function MembersSection({ eventId, isCreator, isAdmin }: MembersSectionProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/members`)
        if (!response.ok) {
          throw new Error('Failed to fetch members')
        }
        const data = await response.json()
        setMembers(data)
      } catch (err) {
        console.error('Error fetching members:', err)
        setError(err instanceof Error ? err.message : 'Failed to load members')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [eventId])

  const handleMemberAdded = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/members`)
      if (!response.ok) {
        throw new Error('Failed to refresh members')
      }
      const data = await response.json()
      setMembers(data)
      toast({
        title: "Success",
        description: "Member added successfully",
      })
    } catch (err) {
      console.error('Error refreshing members:', err)
      toast({
        title: "Error",
        description: "Failed to refresh members list",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyMemberCode = (code: string, name: string) => {
    navigator.clipboard.writeText(code)
    toast({
      description: `Code for ${name} copied to clipboard`,
      duration: 2000,
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
      case 'MODERATOR':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      default:
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
    }
  }

  const getMemberDisplayName = (member: Member) => {
    if (member.user?.name) return member.user.name
    if (member.name) return member.name
    return 'Guest User'
  }

  const getMemberEmail = (member: Member) => {
    if (member.user?.email) return member.user.email
    if (member.email) return member.email
    return 'No email provided'
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null)
                setIsLoading(true)
                window.location.reload()
              }}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none bg-background">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Members</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} {members.length === 1 ? 'member' : 'members'} in this event
              </p>
            </div>
          </div>

          {(isCreator || isAdmin) && (
            <div className="flex items-center gap-2">
              <AddMemberDialog 
                eventId={eventId} 
                onMemberAdded={handleMemberAdded}
                trigger={
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </Button>
                }
              />
              <MemberQRCode eventId={eventId} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Members Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding members to your event
            </p>
            {(isCreator || isAdmin) && (
              <AddMemberDialog 
                eventId={eventId} 
                onMemberAdded={handleMemberAdded}
                trigger={
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="grid gap-4">
              {members.map((member) => (
                <Card key={member.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {member.user?.image ? (
                            <img
                              src={member.user.image}
                              alt={`${getMemberDisplayName(member)}'s avatar`}
                              className="h-12 w-12 rounded-full object-cover border-2 border-background"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background">
                              <span className="text-lg font-semibold text-primary">
                                {getMemberDisplayName(member)[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          {member.role.toUpperCase() === 'OWNER' && (
                            <div className="absolute -top-1 -right-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Event Owner</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{getMemberDisplayName(member)}</h3>
                            <Badge variant="secondary" className={getRoleBadgeColor(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{getMemberEmail(member)}</p>
                        </div>
                      </div>
                      {(isCreator || isAdmin) && member.memberCode && (
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyMemberCode(member.memberCode, getMemberDisplayName(member))}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy member code</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <MemberQRCode memberCode={member.memberCode} memberName={getMemberDisplayName(member)} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
