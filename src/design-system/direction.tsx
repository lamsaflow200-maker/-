/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * RTL + LTR Direction & Language Context
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type TextDirection = 'rtl' | 'ltr';
export type SupportedLocale = 'ar' | 'en' | 'fr';

interface DirectionContextValue {
  dir: TextDirection;
  locale: SupportedLocale;
  isRtl: boolean;
  setLocale: (locale: SupportedLocale) => void;
  toggleDirection: () => void;
  formatNumber: (n: number | string) => string;
}

const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

const RTL_LOCALES: SupportedLocale[] = ['ar'];

export const DirectionProvider: React.FC<{
  defaultLocale?: SupportedLocale;
  children: React.ReactNode;
}> = ({ defaultLocale = 'ar', children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const saved = localStorage.getItem('mnasbati_locale') as SupportedLocale;
    return saved && ['ar', 'en', 'fr'].includes(saved) ? saved : defaultLocale;
  });

  const dir: TextDirection = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  const isRtl = dir === 'rtl';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    localStorage.setItem('mnasbati_locale', locale);
  }, [dir, locale]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
  };

  const toggleDirection = () => {
    setLocaleState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const formatNumber = (n: number | string): string => {
    return isRtl ? Number(n).toLocaleString('ar-MA') : Number(n).toLocaleString('en-US');
  };

  return (
    <DirectionContext.Provider
      value={{
        dir,
        locale,
        isRtl,
        setLocale,
        toggleDirection,
        formatNumber,
      }}
    >
      <div dir={dir} className={isRtl ? 'font-arabic' : 'font-latin'}>
        {children}
      </div>
    </DirectionContext.Provider>
  );
};

export const useDirection = (): DirectionContextValue => {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
};
