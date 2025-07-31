'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Project, projectsData } from '@/data/projects';

// Helper para obtener los IDs de eventos estáticos eliminados
const getDeletedStaticIds = (): string[] => {
  const idsRaw = localStorage.getItem('deletedStaticEventIds');
  return idsRaw ? JSON.parse(idsRaw) : [];
};

// Helper para obtener la lista completa de eventos
const getEvents = (): Project[] => {
  const dynamicEventsRaw = localStorage.getItem('dynamicProjectsData');
  const dynamicEvents = dynamicEventsRaw ? JSON.parse(dynamicEventsRaw).map((e: any) => ({...e, eventDate: new Date(e.eventDate)})) : [];
  
  const deletedIds = getDeletedStaticIds();
  const staticEvents = projectsData.filter(p => p.eventDate && !deletedIds.includes(p.id));

  return [...dynamicEvents, ...staticEvents];
};

export default function EventManagement() {
  const [events, setEvents] = useState<Project[]>([]);
  const [deletedStaticIds, setDeletedStaticIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    eventDate: '',
    school: '',
  });

  useEffect(() => {
    setEvents(getEvents());
    setDeletedStaticIds(getDeletedStaticIds());
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

    setEvents(prevEvents => [newEvent, ...prevEvents]);
    setFormData({ title: '', description: '', imageUrl: '', eventDate: '', school: '' });
  };

  const handleDelete = (eventId: string) => {
    // Si el evento a eliminar es uno de los originales, lo añadimos a la lista de borrados
    if (projectsData.some(p => p.id === eventId)) {
      setDeletedStaticIds(prevIds => [...prevIds, eventId]);
    }
    // Siempre lo quitamos de la vista actual
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
  };

  const handleSaveChanges = () => {
    try {
      // Guardamos los eventos creados por el admin
      const dynamicEventsToSave = events.filter(e => !projectsData.some(p => p.id === e.id));
      localStorage.setItem('dynamicProjectsData', JSON.stringify(dynamicEventsToSave));
      
      // Guardamos la lista de IDs de eventos originales que se han eliminado
      localStorage.setItem('deletedStaticEventIds', JSON.stringify(deletedStaticIds));
      
      alert('¡Cambios guardados con éxito!');
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert('No se pudieron guardar los cambios.');
    }
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
            <TextField label="URL de la Imagen" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
            <TextField label="Escuela Asociada" name="school" value={formData.school} onChange={handleChange} required />
            <TextField label="Fecha del Evento" name="eventDate" type="date" InputLabelProps={{ shrink: true }} value={formData.eventDate} onChange={handleChange} required />
            <Button type="submit" variant="contained">Añadir a la Lista</Button>
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
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSaveChanges}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
