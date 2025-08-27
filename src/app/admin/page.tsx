'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventManagement from '@/components/admin/EventManagement';
import UserManagement from '@/components/admin/UserManagement';
import LogViewer from '@/components/admin/LogViewer';
import AnnouncementManager from '@/components/admin/AnnouncementManager'; // 1. Asegurarse de que está importado
import SchoolManagement from '@/components/admin/SchoolManagement';
import AdminDevTools from '@/components/admin/AdminDevTools';
import AuthDebugPanel from '@/components/admin/AuthDebugPanel';

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

        {/* 2. Pestañas de navegación del panel */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', my: 3 }}>
          <Tabs value={tab} onChange={handleChange} centered variant="scrollable" scrollButtons="auto">
            <Tab label="Eventos" />
            <Tab label="Usuarios" />
            <Tab label="Logs" />
            <Tab label="Anuncios" />
            <Tab label="Escuelas" />
            <Tab label="Dev Tools" />
            <Tab label="Auth Debug" />
          </Tabs>
        </Box>

        {/* 3. Contenido que cambia según la pestaña seleccionada */}
        {tab === 0 && <EventManagement />}
        {tab === 1 && <UserManagement />}
        {tab === 2 && <LogViewer />}
        {tab === 3 && <AnnouncementManager />}
        {tab === 4 && <SchoolManagement />}
        {tab === 5 && <AdminDevTools />}
        {tab === 6 && <AuthDebugPanel />}
      </Box>
    </Container>
  );
}
