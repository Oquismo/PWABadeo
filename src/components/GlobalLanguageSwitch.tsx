"use client";
import { IconButton } from "@mui/material";
import LanguageIcon from '@mui/icons-material/Language';
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
      sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        bgcolor: 'rgba(0,0,0,0.6)',
        color: '#fff', 
        zIndex: 1000,
        fontSize: '1.5rem',
        borderRadius: '50%',
        width: 48,
        height: 48,
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.8)'
        }
      }}
      title={'Cambiar idioma'}
    >
      <LanguageIcon sx={{ fontSize: '2rem' }} />
    </IconButton>
  );
}
