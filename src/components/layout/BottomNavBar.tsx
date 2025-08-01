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
import Link from 'next/link';

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
        value={pathname}
        sx={{ 
          backgroundColor: 'transparent',
          padding: '0 8px',
          // --- SOLUCIÓN AQUÍ ---
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: '48px',
            padding: '8px 0', // 1. Añadimos un padding consistente para todos los botones
            borderRadius: '9999px',
          },
          '& .Mui-selected': {
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
            },
            background: 'rgba(190, 242, 100, 0.15)',
            // 2. Eliminamos el margen que causaba el encogimiento
          },
        }}
      >
        {/* Cada botón es ahora un enlace independiente */}
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
