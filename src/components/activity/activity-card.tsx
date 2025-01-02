'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, MapPin } from "lucide-react"

interface ActivityCardProps {
  activity: {
    id: string
    title: string
    description: string
    startTime: string
    endTime: string
    location: string
    capacity: number
    currentParticipants: number
    status: string
    imageUrl?: string
    user: {
      name: string | null
      image: string | null
    }
  }
  participantCount: number
}

export function ActivityCard({ activity, participantCount }: ActivityCardProps) {
  const { 
    id,
    title, 
    description, 
    startTime, 
    endTime, 
    location, 
    capacity,
    imageUrl,
    user 
  } = activity

  return (
    <Link href={`/activities/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "relative rounded-xl overflow-hidden",
          "bg-white dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700",
          "shadow-sm hover:shadow-md transition-all duration-300",
          "h-full"
        )}
      >
        {/* Background Image */}
        {imageUrl && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{user.name}</span>
            </div>
            <Badge variant={participantCount >= capacity ? "destructive" : "secondary"}>
              <Users className="w-4 h-4 mr-1" />
              {participantCount}/{capacity}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(new Date(startTime))} - {formatDate(new Date(endTime))}</span>
            </div>
            {location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
