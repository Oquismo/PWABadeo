"use client";

import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';
import GTranslateRoundedIcon from '@mui/icons-material/GTranslateRounded';

export default function InitialLanguageDialog() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const chosen = localStorage.getItem('languageChosen');
    if (!chosen) setOpen(true);
  }, []);

  const choose = (lng: 'es' | 'en' | 'it') => {
    setLanguage(lng);
    localStorage.setItem('languageChosen', 'true');
    setSnackbarMessage(getLabel(lng));
    setSnackbarOpen(true);
    try {
      router.refresh();
    } catch (err) {
      console.warn('No se pudo refrescar el router:', err);
    }
    setOpen(false);
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
    <Dialog open={open} onClose={() => {}} disableEscapeKeyDown fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GTranslateRoundedIcon />
        Elige tu idioma
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Selecciona el idioma en el que prefieres usar la aplicación. Podrás cambiarlo luego en Ajustes.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button variant={language === 'es' ? 'contained' : 'outlined'} onClick={() => choose('es')}>🇪🇸 Español</Button>
          <Button variant={language === 'en' ? 'contained' : 'outlined'} onClick={() => choose('en')}>🇬🇧 English</Button>
          <Button variant={language === 'it' ? 'contained' : 'outlined'} onClick={() => choose('it')}>🇮🇹 Italiano</Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Saltar</Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={500}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Dialog>
  );
}
