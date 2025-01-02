import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Registration {
  id: string
  status: string
  formData: Record<string, any>
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  payment?: {
    status: string
    amount: number
    currency: string
  }
}

interface RegistrationListProps {
  eventId: string
  registrations: Registration[]
  onStatusChange: (registrationId: string, status: string) => Promise<void>
}

export function RegistrationList({
  eventId,
  registrations,
  onStatusChange,
}: RegistrationListProps) {
  const { toast } = useToast()

  const handleStatusChange = async (registrationId: string, status: string) => {
    try {
      await onStatusChange(registrationId, status)
      toast({
        title: 'Success',
        description: 'Registration status updated successfully',
      })
    } catch (error) {
      console.error('Failed to update registration status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update registration status',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'cancelled':
        return 'bg-red-500'
      case 'waitlisted':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={registration.user.image || undefined} />
                  <AvatarFallback>
                    {registration.user.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{registration.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {registration.user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {formatDate(new Date(registration.createdAt))}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(registration.status)} text-white`}
                >
                  {registration.status}
                </Badge>
              </TableCell>
              <TableCell>
                {registration.payment ? (
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        registration.payment.status.toLowerCase() === 'completed'
                          ? 'border-green-500 text-green-500'
                          : 'border-yellow-500 text-yellow-500'
                      }
                    >
                      {registration.payment.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {registration.payment.amount}{' '}
                      {registration.payment.currency}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Free</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Select
                  value={registration.status}
                  onValueChange={(value) =>
                    handleStatusChange(registration.id, value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {registrations.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No registrations found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 
