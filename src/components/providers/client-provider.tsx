'use client';

import {NextIntlClientProvider} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  locale: string;
  messages: any;
  children: ReactNode;
};

export function ClientProvider({children, locale, messages}: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
