'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Stack, Paper, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';

interface AnnouncementItem {
  id: number;
  message: string;
  createdAt: string;
  user?: { name?: string } | null;
}

export default function AnnouncementManager() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const current = announcements[0] ?? null;

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/announcement/all');
      const data = await res.json();
      if (res.ok) setAnnouncements(data.announcements || []);
      else setError('Error al cargar anuncios');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    const msg = input.trim();
    if (!msg) { setError('El mensaje no puede estar vacío.'); return; }
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
      setError('Solo administradores pueden publicar anuncios.'); return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al publicar');
      setInput('');
      setSuccess('Anuncio publicado');
      await fetchAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
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
      setSuccess('Anuncio eliminado');
      setConfirmOpen(false);
      await fetchAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (raw: string) => {
    try { return new Date(raw).toLocaleString('es-ES'); } catch { return raw; }
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Gestionar Anuncios</Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Nuevo anuncio"
          placeholder="Escribe un mensaje para todos los usuarios..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleSave} disabled={saving || !input.trim()}>
            {saving ? 'Publicando…' : 'Publicar'}
          </Button>
          {current && (
            <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)} disabled={saving}>
              Eliminar último
            </Button>
          )}
        </Stack>
      </Stack>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Historial de anuncios</Typography>

      {loading ? (
        <Typography variant="body2" color="text.secondary">Cargando…</Typography>
      ) : announcements.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No hay anuncios publicados.</Typography>
      ) : (
        <List dense disablePadding>
          {announcements.map((a) => (
            <ListItem key={a.id} sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
              <ListItemText
                primary={a.message}
                secondary={`${formatDate(a.createdAt)} — ${a.user?.name || 'Admin'}`}
                primaryTypographyProps={{ fontWeight: a.id === current?.id ? 700 : 400 }}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>¿Eliminar el último anuncio?</DialogTitle>
        <DialogContent>
          <Typography>Se eliminará: &ldquo;{current?.message}&rdquo;</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={saving}>
            {saving ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
