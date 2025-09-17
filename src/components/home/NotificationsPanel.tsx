import { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Paper, IconButton, Button, Fade, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '@/context/AuthContext';
import loggerClient from '@/lib/loggerClient';

export default function NotificationsPanel() {
  // Estados
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<Set<string>>(new Set());
  const [seenAnnouncements, setSeenAnnouncements] = useState<Set<string>>(new Set());
  const [localStorageLoaded, setLocalStorageLoaded] = useState(false);
  const { user } = useAuth();

  // Cargar hidden/seen desde localStorage una vez
  useEffect(() => {
    try {
      const hidden = localStorage.getItem('hiddenAnnouncements');
      const seen = localStorage.getItem('seenAnnouncements');
      if (hidden) {
        setHiddenAnnouncements(new Set(JSON.parse(hidden)));
      }
      if (seen) {
        setSeenAnnouncements(new Set(JSON.parse(seen)));
      }
    } catch (err) {
      loggerClient.warn('Error leyendo localStorage para notificaciones', err);
    } finally {
      setLocalStorageLoaded(true);
    }
  }, []);

  // Fetch de anuncios cuando user + localStorage estén listos
  useEffect(() => {
    if (!user || !localStorageLoaded) return;

    let cancelled = false;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/announcement/all');
        const data = await res.json();
        let allAnnouncements = data.announcements || [];

        if (user?.role !== 'admin') {
          allAnnouncements = allAnnouncements.filter((announcement: any) => {
            const idStr = announcement.id?.toString();
            return idStr ? !hiddenAnnouncements.has(idStr) : true;
          });
        }

        if (!cancelled) setAnnouncements(allAnnouncements);
      } catch (error) {
        loggerClient.error('Error cargando anuncios:', error);
        if (!cancelled) setAnnouncements([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnnouncements();

    return () => {
      cancelled = true;
    };
  }, [user, localStorageLoaded, hiddenAnnouncements]);

  // Marcar vistas cuando hay anuncios
  useEffect(() => {
    if (announcements.length > 0 && localStorageLoaded) {
      const visibleIds = announcements.map(a => a.id?.toString()).filter(Boolean) as string[];
      setSeenAnnouncements(prev => new Set([...prev, ...visibleIds]));
      try {
        localStorage.setItem('seenAnnouncements', JSON.stringify(Array.from(new Set([...seenAnnouncements, ...visibleIds]))));
      } catch (err) {
        loggerClient.warn('No se pudo guardar seenAnnouncements en localStorage', err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements, localStorageLoaded]);

  // Helpers
  const isAnnouncementSeen = (announcement: any) => {
    const idStr = announcement.id?.toString();
    return idStr ? seenAnnouncements.has(idStr) : false;
  };

  const markAsSeen = (id: string | number) => {
    const idStr = id.toString();
    setSeenAnnouncements(prev => new Set([...prev, idStr]));
    try {
      localStorage.setItem('seenAnnouncements', JSON.stringify(Array.from(new Set([...seenAnnouncements, idStr]))));
    } catch (err) {
      loggerClient.warn('No se pudo persistir seenAnnouncements', err);
    }
  };

  // Touch handlers (swipe to hide/delete)
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = async (e: React.TouchEvent, id: number, isLocal?: boolean) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) <= 80) return;

    markAsSeen(id);

    const idStr = id.toString();
    if (user?.role === 'admin' && !isLocal) {
      try {
        await fetch(`/api/announcement/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        loggerClient.error('Error eliminando anuncio via swipe:', err);
      }
    } else {
      setHiddenAnnouncements(prev => {
        const newSet = new Set([...prev, idStr]);
        try {
          localStorage.setItem('hiddenAnnouncements', JSON.stringify(Array.from(newSet)));
        } catch (err) {
          loggerClient.warn('No se pudo persistir hiddenAnnouncements', err);
        }
        return newSet;
      });
      setAnnouncements(prev => prev.filter(a => a.id?.toString() !== idStr));
    }
  };

  const handleDelete = async (id: string | number) => {
    const idStr = id.toString();
    markAsSeen(id);
    if (user?.role === 'admin') {
      try {
        await fetch(`/api/announcement/${idStr}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
        setAnnouncements(prev => prev.filter(a => a.id !== (typeof id === 'string' ? parseInt(id) : id)));
      } catch (err) {
        loggerClient.error('Error eliminando anuncio:', err);
      }
    } else {
      setHiddenAnnouncements(prev => {
        const newSet = new Set([...prev, idStr]);
        try {
          localStorage.setItem('hiddenAnnouncements', JSON.stringify(Array.from(newSet)));
        } catch (err) {
          loggerClient.warn('No se pudo persistir hiddenAnnouncements', err);
        }
        return newSet;
      });
      setAnnouncements(prev => prev.filter(a => a.id?.toString() !== idStr));
    }
  };

  // UI helpers
  const now = new Date();
  const fecha = now.toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'short' });
  const hora = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <Box sx={{ position: 'relative', maxWidth: 420, mx: 'auto', mt: 5, px: { xs: 0, sm: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 7,
          overflow: 'hidden',
          background: (theme) => `rgba(${theme.palette.background.default.replace('#', '').match(/.{1,2}/g)?.map(x=>parseInt(x,16)).join(',')},0.7)` || 'rgba(40,40,40,0.7)',
          backdropFilter: 'blur(18px) saturate(1.2)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
          border: (theme) => `1.5px solid ${theme.palette.primary.main}22`,
        }}
      >
        <Box sx={{ px: 4, pt: 3, pb: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 0.5, color: 'text.primary' }}>{hora}</Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>{fecha}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, color: 'text.primary' }}>Notificaciones</Typography>
            <Button
              size="small"
              variant="text"
              color="primary"
              onClick={() => {
                if (user?.role === 'admin') {
                  // Para admin: recargar manualmente
                  setLoading(true);
                  fetch('/api/announcement/all')
                    .then(res => res.json())
                    .then(data => setAnnouncements(data.announcements || []))
                    .catch(err => loggerClient.error('Error recargando anuncios:', err))
                    .finally(() => setLoading(false));
                } else {
                  // Mostrar todas para usuarios normales
                  setHiddenAnnouncements(new Set());
                  setSeenAnnouncements(new Set());
                  try {
                    localStorage.removeItem('hiddenAnnouncements');
                    localStorage.removeItem('seenAnnouncements');
                  } catch (err) {
                    loggerClient.warn('No se pudo limpiar localStorage', err);
                  }
                }
              }}
              sx={{ fontWeight: 600, borderRadius: 99, px: 2, ml: 1 }}
            >
              {user?.role === 'admin' ? 'Recargar' : 'Mostrar todas'}
            </Button>
            {user?.role === 'admin' && (
              <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', ml: 2 }}>ADMIN</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ px: 2.5, pb: 3, pt: 0 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : announcements.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No hay notificaciones.</Typography>
          ) : (
            <Stack spacing={2}>
              {announcements.map((a) => {
                const isSeen = isAnnouncementSeen(a);
                return (
                  <Fade in timeout={400} key={a.id + '-' + (a.createdAt || '')}>
                    <Paper
                      elevation={0}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        bgcolor: (theme) => theme.palette.background.paper,
                        borderRadius: 5,
                        boxShadow: (theme) => `0 2px 12px 0 ${theme.palette.primary.main}22`,
                        p: 2,
                        border: (theme) => `1.5px solid ${theme.palette.primary.main}22`,
                        transition: 'box-shadow 0.2s, border 0.2s, opacity 0.2s',
                        opacity: isSeen ? 0.7 : 1,
                        ':hover': { boxShadow: (theme) => `0 4px 24px 0 ${theme.palette.primary.main}44`, border: (theme) => `2px solid ${theme.palette.primary.main}55`, opacity: 1 },
                        position: 'relative', minHeight: 72, overflow: 'hidden'
                      }}
                      onTouchStart={e => handleTouchStart(e, a.id)}
                      onTouchEnd={e => handleTouchEnd(e, a.id)}
                    >
                      <InfoIcon sx={{ fontSize: 36, color: isSeen ? 'text.secondary' : 'primary.main', flexShrink: 0, mr: 1.5, ml: 0.5 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {a.message}
                          {isSeen && (<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', opacity: 0.6 }}>Vista</Typography>)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          Publicado por: {a.user?.name || 'Admin'} el {new Date(a.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <IconButton edge="end" aria-label={user?.role === 'admin' ? 'delete' : 'hide'} onClick={() => handleDelete(a.id)} title={user?.role === 'admin' ? 'Eliminar permanentemente' : 'Ocultar notificación'} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light, color: (theme) => theme.palette.primary.contrastText, ml: 2, boxShadow: 2, '&:hover': { bgcolor: (theme) => theme.palette.error.main, color: (theme) => theme.palette.error.contrastText }, transition: 'background 0.2s, color 0.2s' }}>
                        <DeleteIcon sx={{ fontSize: 26 }} />
                      </IconButton>
                    </Paper>
                  </Fade>
                );
              })}
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
