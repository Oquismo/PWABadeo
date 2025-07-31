'use client';

import { useState } from 'react';
import { Container, Fab } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Analytics } from "@vercel/analytics/next"
import HeroSection from "@/components/home/HeroSection";
import FilterChips from "@/components/home/FilterChips";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import ProjectsSection from '@/components/home/ProjectsSection';
import CalendarSection from '@/components/home/CalendarSection/CalendarSection';
import AnnouncementBanner from '@/components/home/AnnouncementBanner'; // 1. Importar

export default function Home() {
  const [selectedContent, setSelectedContent] = useState('Calendario');

  const phoneNumber = "34000000000";
  const message = "Hola, me gustaría recibir más información sobre Barrio de Oportunidades.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <AnnouncementBanner /> {/* 2. Mostrar el banner aquí */}
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
