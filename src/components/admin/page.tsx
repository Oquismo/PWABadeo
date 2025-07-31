'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventManagement from '@/components/admin/EventManagement';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Protección de la ruta: solo para administradores
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/'); // Si no es admin, lo enviamos al inicio
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== 'admin') {
    return null; // O un spinner de carga
  }

  return (
    <Container>
      <Box sx={{ pt: 4, position: 'relative' }}>
        <IconButton onClick={() => router.back()} sx={{ position: 'absolute', top: 16, left: 0 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography component="h1" variant="h3" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
          Panel de Administración
        </Typography>

        <EventManagement />
      </Box>
    </Container>
  );
}