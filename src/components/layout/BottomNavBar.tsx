'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext'; // 1. Importar el hook del tema
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { mode } = useThemeContext(); // 2. Obtenemos el modo del tema actual
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'auto',
        zIndex: 100,
        borderRadius: '9999px',
        // 3. Estilos condicionales basados en el modo del tema
        ...(mode === 'dark'
          ? {
              backgroundColor: 'rgba(28, 28, 30, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          : {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }),
      }}
    >
      <BottomNavigation
        showLabels={false}
        value={pathname}
        sx={{ 
          backgroundColor: 'transparent',
          padding: '0 8px',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: '48px',
            padding: '8px 0',
            borderRadius: '9999px',
          },
          '& .Mui-selected': {
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
            },
            // El fondo del botón activo también cambia con el tema
            background: mode === 'dark' ? 'rgba(190, 242, 100, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          },
        }}
      >
        <BottomNavigationAction component={Link} href="/" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction component={Link} href="/mapa" value="/mapa" icon={<MapIcon />} />

        {user?.role === 'admin' ? (
          <BottomNavigationAction component={Link} href="/admin" value="/admin" icon={<AdminPanelSettingsIcon />} />
        ) : (
          <>
            <BottomNavigationAction component={Link} href="/checklist" value="/checklist" icon={<ChecklistIcon />} />
            <BottomNavigationAction component={Link} href="/telefonos" value="/telefonos" icon={<PhoneInTalkIcon />} />
          </>
        )}

        {isAuthenticated ? (
          <BottomNavigationAction component={Link} href="/perfil" value="/perfil" icon={<AccountCircleIcon />} />
        ) : (
          <BottomNavigationAction component={Link} href="/login" value="/login" icon={<LoginIcon />} />
        )}
      </BottomNavigation>
    </Paper>
  );
}
