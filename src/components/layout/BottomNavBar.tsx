'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Paper, BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, LayoutGroup } from 'framer-motion'; // 1. Importar de Framer Motion

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

  // Ocultar barra en páginas de login/registro para evitar navegación antes de autenticarse
  if (pathname === '/login' || pathname === '/login-simple' || pathname === '/registro') {
    return null;
  }

  const navActions = [
    { value: "/", icon: <HomeIcon /> },
    { value: "/mapa", icon: <MapIcon /> },
    ...(user?.role === 'admin'
      ? [{ value: "/admin", icon: <AdminPanelSettingsIcon /> }]
      : [
          { value: "/checklist", icon: <ChecklistIcon /> },
          { value: "/telefonos", icon: <PhoneInTalkIcon /> },
        ]),
    ...(isAuthenticated
      ? [{ value: "/perfil", icon: <AccountCircleIcon /> }]
      : [{ value: "/login", icon: <LoginIcon /> }]),
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
        backgroundColor: 'rgba(40, 40, 42, 0.75)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* 2. Usamos LayoutGroup para que Framer Motion pueda seguir la "burbuja" */}
      <LayoutGroup>
        <BottomNavigation
          showLabels={false}
          value={pathname}
          sx={{ 
            backgroundColor: 'transparent',
            padding: '6px', // Espacio interior
            position: 'relative',
          }}
        >
          {navActions.map((action) => {
            const isActive = pathname === action.value;
            return (
              <BottomNavigationAction
                key={action.value}
                component={Link}
                href={action.value}
                value={action.value}
                icon={action.icon}
                sx={{
                  position: 'relative',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'color 0.3s',
                  zIndex: 2,
                  minWidth: '48px',
                  padding: '8px',
                  borderRadius: '9999px',
                }}
              >
                {/* 3. La "burbuja" animada */}
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    style={{
                      position: 'absolute',
                      zIndex: 1,
                      backgroundColor: 'rgba(190, 242, 100, 0.2)',
                      borderRadius: '9999px',
                      inset: 0,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </BottomNavigationAction>
            );
          })}
        </BottomNavigation>
      </LayoutGroup>
    </Paper>
  );
}
