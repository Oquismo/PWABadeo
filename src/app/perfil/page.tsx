'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fade,
  useTheme,
} from '@mui/material';
import Material3Dialog from '@/components/ui/Material3Dialog';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Link from 'next/link';
import loggerClient from '@/lib/loggerClient';
import dynamic from 'next/dynamic';

const ReviewDialog = dynamic(() => import('@/components/perfil/ReviewDialog'), { ssr: false });
const DeleteAccountDialog = dynamic(() => import('@/components/perfil/DeleteAccountDialog'), { ssr: false });
const NotificationsPanel = dynamic(() => import('@/components/home/NotificationsPanel'), { ssr: false });
const TaskManager = dynamic(() => import('@/components/admin/TaskManager'), { ssr: false });

export default function PerfilPage() {
  const theme = useTheme();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout, refreshAvatar } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const defaultEggAvatar = '/img/twittereggavatar.jpg';

  useEffect(() => {
    setIsMounted(true);
    const handler = () => setReviewOpen(true);
    window.addEventListener('showGoogleReviewPrompt', handler);
    return () => window.removeEventListener('showGoogleReviewPrompt', handler);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) {
      const timer = setTimeout(() => {
        if (!isAuthenticated && !user) router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router, isLoading]);

  useEffect(() => {
    const loadAvatar = async () => {
      if (user?.id) {
        try { await refreshAvatar(); }
        catch (error) { loggerClient.error('Error al cargar avatar:', error); }
      }
    };
    loadAvatar();
  }, [user?.id, refreshAvatar]);

  useEffect(() => {
    const handleProfileImageChange = () => { if (user?.id) refreshAvatar(); };
    window.addEventListener('profileImageChanged', handleProfileImageChange);
    return () => window.removeEventListener('profileImageChanged', handleProfileImageChange);
  }, [user?.id, refreshAvatar]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('appLogs');
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <Material3LoadingPage
        text="Cargando perfil..."
        subtitle="Obteniendo información de tu cuenta"
      />
    );
  }

  const isReady = isAuthenticated && !!user && isMounted;
  if (!isReady) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography variant="h6" color="text.secondary">Verificando autenticación...</Typography>
        </Box>
      </Container>
    );
  }

  const handleAvatarTouchStart = () => {
    tapTimeout.current = setTimeout(() => setModalOpen(true), 500);
  };
  const handleAvatarTouchEnd = () => {
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
  };

  const isAdmin = user.role === 'admin' || user.role === 'ADMIN';

  const locationStr = (() => {
    const parts: string[] = [];
    if (!isAdmin && user.school && typeof user.school === 'object') {
      const school = user.school as any;
      if (school.town) parts.push(school.town);
      if (school.city) parts.push(school.city);
      if (school.country) parts.push(school.country);
    } else {
      if (user.town) parts.push(user.town);
      if (user.city) parts.push(user.city);
      if (user.country) parts.push(user.country);
    }
    return parts.length > 0 ? parts.join(', ') : 'No especificada';
  })();

  const schoolName = user.school
    ? (typeof user.school === 'string' ? user.school : (user.school as any).name)
    : 'No especificada';

  const infoRows = [
    { icon: <EmailRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />, label: 'Email', value: user.email },
    !isAdmin ? { icon: <SchoolRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />, label: 'Escuela', value: schoolName } : null,
    !isAdmin ? { icon: <CakeRoundedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />, label: 'Edad', value: user.age ? `${user.age} años` : 'No especificada' } : null,
    { icon: <LocationOnRoundedIcon sx={{ fontSize: 18, color: 'warning.main' }} />, label: 'Ubicación', value: locationStr },
    (!isAdmin && user.residence) ? { icon: <HotelRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />, label: 'Residencia', value: user.residence } : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <Fade in={true} timeout={350}>
      <Container component="main" maxWidth="md" sx={{ py: 2, pb: 6 }}>
        <Material3Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Notificaciones"
          icon={<NotificationsOutlinedIcon />}
          supportingText="Revisa todas tus notificaciones importantes."
          maxWidth="sm"
          fullWidth
        >
          <NotificationsPanel />
        </Material3Dialog>

        {/* ── Hero ── */}
        <Box sx={{
          mb: 2.5, borderRadius: 6,
          background: (t) => `linear-gradient(135deg, ${t.palette.secondary.dark} 0%, ${t.palette.background.default} 100%)`,
          p: '28px 22px', position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', top: -48, right: -48, width: 180, height: 180, borderRadius: '50%', background: (t) => `${t.palette.primary.main}1A`, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -24, left: -16, width: 100, height: 100, borderRadius: '50%', background: (t) => `${t.palette.primary.main}12`, pointerEvents: 'none' }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={user.avatarUrl || defaultEggAvatar}
                sx={{
                  width: 84, height: 84,
                  bgcolor: 'primary.main',
                  border: (t) => `3px solid ${t.palette.primary.contrastText}2E`,
                  cursor: 'pointer',
                  transition: 'transform 240ms cubic-bezier(0.2,0,0,1)',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
                onTouchStart={handleAvatarTouchStart}
                onTouchEnd={handleAvatarTouchEnd}
                onMouseDown={handleAvatarTouchStart}
                onMouseUp={handleAvatarTouchEnd}
                title="Mantén presionado para ver notificaciones"
              >
                {!user.avatarUrl && <PersonRoundedIcon sx={{ fontSize: 46 }} />}
              </Avatar>
              <Link href="/perfil/editar" passHref>
                <Box sx={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: (t) => t.shadows[2],
                  transition: 'transform 150ms', '&:hover': { transform: 'scale(1.1)' },
                }}>
                  <EditRoundedIcon sx={{ fontSize: 15, color: 'primary.contrastText' }} />
                </Box>
              </Link>
            </Box>

            {/* Name + badge */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontSize: '1.5rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.1, mb: 1,
                fontFamily: 'var(--font-bricolage,"Bricolage Grotesque",Inter,sans-serif)',
              }}>
                {user.name || 'Estudiante'}
              </Typography>
              <Box component="span" sx={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                px: '10px', py: '4px', borderRadius: 9999,
                bgcolor: isAdmin ? 'secondary.dark' : 'primary.dark',
                border: (t) => `1px solid ${isAdmin ? t.palette.secondary.main : t.palette.primary.main}4D`,
                fontSize: '0.72rem', fontWeight: 700,
                color: isAdmin ? 'secondary.light' : 'primary.light',
              }}>
                {isAdmin
                  ? <AdminPanelSettingsRoundedIcon sx={{ fontSize: 13 }} />
                  : <PersonRoundedIcon sx={{ fontSize: 13 }} />}
                {isAdmin ? 'Administrador' : 'Estudiante activo'}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Quick actions ── */}
        <Box sx={{
          display: 'flex', gap: 1, mb: 2.5,
          overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}>
          {([
            { href: '/perfil/editar', icon: <EditRoundedIcon sx={{ fontSize: 20 }} />, label: 'Editar', palette: 'primary' as const },
            { href: '/cursos/espanol', icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />, label: 'Cursos', palette: 'secondary' as const },
            { href: '/ajustes', icon: <EditRoundedIcon sx={{ fontSize: 20 }} />, label: 'Ajustes', palette: 'info' as const },
          ]).map(item => {
            const colorKey = item.palette;
            const mainColor = theme.palette[colorKey]?.main || theme.palette.primary.main;
            return (
              <Link key={item.label} href={item.href} passHref style={{ textDecoration: 'none', flexShrink: 0 }}>
                <Box sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  px: 2.5, py: 1.5, borderRadius: 4, cursor: 'pointer',
                  bgcolor: `${mainColor}1A`, border: (t) => `1px solid ${mainColor}38`,
                  transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
                  '&:hover': { transform: 'translateY(-3px)', bgcolor: `${mainColor}2E` },
                  '&:active': { transform: 'scale(0.95)' },
                }}>
                  <Box sx={{ color: mainColor, display: 'flex' }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: mainColor, lineHeight: 1 }}>
                    {item.label}
                  </Typography>
                </Box>
              </Link>
            );
          })}
          <Box
            component="button"
            onClick={() => setModalOpen(true)}
            sx={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              px: 2.5, py: 1.5, borderRadius: 4, cursor: 'pointer',
              bgcolor: (t) => `${t.palette.secondary.main}1A`, border: (t) => `1px solid ${t.palette.secondary.main}38`,
              transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
              '&:hover': { transform: 'translateY(-3px)', bgcolor: (t) => `${t.palette.secondary.main}2E` },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <NotificationsOutlinedIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'secondary.main', lineHeight: 1 }}>
              Avisos
            </Typography>
          </Box>
        </Box>

        {/* ── Info list ── */}
        <Box sx={{
          mb: 2.5, borderRadius: 4,
          bgcolor: 'background.paper', border: (t) => `1px solid ${t.palette.divider}`,
          overflow: 'hidden',
        }}>
          {infoRows.map((row, i, arr) => (
            <Box
              key={row.label}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2.5, py: 1.75,
                borderBottom: i < arr.length - 1 ? (t) => `1px solid ${t.palette.divider}` : 'none',
              }}
            >
              {row.icon}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'text.secondary', lineHeight: 1 }}>
                  {row.label}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', mt: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── Mis Tareas ── */}
        <Box sx={{ mb: 2, borderRadius: 4, bgcolor: 'background.paper', border: (t) => `1px solid ${t.palette.divider}`, overflow: 'hidden' }}>
          <Accordion
            elevation={0}
            sx={{
              background: 'transparent',
              '&:before': { display: 'none' },
              '& .MuiAccordionSummary-root': { px: 2.5, py: 0.5 },
              '& .MuiAccordionDetails-root': { px: 2.5, pb: 2.5 },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
              sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.25 } }}
            >
              <AssignmentRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography sx={{
                fontWeight: 700, fontSize: '0.95rem',
                fontFamily: 'var(--font-bricolage,"Bricolage Grotesque",Inter,sans-serif)',
              }}>
                Mis Tareas Personalizadas
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Gestiona las tareas que aparecen en tu dashboard principal.
              </Typography>
              <TaskManager />
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* ── Admin panel ── */}
        {isAdmin && (
          <Box sx={{ mb: 2, borderRadius: 4, bgcolor: (t) => `${t.palette.secondary.main}14`, border: (t) => `1px solid ${t.palette.secondary.main}3F`, overflow: 'hidden' }}>
            <Accordion
              elevation={0}
              sx={{
                background: 'transparent',
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': { px: 2.5, py: 0.5 },
                '& .MuiAccordionDetails-root': { px: 2.5, pb: 2.5 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'secondary.light', fontSize: 20 }} />}
                sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.25 } }}
              >
                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 20, color: 'secondary.light' }} />
                <Typography sx={{
                  fontWeight: 700, fontSize: '0.95rem', color: 'secondary.light',
                  fontFamily: 'var(--font-bricolage,"Bricolage Grotesque",Inter,sans-serif)',
                }}>
                  Panel de Administración
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Accede a las herramientas de gestión de usuarios y tareas administrativas.
                </Typography>
                <TaskManager />
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {/* ── Bottom actions ── */}
        <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
          <Box
            component="button"
            onClick={() => setReviewOpen(true)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              height: 40, px: 2, borderRadius: 5, cursor: 'pointer',
              bgcolor: (t) => `${t.palette.primary.main}1A`, border: (t) => `1px solid ${t.palette.primary.main}3F`,
              fontSize: '0.82rem', fontWeight: 700, color: 'primary.main',
              transition: 'all 150ms', '&:hover': { bgcolor: (t) => `${t.palette.primary.main}2E` },
            }}
          >
            <StarRoundedIcon sx={{ fontSize: 17 }} />
            Reseña Google
          </Box>
          <Box
            component="button"
            onClick={handleLogout}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              height: 40, px: 2, borderRadius: 5, cursor: 'pointer',
              bgcolor: 'transparent', border: (t) => `1px solid ${t.palette.divider}`,
              fontSize: '0.82rem', fontWeight: 700, color: 'text.secondary',
              transition: 'all 150ms', '&:hover': { borderColor: 'error.main', color: 'error.light', bgcolor: (t) => `${t.palette.error.main}14` },
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 17 }} />
            Cerrar sesión
          </Box>
        </Box>

        {/* ── Danger zone ── */}
        <Box sx={{
          mt: 3, p: '18px 20px', borderRadius: 4,
          bgcolor: (t) => `${t.palette.error.main}0D`, border: (t) => `1px solid ${t.palette.error.main}38`,
        }}>
          <Typography sx={{ fontWeight: 700, color: 'error.light', mb: 0.5, fontSize: '0.9rem' }}>
            Zona de peligro
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
            Una vez que elimines tu cuenta no hay vuelta atrás. Esta acción es permanente.
          </Typography>
          <Box
            component="button"
            onClick={() => setDeleteAccountOpen(true)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              height: 36, px: 2, borderRadius: 4.5, cursor: 'pointer',
              bgcolor: 'transparent', border: (t) => `1px solid ${t.palette.error.main}66`,
              fontSize: '0.8rem', fontWeight: 700, color: 'error.light',
              transition: 'all 150ms', '&:hover': { bgcolor: (t) => `${t.palette.error.main}26`, borderColor: 'error.main' },
            }}
          >
            Eliminar mi cuenta permanentemente
          </Box>
        </Box>

        <ReviewDialog open={reviewOpen} onClose={() => setReviewOpen(false)} />
        <DeleteAccountDialog open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
      </Container>
    </Fade>
  );
}
