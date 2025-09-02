import { useLanguage } from './useLanguage';
import { getTranslation } from '@/lib/i18n';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const translation = getTranslation(language, key);
    console.log(`Traduciendo "${key}" en ${language}:`, translation); // Debug
    return translation;
  };

  return { t, language };
}
