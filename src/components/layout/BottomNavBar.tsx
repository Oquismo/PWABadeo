'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useState, useEffect } from 'react';
import Link from 'next/link'; // 1. Importar el componente Link

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Evita errores de hidratación
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
        backgroundColor: 'rgba(28, 28, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <BottomNavigation
        showLabels={false}
        value={pathname} // El valor activo sigue siendo controlado por la ruta actual
        sx={{ 
          backgroundColor: 'transparent',
          padding: '0 8px',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: '48px',
          },
          '& .Mui-selected': {
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
            },
            background: 'rgba(190, 242, 100, 0.15)',
            borderRadius: '9999px',
            margin: '6px 0',
          },
        }}
      >
        {/* --- SOLUCIÓN: Cada botón es ahora un enlace independiente --- */}
        <BottomNavigationAction component={Link} href="/" value="/" icon={<HomeIcon />} sx={{ borderRadius: '9999px' }} />
        <BottomNavigationAction component={Link} href="/mapa" value="/mapa" icon={<MapIcon />} sx={{ borderRadius: '9999px' }} />

        {user?.role === 'admin' && (
          <BottomNavigationAction component={Link} href="/admin" value="/admin" icon={<AdminPanelSettingsIcon />} sx={{ borderRadius: '9999px' }} />
        )}

        {user?.role !== 'admin' && (
          <>
            <BottomNavigationAction component={Link} href="/checklist" value="/checklist" icon={<ChecklistIcon />} sx={{ borderRadius: '9999px' }} />
            <BottomNavigationAction component={Link} href="/telefonos" value="/telefonos" icon={<PhoneInTalkIcon />} sx={{ borderRadius: '9999px' }} />
          </>
        )}

        {isAuthenticated ? (
          <BottomNavigationAction component={Link} href="/perfil" value="/perfil" icon={<AccountCircleIcon />} sx={{ borderRadius: '9999px' }} />
        ) : (
          <BottomNavigationAction component={Link} href="/login" value="/login" icon={<LoginIcon />} sx={{ borderRadius: '9999px' }} />
        )}
      </BottomNavigation>
    </Paper>
  );
}
