'use client'

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Check, Users, Star, Shield, Zap, Globe, Clock, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                EventFlow
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">Features</Button>
              <Button variant="ghost" size="sm">Pricing</Button>
              <Button variant="ghost" size="sm">About</Button>
              <Button 
                className="bg-gradient-to-r from-primary to-violet-500 text-white"
                size="sm"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center rounded-full bg-primary/10 px-6 py-2 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-8">
              <Star className="w-4 h-4 mr-2" /> Trusted by 10,000+ event organizers
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Transform Your
              <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-violet-500 bg-clip-text text-transparent">
                Event Management Experience
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Streamline your events with powerful automation, seamless integrations, and intelligent insights. 
              The all-in-one platform that makes event planning effortless.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg" 
                asChild
              >
                <Link href="/events">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary/20 hover:bg-primary/5 transition-all duration-300 text-lg"
              >
                Watch Demo
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                Enterprise-grade security
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                Set up in minutes
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="glass-card p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
              <Calendar className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-semibold mb-3">Smart Scheduling</h3>
              <p className="text-muted-foreground">AI-powered scheduling that automatically finds the perfect time for all attendees.</p>
            </div>
            
            <div className="glass-card p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
              <Globe className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-semibold mb-3">Global Reach</h3>
              <p className="text-muted-foreground">Host events across time zones with automatic time conversion and localization.</p>
            </div>
            
            <div className="glass-card p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
              <Zap className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-semibold mb-3">Instant Analytics</h3>
              <p className="text-muted-foreground">Real-time insights into attendance, engagement, and event performance.</p>
            </div>
          </motion.div>

          {/* Social Proof */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-12">Trusted by Industry Leaders</h2>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
              {/* Add company logos here */}
              <div className="h-8 w-32 bg-muted rounded"></div>
              <div className="h-8 w-32 bg-muted rounded"></div>
              <div className="h-8 w-32 bg-muted rounded"></div>
              <div className="h-8 w-32 bg-muted rounded"></div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="glass-card p-6 rounded-xl border border-border/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Event Director</p>
                  </div>
                </div>
                <p className="text-muted-foreground">"This platform has revolutionized how we manage our corporate events. The automation features alone have saved us countless hours."</p>
              </div>
              
              {/* Add more testimonials */}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-24 text-center">
            <div className="max-w-3xl mx-auto glass-card p-12 rounded-2xl border border-border/50">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Events?</h2>
              <p className="text-xl text-muted-foreground mb-8">Join thousands of successful event organizers who trust our platform.</p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
