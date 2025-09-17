"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import loggerClient from '@/lib/loggerClient';
import { Language } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // Cargar idioma guardado o detectar del navegador
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['es', 'en', 'it'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      loggerClient.debug(`Idioma cargado desde localStorage: ${savedLanguage}`); // Debug
    } else {
      // Detectar idioma del navegador
      const browserLang = navigator.language.split('-')[0];
      if (['es', 'en', 'it'].includes(browserLang)) {
        setLanguageState(browserLang as Language);
        loggerClient.debug(`Idioma detectado del navegador: ${browserLang}`); // Debug
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    loggerClient.debug(`Cambiando idioma a: ${lang}`); // Debug
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const value = { language, setLanguage };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
