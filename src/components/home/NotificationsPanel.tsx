import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Paper, IconButton } from '@mui/material';
import { useRef } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

export default function NotificationsPanel() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/announcement/all');
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Swipe para eliminar anuncio
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = async (e: React.TouchEvent, id: number) => {
    if (touchStartX.current !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(deltaX) > 80) {
        // Eliminar anuncio
        await fetch(`/api/announcement/${id}`, { method: 'DELETE' });
        setAnnouncements(announcements.filter(a => a.id !== id));
      }
    }
    touchStartX.current = null;
  };

  // Eliminar con botón (opcional)
  const handleDelete = async (id: number) => {
    await fetch(`/api/announcement/${id}`, { method: 'DELETE' });
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, margin: 'auto', mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Historial de Anuncios
      </Typography>
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Typography color="text.secondary">No hay anuncios previos.</Typography>
      ) : (
        <List>
          {announcements.map((a, idx) => (
            <Box key={a.id}>
              <ListItem
                alignItems="flex-start"
                onTouchStart={e => handleTouchStart(e, a.id)}
                onTouchEnd={e => handleTouchEnd(e, a.id)}
                sx={{
                  transition: 'background 0.2s',
                  bgcolor: 'background.paper',
                  ':active': { bgcolor: 'error.light' },
                }}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(a.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <InfoIcon color="info" sx={{ mr: 2 }} />
                <ListItemText
                  primary={a.message}
                  secondary={`Publicado por: ${a.user?.name || 'Admin'} el ${new Date(a.createdAt).toLocaleString()}`}
                />
              </ListItem>
              {idx < announcements.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      )}
    </Paper>
  );
}
