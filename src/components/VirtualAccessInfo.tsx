import { Link2, Video, Mic, MonitorSmartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VirtualAccess {
  platform: string
  link?: string
  meetingId?: string
  passcode?: string
  instructions?: string
  requirements?: string[]
}

interface VirtualAccessInfoProps {
  virtualAccess: VirtualAccess
}

export function VirtualAccessInfo({ virtualAccess }: VirtualAccessInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Video className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{virtualAccess.platform}</p>
          {virtualAccess.link && (
            <a
              href={virtualAccess.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Link2 className="h-3 w-3" />
              Join Meeting
            </a>
          )}
        </div>
      </div>

      {(virtualAccess.meetingId || virtualAccess.passcode) && (
        <div className="space-y-2 text-sm">
          {virtualAccess.meetingId && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Meeting ID:</span>
              <code className="bg-muted px-2 py-1 rounded">
                {virtualAccess.meetingId}
              </code>
            </div>
          )}
          {virtualAccess.passcode && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Passcode:</span>
              <code className="bg-muted px-2 py-1 rounded">
                {virtualAccess.passcode}
              </code>
            </div>
          )}
        </div>
      )}

      {virtualAccess.instructions && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Instructions</h3>
          <p className="text-sm text-muted-foreground">{virtualAccess.instructions}</p>
        </div>
      )}

      {virtualAccess.requirements && virtualAccess.requirements.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Requirements</h3>
          <ul className="space-y-1">
            {virtualAccess.requirements.map((requirement, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4" />
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Mic className="h-4 w-4" />
          Test Audio
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Video className="h-4 w-4" />
          Test Video
        </Button>
      </div>
    </div>
  )
} 
