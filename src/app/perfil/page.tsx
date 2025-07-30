'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, Button, Avatar, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';

export default function PerfilPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) { // Si no hay datos de usuario, no renderizamos nada hasta la redirección
    return null; 
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          src={user.avatarUrl}
          sx={{ width: 100, height: 100, mb: 2 }}
        />
        <Typography component="h1" variant="h4" fontWeight="bold">
          {user.name}
        </Typography>
        <Paper elevation={2} sx={{ width: '100%', mt: 4, p: 2, bgcolor: 'background.paper' }}>
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
    </Container>
  );
}