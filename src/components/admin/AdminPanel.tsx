'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Stack, Paper } from '@mui/material';
import { Project, projectsData } from '@/data/projects'; // Importamos la estructura

// Helper para obtener los eventos (combinando los estáticos y los dinámicos)
const getEvents = (): Project[] => {
  const dynamicEventsRaw = localStorage.getItem('dynamicProjectsData');
  const dynamicEvents = dynamicEventsRaw ? JSON.parse(dynamicEventsRaw).map((e: any) => ({...e, eventDate: new Date(e.eventDate)})) : [];
  return [...dynamicEvents, ...projectsData.filter(p => p.eventDate)];
};

export default function AdminPanel() {
  const [events, setEvents] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    eventDate: '',
    school: '',
  });

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Obtenemos solo los eventos dinámicos existentes
    const dynamicEventsRaw = localStorage.getItem('dynamicProjectsData');
    const dynamicEvents = dynamicEventsRaw ? JSON.parse(dynamicEventsRaw) : [];

    const newEvent: Project = {
      id: formData.title.toLowerCase().replace(/\s+/g, '-'),
      ...formData,
      eventDate: new Date(formData.eventDate),
    };

    // 2. Añadimos el nuevo evento a la lista de dinámicos y guardamos
    const updatedDynamicEvents = [newEvent, ...dynamicEvents];
    localStorage.setItem('dynamicProjectsData', JSON.stringify(updatedDynamicEvents));

    setEvents(getEvents()); // Actualizamos la lista visible en el panel
    setFormData({ title: '', description: '', imageUrl: '', eventDate: '', school: '' });
    alert(`Evento "${formData.title}" añadido con éxito.`);
  };

  // ... (la lógica de handleDelete y el JSX no cambian)

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      {/* ... (el resto del componente) ... */}
    </Paper>
  );
}
