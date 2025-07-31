// src/components/home/FeaturedCarousel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Skeleton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Image from 'next/image';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { projectsData, Project } from '@/data/projects';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { vibrate } from '@/utils/haptics';

interface Event {
  date: Date;
  title: string;
}

// Filtramos solo los proyectos que tienen fecha de evento
const featuredProjects = projectsData.filter(p => p.eventDate);

export default function FeaturedCarousel() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true); // Estado de carga
  const open = Boolean(anchorEl);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simular una carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Simula 1 segundo de carga

    return () => clearTimeout(timer);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleAddToCalendar = () => {
    if (!user || !selectedProject || !selectedProject.eventDate) return;

    const savedEventsRaw = localStorage.getItem(`userCustomEvents_${user.email}`);
    const existingEvents: Event[] = savedEventsRaw ? JSON.parse(savedEventsRaw).map((e: any) => ({ ...e, date: new Date(e.date) })) : [];
    
    const newEvent: Event = {
      title: `${selectedProject.title} (Destacado)`,
      date: selectedProject.eventDate,
    };

    const updatedEvents = [...existingEvents, newEvent];
    localStorage.setItem(`userCustomEvents_${user.email}`, JSON.stringify(updatedEvents));
    
    alert(`"${newEvent.title}" ha sido añadido a tu calendario.`);
    vibrate();
    handleClose();
    // router.push('/'); // Comentado para que puedas ver el efecto sin salir de la página
  };

  return (
    <Box sx={{ py: 2 }}>
      {loading ? (
        // Skeleton para simular la carga
        <Box sx={{ 
            p: 3, 
            borderRadius: '24px', 
            position: 'relative', // Asegura que el skeleton se posicione correctamente si hay un layout similar al real
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #D946EF 0%, #8B5CF6 100%)', // Mismo fondo que las tarjetas reales
            color: 'white', 
            minHeight: '200px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between' 
          }}
        >
          <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.3)', mb: 1 }} />
          <Skeleton variant="text" width="80%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)', mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          </Box>
        </Box>
      ) : (
        // Contenido del carrusel una vez cargado
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="mySwiper"
        >
          {featuredProjects.map((project) => (
            <SwiperSlide key={project.id} style={{ width: '80%', maxWidth: '350px' }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: '24px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #D946EF 0%, #8B5CF6 100%)',
                  color: 'white',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Typography variant="overline" sx={{ fontWeight: 'bold' }}>
                    Evento Destacado
                  </Typography>
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    {project.title}
                  </Typography>
                </Box>

                <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton sx={{ color: 'white' }} onClick={(e) => handleClick(e, project)}>
                    <MoreHorizIcon />
                  </IconButton>
                </Box>

                {project.imageUrl && project.imageUrl.startsWith('http') && (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    layout="fill"
                    objectFit="cover"
                    style={{ zIndex: 1, opacity: 0.2 }}
                  />
                )}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleAddToCalendar}>
          <CalendarMonthIcon sx={{ mr: 1 }} fontSize="small" />
          Añadir al calendario
        </MenuItem>
      </Menu>
    </Box>
  );
}