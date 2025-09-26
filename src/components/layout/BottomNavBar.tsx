'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { Paper, BottomNavigation, BottomNavigationAction, Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LoginIcon from '@mui/icons-material/Login';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
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
    { value: "/", icon: <HomeRoundedIcon />, label: t('nav.home') },
    { value: "/mapa", icon: <MapRoundedIcon />, label: t('nav.map') },
    // Actions principales (mostrar directamente)
    ...(user?.role === 'admin'
      ? [
          { value: "/admin", icon: <AdminPanelSettingsRoundedIcon />, label: "Admin" }
        ]
      : []),
    { value: "/telefonos", icon: <CallRoundedIcon />, label: "Teléfonos" },
    ...(isAuthenticated
      ? [{ value: "/perfil", icon: <PersonRoundedIcon />, label: t('nav.profile') }]
      : [{ value: "/login", icon: <LoginIcon />, label: "Login" }]),
  ];

  // Acciones que van al overflow (Menú "Más") — diseño expresivo tipo Material
  const overflowActions = [
    { value: "/sevilla-spot", icon: <ExploreRoundedIcon />, label: 'Tour' },
    { value: "/recomendaciones", icon: <RestaurantRoundedIcon />, label: "Recomendaciones" },
    { value: "/residencia", icon: <HotelRoundedIcon />, label: "Residencia" },
    // opciones adicionales temporales
    // { value: "/spotify", icon: <MusicNoteRoundedIcon />, label: "Spotify" },
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
          borderRadius: '50px', // Fully rounded como en M3 Floating Toolbar
          backgroundColor: theme => theme.palette.mode === 'dark' 
            ? '#2D2D30' // Surface container color M3
            : '#F3EDF7', // Surface container color M3
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08)', // Elevation 3 M3
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
              padding: '8px', // Padding interno M3 Floating Toolbar aumentado para más separación
              position: 'relative',
              minHeight: 48, // Altura compacta M3
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
                    color: theme => isActive 
                      ? theme.palette.mode === 'dark' ? '#E8DEF8' : '#5A4570'
                      : theme.palette.mode === 'dark' ? '#CAC4D0' : '#49454F',
                    transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
                    zIndex: 2,
                    minWidth: '40px',
                    height: '40px',
                    padding: '8px',
                    borderRadius: '50%', // Completamente redondo como IconButton M3
                    margin: '0 6px',
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(232, 222, 248, 0.08)' 
                        : 'rgba(90, 69, 112, 0.08)',
                    },
                    '&:active': {
                      backgroundColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(232, 222, 248, 0.12)' 
                        : 'rgba(90, 69, 112, 0.12)',
                    },
                    // Deshabilitar selección de texto y arrastre
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {/* 3. Badge M3 Floating Toolbar - Estado activo */}
                  {isActive && (
                    <motion.div
                      layoutId="bubble"
                      style={{
                        position: 'absolute',
                        zIndex: 1,
                        backgroundColor: '#E8DEF8', // M3 Secondary Container
                        borderRadius: '50%',
                        inset: 0,
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                </BottomNavigationAction>
              );
            })}

            {/* Botón 'Más' para overflow */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
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
        size="medium"
        sx={{
          color: theme => open 
            ? theme.palette.mode === 'dark' ? '#E8DEF8' : '#5A4570'
            : theme.palette.mode === 'dark' ? '#CAC4D0' : '#49454F',
          zIndex: 2,
          backgroundColor: open 
            ? '#E8DEF8' 
            : 'transparent',
          borderRadius: '50%',
          margin: '0 1px',
          padding: '8px',
          minWidth: '40px',
          height: '40px',
          transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': { 
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(232, 222, 248, 0.08)' 
              : 'rgba(90, 69, 112, 0.08)',
          },
          '&:active': {
            backgroundColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(232, 222, 248, 0.12)' 
              : 'rgba(90, 69, 112, 0.12)',
          },
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
