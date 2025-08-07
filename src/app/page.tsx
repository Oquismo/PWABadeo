'use client';

import { useState, useEffect } from 'react';
import { Container, Fab, Fade, Box } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import dynamic from 'next/dynamic';

// Importamos los componentes críticos de forma normal
import HeroSection from "@/components/home/HeroSection";
import NotificationsPanel from "@/components/home/NotificationsPanel";

// Lazy loading para componentes menos críticos
const ProjectsDashboard = dynamic(() => import("@/components/home/ProjectsDashboard"), {
  ssr: false,
  loading: () => <Box sx={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando proyectos...</Box>
});

const CalendarSection = dynamic(() => import('@/components/home/CalendarSection/CalendarSection'), {
  ssr: false,
  loading: () => <Box sx={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando calendario...</Box>
});

export default function Home() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Información para el enlace de WhatsApp
  const phoneNumber = "34000000000"; // Reemplaza con el número de teléfono real
  const message = "Hola, me gustaría recibir más información sobre Barrio de Oportunidades.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <Container>
        <Fade in={fadeIn} timeout={1000}>
          <Box sx={{ pt: 2, pb: 2 }}>
            <HeroSection />
            <ProjectsDashboard />
            <CalendarSection />
          </Box>
        </Fade>
      </Container>

      {/* El botón flotante para WhatsApp */}
      <Fab
        color="primary"
        aria-label="contactar por WhatsApp"
        component="a"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`,
          right: (theme) => theme.spacing(2),
          color: 'background.default'
        }}
      >
        <WhatsAppIcon />
      </Fab>
    </>
  );
}
