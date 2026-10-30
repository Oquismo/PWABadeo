"use client";
import { Box, Typography, Avatar, Stack, IconButton } from '@mui/material';
import Material3Dialog from '@/components/ui/Material3Dialog';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from '@/hooks/useTranslation';

export default function HeroSection() {
  // ...existing code...
  const { isAuthenticated, user, refreshAvatar } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const { t } = useTranslation();
  
  // Imagen de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '/img/twittereggavatar.jpg';

  useEffect(() => {
    setNow(new Date());
  }, []);

  // Función para obtener el saludo según la hora del día
  const getGreeting = () => {
    if (!now) {
      return t('common.greetings.morning') || 'Buenos días';
    }
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) {
      return t('common.greetings.morning') || 'Buenos días';
    } else if (hour >= 12 && hour < 20) {
      return t('common.greetings.afternoon') || 'Buenas tardes';
    } else {
      return t('common.greetings.evening') || 'Buenas noches';
    }
  };

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

  const firstName = isAuthenticated && user ? (user.name?.split(' ')[0] || 'estudiante') : '';
  const dateLabel = now ? now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const dateCap = dateLabel ? dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1) : '\u00A0';

  const roundBtn = {
    width: 44,
    height: 44,
    bgcolor: 'var(--md-surface)',
    border: '1px solid var(--md-outline-variant)',
    color: 'var(--md-on-surface)',
    '&:hover': { bgcolor: 'var(--md-surface-high)' },
  } as const;

  return (
    <Box component="header" sx={{ pt: 0.5, pb: 0.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Link href={isAuthenticated ? '/perfil' : '/login'} aria-label={isAuthenticated ? 'Ir a tu perfil' : 'Iniciar sesión'} style={{ display: 'inline-flex' }}>
          <Avatar
            src={isAuthenticated ? user?.avatarUrl || defaultEggAvatar : undefined}
            variant="rounded"
            sx={{
              width: 46,
              height: 46,
              borderRadius: '16px',
              bgcolor: 'var(--md-primary)',
              color: 'var(--md-on-primary)',
              fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
              fontWeight: 800,
              fontSize: 19,
            }}
          >
            {firstName ? firstName.charAt(0).toUpperCase() : undefined}
          </Avatar>
        </Link>

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
              fontWeight: 700,
              fontSize: '1.45rem',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {firstName ? `${getGreeting()}, ${firstName}` : getGreeting()}
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: '0.8rem', color: 'text.secondary' }}>{dateCap}</Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {isAuthenticated && (
            <IconButton aria-label="Notificaciones" title="Ver notificaciones" onClick={() => setModalOpen(true)} sx={roundBtn}>
              <NotificationsOutlinedIcon color={modalOpen ? 'primary' : 'inherit'} />
            </IconButton>
          )}
          <IconButton component={Link} href="/ajustes" aria-label="Ajustes" sx={roundBtn}>
            <TuneIcon />
          </IconButton>
        </Stack>
      </Stack>

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
  );
}
