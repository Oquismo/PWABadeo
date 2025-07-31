'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper } from '@mui/material'; // 1. Añadir 'Paper' a la importación

export default function AdminPanel() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    eventDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En una app real, aquí se enviaría a una base de datos.
    // Por ahora, simulamos la persistencia guardando en localStorage.
    
    // 1. Obtenemos los proyectos existentes
    const existingProjectsRaw = localStorage.getItem('projectsData');
    const existingProjects = existingProjectsRaw ? JSON.parse(existingProjectsRaw) : [];

    // 2. Creamos el nuevo proyecto/evento
    const newProject = {
      id: formData.title.toLowerCase().replace(/\s+/g, '-'), // Creamos un ID simple
      ...formData,
      eventDate: new Date(formData.eventDate),
    };

    // 3. Añadimos el nuevo y guardamos
    const updatedProjects = [...existingProjects, newProject];
    localStorage.setItem('projectsData', JSON.stringify(updatedProjects));

    alert(`Evento "${formData.title}" añadido con éxito.`);
    setFormData({ title: '', description: '', imageUrl: '', eventDate: '' }); // Limpiamos el formulario
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Añadir Nuevo Evento Destacado</Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Título del Evento" name="title" value={formData.title} onChange={handleChange} required />
          <TextField label="Descripción Corta" name="description" value={formData.description} onChange={handleChange} required />
          <TextField label="URL de la Imagen" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
          <TextField label="Fecha del Evento" name="eventDate" type="date" InputLabelProps={{ shrink: true }} value={formData.eventDate} onChange={handleChange} required />
          <Button type="submit" variant="contained">Añadir Evento</Button>
        </Stack>
      </form>
    </Paper>
  );
}
