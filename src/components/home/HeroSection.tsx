'use client';

import { Box, Typography, Avatar, Stack, IconButton } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings'; // 1. Importar el icono de Ajustes

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Box 
      sx={{ 
        py: { xs: 2, md: 3 }, // Reducimos un poco el padding para un look más compacto
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Parte Izquierda: Avatar y Saludo */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
          <Link href={isAuthenticated ? "/perfil" : "/login"} passHref>
            <Avatar 
              src={isAuthenticated && user ? user.avatarUrl : undefined}
              sx={{ 
                width: 48, 
                height: 48, 
                cursor: 'pointer',
                bgcolor: !isAuthenticated ? 'primary.main' : undefined 
              }}
            />
          </Link>

          <Box>
            <Typography 
              component="h1" 
              variant="h4"
              fontWeight="bold"
            >
              {isAuthenticated && user ? `Hola, ${user.name.split(' ')[0]}` : 'Hola'}
            </Typography>
          </Box>
        </Stack>

        {/* Parte Derecha: Iconos de Acción */}
        <Stack direction="row" spacing={1}>
          <IconButton>
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </IconButton>
          {/* 2. Reemplazamos el icono y lo enlazamos a la página de ajustes */}
          <Link href="/ajustes" passHref>
            <IconButton>
              <SettingsIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}
