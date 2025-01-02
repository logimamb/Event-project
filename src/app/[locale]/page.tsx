'use client'

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Check, 
  Users, 
  Zap, 
  Globe, 
  Clock, 
  Languages, 
  Moon, 
  Sun, 
  Video, 
  MessageSquare,
  Menu,
  Star,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' }
];

export default function LandingPage() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.split('/').slice(2).join('/');
    const newPath = `/${newLocale}${currentPath ? `/${currentPath}` : ''}`;
    router.push(newPath);
    router.refresh();
  };

  const NavItems = () => (
    <nav className="flex items-center gap-6">
      <Link
        href={`/${locale}/features`}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        {t('featuresNav')}
      </Link>
      <Link
        href={`/${locale}/pricing`}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        {t('pricingNav')}
      </Link>
      <Link
        href={`/${locale}/about`}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        {t('about')}
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">EventPro</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <NavItems />
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-gradient-to-r from-primary to-violet-500 text-white"
                  size="sm"
                >
                  <Link href={`/${locale}/auth/signin`}>{t('signIn')}</Link>
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-9 px-0"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      {languages.find(lang => lang.code === locale)?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center gap-2"
                      >
                        {lang.code === locale && <Check className="h-4 w-4" />}
                        <span className={lang.code === locale ? "font-medium" : ""}>{lang.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-6 pt-6">
                    <Link
                      href={`/${locale}/features`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t('featuresNav')}
                    </Link>
                    <Link
                      href={`/${locale}/pricing`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t('pricingNav')}
                    </Link>
                    <Link
                      href={`/${locale}/about`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t('about')}
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      className="w-full"
                    >
                      <Button className="w-full bg-gradient-to-r from-primary to-violet-500 text-white">
                        {t('register')}
                      </Button>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            {languages.find(lang => lang.code === locale)?.name}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {languages.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() => handleLanguageChange(lang.code)}
                              className="flex items-center gap-2"
                            >
                              {lang.code === locale && <Check className="h-4 w-4" />}
                              <span className={lang.code === locale ? "font-medium" : ""}>{lang.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

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
              <Star className="w-4 h-4 mr-2" /> {t('hero.trustedBy')}
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {t('hero.title')}
              <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-violet-500 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="mt-8 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-8">
              <Link href={`/${locale}/auth/register`}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-violet-500 text-white w-full sm:w-auto"
                >
                  {t('hero.startTrial')}
                </Button>
              </Link>
              <Link href={`/${locale}/demo`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {t('hero.watchDemo')}
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-primary mr-2" />
                {t('features.security')}
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                {t('features.noCredit')}
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                {t('features.setup')}
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
              <h3 className="text-xl font-semibold mb-3">{t('features.smartScheduling.title')}</h3>
              <p className="text-muted-foreground">{t('features.smartScheduling.description')}</p>
            </div>
            
            <div className="glass-card p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
              <Globe className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-semibold mb-3">{t('features.globalReach.title')}</h3>
              <p className="text-muted-foreground">{t('features.globalReach.description')}</p>
            </div>
            
            <div className="glass-card p-8 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
              <Zap className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-semibold mb-3">{t('features.instantAnalytics.title')}</h3>
              <p className="text-muted-foreground">{t('features.instantAnalytics.description')}</p>
            </div>
          </motion.div>

          {/* Social Proof */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-12">{t('social.title')}</h2>
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
            <h2 className="text-3xl font-bold text-center mb-12">{t('testimonials.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="glass-card p-6 rounded-xl border border-border/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{t('testimonials.testimonial1.name')}</h4>
                    <p className="text-sm text-muted-foreground">{t('testimonials.testimonial1.role')}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{t('testimonials.testimonial1.quote')}</p>
              </div>

              {/* Testimonial 2 */}
              <div className="glass-card p-6 rounded-xl border border-border/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{t('testimonials.testimonial2.name')}</h4>
                    <p className="text-sm text-muted-foreground">{t('testimonials.testimonial2.role')}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{t('testimonials.testimonial2.quote')}</p>
              </div>

              {/* Testimonial 3 */}
              <div className="glass-card p-6 rounded-xl border border-border/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{t('testimonials.testimonial3.name')}</h4>
                    <p className="text-sm text-muted-foreground">{t('testimonials.testimonial3.role')}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{t('testimonials.testimonial3.quote')}</p>
              </div>
            </div>
          </div>

          {/* Integration Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-32"
          >
            <h2 className="text-3xl font-bold text-center mb-12">{t('integrations.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Google Calendar */}
              <div className="glass-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('integrations.google.title')}</h3>
                <p className="text-muted-foreground">{t('integrations.google.description')}</p>
              </div>

              {/* Zoom */}
              <div className="glass-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
                <Video className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('integrations.zoom.title')}</h3>
                <p className="text-muted-foreground">{t('integrations.zoom.description')}</p>
              </div>

              {/* Slack */}
              <div className="glass-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('integrations.slack.title')}</h3>
                <p className="text-muted-foreground">{t('integrations.slack.description')}</p>
              </div>

              {/* Microsoft Teams */}
              <div className="glass-card p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('integrations.teams.title')}</h3>
                <p className="text-muted-foreground">{t('integrations.teams.description')}</p>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-32"
          >
            <h2 className="text-3xl font-bold text-center mb-4">{t('faq.title')}</h2>
            <p className="text-xl text-muted-foreground text-center mb-12">{t('faq.subtitle')}</p>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {['q1', 'q2', 'q3', 'q4', 'q5'].map((item) => (
                  <AccordionItem key={item} value={item} className="glass-card border-none mb-4 rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-6 hover:no-underline hover:bg-primary/5">
                      <span className="text-lg font-semibold">{t(`faq.${item}.question`)}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 text-muted-foreground">
                      {t(`faq.${item}.answer`)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>

          {/* Final CTA */}
          <div className="mt-24 text-center mb-24">
            <div className="max-w-3xl mx-auto glass-card p-12 rounded-2xl border border-border/50">
              <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
              <p className="text-xl text-muted-foreground mb-8">{t('cta.subtitle')}</p>
              <Link href={`/${locale}/auth/register`}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('cta.button')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
