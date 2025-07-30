'use client';

import { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Image from 'next/image';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { projectsData, Project } from '@/data/projects'; // Importamos el tipo Project
const featuredProject: Project = projectsData[0];

interface Event {
  date: Date;
  title: string;
}

export default function FeaturedCard() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddToCalendar = () => {
    if (!user) {
      alert('Debes iniciar sesión para añadir eventos.');
      handleClose();
      return;
    }
    // 1. Comprobamos que el proyecto tenga una fecha de evento
    if (!featuredProject.eventDate) {
      alert('Este proyecto no tiene una fecha de evento asociada.');
      handleClose();
      return;
    }

    const savedEventsRaw = localStorage.getItem(`userCustomEvents_${user.email}`);
    const existingEvents: Event[] = savedEventsRaw ? JSON.parse(savedEventsRaw).map((e: any) => ({...e, date: new Date(e.date)})) : [];

    const newEvent: Event = {
      title: `${featuredProject.title} (Destacado)`,
      date: featuredProject.eventDate, // 2. Usamos la fecha fija del proyecto
    };

    const updatedEvents = [...existingEvents, newEvent];
    localStorage.setItem(`userCustomEvents_${user.email}`, JSON.stringify(updatedEvents));
    
    alert(`"${newEvent.title}" ha sido añadido a tu calendario para el día ${newEvent.date.toLocaleDateString()}.`);
    handleClose();
    router.push('/');
  };

  return (
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
          Proyecto del Mes
        </Typography>
        <Typography variant="h4" component="h3" fontWeight="bold">
          {featuredProject.title}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton sx={{ color: 'white' }} onClick={handleClick}>
          <MoreHorizIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {/* 3. El menú ahora llama directamente a la función de añadir */}
        <MenuItem onClick={handleAddToCalendar}>
          <CalendarMonthIcon sx={{ mr: 1 }} fontSize="small" />
          Añadir al calendario
        </MenuItem>
      </Menu>

      <Image
        src={featuredProject.imageUrl}
        alt={featuredProject.title}
        layout="fill"
        objectFit="cover"
        style={{ zIndex: 1, opacity: 0.2 }}
      />
    </Box>
  );
}