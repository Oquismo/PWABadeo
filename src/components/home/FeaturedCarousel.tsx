// src/components/home/FeaturedCarousel.tsx

'use client';

import { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
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

import { vibrate } from '@/utils/haptics'; // ¡Importa la función aquí!

interface Event {
  date: Date;
  title: string;
}

const featuredProjects = projectsData.filter(p => p.eventDate);

export default function FeaturedCarousel() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const open = Boolean(anchorEl);
  const { user } = useAuth();
  const router = useRouter();

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
    vibrate(); // ¡Añade la vibración aquí!
    handleClose();
    router.push('/');
  };

  return (
    <Box sx={{ py: 2 }}>
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