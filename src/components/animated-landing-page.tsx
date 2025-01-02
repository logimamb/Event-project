'use client'

import Link from "next/link"
import { motion, Variants } from "framer-motion"
import { 
  Calendar, Users, Activity, Shield, 
  CheckCircle, Zap, Globe, Lock, Cloud, 
  Sparkles, Clock, Bell, ArrowRight, ChevronRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ThemeToggle } from './theme-toggle'
import { LanguageSelector } from './language-selector'

const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  } as Variants,
  fadeInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 }
  } as Variants,
  fadeInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 }
  } as Variants,
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 }
  } as Variants,
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  } as Variants
}

const features = [
  {
    icon: Calendar,
    title: "Calendar Integration",
    description: "Seamlessly sync with Google Calendar and manage all your events in one place",
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together with your team in real-time with shared calendars and events",
    color: "text-green-600 dark:text-green-400"
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get timely reminders and updates about your events and activities",
    color: "text-purple-600 dark:text-purple-400"
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Enterprise-grade security with role-based access control",
    color: "text-red-600 dark:text-red-400"
  },
  {
    icon: Globe,
    title: "Accessibility First",
    description: "Built with accessibility in mind, ensuring everyone can use our platform",
    color: "text-teal-600 dark:text-teal-400"
  },
  {
    icon: Clock,
    title: "Time Management",
    description: "Efficient scheduling tools to help you make the most of your time",
    color: "text-orange-600 dark:text-orange-400"
  }
]

const testimonials = [
  {
    quote: "This platform has revolutionized how we manage our team events and activities.",
    author: "Sarah Johnson",
    role: "Event Director",
    company: "TechCorp Inc."
  },
  {
    quote: "The accessibility features are outstanding. Finally, a platform that everyone can use!",
    author: "Michael Chen",
    role: "Accessibility Advocate",
    company: "Digital Access Group"
  },
  {
    quote: "The Google Calendar integration is seamless. It's exactly what we needed.",
    author: "Emily Rodriguez",
    role: "Project Manager",
    company: "Innovation Labs"
  }
]

export function AnimatedLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Navigation */}
      <nav 
        className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span className="text-xl font-bold">EventCalendar</span>
            </motion.div>
            <div 
              className="flex items-center space-x-4"
              role="group"
              aria-label="Navigation actions"
            >
              <LanguageSelector />
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/auth/signin" aria-label="Sign in to your account">
                  Sign In
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white">
                <Link href="/auth/register" aria-label="Create a new account">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="pt-32 pb-20 px-4"
        aria-labelledby="hero-heading"
      >
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={animations.fadeInLeft}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <h1 
                id="hero-heading"
                className="text-5xl font-bold leading-tight"
                tabIndex={0}
              >
                Manage Events with
                <span className="text-indigo-600 dark:text-indigo-400"> Intelligence</span>
              </h1>
              <p 
                className="text-xl text-gray-600 dark:text-gray-300"
                tabIndex={0}
              >
                Streamline your event planning with smart calendar integration, team collaboration, 
                and accessibility features that work for everyone.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Link href="/auth/register" aria-label="Start your free trial now">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  asChild
                >
                  <Link href="#features" aria-label="Learn more about our features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              variants={animations.fadeInRight}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/dashboard-preview.png"
                  alt="Event management dashboard interface preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features"
        className="py-20 bg-white/50 dark:bg-gray-800/50"
        aria-labelledby="features-heading"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={animations.fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              id="features-heading"
              className="text-3xl font-bold mb-4"
              tabIndex={0}
            >
              Powerful Features
            </h2>
            <p 
              className="text-xl text-gray-600 dark:text-gray-300"
              tabIndex={0}
            >
              Everything you need to manage events efficiently
            </p>
          </motion.div>
          <div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            role="list"
            aria-label="Feature list"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={animations.scaleIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                role="listitem"
                tabIndex={0}
              >
                <feature.icon 
                  className={`h-12 w-12 mb-4 ${feature.color}`}
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section
        className="py-20 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800"
        aria-labelledby="dashboard-preview-heading"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={animations.fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              id="dashboard-preview-heading"
              className="text-3xl font-bold mb-4"
              tabIndex={0}
            >
              Powerful Dashboard Interface
            </h2>
            <p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              tabIndex={0}
            >
              Experience a modern, intuitive interface designed for efficient event management
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={animations.fadeInLeft}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="grid gap-6">
                <motion.div 
                  className="flex items-start gap-4"
                  variants={animations.fadeIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Event Overview</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get a comprehensive view of all your events with detailed statistics and insights
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-4"
                  variants={animations.fadeIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Activity Tracking</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monitor event activities and track progress with our intuitive dashboard
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-4"
                  variants={animations.fadeIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Team Management</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Collaborate with team members and manage event responsibilities efficiently
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={animations.fadeInRight}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                <Image
                  src="/dashboard-preview.png"
                  alt="Event management dashboard interface preview"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Stats Card */}
              <motion.div
                variants={animations.scaleIn}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                    <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">10k+</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-20"
        aria-labelledby="testimonials-heading"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={animations.fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              id="testimonials-heading"
              className="text-3xl font-bold mb-4"
              tabIndex={0}
            >
              What Our Users Say
            </h2>
          </motion.div>
          <div 
            className="grid md:grid-cols-3 gap-8"
            role="list"
            aria-label="User testimonials"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                variants={animations.scaleIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                role="listitem"
                tabIndex={0}
              >
                <blockquote>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">"{testimonial.quote}"</p>
                  <footer>
                    <cite className="not-italic">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </cite>
                  </footer>
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800"
        aria-labelledby="pricing-heading"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={animations.fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 
              id="pricing-heading"
              className="text-3xl font-bold mb-4"
              tabIndex={0}
            >
              Choose Your Plan
            </h2>
            <p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              tabIndex={0}
            >
              Select the perfect plan for your needs, with flexible options for individuals and teams
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Trial Plan */}
            <motion.div
              variants={animations.fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  14 Days Free Trial
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Free Trial</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8" role="list">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Basic calendar functions</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Single calendar</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Up to 50 events</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>5GB storage</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/auth/register">Start Free Trial</Link>
              </Button>
            </motion.div>

            {/* Essential/Professional Plan */}
            <motion.div
              variants={animations.fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 scale-105 z-10"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Professional</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">For growing teams</p>
              </div>
              <ul className="space-y-4 mb-8" role="list">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited calendars</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited events</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>20GB storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Event templates</span>
                </li>
              </ul>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" asChild>
                <Link href="/auth/register?plan=professional">Get Started</Link>
              </Button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              variants={animations.fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <div className="flex justify-center items-baseline mb-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">For large organizations</p>
              </div>
              <ul className="space-y-4 mb-8" role="list">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>All Professional features</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>24/7 Premium support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Custom branding</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link href="/contact-sales">Contact Sales</Link>
              </Button>
            </motion.div>
          </div>

          {/* Additional Benefits */}
          <motion.div
            variants={animations.fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mt-16 grid md:grid-cols-3 gap-8 text-center"
          >
            <div>
              <Lock className="h-8 w-8 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-300">Enterprise-grade security for all plans</p>
            </div>
            <div>
              <ArrowRight className="h-8 w-8 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg font-semibold mb-2">Easy Upgrade</h3>
              <p className="text-gray-600 dark:text-gray-300">Seamlessly upgrade as your needs grow</p>
            </div>
            <div>
              <Clock className="h-8 w-8 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300">We're here to help you succeed</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 bg-indigo-600 dark:bg-indigo-900"
        aria-labelledby="cta-heading"
      >
        <div className="container mx-auto px-4">
          <motion.div
            variants={animations.fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 
              id="cta-heading"
              className="text-3xl font-bold mb-4"
              tabIndex={0}
            >
              Ready to Transform Your Event Management?
            </h2>
            <p 
              className="text-xl mb-8 text-indigo-100"
              tabIndex={0}
            >
              Join thousands of satisfied users and start managing your events more efficiently today.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              asChild
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <Link 
                href="/auth/register"
                aria-label="Start your free trial now"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 
