import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: 'en',
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  localePrefix: 'always'
});

export const config = {
  // Skip locale prefix for api routes and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};