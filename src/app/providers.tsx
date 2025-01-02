'use client';

import {NextIntlClientProvider} from 'next-intl';
import {SessionProvider} from "next-auth/react";

type Props = {
  locale: string;
  messages: any;
  children: React.ReactNode;
};

export function Providers({children, locale, messages}: Props) {
  return (
    <SessionProvider>
      <NextIntlClientProvider 
        locale={locale} 
        messages={messages}
        timeZone="Europe/Paris"
        now={new Date()}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
