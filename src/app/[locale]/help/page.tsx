import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search,
  HelpCircle,
  AlertTriangle,
  Mail,
  MessageSquare,
  Phone,
  FileText,
  BookOpen,
  Video
} from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: "How do I create a new event?",
    answer: "To create a new event, click on the 'Events' tab in the sidebar, then click the 'Create New Event' button. Fill in the required information such as title, description, date, and location."
  },
  {
    question: "How can I invite members to my event?",
    answer: "After creating an event, go to the event details page and click on the 'Members' tab. Use the 'Add Member' button to invite new members by email or username."
  },
  {
    question: "What are the different member roles?",
    answer: "There are four member roles: Owner (event creator), Admin (full management rights), Moderator (can manage activities and messages), and Member (basic participation rights)."
  },
  {
    question: "How do I manage event activities?",
    answer: "Navigate to your event's details page and click on the 'Activities' tab. Here you can create, edit, and manage all activities associated with your event."
  },
  {
    question: "Can I export event data?",
    answer: "Yes, you can export event data in various formats (CSV, PDF) from the event settings menu. This includes attendee lists, activities, and analytics."
  }
]

const troubleshootingGuides = [
  {
    title: "Calendar Sync Issues",
    steps: [
      "Check if your calendar service is supported",
      "Ensure you've granted necessary permissions",
      "Try disconnecting and reconnecting your calendar",
      "Clear your browser cache and try again",
      "Contact support if the issue persists"
    ]
  },
  {
    title: "Member Access Problems",
    steps: [
      "Verify the member's email address is correct",
      "Check the member's assigned role and permissions",
      "Ensure the event is active and not archived",
      "Try removing and re-adding the member",
      "Review event privacy settings"
    ]
  },
  {
    title: "Notification Problems",
    steps: [
      "Check your notification settings",
      "Verify your email address is confirmed",
      "Check your spam/junk folder",
      "Enable browser notifications if desired",
      "Update your contact preferences"
    ]
  }
]

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers, troubleshoot issues, and get support
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="troubleshooting">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Troubleshooting
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FileText className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* FAQs Section */}
          <TabsContent value="faq">
            <Card className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </TabsContent>

          {/* Troubleshooting Section */}
          <TabsContent value="troubleshooting">
            <Card className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                {troubleshootingGuides.map((guide, index) => (
                  <div key={index} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">{guide.title}</h3>
                    <ol className="list-decimal pl-4 space-y-2">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Contact Support Section */}
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Live Chat */}
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <MessageSquare className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                  <p className="text-muted-foreground mb-4">
                    Chat with our support team in real-time
                  </p>
                  <Button>Start Chat</Button>
                </div>
              </Card>

              {/* Email Support */}
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Mail className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                  <p className="text-muted-foreground mb-4">
                    Get help via email within 24 hours
                  </p>
                  <Button>Send Email</Button>
                </div>
              </Card>

              {/* Phone Support */}
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Phone className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                  <p className="text-muted-foreground mb-4">
                    Speak directly with our support team
                  </p>
                  <Button>Call Now</Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Section */}
          <TabsContent value="resources">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Documentation */}
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <BookOpen className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed guides and documentation
                  </p>
                  <Button asChild>
                    <Link href="/docs">View Docs</Link>
                  </Button>
                </div>
              </Card>

              {/* Video Tutorials */}
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Video className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn through step-by-step videos
                  </p>
                  <Button asChild>
                    <Link href="/tutorials">Watch Now</Link>
                  </Button>
                </div>
              </Card>

              {/* API Documentation */}
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <FileText className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">API Docs</h3>
                  <p className="text-muted-foreground mb-4">
                    Technical API documentation
                  </p>
                  <Button asChild>
                    <Link href="/api-docs">View API</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 
