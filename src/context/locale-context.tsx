'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

import en from '@/messages/en.json';
import hi from '@/messages/hi.json';
import mr from '@/messages/mr.json';
import kn from '@/messages/kn.json';
import ta from '@/messages/ta.json';
import ml from '@/messages/ml.json';
import pa from '@/messages/pa.json';
import bho from '@/messages/bho.json';
import gu from '@/messages/gu.json';

const translations: { [key: string]: any } = { en, hi, mr, kn, ta, ml, pa, bho, gu };

export const locales = {
  'en': 'English',
  'hi': 'हिन्दी',
  'mr': 'मराठी',
  'kn': 'ಕನ್ನಡ',
  'ta': 'தமிழ்',
  'ml': 'മലയാളം',
  'pa': 'ਪੰਜਾਬੀ',
  'bho': 'भोजपुरी',
  'gu': 'ગુજરાતી',
};

type LocaleContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  locales: { [key: string]: string };
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (locales[browserLang as keyof typeof locales]) {
      setLocale(browserLang);
    }
  }, []);
  
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, locales }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const useTranslations = () => {
    const { locale } = useLocale();
    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        let translation = translations[locale][key] || key;
        if (params) {
            Object.keys(params).forEach(pKey => {
                translation = translation.replace(`{${pKey}}`, params[pKey]);
            });
        }
        return translation;
    }, [locale]);
    return t;
};
