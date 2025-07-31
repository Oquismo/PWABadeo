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
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- SOLUCIÓN: Construimos la lista de acciones de forma dinámica ---
  const navActions = useMemo(() => {
    const baseActions = [
      { value: "/", icon: <HomeIcon /> },
      { value: "/mapa", icon: <MapIcon /> },
    ];

    const userActions = [
      { value: "/checklist", icon: <ChecklistIcon /> },
      { value: "/telefonos", icon: <PhoneInTalkIcon /> },
    ];

    const adminActions = [
      { value: "/admin", icon: <AdminPanelSettingsIcon /> },
    ];

    const authAction = isAuthenticated
      ? { value: "/perfil", icon: <AccountCircleIcon /> }
      : { value: "/login", icon: <LoginIcon /> };

    // Si no estamos en el cliente, mostramos una versión mínima
    if (!isClient) {
      return [...baseActions, authAction];
    }

    // Si estamos en el cliente, mostramos la versión completa según el rol
    return [...baseActions, ...(user?.role === 'admin' ? adminActions : userActions), authAction];
  }, [isClient, user, isAuthenticated]);


  if (!isClient) {
    // Renderizamos un placeholder o nada en el servidor para evitar errores de hidratación
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
        {navActions.map((action) => (
          <BottomNavigationAction 
            key={action.value}
            component={Link} 
            href={action.value} 
            value={action.value} 
            icon={action.icon} 
            sx={{ borderRadius: '9999px' }} 
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
