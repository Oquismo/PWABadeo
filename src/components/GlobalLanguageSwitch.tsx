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
        fontSize: '0.75rem',
        minWidth: '50px',
        borderRadius: '25px',
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.8)'
        }
      }}
      title={`Current language: ${getLanguageLabel()}`}
    >
      <LanguageIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
      <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
        {language.toUpperCase()}
      </span>
    </IconButton>
  );
}
