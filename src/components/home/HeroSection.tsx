'use client';

import { Box, Typography, Avatar, Stack } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function HeroSection() {
  // Usamos el hook para saber si el usuario está autenticado y obtener sus datos
  const { isAuthenticated, user } = useAuth();

  return (
    <Box 
      sx={{ 
        py: { xs: 4, md: 6 }, // Padding vertical
      }}
    >
      {/* Stack nos permite alinear elementos en fila con espaciado */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Renderizado condicional del Avatar */}
        {isAuthenticated && user ? (
          // Si está logueado, el avatar es un enlace a su perfil
          <Link href="/perfil" passHref>
            <Avatar 
              src={user.avatarUrl}
              sx={{ width: 48, height: 48 }}
            />
          </Link>
        ) : (
          // Si no, mostramos un avatar genérico
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }} />
        )}

        {/* El saludo */}
        <Box>
          <Typography 
            component="h1" 
            variant="h4"
            fontWeight="bold"
          >
            {/* Saludo condicional: "Hola, [Nombre]" o "Hola" */}
            {isAuthenticated && user ? `Hola, ${user.name.split(' ')[0]}` : 'Hola'}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}