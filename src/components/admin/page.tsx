'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, IconButton, Tabs, Tab, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dynamic from 'next/dynamic';

// Lazy loading para componentes de admin
const EventManagement = dynamic(() => import('@/components/admin/EventManagement'), {
  ssr: false,
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
});

const UserManagement = dynamic(() => import('@/components/admin/UserManagement'), {
  ssr: false,
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
});

const LogViewer = dynamic(() => import('@/components/admin/LogViewer'), {
  ssr: false,
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
});

const AdminActivityPanel = dynamic(() => import('@/components/admin/activity/AdminActivityPanel'), {
  ssr: false,
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
});

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
            <Tab label="Eventos" />
            <Tab label="Usuarios" />
            <Tab label="Logs Local" />
            <Tab label="Actividad DB (Beta)" />
          </Tabs>
        </Box>

  {tab === 0 && <EventManagement />}
  {tab === 1 && <UserManagement />}
  {tab === 2 && <LogViewer />}
  {tab === 3 && <AdminActivityPanel />}
      </Box>
    </Container>
  );
}
