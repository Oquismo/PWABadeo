"use client";
import { IconButton, Menu, MenuItem } from "@mui/material";
import LanguageIcon from '@mui/icons-material/Language';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
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
  };

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 124, 
          color: '#fff', 
          zIndex: 10 
        }}
      >
        <LanguageIcon />
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
    </>
  );
}
