'use client'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Loader2, Github, Mail, Languages } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' }
];

const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('auth.register')
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isGithubLoading, setIsGithubLoading] = React.useState(false)

  const handleLanguageChange = (newLocale: string) => {
    // Preserve the current path structure but change the locale
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    router.push(newPathname);
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: FormData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Registration failed')
      }

      await response.json()

      // Sign in the user automatically after successful registration
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: `/${locale}/dashboard`
      })
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: t('form.error'),
        description: error instanceof Error ? error.message : t('form.unexpectedError'),
        variant: "destructive",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      await signIn('google', {
        redirect: true,
        callbackUrl: `/${locale}/dashboard`
      })
    } catch (error) {
      toast({
        title: t('form.error'),
        description: t('form.oauthError'),
        variant: "destructive",
      })
    }
  }

  const handleGithubSignIn = async () => {
    try {
      setIsGithubLoading(true)
      await signIn('github', {
        redirect: true,
        callbackUrl: `/${locale}/dashboard`
      })
    } catch (error) {
      toast({
        title: t('form.error'),
        description: t('form.oauthError'),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="">
      <div className="">
        {/* Left side - Branding */}
        {/* <div className="relative hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl shadow-2xl min-h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Icons.logo className="h-10 w-10" />
              <h1 className="text-2xl font-bold">{t('branding.title')}</h1>
            </div>
            <p className="text-xl font-light text-indigo-100 mb-8">
              {t('branding.subtitle')}
            </p>
          </div>
          <div className="relative space-y-6">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
              <blockquote className="text-lg font-light">
                {t('testimonial.quote')}
              </blockquote>
              <footer className="mt-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl font-semibold">SJ</span>
                </div>
                <div>
                  <p className="font-medium">{t('testimonial.author')}</p>
                  <p className="text-sm text-indigo-200">{t('testimonial.role')}</p>
                </div>
              </footer>
            </div>
          </div>
        </div> */}

        {/* Right side - Form */}
        <div className="">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('form.title')}</h2>
              <p className="text-gray-600">{t('form.subtitle')}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8">
                  <Languages className="h-4 w-4" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={locale === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-4 mb-6">
            <Button
              variant="outline"
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="relative overflow-hidden group hover:border-indigo-600 transition-colors"
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4 text-indigo-600" />
              )}
              <span className="relative z-10">{t('form.continueWith', { provider: 'Google' })}</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isGithubLoading}
              onClick={handleGithubSignIn}
              className="relative overflow-hidden group hover:border-gray-900 transition-colors"
            >
              {isGithubLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              <span className="relative z-10">{t('form.continueWith', { provider: 'GitHub' })}</span>
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 rounded-full">
                {t('form.orContinueWith')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">{t('form.name')}</Label>
              <Input
                id="name"
                placeholder={t('form.namePlaceholder')}
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isSubmitting}
                {...register("name")}
                className="h-11"
              />
              {errors?.name && (
                <p className="px-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">{t('form.email')}</Label>
              <Input
                id="email"
                placeholder={t('form.emailPlaceholder')}
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isSubmitting}
                {...register("email")}
                className="h-11"
              />
              {errors?.email && (
                <p className="px-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">{t('form.password')}</Label>
              <Input
                id="password"
                placeholder={t('form.passwordPlaceholder')}
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("password")}
                className="h-11"
              />
              {errors?.password && (
                <p className="px-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">{t('form.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                placeholder={t('form.confirmPasswordPlaceholder')}
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("confirmPassword")}
                className="h-11"
              />
              {errors?.confirmPassword && (
                <p className="px-1 text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button 
              disabled={isSubmitting} 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white shadow-lg"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('form.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('form.haveAccount')}{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
            >
              {t('form.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
