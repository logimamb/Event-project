export const defaultLocale = 'en';
export const locales = ['en', 'fr', 'es', 'zh', 'ar', 'de'] as const;
export type Locale = typeof locales[number];
