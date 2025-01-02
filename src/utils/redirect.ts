import { headers } from 'next/headers';
import { defaultLocale } from '@/config/i18n';

export function getLocaleFromHeaders(): string {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const locale = pathname.split('/')[1];
  return locale || defaultLocale;
}

export function getLocalizedPath(path: string): string {
  const locale = getLocaleFromHeaders();
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}
