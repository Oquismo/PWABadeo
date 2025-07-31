// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Container, Fab, Fade, Box } from "@mui/material"; // ¡IMPORTACIÓN DE BOX AÑADIDA AQUÍ!
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

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

      <Fab
        color="secondary"
        aria-label="solicitar información"
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`,
          right: (theme) => theme.spacing(2),
        }}
      >
        <QuestionAnswerIcon />
      </Fab>
    </>
  );
}