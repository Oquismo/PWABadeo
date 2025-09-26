"use client";
import { IconButton, Menu, MenuItem, Snackbar } from "@mui/material";
import TranslateIcon from '@mui/icons-material/Translate';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: 'es' | 'en' | 'it') => {
    setLanguage(lng);
    handleClose();
    setSnackbarMessage(getLabel(lng));
    setSnackbarOpen(true);
    try {
      router.refresh();
    } catch (err) {
      console.warn('No se pudo forzar refresh del router:', err);
    }
    // Rely on router.refresh() to update server components; no hard reload.
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
    <>
      <IconButton 
  onClick={handleClick}
  color="default"
      >
  <TranslateIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            '& .MuiMenuItem-root': {
              color: '#fff',
              '&:hover': {
                bgcolor: '#3a3a3a'
              }
            }
          }
        }}
      >
        <MenuItem 
          onClick={() => changeLanguage('es')}
          sx={{ fontWeight: language === 'es' ? 700 : 400 }}
        >
          🇪🇸 Español
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('en')}
          sx={{ fontWeight: language === 'en' ? 700 : 400 }}
        >
          🇺🇸 English
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('it')}
          sx={{ fontWeight: language === 'it' ? 700 : 400 }}
        >
          🇮🇹 Italiano
        </MenuItem>
      </Menu>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={500}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
}
