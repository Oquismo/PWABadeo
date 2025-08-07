import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Paper } from '@mui/material';
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
              <ListItem alignItems="flex-start">
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
