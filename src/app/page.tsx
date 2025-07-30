'use client';

import { useState } from 'react';
import { Container, Fab } from "@mui/material";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// Importamos todos los componentes de sección
import HeroSection from "@/components/home/HeroSection";
import FilterChips from "@/components/home/FilterChips";
import FeaturedCard from "@/components/home/FeaturedCard"; // 1. Importar la nueva tarjeta
import ProjectsSection from '@/components/home/ProjectsSection';
import CalendarSection from '@/components/home/CalendarSection/CalendarSection';

export default function Home() {
  const [selectedContent, setSelectedContent] = useState('Calendario');

  return (
    <>
      <Container>
        <HeroSection />
        <FilterChips 
          filters={['Calendario', 'Proyectos']} // Simplificamos los filtros por ahora
          selected={selectedContent} 
          setSelected={setSelectedContent} 
        />

        {/* 2. Añadimos la tarjeta destacada */}
        <FeaturedCard />

        {/* Renderizado condicional del contenido principal */}
        {selectedContent === 'Calendario' && <CalendarSection />}
        {selectedContent === 'Proyectos' && <ProjectsSection />}
        
      </Container>

      <Fab 
        color="primary"
        aria-label="solicitar información"
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`, 
          right: (theme) => theme.spacing(2),
          color: 'background.default'
        }}
      >
        <QuestionAnswerIcon />
      </Fab>
    </>
  );
}
