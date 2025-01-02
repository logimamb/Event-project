import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import fs from 'fs';
import path from 'path';

export const locales = ['en', 'fr', 'es', 'de', 'ar', 'zh'] as const;
export type Locale = (typeof locales)[number];

const loadMessages = (locale: string) => {
  if (process.env.NODE_ENV === 'development') {
    // In development, read the file directly
    const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } else {
    // In production, use the regular import
    return require(`../messages/${locale}.json`);
  }
};

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: loadMessages(locale),
    timeZone: 'Europe/Paris',
    now: new Date(),
    defaultLocale: 'en',
    locales
  };
});
