'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { locales } from '@/config/i18n';

const languageNames = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية',
  zh: '中文',
  de: 'Deutsch'
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split('/')[1];

  const handleLocaleChange = (newLocale: string) => {
    if (!locales.includes(newLocale as any)) {
      console.error('Invalid locale:', newLocale);
      return;
    }
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Select defaultValue={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {languageNames[locale as keyof typeof languageNames] || locale}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
