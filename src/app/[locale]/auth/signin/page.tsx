'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Loader2, Github, Mail, Languages } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

const signInSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

type FormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('auth.signin')
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isGithubLoading, setIsGithubLoading] = React.useState(false)

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    router.push(newPathname);
  };

  const form = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(data: FormData) {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: `/${locale}/dashboard`
      })

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: t('form.error'),
          description: t('form.invalidCredentials'),
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('form.error'),
        description: t('form.invalidCredentials'),
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
        variant: 'destructive',
        title: t('form.error'),
        description: t('form.oauthError'),
      })
    } finally {
      setIsGoogleLoading(false)
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
        variant: 'destructive',
        title: t('form.error'),
        description: t('form.oauthError'),
      })
    } finally {
      setIsGithubLoading(false)
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
                {t('form.or')}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-700">{t('form.emailAddress')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('form.emailAddressPlaceholder')}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-700">{t('form.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('form.passwordPlaceholder')}
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white shadow-lg"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('form.submit')}
              </Button>
            </form>
          </Form>

          <div className="mt-6 grid gap-2">
            <p className="text-center text-sm text-gray-600">
              {t('form.noAccount')}{' '}
              <Link
                href={`/${locale}/auth/register`}
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
              >
                {t('signUp')}
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600">
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
              >
                {t('form.forgotPassword')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
