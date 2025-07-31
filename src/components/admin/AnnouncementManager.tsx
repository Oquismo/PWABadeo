'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper, Alert } from '@mui/material';

export default function AnnouncementManager() {
  const [announcement, setAnnouncement] = useState('');
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');

  useEffect(() => {
    const savedAnnouncement = localStorage.getItem('globalAnnouncement');
    if (savedAnnouncement) {
      setCurrentAnnouncement(savedAnnouncement);
    }
  }, []);

  const handleSave = () => {
    if (announcement.trim() === '') {
      alert("El anuncio no puede estar vacío.");
      return;
    }
    localStorage.setItem('globalAnnouncement', announcement);
    setCurrentAnnouncement(announcement);
    setAnnouncement('');
    alert('Anuncio publicado con éxito.');
  };

  const handleDelete = () => {
    localStorage.removeItem('globalAnnouncement');
    setCurrentAnnouncement('');
    alert('Anuncio eliminado.');
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Gestionar Anuncio Global</Typography>
      {currentAnnouncement && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Anuncio Activo:</strong> {currentAnnouncement}
        </Alert>
      )}
      <Stack spacing={2}>
        <TextField
          label="Nuevo Anuncio"
          placeholder="Escribe un mensaje corto..."
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleSave}>
            Publicar Anuncio
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete} disabled={!currentAnnouncement}>
            Eliminar Anuncio
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
