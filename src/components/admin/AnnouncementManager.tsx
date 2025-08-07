'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function AnnouncementManager() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState('');
  const [currentAnnouncement, setCurrentAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Leer anuncio actual desde la API
  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/announcement');
        const data = await res.json();
        setCurrentAnnouncement(data.message || '');
      } catch {
        setCurrentAnnouncement('');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, []);

  const handleSave = async () => {
    if (announcement.trim() === '') {
      setError('El anuncio no puede estar vacío.');
      return;
    }
    if (!user || user.role !== 'admin') {
      setError('Solo los administradores pueden publicar anuncios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcement, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al publicar');
      setCurrentAnnouncement(announcement);
      setAnnouncement('');
      alert('Anuncio publicado con éxito.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.role !== 'admin') {
      setError('Solo los administradores pueden eliminar anuncios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/announcement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar');
      setCurrentAnnouncement('');
      alert('Anuncio eliminado.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Gestionar Anuncio Global</Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : currentAnnouncement ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Anuncio Activo:</strong> {currentAnnouncement}
        </Alert>
      ) : null}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            Publicar Anuncio
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete} disabled={!currentAnnouncement || saving}>
            Eliminar Anuncio
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
