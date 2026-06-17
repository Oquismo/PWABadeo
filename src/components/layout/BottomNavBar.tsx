'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, LayoutGroup } from 'framer-motion';
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
    return null;
  }

  if (pathname === '/login' || pathname === '/login-simple' || pathname === '/registro') {
    return null;
  }

  const navActions = [
    { value: "/", icon: <HomeRoundedIcon />, label: t('nav.home') },
    { value: "/mapa", icon: <MapRoundedIcon />, label: t('nav.map') },
    ...(user?.role === 'admin'
      ? [{ value: "/admin", icon: <AdminPanelSettingsRoundedIcon />, label: t('nav.admin') }]
      : []),
    { value: "/telefonos", icon: <CallRoundedIcon />, label: t('nav.phones') },
    ...(isAuthenticated
      ? [{ value: "/perfil", icon: <PersonRoundedIcon />, label: t('nav.profile') }]
      : [{ value: "/login", icon: <LoginIcon />, label: t('nav.login') }]),
  ];

  const overflowActions = [
    { value: "/comunidad", icon: <QuestionAnswerRoundedIcon />, label: t('nav.community') || 'Comunidad' },
    { value: "/album", icon: <PhotoLibraryRoundedIcon />, label: 'Álbum' },
    { value: "/programa", icon: <ExploreRoundedIcon />, label: 'Programa' },
    { value: "/recomendaciones", icon: <RestaurantRoundedIcon />, label: t('nav.recommendations') },
    { value: "/residencia", icon: <HotelRoundedIcon />, label: t('nav.residence') },
    ...(user?.role === 'admin'
      ? [{ value: "/tutoriales", icon: <VideoLibraryRoundedIcon />, label: t('nav.tutorials') }]
      : []),
  ];

  return (
    <Paper
      elevation={0}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
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
              const isActive = pathname === action.value;
              return (
                <BottomNavigationAction
                  key={action.value}
                  component={Link}
                  href={action.value}
                  aria-label={action.label || action.value}
                  value={action.value}
                  icon={action.icon}
                  onClick={() => tap()}
                  sx={{
                    position: 'relative',
                    color: theme => isActive
                      ? theme.palette.mode === 'dark' ? '#E8DEF8' : '#5A4570'
                      : theme.palette.mode === 'dark' ? '#CAC4D0' : '#49454F',
                    transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
                    zIndex: 2,
                    minWidth: '48px',
                    height: '48px',
                    padding: '12px',
                    borderRadius: '50%',
                    margin: '0 4px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: '-4px',
                      borderRadius: 'inherit',
                    },
                    '&:hover': {
                      backgroundColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(232, 222, 248, 0.08)'
                        : 'rgba(90, 69, 112, 0.08)',
                    },
                    '&:active': {
                      backgroundColor: theme => theme.palette.mode === 'dark'
                        ? 'rgba(232, 222, 248, 0.12)'
                        : 'rgba(90, 69, 112, 0.12)',
                      transform: 'scale(0.95)',
                    },
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
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
                        backgroundColor: '#E8DEF8',
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
  );
}

// Componente interno: menú "Más" para acciones en overflow
function MoreMenu({ overflowActions, tap, pathname }: { overflowActions: any[]; tap: () => void; pathname: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    tap();
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        aria-label={t('nav.more')}
        aria-controls={open ? 'more-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        size="medium"
        sx={{
          color: theme => open
            ? theme.palette.mode === 'dark' ? '#E8DEF8' : '#5A4570'
            : theme.palette.mode === 'dark' ? '#CAC4D0' : '#49454F',
          zIndex: 2,
          backgroundColor: open ? '#E8DEF8' : 'transparent',
          borderRadius: '50%',
          margin: '0 1px',
          padding: '12px',
          minWidth: '48px',
          height: '48px',
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
          userSelect: 'none',
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
        PaperProps={{
          elevation: 16,
          sx: {
            minWidth: 220,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: theme => `1px solid rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.24 : 0.08})`,
            boxShadow: '0px 12px 40px rgba(0,0,0,0.28)',
            px: 0.5,
          },
        }}
        MenuListProps={{ dense: true }}
      >
        {overflowActions.map((item) => (
          <MenuItem
            key={item.value}
            component={Link}
            href={item.value}
            aria-label={item.label || item.value}
            onClick={() => { tap(); handleClose(); }}
            selected={pathname === item.value}
            sx={{
              borderRadius: 2,
              mx: 0.5,
              my: 0.25,
              '&.Mui-selected': { backgroundColor: 'rgba(25,118,210,0.12)' },
              '&:hover': { backgroundColor: 'rgba(25,118,210,0.08)' },
              userSelect: 'none',
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
