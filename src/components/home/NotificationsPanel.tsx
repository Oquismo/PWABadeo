import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Paper, IconButton, Button } from '@mui/material';
import { useRef } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsPanel() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seenAnnouncements, setSeenAnnouncements] = useState<Set<string>>(new Set());
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Cargar anuncios vistos y ocultos desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('seenAnnouncements');
    if (saved) {
      setSeenAnnouncements(new Set(JSON.parse(saved)));
    }

    const hidden = localStorage.getItem('hiddenAnnouncements');
    if (hidden) {
      setHiddenAnnouncements(new Set(JSON.parse(hidden)));
    }
  }, []);

  // Guardar anuncios ocultos en localStorage
  useEffect(() => {
    localStorage.setItem('hiddenAnnouncements', JSON.stringify([...hiddenAnnouncements]));
  }, [hiddenAnnouncements]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/announcement/all');
        const data = await res.json();
        let allAnnouncements = data.announcements || [];
        
        // Agregar anuncios vistos localmente que no estén en la API
        const localSeenAnnouncements = Array.from(seenAnnouncements).map(message => ({
          id: `local-${message.slice(0, 10)}`,
          message,
          createdAt: new Date().toISOString(),
          user: { name: 'Sistema' },
          isLocal: true
        }));
        
        // Combinar y ordenar por fecha (más recientes primero)
        allAnnouncements = [...allAnnouncements, ...localSeenAnnouncements]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Filtrar anuncios ocultos
        allAnnouncements = allAnnouncements.filter((a: any) => !hiddenAnnouncements.has(a.message));
        
        setAnnouncements(allAnnouncements);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [seenAnnouncements, hiddenAnnouncements]);

  // Swipe para eliminar/ocultar anuncio
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = async (e: React.TouchEvent, id: number, isLocal?: boolean, message?: string) => {
    if (touchStartX.current !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(deltaX) > 80) {
        if (user?.role === 'admin' && !isLocal) {
          // Admin puede eliminar de la BD
          await fetch(`/api/announcement/${id}`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
          setAnnouncements(announcements.filter(a => a.id !== id));
        } else if (message) {
          // Usuario normal solo oculta localmente
          setHiddenAnnouncements(prev => new Set([...prev, message]));
        }
      }
    }
    touchStartX.current = null;
  };

  // Eliminar/ocultar con botón
  const handleDelete = async (id: number, isLocal?: boolean, message?: string) => {
    if (user?.role === 'admin' && !isLocal) {
      // Admin puede eliminar de la BD
      await fetch(`/api/announcement/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      setAnnouncements(announcements.filter(a => a.id !== id));
    } else if (message) {
      // Usuario normal solo oculta localmente
      setHiddenAnnouncements(prev => new Set([...prev, message]));
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, margin: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Historial de Anuncios
        </Typography>
        {user?.role === 'admin' && (
          <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
            MODO ADMIN
          </Typography>
        )}
      </Box>
      
      {hiddenAnnouncements.size > 0 && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {hiddenAnnouncements.size} notificación(es) oculta(s) • 
            <Button 
              size="small" 
              onClick={() => setHiddenAnnouncements(new Set())}
              sx={{ ml: 1, p: 0, minHeight: 'auto', fontSize: '0.7rem' }}
            >
              Mostrar todas
            </Button>
          </Typography>
        </Box>
      )}
      
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
                onTouchEnd={e => handleTouchEnd(e, a.id, a.isLocal, a.message)}
                sx={{
                  transition: 'background 0.2s',
                  bgcolor: 'background.paper',
                  ':active': { bgcolor: 'error.light' },
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label={user?.role === 'admin' && !a.isLocal ? 'delete' : 'hide'} 
                    onClick={() => handleDelete(a.id, a.isLocal, a.message)}
                    title={user?.role === 'admin' && !a.isLocal ? 'Eliminar permanentemente' : 'Ocultar notificación'}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <InfoIcon color={a.isLocal ? 'action' : 'info'} sx={{ mr: 2 }} />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {a.message}
                      {a.isLocal && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          (Visto)
                        </Typography>
                      )}
                    </Box>
                  }
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
