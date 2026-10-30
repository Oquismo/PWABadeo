'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
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

  if (pathname === '/login' || pathname === '/registro') {
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
    <Box
      component="nav"
      aria-label="Navegación principal"
      onContextMenu={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}
      sx={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        width: 'min(calc(100% - 32px), 400px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        p: '6px',
        borderRadius: '9999px',
        bgcolor: 'var(--md-glass)',
        border: '1px solid var(--md-outline-variant)',
        boxShadow: 'var(--md-shadow-card)',
        backdropFilter: 'blur(22px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <LayoutGroup>
        {navActions.map((action) => {
          const isActive = pathname === action.value;
          return (
            <Box
              key={action.value}
              component={Link}
              href={action.value}
              aria-label={action.label || action.value}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => tap()}
              sx={{
                position: 'relative',
                flex: isActive ? 2.3 : 1,
                height: 50,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                whiteSpace: 'nowrap',
                color: isActive ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
                transition: 'flex 0.3s ease, color 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
                '&:active': { transform: 'scale(0.96)' },
                '&:focus-visible': { outline: '2px solid var(--md-azul)', outlineOffset: 2 },
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                '& svg': { position: 'relative', zIndex: 2, fontSize: 24 },
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="bubble"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    borderRadius: 9999,
                    backgroundColor: 'var(--md-primary)',
                  }}
                  transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                />
              )}
              {action.icon}
              {isActive && (
                <Box component="span" sx={{ position: 'relative', zIndex: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {action.label}
                </Box>
              )}
            </Box>
          );
        })}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
          <MoreMenu overflowActions={overflowActions} tap={tap} pathname={pathname} />
        </Box>
      </LayoutGroup>
    </Box>
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
          color: open ? 'var(--md-on-primary)' : 'var(--md-on-surface-variant)',
          zIndex: 2,
          backgroundColor: open ? 'var(--md-primary)' : 'transparent',
          borderRadius: '50%',
          margin: '0 1px',
          padding: '12px',
          minWidth: '48px',
          height: '50px',
          transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            backgroundColor: 'rgba(47, 82, 0, 0.08)',
          },
          '&:active': {
            backgroundColor: 'rgba(47, 82, 0, 0.14)',
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
            border: '1px solid var(--md-outline-variant)',
            boxShadow: 'var(--md-shadow-card)',
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
