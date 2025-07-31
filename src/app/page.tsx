'use client';

import { useState, useEffect } from 'react';
import { Container, Fab, Fade, Box } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; // 1. Cambiamos el icono

// Importamos todos los componentes de sección
import HeroSection from "@/components/home/HeroSection";
import FilterChips from "@/components/home/FilterChips";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import ProjectsSection from '@/components/home/ProjectsSection';
import CalendarSection from '@/components/home/CalendarSection/CalendarSection';

export default function Home() {
  const [selectedContent, setSelectedContent] = useState('Calendario');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // 2. Definimos la información para el enlace de WhatsApp
  const phoneNumber = "34000000000"; // Reemplaza con el número de teléfono real
  const message = "Hola, me gustaría recibir más información sobre Barrio de Oportunidades.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <Container>
        <Fade in={fadeIn} timeout={1000}>
          <Box sx={{ pt: 2, pb: 2 }}>
            <HeroSection />
            <FilterChips
              filters={['Calendario', 'Proyectos']}
              selected={selectedContent}
              setSelected={setSelectedContent}
            />
            <FeaturedCarousel />

            {selectedContent === 'Calendario' && <CalendarSection />}
            {selectedContent === 'Proyectos' && <ProjectsSection />}
          </Box>
        </Fade>
      </Container>

      {/* 3. El botón flotante ahora abre WhatsApp */}
      <Fab
        color="primary" // Cambiado a primary para que use el color verde/lima
        aria-label="contactar por WhatsApp"
        component="a" // Lo convertimos en un enlace
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`,
          right: (theme) => theme.spacing(2),
          color: 'background.default' // Para que el icono sea oscuro
        }}
      >
        <WhatsAppIcon />
      </Fab>
    </>
  );
}
