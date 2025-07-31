'use client';

import { Box, Container, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import Head from 'next/head'; // 1. Importar Head para añadir enlaces al <head>

export default function MapaPage() {
  const InteractiveMap = useMemo(() => dynamic(
    () => import('@/components/mapa/InteractiveMap'),
    { ssr: false }
  ), []);

  return (
    <>
      {/* 2. Añadimos los estilos del mapa directamente aquí desde un CDN */}
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
      </Head>
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Mapa Interactivo
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            Tus lugares importantes en la ciudad.
          </Typography>
        </Box>
        <InteractiveMap />
      </Container>
    </>
  );
}
