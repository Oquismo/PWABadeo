'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, Button, Avatar, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
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
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string>('');
  
  // Emoji de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '🥚';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

  if (!user) {
    return null; 
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ position: 'relative', pt: 4 }}>
        <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 0, right: 0 }}>
          <Link href="/perfil/editar" passHref>
            <IconButton aria-label="editar perfil">
              <EditIcon />
            </IconButton>
          </Link>
          <Link href="/ajustes" passHref>
            <IconButton aria-label="ajustes">
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
              bgcolor: 'primary.light'
            }}
          >
            {!profileImage ? defaultEggAvatar : profileImage.startsWith('data:') ? null : profileImage}
          </Avatar>
          <Typography component="h1" variant="h4" fontWeight="bold">
            {user.name}
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
                <ListItemText primary="Escuela" secondary={user.school} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CakeIcon />
                </ListItemIcon>
                <ListItemText primary="Edad" secondary={`${user.age} años`} />
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

          {/* Se ha eliminado el panel de administrador de esta vista */}

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
