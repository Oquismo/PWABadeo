"use client";
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import Material3Dialog from '@/components/ui/Material3Dialog';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function HeroSection() {
  const { isAuthenticated, user, refreshAvatar } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const { t } = useTranslation();

  const defaultEggAvatar = '/img/twittereggavatar.jpg';

  useEffect(() => {
    setNow(new Date());
  }, []);

  const getGreeting = () => {
    if (!now) return t('common.greetings.morning') || 'Buenos días';
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) return t('common.greetings.morning') || 'Buenos días';
    if (hour >= 12 && hour < 20) return t('common.greetings.afternoon') || 'Buenas tardes';
    return t('common.greetings.evening') || 'Buenas noches';
  };

  useEffect(() => {
    const handleAvatarChange = () => {
      if (isAuthenticated && user?.id) refreshAvatar();
    };
    window.addEventListener('profileImageChanged', handleAvatarChange);
    return () => window.removeEventListener('profileImageChanged', handleAvatarChange);
  }, [isAuthenticated, user?.id, refreshAvatar]);

  const firstName = isAuthenticated && user ? user.name?.split(' ')[0] || 'estudiante' : '';
  const dateLabel = now
    ? now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  const subtitle = dateLabel ? dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1) : '\u00A0';

  return (
    <>
      <Box component="header" sx={{ display: 'flex', alignItems: 'center', gap: '12px', pt: 0.75, pb: 0.5 }}>
        <Link
          href={isAuthenticated ? '/perfil' : '/login'}
          aria-label={isAuthenticated ? 'Ir a tu perfil' : 'Iniciar sesión'}
          style={{ display: 'inline-flex' }}
        >
          <Avatar
            src={isAuthenticated ? user?.avatarUrl || defaultEggAvatar : undefined}
            variant="rounded"
            sx={{
              width: 46,
              height: 46,
              flex: 'none',
              borderRadius: '16px',
              bgcolor: 'var(--md-primary)',
              color: 'var(--md-on-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 19,
            }}
          >
            {firstName ? firstName.charAt(0).toUpperCase() : undefined}
          </Avatar>
        </Link>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.4rem',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {firstName ? `${getGreeting()}, ${firstName}` : getGreeting()}
          </Typography>
          <Typography component="p" sx={{ m: 0, mt: '2px', fontSize: '0.82rem', color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>

        {isAuthenticated && (
          <IconButton
            aria-label="Notificaciones"
            title="Ver notificaciones"
            onClick={() => setModalOpen(true)}
            sx={{
              width: 44,
              height: 44,
              flex: 'none',
              bgcolor: 'var(--md-surface)',
              border: '1px solid var(--md-outline-variant)',
              color: 'var(--md-on-surface)',
              '&:hover': { bgcolor: 'var(--md-surface-high)' },
            }}
          >
            <NotificationsOutlinedIcon />
          </IconButton>
        )}
      </Box>

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
    </>
  );
}
