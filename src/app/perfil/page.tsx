'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Fade,
  Grid
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import M3Button from '@/components/ui/M3Button';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import ReviewDialog from '@/components/perfil/ReviewDialog';
import Material3Dialog from '@/components/ui/Material3Dialog';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import Link from 'next/link';
import loggerClient from '@/lib/loggerClient';
import TaskManager from '@/components/admin/TaskManager';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';

export default function PerfilPage() {
  // Abrir el modal de reseña automáticamente al recibir el evento
  useEffect(() => {
    const handler = () => setReviewOpen(true);
    window.addEventListener('showGoogleReviewPrompt', handler);
    return () => window.removeEventListener('showGoogleReviewPrompt', handler);
  }, []);
  const [reviewOpen, setReviewOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout, refreshAvatar } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  // Imagen de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '/img/twittereggavatar.jpg';

  // Estado para evitar errores de hidratación con Fade
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Solo redirigir si definitivamente no hay usuario después de que termine la carga
    if (!isLoading && !isAuthenticated && !user) {
      // Dar tiempo adicional para que el contexto se inicialice en producción
      const timer = setTimeout(() => {
        if (!isAuthenticated && !user) {
          router.push('/login');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Cargar imagen de perfil desde el servidor
  useEffect(() => {
    const loadAvatar = async () => {
      if (user?.id) {
        try {
          await refreshAvatar();
        } catch (error) {
            loggerClient.error('Error al cargar avatar:', error);
        }
      }
    };
    loadAvatar();
  }, [user?.id]); // Removido refreshAvatar de las dependencias

  // Escuchar cambios en la imagen de perfil (para sincronización entre pestañas)
  useEffect(() => {
    const handleProfileImageChange = () => {
      if (user?.id) {
        refreshAvatar();
      }
    };

    window.addEventListener('profileImageChanged', handleProfileImageChange);
    return () => {
      window.removeEventListener('profileImageChanged', handleProfileImageChange);
    };
  }, [user?.id]); // Removido refreshAvatar de las dependencias

  const handleLogout = () => {
    // Limpiar completamente el localStorage para evitar datos viejos
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

  // Solo renderizar el contenido si el usuario está autenticado y existe
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

  // Handler para tap largo en el avatar
  const handleAvatarTouchStart = () => {
    tapTimeout.current = setTimeout(() => setModalOpen(true), 500); // 500ms tap largo
  };
  const handleAvatarTouchEnd = () => {
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
  };

  const isAdmin = user.role === 'admin' || user.role === 'ADMIN';

  return (
    <Fade in={true} timeout={350}>
    <Container component="main" maxWidth="md" sx={{ py: 2 }}>
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

      {/* Header con acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          {/* Título removido visualmente por petición del usuario. Se mantiene una etiqueta accesible para screen readers. */}
          <span style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0
          }} aria-hidden={false}>Mi Perfil</span>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Los botones se reubican dentro de la tarjeta principal para mejor jerarquía visual. */}
          {/* Se deja un placeholder aquí para mantener layout; los botones reales se renderizan más abajo en la tarjeta. */}
        </Stack>
      </Box>

      {/* Card principal del perfil */}
  <Material3ElevatedCard sx={{ mb: 3, p: 4, borderRadius: 4, overflow: 'visible', transition: 'transform 220ms ease, box-shadow 220ms ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: 8 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Avatar con mejor diseño */}
          <Box sx={{ position: 'relative', mb: 3 }}>
              <Avatar
                src={user.avatarUrl || defaultEggAvatar}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: user.avatarUrl && !user.avatarUrl.startsWith('data:') && user.avatarUrl !== defaultEggAvatar ? '3rem' : 'inherit',
                  bgcolor: 'primary.light',
                  cursor: 'pointer',
                  boxShadow: modalOpen ? 12 : 4,
                  transition: 'transform 240ms cubic-bezier(0.2, 0, 0, 1), box-shadow 240ms ease',
                  border: '4px solid',
                  borderColor: 'background.paper',
                  '&:hover': {
                    transform: 'scale(1.06)',
                    boxShadow: 10
                  }
                }}
                onTouchStart={handleAvatarTouchStart}
                onTouchEnd={handleAvatarTouchEnd}
                onMouseDown={handleAvatarTouchStart}
                onMouseUp={handleAvatarTouchEnd}
                title="Mantén presionado para ver notificaciones"
              >
                {!user.avatarUrl ? undefined : user.avatarUrl.startsWith('data:') ? null : user.avatarUrl === defaultEggAvatar ? undefined : user.avatarUrl}
              </Avatar>

              {/* Indicador de rol */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: isAdmin ? 'secondary.main' : 'primary.main',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                  border: '2px solid',
                  borderColor: 'background.paper'
                }}
              >
                {isAdmin ? (
                  <AdminPanelSettingsRoundedIcon sx={{ fontSize: 16, color: 'white' }} />
                ) : (
                  <PersonRoundedIcon sx={{ fontSize: 16, color: 'white' }} />
                )}
              </Box>
            </Box>

            {/* Información principal */}
            <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
              {user.name || 'Usuario'}
            </Typography>

            {/* Mostrar la residencia si existe; si no, mostrar el rol como fallback */}
            {user?.residence ? (
              <Chip
                icon={<HotelRoundedIcon />}
                label={String(user.residence).toUpperCase()}
                color="primary"
                variant="filled"
                sx={{ mb: 2, fontWeight: 'medium', px: 1.5 }}
              />
            ) : (
              <Chip
                icon={isAdmin ? <AdminPanelSettingsRoundedIcon /> : <PersonRoundedIcon />}
                label={isAdmin ? 'Administrador' : 'Usuario'}
                color={isAdmin ? 'secondary' : 'primary'}
                variant="filled"
                sx={{ mb: 2, fontWeight: 'medium', px: 1.5 }}
              />
            )}

            {/* Botones de acción: Editar perfil y Ajustes (reubicados y rediseñados) */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/perfil/editar" passHref>
                <M3Button
                  component="a"
                  m3variant="filled"
                  color="primary"
                  startIcon={<EditRoundedIcon />}
                  sx={{ px: 2.5, py: 1.25, borderRadius: 3, fontWeight: 700 }}
                >
                  Editar perfil
                </M3Button>
              </Link>

              <Link href="/ajustes" passHref>
                <M3Button
                  component="a"
                  m3variant="tonal"
                  color="primary"
                  startIcon={<SettingsRoundedIcon />}
                  sx={{ px: 2.5, py: 1.25, borderRadius: 3, fontWeight: 700 }}
                >
                  Ajustes
                </M3Button>
              </Link>
            </Box>

            {/* Información de contacto */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={isAdmin ? 6 : 4}>
                <Material3ElevatedCard sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1, transition: 'transform 180ms ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <EmailRoundedIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {user.email}
                    </Typography>
                  </Box>
                </Material3ElevatedCard>
              </Grid>

              {!isAdmin && (
                <>
                  <Grid item xs={12} sm={4}>
                    <Material3ElevatedCard sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1, transition: 'transform 180ms ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                      <SchoolRoundedIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Escuela
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {user.school
                            ? (typeof user.school === 'string'
                                ? user.school
                                : user.school.name)
                            : 'No especificada'}
                        </Typography>
                      </Box>
                    </Material3ElevatedCard>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Material3ElevatedCard sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1, transition: 'transform 180ms ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                      <CakeRoundedIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Edad
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {user.age ? `${user.age} años` : 'No especificada'}
                        </Typography>
                      </Box>
                    </Material3ElevatedCard>
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={isAdmin ? 6 : 12}>
                <Material3ElevatedCard sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1, transition: 'transform 180ms ease', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <LocationOnRoundedIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ubicación
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {(() => {
                        const isAdmin = user.role === 'admin' || user.role === 'ADMIN';
                        let parts = [];
                        // Si el usuario no es admin y tiene escuela, usar ubicación de la escuela
                        if (!isAdmin && user.school && typeof user.school === 'object') {
                          const school = user.school as any;
                          if (school.town) parts.push(school.town);
                          if (school.city) parts.push(school.city);
                          if (school.country) parts.push(school.country);
                        } else {
                          // Para admins o usuarios sin escuela, usar ubicación del usuario
                          if (user.town) parts.push(user.town);
                          if (user.city) parts.push(user.city);
                          if (user.country) parts.push(user.country);
                        }
                        return parts.length > 0 ? parts.join(', ') : 'No especificada';
                      })()}
                    </Typography>
                    {(() => {
                      const isAdmin = user.role === 'admin' || user.role === 'ADMIN';
                      if (!isAdmin && user.school && typeof user.school === 'object') {
                        return (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                            📍 Ubicación de tu escuela
                          </Typography>
                        );
                      }
                      return null;
                    })()}
                  </Box>
                </Material3ElevatedCard>
              </Grid>
            </Grid>
          </Box>
        </Material3ElevatedCard>

      {/* Sección de tareas personales */}
      <Material3ElevatedCard sx={{ mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Accordion
          elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 4,
              '& .MuiAccordionSummary-root': { borderRadius: 4 }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1
                }
              }}
            >
              <AssignmentRoundedIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Mis Tareas Personalizadas
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Gestiona las tareas que aparecen en tu dashboard principal.
                Puedes agregar, editar o eliminar tareas según tus necesidades.
              </Typography>
              <TaskManager />
            </AccordionDetails>
          </Accordion>
        </Material3ElevatedCard>

      {/* Panel de administración solo visible para admin */}
      {isAdmin && (
        <Material3ElevatedCard sx={{ mb: 3, borderRadius: 4, border: '1px solid', borderColor: 'secondary.main', bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
          <Accordion
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 4,
              bgcolor: 'transparent',
              color: 'inherit',
              '& .MuiAccordionSummary-root': {
                  borderRadius: 4,
                  color: 'inherit'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: 'inherit' }} />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                <AdminPanelSettingsRoundedIcon />
                <Typography variant="h6" fontWeight="bold">
                  Panel de Administración
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                  Accede a las herramientas de gestión de usuarios y tareas administrativas.
                </Typography>
                <TaskManager />
              </AccordionDetails>
            </Accordion>
          </Material3ElevatedCard>
      )}

      {/* Botón de reseña y cerrar sesión */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <M3Button m3variant="filled" color="primary" onClick={() => setReviewOpen(true)}>
          Escribir Reseña Google
        </M3Button>
        <M3Button
          m3variant="outlined"
          onClick={handleLogout}
          color="error"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'error.contrastText'
            }
          }}
        >
          Cerrar Sesión
        </M3Button>
      </Box>

      <ReviewDialog open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </Container>
    </Fade>
  );
}