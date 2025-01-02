'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Badge } from '@/components/ui/badge'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Plus, 
  Search, 
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowUpRight,
  Filter,
  SortAsc,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Activity {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  event: {
    id: string
    title: string
  }
  user: {
    id: string
    name: string | null
    image: string | null
  }
  participants: Array<{
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
}

interface FilterState {
  status: string[]
  capacity: string
}

const ACTIVITY_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

function getStatusBadge(status: string) {
  const statusConfig = {
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      icon: Clock,
    },
    IN_PROGRESS: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      icon: Loader2,
    },
    COMPLETED: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      icon: CheckCircle,
    },
    CANCELLED: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      icon: XCircle,
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={cn("gap-1.5", config.color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{status}</span>
    </Badge>
  )
}

function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

function formatDateTime(date: string | null, formatStr: string = 'PPp'): string {
  if (!date) return ''
  return format(new Date(date), formatStr)
}

export function ActivitiesClient() {
  const t = useTranslations('activities')
  const [activities, setActivities] = useState<Activity[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    capacity: 'all'
  })

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/api/activities')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch activities')
        }
        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch activities')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase())

    const startDate = parseDate(activity.startTime)
    const endDate = parseDate(activity.endTime)

    const matchesDateRange = !dateRange?.from || !dateRange?.to ||
      (startDate && endDate &&
        startDate >= dateRange.from &&
        endDate <= dateRange.to)

    const matchesStatus = filters.status.length === 0 || filters.status.includes(activity.status)

    const matchesCapacity = filters.capacity === 'all' ||
      (filters.capacity === 'available' && activity.participants.length < activity.capacity) ||
      (filters.capacity === 'full' && activity.participants.length >= activity.capacity)

    return matchesSearch && matchesDateRange && matchesStatus && matchesCapacity
  })

  const handleStatusFilterChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button asChild>
          <Link href="/activities/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('createActivity')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={t('selectDateRange')}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-3" aria-label="Filter activities">
                <Filter className="h-4 w-4 mr-2" />
                {t('filters')}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITY_STATUSES.map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
                          checked={filters.status.includes(status)}
                          onChange={() => handleStatusFilterChange(status)}
                        />
                        <span className="text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Capacity</h4>
                  <RadioGroup
                    value={filters.capacity}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, capacity: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="capacity-all" />
                      <Label htmlFor="capacity-all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="available" id="capacity-available" />
                      <Label htmlFor="capacity-available">Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="capacity-full" />
                      <Label htmlFor="capacity-full">Full</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('noActivities')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold mb-1 line-clamp-1">{activity.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDateTime(activity.startTime, 'PPP')}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {formatDateTime(activity.startTime, 'p')} - {formatDateTime(activity.endTime, 'p')}
                    </span>
                  </div>
                  {activity.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{activity.participants.length} / {activity.capacity || '∞'}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.image || undefined} />
                      <AvatarFallback>{activity.user.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {activity.user.name || t('unknownUser')}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/en/activities/${activity.id}`}>
                      {t('viewDetails')}
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
