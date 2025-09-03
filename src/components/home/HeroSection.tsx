"use client";
import { Box, Typography, Avatar, Stack, IconButton, Modal, Slide, Backdrop } from '@mui/material';
import GlobalLanguageSwitch from '@/components/GlobalLanguageSwitch';
// import SearchIcon from '@mui/icons-material/Search';
// SearchIcon eliminado
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings'; // 1. Importar el icono de Ajustes
import { useTranslation } from '@/hooks/useTranslation';

export default function HeroSection() {
  // ...existing code...
  const { isAuthenticated, user, refreshAvatar } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();
  
  // Emoji de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '🥚';

  // Función para obtener el saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return t('common.greetings.morning') || 'Buenos días';
    } else if (hour >= 12 && hour < 20) {
      return t('common.greetings.afternoon') || 'Buenas tardes';
    } else {
      return t('common.greetings.evening') || 'Buenas noches';
    }
  };

  useEffect(() => {
    const loadAvatar = async () => {
      if (isAuthenticated && user?.id) {
        try {
          await refreshAvatar();
        } catch (error) {
          console.error('Error al cargar avatar en hero:', error);
        }
      }
    };
    loadAvatar();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const handleAvatarChange = () => {
      if (isAuthenticated && user?.id) {
        refreshAvatar();
      }
    };
    window.addEventListener('profileImageChanged', handleAvatarChange);
    return () => {
      window.removeEventListener('profileImageChanged', handleAvatarChange);
    };
  }, [isAuthenticated, user?.id]);

  return (
    <Box 
      sx={{ 
        py: { xs: 2, md: 3 },
        position: 'relative'
      }}
    >
      {/* Botón de cambio de idioma fijo */}
      <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1200 }}>
        <GlobalLanguageSwitch />
      </Box>
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Parte Izquierda: Avatar, Campana y Saludo */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1, position: 'relative' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Link href={isAuthenticated ? "/perfil" : "/login"} passHref>
              <Avatar
                src={isAuthenticated ? user?.avatarUrl || undefined : undefined}
                sx={{
                  width: 48,
                  height: 48,
                  cursor: 'pointer',
                  fontSize: user?.avatarUrl && !user.avatarUrl.startsWith('data:') ? '1.5rem' : 'inherit',
                  bgcolor: !isAuthenticated ? 'primary.main' : 'primary.light'
                }}
              >
                {isAuthenticated && !user?.avatarUrl ? defaultEggAvatar :
                 isAuthenticated && user?.avatarUrl && !user.avatarUrl.startsWith('data:') ? user.avatarUrl :
                 !isAuthenticated ? undefined : null}
              </Avatar>
            </Link>
            {/* Icono de campana sobre el avatar */}
            {isAuthenticated && (
              <IconButton
                aria-label="notificaciones"
                onClick={() => setModalOpen(true)}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  zIndex: 2,
                  p: 0.5,
                }}
                size="small"
                title="Ver notificaciones"
              >
                <NotificationsIcon color={modalOpen ? 'primary' : 'action'} fontSize="small" />
              </IconButton>
            )}
            {/* Modal de notificaciones deslizante */}
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              closeAfterTransition
              slots={{ backdrop: Backdrop }}
              slotProps={{ backdrop: { timeout: 300 } }}
              sx={{ zIndex: 1500 }}
            >
              <Slide direction="down" in={modalOpen} mountOnEnter unmountOnExit>
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 0,
                    p: { xs: 1, md: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflowY: 'auto',
                  }}
                  onClick={(e) => {
                    // Solo cerrar si se hace click fuera del panel (no sobre el contenido)
                    if (e.target === e.currentTarget) setModalOpen(false);
                  }}
                >
                  <NotificationsPanel />
                </Box>
              </Slide>
            </Modal>
          </Box>
          <Box>
            <Typography 
              component="h1" 
              variant="h4"
              fontWeight="bold"
            >
              {isAuthenticated && user ? `${getGreeting()}, ${user.name?.split(' ')[0] || 'Usuario'}` : getGreeting()}
            </Typography>
          </Box>
        </Stack>

        {/* Parte Derecha: Iconos de Acción */}
        <Stack direction="row" spacing={1}>
          {/* SearchIcon eliminado */}
          {/* 2. Reemplazamos el icono y lo enlazamos a la página de ajustes */}
          <Link href="/ajustes" passHref>
            <IconButton>
              <SettingsIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}
