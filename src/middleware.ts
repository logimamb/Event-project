import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './config/i18n'

// Define public pages that don't require authentication
const publicPages = [
  '/auth/signin',
  '/auth/register',
  '/auth/error',
  '/'
]

// Create intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

// Helper function to check if a path is public
const isPublicPath = (path: string) => {
  // Remove locale prefix if present
  const pathWithoutLocale = locales.some(locale => path.startsWith(`/${locale}`))
    ? path.replace(/^\/[^/]+/, '')
    : path

  return publicPages.some(publicPath => 
    pathWithoutLocale === publicPath || pathWithoutLocale.startsWith(publicPath + '/')
  )
}

// Middleware function that combines authentication and internationalization
export default withAuth(
  function middleware(req) {
    // Always apply intl middleware
    return intlMiddleware(req)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Always allow public paths
        if (isPublicPath(path)) {
          return true
        }
        
        // For protected paths, require a token
        return !!token
      }
    },
    pages: {
      signIn: '/auth/signin'
    }
  }
)

export const config = {
  matcher: [
    // Match all paths except those starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - .*\\..* (files with extensions, e.g. favicon.ico)
    '/((?!api|_next|_vercel|.*\\..*|_next/static|_next/image|favicon.ico).*)',
  ]
}