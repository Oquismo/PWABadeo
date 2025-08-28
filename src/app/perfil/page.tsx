'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, Button, Avatar, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, Stack, Accordion, AccordionSummary, AccordionDetails, Modal, Slide, Backdrop } from '@mui/material';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import SchoolIcon from '@mui/icons-material/School';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import TaskManager from '@/components/admin/TaskManager';

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Emoji de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '🥚';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoading]);

  // Cargar imagen de perfil al inicializar
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('userProfileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // Escuchar cambios en la imagen de perfil
  useEffect(() => {
    const handleProfileImageChange = () => {
      const savedProfileImage = localStorage.getItem('userProfileImage');
      setProfileImage(savedProfileImage || '');
    };

    window.addEventListener('profileImageChanged', handleProfileImageChange);
    return () => {
      window.removeEventListener('profileImageChanged', handleProfileImageChange);
    };
  }, []);

  const handleLogout = () => {
    // Limpiar completamente el localStorage para evitar datos viejos
    localStorage.removeItem('user');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('appLogs');
    logout();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Cargando...</Typography>
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

  return (
    <Container component="main" maxWidth="sm">
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Slide direction="down" in={modalOpen} mountOnEnter unmountOnExit>
          <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', bgcolor: 'background.paper', boxShadow: 24, borderRadius: 3, p: 3, minWidth: 340, maxWidth: 500, mt: 2 }}>
            <NotificationsPanel />
          </Box>
        </Slide>
      </Modal>
      <Box sx={{ position: 'relative', pt: 4 }}>
        <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
          <Link href="/perfil/editar" passHref>
            <IconButton aria-label="editar perfil" size="large">
              <EditIcon />
            </IconButton>
          </Link>
          <Link href="/ajustes" passHref>
            <IconButton aria-label="ajustes" size="large">
              <SettingsIcon />
            </IconButton>
          </Link>
        </Stack>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            src={profileImage}
            sx={{ 
              width: 100, 
              height: 100, 
              mb: 2,
              fontSize: profileImage && !profileImage.startsWith('data:') ? '3rem' : 'inherit',
              bgcolor: 'primary.light',
              cursor: 'pointer',
              boxShadow: modalOpen ? 6 : 1,
              transition: 'box-shadow 0.2s',
            }}
            onTouchStart={handleAvatarTouchStart}
            onTouchEnd={handleAvatarTouchEnd}
            onMouseDown={handleAvatarTouchStart}
            onMouseUp={handleAvatarTouchEnd}
            title="Mantén presionado para ver notificaciones"
          >
            {!profileImage ? defaultEggAvatar : profileImage.startsWith('data:') ? null : profileImage}
          </Avatar>
          <Typography component="h1" variant="h4" fontWeight="bold">
            {user.name || 'Sin nombre'}
          </Typography>
          <Typography variant="subtitle1" color={user.role === 'admin' ? 'secondary' : 'text.primary'} sx={{ mt: 1 }}>
            Rol: {user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </Typography>
          <Paper elevation={0} sx={{ width: '100%', mt: 4, p: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={user.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Escuela" 
                  secondary={
                    user.school 
                      ? (typeof user.school === 'string' 
                          ? user.school 
                          : user.school.name)
                      : 'No especificada'
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CakeIcon />
                </ListItemIcon>
                <ListItemText primary="Edad" secondary={user.age ? `${user.age} años` : 'No especificada'} />
              </ListItem>
            </List>
          </Paper>

          {/* Gestión de tareas personales */}
          <Accordion sx={{ width: '100%', mt: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon />
                <Typography variant="h6">Mis Tareas Personalizadas</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Gestiona las tareas que aparecen en tu dashboard principal. 
                Puedes agregar, editar o eliminar tareas según tus necesidades.
              </Typography>
              <TaskManager />
            </AccordionDetails>
          </Accordion>

          {/* Panel de administración solo visible para admin */}
          {user.role === 'admin' && (
            <Accordion sx={{ width: '100%', mt: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsIcon />
                  <Typography variant="h6" color="secondary">Panel de Administración</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Accede a las herramientas de gestión de usuarios y tareas administrativas.
                </Typography>
                {/* Aquí puedes agregar componentes de admin, por ejemplo: */}
                {/* <UserManagement /> */}
                <TaskManager />
              </AccordionDetails>
            </Accordion>
          )}

          <Button
            onClick={handleLogout}
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 4 }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
