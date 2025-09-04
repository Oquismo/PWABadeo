"use client";
import { IconButton } from "@mui/material";
import TranslateIcon from '@mui/icons-material/Translate';
import { useLanguage } from '@/hooks/useLanguage';

export default function GlobalLanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    // Ciclo entre idiomas: es -> en -> it -> es
    const nextLanguage = {
      'es': 'en',
      'en': 'it', 
      'it': 'es'
    } as const;
    
    const newLang = nextLanguage[language];
    console.log('Cambiando de', language, 'a', newLang); // Debug
    setLanguage(newLang);
  };

  const getLanguageLabel = () => {
    const labels = {
      'es': '🇪🇸 ES',
      'en': '🇺🇸 EN',
      'it': '🇮🇹 IT'
    };
    return labels[language];
  };

  return (
    <IconButton 
      onClick={handleLanguageToggle}
      color="default"
      title={'Cambiar idioma'}
    >
      <TranslateIcon />
    </IconButton>
  );
}
