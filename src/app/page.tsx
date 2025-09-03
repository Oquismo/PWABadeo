'use client';

import { useState, useEffect } from 'react';
import { Container, Fab, Fade, Box } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTranslation } from '@/hooks/useTranslation';

// Importamos los componentes críticos de forma normal
import HeroSection from "@/components/home/HeroSection";
import NotificationsPanel from "@/components/home/NotificationsPanel";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import ProjectsDashboard from "@/components/home/ProjectsDashboard";
import CalendarSection from "@/components/home/CalendarSection/CalendarSection";
import ExternalInfoPanel from "@/components/home/ExternalInfoPanel";
// import SpotifyPlayer from "@/components/SpotifyPlayer";

export default function Home() {
  const [fadeIn, setFadeIn] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Información para el enlace de WhatsApp
  const phoneNumber = "+34649347760"; // Reemplaza con el número de teléfono real
  const message = t('pages.home.welcomeMessage'); // Usar traducción
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <AnnouncementBanner />
      <Container>
        <Fade in={fadeIn} timeout={1000}>
          <Box sx={{ pt: 2, pb: 2 }}>
            <HeroSection />
            {/* <SpotifyPlayer compact /> */}
            <ExternalInfoPanel />
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
