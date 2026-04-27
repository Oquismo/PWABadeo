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
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import M3Button from '@/components/ui/M3Button';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import ReviewDialog from '@/components/perfil/ReviewDialog';
import DeleteAccountDialog from '@/components/perfil/DeleteAccountDialog';
import Material3Dialog from '@/components/ui/Material3Dialog';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
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
import TaskManager from '@/components/admin/TaskManager';

export default function PerfilPage() {
  useEffect(() => {
    const handler = () => setReviewOpen(true);
    window.addEventListener('showGoogleReviewPrompt', handler);
    return () => window.removeEventListener('showGoogleReviewPrompt', handler);
  }, []);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout, refreshAvatar } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const defaultEggAvatar = '/img/twittereggavatar.jpg';

  useEffect(() => { setIsMounted(true); }, []);

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
  }, [user?.id]);

  useEffect(() => {
    const handleProfileImageChange = () => { if (user?.id) refreshAvatar(); };
    window.addEventListener('profileImageChanged', handleProfileImageChange);
    return () => window.removeEventListener('profileImageChanged', handleProfileImageChange);
  }, [user?.id]);

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
          mb: 2.5, borderRadius: '24px',
          background: 'linear-gradient(135deg, #3A2C4A 0%, #1C1230 100%)',
          p: '28px 22px', position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', top: -48, right: -48, width: 180, height: 180, borderRadius: '50%', background: 'rgba(102,126,234,0.10)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -24, left: -16, width: 100, height: 100, borderRadius: '50%', background: 'rgba(190,242,100,0.07)', pointerEvents: 'none' }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={user.avatarUrl || defaultEggAvatar}
                sx={{
                  width: 84, height: 84,
                  bgcolor: '#667EEA',
                  border: '3px solid rgba(255,255,255,0.18)',
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
                  background: '#BEF264',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                  transition: 'transform 150ms', '&:hover': { transform: 'scale(1.1)' },
                }}>
                  <EditRoundedIcon sx={{ fontSize: 15, color: '#1A2E00' }} />
                </Box>
              </Link>
            </Box>

            {/* Name + badge */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, mb: 1,
                fontFamily: 'var(--font-bricolage,"Bricolage Grotesque",Inter,sans-serif)',
              }}>
                {user.name || 'Estudiante'}
              </Typography>
              <Box component="span" sx={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                px: '10px', py: '4px', borderRadius: '9999px',
                background: isAdmin ? 'rgba(217,70,239,0.18)' : 'rgba(190,242,100,0.15)',
                border: `1px solid ${isAdmin ? 'rgba(217,70,239,0.35)' : 'rgba(190,242,100,0.3)'}`,
                fontSize: '0.72rem', fontWeight: 700,
                color: isAdmin ? '#F0ABFC' : '#BEF264',
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
            { href: '/perfil/editar', icon: <EditRoundedIcon sx={{ fontSize: 20 }} />, label: 'Editar', accent: '#BEF264', bg: 'rgba(190,242,100,0.10)', border: 'rgba(190,242,100,0.22)' },
            { href: '/cursos/espanol', icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />, label: 'Cursos', accent: '#8EA8F0', bg: 'rgba(102,126,234,0.10)', border: 'rgba(102,126,234,0.22)' },
            { href: '/ajustes', icon: <SettingsRoundedIcon sx={{ fontSize: 20 }} />, label: 'Ajustes', accent: '#E8DEF8', bg: 'rgba(232,222,248,0.07)', border: 'rgba(232,222,248,0.14)' },
          ] as const).map(item => (
            <Link key={item.label} href={item.href} passHref style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                px: 2.5, py: 1.5, borderRadius: '16px', cursor: 'pointer',
                background: item.bg, border: `1px solid ${item.border}`,
                transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
                '&:hover': { transform: 'translateY(-3px)', filter: 'brightness(1.2)' },
                '&:active': { transform: 'scale(0.95)' },
              }}>
                <Box sx={{ color: item.accent, display: 'flex' }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: item.accent, lineHeight: 1 }}>
                  {item.label}
                </Typography>
              </Box>
            </Link>
          ))}
          <Box
            component="button"
            onClick={() => setModalOpen(true)}
            sx={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              px: 2.5, py: 1.5, borderRadius: '16px', cursor: 'pointer',
              background: 'rgba(217,70,239,0.10)', border: '1px solid rgba(217,70,239,0.22)',
              transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
              '&:hover': { transform: 'translateY(-3px)', filter: 'brightness(1.2)' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <NotificationsOutlinedIcon sx={{ fontSize: 20, color: '#D946EF' }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#D946EF', lineHeight: 1 }}>
              Avisos
            </Typography>
          </Box>
        </Box>

        {/* ── Info list ── */}
        <Box sx={{
          mb: 2.5, borderRadius: '16px',
          background: '#1E1E21', border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          {([
            { icon: <EmailRoundedIcon sx={{ fontSize: 18, color: '#8EA8F0' }} />, label: 'Email', value: user.email },
            !isAdmin ? { icon: <SchoolRoundedIcon sx={{ fontSize: 18, color: '#BEF264' }} />, label: 'Escuela', value: schoolName } : null,
            !isAdmin ? { icon: <CakeRoundedIcon sx={{ fontSize: 18, color: '#D946EF' }} />, label: 'Edad', value: user.age ? `${user.age} años` : 'No especificada' } : null,
            { icon: <LocationOnRoundedIcon sx={{ fontSize: 18, color: '#F97316' }} />, label: 'Ubicación', value: locationStr },
            (!isAdmin && user.residence) ? { icon: <HotelRoundedIcon sx={{ fontSize: 18, color: '#00E676' }} />, label: 'Residencia', value: user.residence } : null,
          ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[]).map((row, i, arr) => (
            <Box
              key={row.label}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2.5, py: 1.75,
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              {row.icon}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#71717A', lineHeight: 1 }}>
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
        <Box sx={{ mb: 2, borderRadius: '16px', background: '#1E1E21', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
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
              expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#BEF264', fontSize: 20 }} />}
              sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.25 } }}
            >
              <AssignmentRoundedIcon sx={{ fontSize: 20, color: '#BEF264' }} />
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
          <Box sx={{ mb: 2, borderRadius: '16px', background: 'rgba(217,70,239,0.08)', border: '1px solid rgba(217,70,239,0.25)', overflow: 'hidden' }}>
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
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#F0ABFC', fontSize: 20 }} />}
                sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.25 } }}
              >
                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 20, color: '#F0ABFC' }} />
                <Typography sx={{
                  fontWeight: 700, fontSize: '0.95rem', color: '#F0ABFC',
                  fontFamily: 'var(--font-bricolage,"Bricolage Grotesque",Inter,sans-serif)',
                }}>
                  Panel de Administración
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ mb: 2, color: '#E8DEF8', opacity: 0.8 }}>
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
              height: 40, px: 2, borderRadius: '20px', cursor: 'pointer',
              background: 'rgba(190,242,100,0.10)', border: '1px solid rgba(190,242,100,0.25)',
              fontSize: '0.82rem', fontWeight: 700, color: '#BEF264',
              transition: 'all 150ms', '&:hover': { background: 'rgba(190,242,100,0.18)' },
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
              height: 40, px: 2, borderRadius: '20px', cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.14)',
              fontSize: '0.82rem', fontWeight: 700, color: '#A1A1AA',
              transition: 'all 150ms', '&:hover': { borderColor: '#EF4444', color: '#FCA5A5', background: 'rgba(239,68,68,0.08)' },
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 17 }} />
            Cerrar sesión
          </Box>
        </Box>

        {/* ── Danger zone ── */}
        <Box sx={{
          mt: 3, p: '18px 20px', borderRadius: '16px',
          background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.22)',
        }}>
          <Typography sx={{ fontWeight: 700, color: '#FCA5A5', mb: 0.5, fontSize: '0.9rem' }}>
            Zona de peligro
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#71717A', mb: 2, lineHeight: 1.5 }}>
            Una vez que elimines tu cuenta no hay vuelta atrás. Esta acción es permanente.
          </Typography>
          <Box
            component="button"
            onClick={() => setDeleteAccountOpen(true)}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              height: 36, px: 2, borderRadius: '18px', cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(239,68,68,0.4)',
              fontSize: '0.8rem', fontWeight: 700, color: '#FCA5A5',
              transition: 'all 150ms', '&:hover': { background: 'rgba(239,68,68,0.15)', borderColor: '#EF4444' },
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
