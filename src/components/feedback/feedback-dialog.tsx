'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FeedbackForm } from "./feedback-form"
import { MessageSquare } from "lucide-react"

interface FeedbackDialogProps {
  eventId?: string
  children?: React.ReactNode
}

export function FeedbackDialog({ eventId, children }: FeedbackDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="relative"
            aria-label="Open feedback form"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Give Feedback</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts and experiences. Your feedback is valuable to us.
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm eventId={eventId} />
      </DialogContent>
    </Dialog>
  )
}
