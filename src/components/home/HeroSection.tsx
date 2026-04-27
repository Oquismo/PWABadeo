"use client";
import { Box, Typography, Avatar, Stack, IconButton } from '@mui/material';
import Material3Dialog from '@/components/ui/Material3Dialog';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from '@/hooks/useTranslation';

export default function HeroSection() {
  // ...existing code...
  const { isAuthenticated, user, refreshAvatar } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();
  
  // Imagen de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '/img/twittereggavatar.jpg';

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
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Parte Izquierda: Avatar, Campana y Saludo */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1, position: 'relative' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Link href={isAuthenticated ? "/perfil" : "/login"} passHref>
              <Avatar
                src={isAuthenticated ? user?.avatarUrl || defaultEggAvatar : undefined}
                sx={{
                  width: 48,
                  height: 48,
                  cursor: 'pointer',
                  fontSize: user?.avatarUrl && !user.avatarUrl.startsWith('data:') && user.avatarUrl !== defaultEggAvatar ? '1.5rem' : 'inherit',
                  bgcolor: !isAuthenticated ? 'primary.main' : 'primary.light'
                }}
              >
                {isAuthenticated && !user?.avatarUrl ? undefined :
                 isAuthenticated && user?.avatarUrl && !user.avatarUrl.startsWith('data:') && user.avatarUrl !== defaultEggAvatar ? user.avatarUrl :
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
                <NotificationsOutlinedIcon color={modalOpen ? 'primary' : 'action'} fontSize="small" />
              </IconButton>
            )}
            {/* Material 3 Dialog de notificaciones */}
            <Material3Dialog
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Notificaciones"
              icon={<NotificationsOutlinedIcon />}
              supportingText="Revisa tus notificaciones y actualizaciones importantes."
              maxWidth="md"
              fullWidth
            >
              <NotificationsPanel />
            </Material3Dialog>
          </Box>
          <Box>
            <Typography
              component="h1"
              variant="h4"
              fontWeight={700}
              sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)', lineHeight: 1.2 }}
            >
              {isAuthenticated && user ? `${getGreeting()}, ${user.name?.split(' ')[0] || 'estudiante'}` : getGreeting()}
            </Typography>
          </Box>
        </Stack>

        {/* Parte Derecha: Iconos de Acción */}
        <Stack direction="row" spacing={1}>
          <Link href="/ajustes" passHref>
            <IconButton>
              <TuneIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}
