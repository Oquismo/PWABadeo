'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventManagement from '@/components/admin/EventManagement';
import UserManagement from '@/components/admin/UserManagement';
import LogViewer from '@/components/admin/LogViewer';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Container>
      <Box sx={{ pt: 4, position: 'relative' }}>
        <IconButton onClick={() => router.back()} sx={{ position: 'absolute', top: 16, left: 0 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography component="h1" variant="h3" fontWeight="bold" textAlign="center">
          Panel de Administración
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', my: 3 }}>
          <Tabs value={tab} onChange={handleChange} centered>
            <Tab label="Gestionar Eventos" />
            <Tab label="Gestionar Usuarios" />
            <Tab label="Registro de Actividad" />
          </Tabs>
        </Box>

        {/* Contenido condicional basado en la pestaña seleccionada */}
        {tab === 0 && <EventManagement />}
        {tab === 1 && <UserManagement />}
        {tab === 2 && <LogViewer />}
      </Box>
    </Container>
  );
}
