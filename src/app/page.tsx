'use client';

import { useState } from 'react';
import { Container, Fab } from "@mui/material";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// Importamos todos los componentes de sección
import HeroSection from "@/components/home/HeroSection";
import FilterChips from "@/components/home/FilterChips";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import ProjectsSection from '@/components/home/ProjectsSection';
import CalendarSection from '@/components/home/CalendarSection/CalendarSection';

export default function Home() {
  const [selectedContent, setSelectedContent] = useState('Calendario');

  return (
    <>
      <Container>
        <HeroSection />
        <FilterChips 
          filters={['Calendario', 'Proyectos']}
          selected={selectedContent} 
          setSelected={setSelectedContent} 
        />
        <FeaturedCarousel />

        {selectedContent === 'Calendario' && <CalendarSection />}
        {selectedContent === 'Proyectos' && <ProjectsSection />}
        
      </Container>

      {/* --- BOTÓN FLOTANTE CORREGIDO --- */}
      <Fab 
        color="secondary" // 1. Color restaurado para que destaque
        aria-label="solicitar información"
        sx={{
          position: 'fixed',
          // 2. Posición ajustada a la esquina inferior derecha
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`, // 64px de la barra + 16px de margen
          right: (theme) => theme.spacing(2),
        }}
      >
        <QuestionAnswerIcon />
      </Fab>
    </>
  );
}
