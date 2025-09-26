'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { Paper, BottomNavigation, BottomNavigationAction, Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import BugReportIcon from '@mui/icons-material/BugReport';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HotelIcon from '@mui/icons-material/Hotel';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, LayoutGroup } from 'framer-motion'; // 1. Importar de Framer Motion
import { useTranslation } from '@/hooks/useTranslation';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { tap } = useHaptics();
  const [isClient, setIsClient] = useState(false);
  const { t } = useTranslation();

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
    { value: "/", icon: <HomeIcon />, label: t('nav.home') },
    { value: "/mapa", icon: <MapIcon />, label: t('nav.map') },
    // Actions principales (mostrar directamente)
    ...(user?.role === 'admin'
      ? [
          { value: "/admin", icon: <AdminPanelSettingsIcon />, label: "Admin" }
        ]
      : []),
    { value: "/telefonos", icon: <PhoneInTalkIcon />, label: "Teléfonos" },
    ...(isAuthenticated
      ? [{ value: "/perfil", icon: <AccountCircleIcon />, label: t('nav.profile') }]
      : [{ value: "/login", icon: <LoginIcon />, label: "Login" }]),
  ];

  // Acciones que van al overflow (Menú "Más") — diseño expresivo tipo Material
  const overflowActions = [
    { value: "/sevilla-spot", icon: <LocationOnIcon />, label: 'Tour' },
    { value: "/residencia", icon: <HotelIcon />, label: "Residencia" },
    // opciones adicionales temporales
    // { value: "/spotify", icon: <MusicNoteIcon />, label: "Spotify" },
  ];

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 110, left: '50%', transform: 'translateX(-50%)', zIndex: 99 }}>
      </Box>
      <Paper 
        elevation={0}
        onContextMenu={(e) => {
          e.preventDefault(); // Prevenir menú contextual del navegador en todo el navbar
          e.stopPropagation();
        }}
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
          // Deshabilitar selección de texto y arrastre en todo el navbar
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
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
              // Determinar si está activo: para rutas de turismo, considerar todas las páginas relacionadas
              const isActive = action.value === "/sevilla-spot" 
                ? (pathname === "/sevilla-spot" || pathname === "/plaza-espana" || pathname === "/alcazar-sevilla" || pathname === "/barrio-santa-cruz")
                : pathname === action.value;
              return (
                <BottomNavigationAction
                  key={action.value}
                  component={Link}
                  href={action.value}
                  aria-label={action.label || action.value}
                  value={action.value}
                  icon={action.icon}
                  onClick={() => tap()} // Vibración al hacer tap en navegación
                  onContextMenu={(e) => {
                    e.preventDefault(); // Prevenir menú contextual del navegador
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    // Prevenir comportamientos no deseados en dispositivos táctiles
                    if (e.touches.length > 1) {
                      e.preventDefault();
                    }
                  }}
                  onTouchMove={(e) => {
                    // Evitar scroll accidental durante navegación
                    if (e.touches.length > 1) {
                      e.preventDefault();
                    }
                  }}
                  sx={{
                    position: 'relative',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.3s',
                    zIndex: 2,
                    minWidth: '48px',
                    padding: '8px',
                    borderRadius: '9999px',
                    // Deshabilitar selección de texto y arrastre
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent',
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

            {/* Botón 'Más' para overflow */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
              <MoreMenu overflowActions={overflowActions} tap={tap} pathname={pathname} />
            </Box>
          </BottomNavigation>
        </LayoutGroup>
      </Paper>
    </>
  );
}

// Componente interno: menú "Más" para acciones en overflow
function MoreMenu({ overflowActions, tap, pathname }: { overflowActions: any[]; tap: () => void; pathname: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    tap();
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        aria-label="más"
        aria-controls={open ? 'more-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        onContextMenu={(e) => {
          e.preventDefault(); // Prevenir menú contextual del navegador
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          // Prevenir comportamientos no deseados en dispositivos táctiles
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        }}
        size="large"
        sx={{
          color: open ? 'primary.main' : 'text.secondary',
          zIndex: 2,
          backgroundColor: open ? 'rgba(25,118,210,0.08)' : 'transparent',
          borderRadius: 2,
          '&:hover': { backgroundColor: open ? 'rgba(25,118,210,0.12)' : 'rgba(255,255,255,0.04)' },
          // Deshabilitar selección de texto y arrastre
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ elevation: 16, sx: {
            minWidth: 220,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: theme => `1px solid rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.24 : 0.08})`,
            boxShadow: '0px 12px 40px rgba(0,0,0,0.28)',
            px: 0.5,
          }
        }}
        MenuListProps={{ dense: true }}
      >
        {overflowActions.map((item) => (
          <MenuItem
            key={item.value}
            component={Link}
            href={item.value}
            aria-label={item.label || item.value}
            onClick={() => {
              tap();
              handleClose();
            }}
            onContextMenu={(e) => {
              e.preventDefault(); // Prevenir menú contextual del navegador
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              // Prevenir comportamientos no deseados en dispositivos táctiles
              if (e.touches.length > 1) {
                e.preventDefault();
              }
            }}
            selected={pathname === item.value}
            sx={{
              borderRadius: 2,
              mx: 0.5,
              my: 0.25,
              '&.Mui-selected': { backgroundColor: 'rgba(25,118,210,0.12)' },
              '&:hover': { backgroundColor: 'rgba(25,118,210,0.08)' },
              // Deshabilitar selección de texto y arrastre
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
