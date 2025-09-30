"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// Import the events client dynamically (no SSR)
const EventosClient = dynamic(() => import('../components/EventosClient'), { ssr: false });

export default function EventosPage() {
  const theme = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
      pt: 2,
      pb: 8
    }}>
      <Container maxWidth="lg">
        <EventosClient />
      </Container>
    </Box>
  );
}