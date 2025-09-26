"use client";
import { IconButton, Snackbar } from "@mui/material";
import TranslateIcon from '@mui/icons-material/Translate';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GlobalLanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleLanguageToggle = () => {
    // Ciclo entre idiomas: es -> en -> it -> es
    const nextLanguage: Record<string, string> = {
      'es': 'en',
      'en': 'it', 
      'it': 'es'
    };
    
    const newLang = nextLanguage[language] || 'es';
    console.log('Cambiando de', language, 'a', newLang); // Debug
  setLanguage(newLang as any);
  setSnackbarMessage(getLabel(newLang));
  setSnackbarOpen(true);

    // Refresh the app router so server components re-render with the new language
    try {
      router.refresh();
    } catch (err) {
      console.warn('No se pudo forzar refresh del router:', err);
    }
    // No reload fallback: rely on router.refresh() to update server components.
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const getLabel = (lng: string) => {
    switch (lng) {
      case 'es':
        return 'Idioma: Español';
      case 'en':
        return 'Language: English';
      case 'it':
        return 'Lingua: Italiano';
      default:
        return '';
    }
  };

  return (
    <IconButton 
      onClick={handleLanguageToggle}
      color="default"
      title={'Cambiar idioma'}
    >
      <TranslateIcon />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={500}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </IconButton>
  );
}
