'use client';

import { useState } from 'react';
import { Container, Fab } from "@mui/material";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// Importamos todos los componentes de sección
import HeroSection from "@/components/home/HeroSection";
import FilterChips from "@/components/home/FilterChips";
import PillarsSection from "@/components/home/PillarsSection";
import ProjectsSection from '@/components/home/ProjectsSection';
import CalendarSection from '@/components/home/CalendarSection/CalendarSection'; // 1. Importar el calendario

export default function Home() {
  // 2. Añadimos 'Calendario' como opción por defecto
  const [selectedContent, setSelectedContent] = useState('Calendario');

  return (
    <>
      <Container>
        <HeroSection />
        {/* 3. Actualizamos los filtros disponibles */}
        <FilterChips 
          filters={['Calendario', 'Pilares', 'Proyectos']}
          selected={selectedContent} 
          setSelected={setSelectedContent} 
        />

        {/* 4. Añadimos el renderizado condicional para el calendario */}
        {selectedContent === 'Calendario' && <CalendarSection />}
        {selectedContent === 'Pilares' && <PillarsSection />}
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