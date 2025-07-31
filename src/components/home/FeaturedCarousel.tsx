'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Image from 'next/image';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { projectsData, Project } from '@/data/projects';

// Importaciones de Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface Event {
  date: Date;
  title: string;
}

// Helper para obtener la lista completa y actualizada de eventos
const getFeaturedProjects = (): Project[] => {
  const dynamicEventsRaw = localStorage.getItem('dynamicProjectsData');
  const dynamicEvents = dynamicEventsRaw ? JSON.parse(dynamicEventsRaw).map((e: any) => ({...e, eventDate: new Date(e.eventDate)})) : [];
  
  const deletedIdsRaw = localStorage.getItem('deletedStaticEventIds');
  const deletedIds = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
  
  const staticEvents = projectsData.filter(p => p.eventDate && !deletedIds.includes(p.id));
  
  const allEvents = [...dynamicEvents, ...staticEvents.filter(p => !dynamicEvents.find((dp: Project) => dp.id === p.id))];
  return allEvents;
};


export default function FeaturedCarousel() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const open = Boolean(anchorEl);
  const { user } = useAuth();
  const router = useRouter();

  // --- SOLUCIÓN: Hacemos que el carrusel reaccione a los cambios ---
  useEffect(() => {
    // 1. Cargamos los datos al iniciar
    setFeaturedProjects(getFeaturedProjects());

    // 2. Creamos un "oyente" que se activa cuando los datos cambian en otra pestaña/página
    const handleStorageChange = () => {
      setFeaturedProjects(getFeaturedProjects());
    };

    window.addEventListener('storage', handleStorageChange);

    // 3. Limpiamos el oyente cuando el componente se desmonta
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
    const existingEvents: Event[] = savedEventsRaw ? JSON.parse(savedEventsRaw).map((e: any) => ({...e, date: new Date(e.date)})) : [];
    
    const newEvent: Event = {
      title: `${selectedProject.title} (Destacado)`,
      date: selectedProject.eventDate,
    };

    const updatedEvents = [...existingEvents, newEvent];
    localStorage.setItem(`userCustomEvents_${user.email}`, JSON.stringify(updatedEvents));
    
    alert(`"${newEvent.title}" ha sido añadido a tu calendario.`);
    handleClose();
    router.push('/');
  };

  return (
    <Box sx={{ py: 2 }}>
      <style>{`
        .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.5) !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #BEF264 !important;
        }
      `}</style>
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
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Pagination]}
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
