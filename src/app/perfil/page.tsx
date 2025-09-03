'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Slide,
  Backdrop,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Grid
} from '@mui/material';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import SchoolIcon from '@mui/icons-material/School';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Link from 'next/link';
import TaskManager from '@/components/admin/TaskManager';

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading, logout, refreshAvatar } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  // Emoji de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '🥚';

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
          console.error('Error al cargar avatar:', error);
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
      <Container component="main" maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography variant="h6" color="text.secondary">Cargando perfil...</Typography>
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
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
    <Container component="main" maxWidth="md" sx={{ py: 2 }}>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Slide direction="down" in={modalOpen} mountOnEnter unmountOnExit>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 3,
            p: 3,
            minWidth: 340,
            maxWidth: 500,
            mt: 2
          }}>
            <NotificationsPanel />
          </Box>
        </Slide>
      </Modal>

      {/* Header con acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Mi Perfil
        </Typography>
        <Stack direction="row" spacing={1}>
          <Link href="/perfil/editar" passHref>
            <IconButton
              aria-label="editar perfil"
              size="large"
              sx={{
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <EditIcon />
            </IconButton>
          </Link>
          <Link href="/ajustes" passHref>
            <IconButton
              aria-label="ajustes"
              size="large"
              sx={{
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Link>
        </Stack>
      </Box>

      {/* Card principal del perfil */}
      <Fade in={true} timeout={600}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Avatar con mejor diseño */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Avatar
                  src={user.avatarUrl || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: user.avatarUrl && !user.avatarUrl.startsWith('data:') ? '3rem' : 'inherit',
                    bgcolor: 'primary.light',
                    cursor: 'pointer',
                    boxShadow: modalOpen ? 8 : 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '4px solid',
                    borderColor: 'background.paper',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6
                    }
                  }}
                  onTouchStart={handleAvatarTouchStart}
                  onTouchEnd={handleAvatarTouchEnd}
                  onMouseDown={handleAvatarTouchStart}
                  onMouseUp={handleAvatarTouchEnd}
                  title="Mantén presionado para ver notificaciones"
                >
                  {!user.avatarUrl ? defaultEggAvatar : user.avatarUrl.startsWith('data:') ? null : user.avatarUrl}
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
                    <AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'white' }} />
                  ) : (
                    <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
                  )}
                </Box>
              </Box>

              {/* Información principal */}
              <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                {user.name || 'Usuario'}
              </Typography>

              <Chip
                icon={isAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                label={isAdmin ? 'Administrador' : 'Usuario'}
                color={isAdmin ? 'secondary' : 'primary'}
                variant="filled"
                sx={{ mb: 2, fontWeight: 'medium' }}
              />

              {/* Información de contacto */}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {user.email}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <SchoolIcon color="action" />
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
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CakeIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Edad
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {user.age ? `${user.age} años` : 'No especificada'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Sección de tareas personales */}
      <Fade in={true} timeout={800}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Accordion
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              borderRadius: 4,
              '& .MuiAccordionSummary-root': { borderRadius: 4 }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1
                }
              }}
            >
              <AssignmentIcon color="primary" />
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
        </Card>
      </Fade>

      {/* Panel de administración solo visible para admin */}
      {isAdmin && (
        <Fade in={true} timeout={1000}>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'secondary.main',
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText'
            }}
          >
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
                expandIcon={<ExpandMoreIcon sx={{ color: 'inherit' }} />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                <AdminPanelSettingsIcon />
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
          </Card>
        </Fade>
      )}

      {/* Botón de cerrar sesión */}
      <Fade in={true} timeout={1200}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            onClick={handleLogout}
            variant="outlined"
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
          </Button>
        </Box>
      </Fade>
    </Container>
  );
}