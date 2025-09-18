import { useLanguage } from './useLanguage';
import { getTranslation } from '@/lib/i18n';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string, variables?: Record<string, any>): string => {
    let translation = getTranslation(language, key);
    console.log(`Traduciendo "${key}" en ${language}:`, translation); // Debug

    // Si hay variables, hacer interpolación
    if (variables && typeof translation === 'string') {
      Object.keys(variables).forEach(varKey => {
        const placeholder = `{{${varKey}}}`;
        const value = variables[varKey];
        translation = translation.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }

    return translation;
  };

  return { t, language };
}
