'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';

// Mapeo de rutas a un índice numérico actualizado
const routeToIndex: { [key: string]: number } = {
  '/': 0,
  '/checklist': 1,
  '/mapa': 2,
  '/telefonos': 3,
  '/perfil': 4,
  '/login': 4,
};

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  const [value, setValue] = useState(routeToIndex[pathname] ?? 0);

  useEffect(() => {
    setValue(routeToIndex[pathname] ?? 0);
  }, [pathname]);

  // Array de acciones de navegación sin Proyectos y Servicios
  const navActions = [
    { label: "Inicio", value: "/", icon: <HomeIcon /> },
    { label: "Checklist", value: "/checklist", icon: <ChecklistIcon /> },
    { label: "Mapa", value: "/mapa", icon: <MapIcon /> },
    { label: "Teléfonos", value: "/telefonos", icon: <PhoneInTalkIcon /> },
    isAuthenticated
      ? { label: "Perfil", value: "/perfil", icon: <AccountCircleIcon /> }
      : { label: "Login", value: "/login", icon: <LoginIcon /> },
  ];

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
        value={value}
        onChange={(event, newValue) => {
          router.push(navActions[newValue].value);
        }}
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
            icon={action.icon}
            sx={{ borderRadius: '9999px' }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}