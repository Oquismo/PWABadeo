'use client';

import { Box, Typography, Avatar, Stack, IconButton } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings'; // 1. Importar el icono de Ajustes

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();
  const [profileImage, setProfileImage] = useState<string>('');
  
  // Emoji de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '🥚';

  // Cargar imagen de perfil al inicializar
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('userProfileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // Escuchar cambios en localStorage para actualizar la imagen en tiempo real
  useEffect(() => {
    const handleStorageChange = () => {
      const savedProfileImage = localStorage.getItem('userProfileImage');
      setProfileImage(savedProfileImage || '');
    };

    // Escuchar cambios en localStorage desde otras pestañas/ventanas
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar un evento personalizado para cambios en la misma pestaña
    window.addEventListener('profileImageChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileImageChanged', handleStorageChange);
    };
  }, []);

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
              src={isAuthenticated ? profileImage : undefined}
              sx={{ 
                width: 48, 
                height: 48, 
                cursor: 'pointer',
                fontSize: profileImage && !profileImage.startsWith('data:') ? '1.5rem' : 'inherit',
                bgcolor: !isAuthenticated ? 'primary.main' : 'primary.light'
              }}
            >
              {isAuthenticated && !profileImage ? defaultEggAvatar : 
               isAuthenticated && profileImage && !profileImage.startsWith('data:') ? profileImage : 
               !isAuthenticated ? undefined : null}
            </Avatar>
          </Link>

          <Box>
            <Typography 
              component="h1" 
              variant="h4"
              fontWeight="bold"
            >
              {isAuthenticated && user ? `Hola, ${user.name?.split(' ')[0] || 'Usuario'}` : 'Hola'}
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
