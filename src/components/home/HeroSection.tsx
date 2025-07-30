'use client';

import { Box, Container, Typography } from '@mui/material';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <Container>
      <Box 
        sx={{ 
          py: { xs: 4, md: 8 }, // Menos padding en móvil
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Image 
            src="/img/logo.png"
            alt="Logo de Barrio de Oportunidades"
            width={150} // Un poco más pequeño para móviles
            height={150}
            style={{ height: 'auto' }} 
            priority
          />
        </Box>

        <Box>
          <Typography 
            component="h1" 
            variant="h2"
            fontWeight="bold" 
            gutterBottom
            // Aquí está la magia: un tamaño para móvil (xs) y otro para escritorio (md)
            sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' } }}
          >
            Barrio de Oportunidades
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary"
            // También hacemos responsivo el subtítulo
            sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Movilidad, comunidad e innovación para tu futuro internacional.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}