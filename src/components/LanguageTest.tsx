"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';

export default function LanguageTest() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div style={{ 
      position: 'fixed', 
      top: '70px', 
      right: '16px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 999
    }}>
      <div>Idioma actual: {language}</div>
      <div>Home: {t('nav.home')}</div>
      <div>Próximos sitios: {t('nav.nextSites')}</div>
    </div>
  );
}
