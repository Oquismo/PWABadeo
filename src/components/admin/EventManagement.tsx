'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Project, projectsData } from '@/data/projects'; // Usaremos la misma estructura

// Helper para obtener los eventos (combinando los estáticos y los dinámicos)
const getEvents = (): Project[] => {
  const dynamicEventsRaw = localStorage.getItem('dynamicProjectsData');
  const dynamicEvents = dynamicEventsRaw ? JSON.parse(dynamicEventsRaw).map((e: any) => ({...e, eventDate: new Date(e.eventDate)})) : [];
  // Damos prioridad a los eventos dinámicos
  return [...dynamicEvents, ...projectsData.filter(p => p.eventDate)];
};

export default function EventManagement() {
  const [events, setEvents] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    eventDate: '',
    school: '', // Nuevo campo para la escuela
  });

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Project = {
      id: formData.title.toLowerCase().replace(/\s+/g, '-'),
      ...formData,
      eventDate: new Date(formData.eventDate),
    };

    const updatedEvents = [newEvent, ...events];
    localStorage.setItem('dynamicProjectsData', JSON.stringify(updatedEvents.filter(e => projectsData.findIndex(p => p.id === e.id) === -1)));
    setEvents(updatedEvents);
    setFormData({ title: '', description: '', imageUrl: '', eventDate: '', school: '' });
    alert('Evento añadido con éxito.');
  };

  const handleDelete = (eventId: string) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    localStorage.setItem('dynamicProjectsData', JSON.stringify(updatedEvents.filter(e => projectsData.findIndex(p => p.id === e.id) === -1)));
    setEvents(updatedEvents);
    alert('Evento eliminado.');
  };

  return (
    <Stack spacing={4}>
      {/* Formulario para añadir eventos */}
      <Paper elevation={0} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Añadir Nuevo Evento</Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Título del Evento" name="title" value={formData.title} onChange={handleChange} required />
            <TextField label="Descripción Corta" name="description" value={formData.description} onChange={handleChange} required />
            <TextField label="URL de la Imagen" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
            <TextField label="Escuela Asociada" name="school" value={formData.school} onChange={handleChange} required />
            <TextField label="Fecha del Evento" name="eventDate" type="date" InputLabelProps={{ shrink: true }} value={formData.eventDate} onChange={handleChange} required />
            <Button type="submit" variant="contained">Añadir Evento</Button>
          </Stack>
        </form>
      </Paper>

      {/* Lista de eventos existentes */}
      <Paper elevation={0} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Eventos Actuales</Typography>
        <List>
          {events.map((event, index) => (
            <Box key={event.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(event.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={event.title}
                  secondary={`${event.eventDate?.toLocaleDateString()} - ${event.description}`}
                />
              </ListItem>
              {index < events.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>
    </Stack>
  );
}
