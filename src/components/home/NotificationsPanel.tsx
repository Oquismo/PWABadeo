import { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Paper, IconButton, Button, Fade, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsPanel() {
  // Estados para manejar notificaciones
  // - announcements: lista actual de notificaciones visibles
  // - hiddenAnnouncements: Set de IDs de notificaciones ocultas (persistido en localStorage)
  // - seenAnnouncements: Set de IDs de notificaciones vistas (persistido en localStorage)
  // - localStorageLoaded: flag para saber cuando se cargó el localStorage
  // Comportamiento:
  // - Admin: puede eliminar notificaciones permanentemente de la BD
  // - Usuario normal: solo oculta notificaciones localmente, no vuelven a aparecer
  // - Las notificaciones ocultas se mantienen ocultas incluso después de recargar la página
  // - Las notificaciones vistas se muestran con opacidad reducida y etiqueta "Vista"
  // - Sistema de persistencia robusto que espera a que localStorage esté listo

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<Set<string>>(new Set());
  const [seenAnnouncements, setSeenAnnouncements] = useState<Set<string>>(new Set());
  const [localStorageLoaded, setLocalStorageLoaded] = useState(false);
  const { user } = useAuth();

  // Cargar anuncios ocultos y vistos desde localStorage
  useEffect(() => {
    const hidden = localStorage.getItem('hiddenAnnouncements');
    const seen = localStorage.getItem('seenAnnouncements');

    if (hidden) {
      try {
        const parsedHidden = JSON.parse(hidden);
        setHiddenAnnouncements(new Set(parsedHidden));
      } catch (error) {
        console.error('Error parsing hidden announcements from localStorage:', error);
        setHiddenAnnouncements(new Set());
      }
    }

    if (seen) {
      try {
        const parsedSeen = JSON.parse(seen);
        setSeenAnnouncements(new Set(parsedSeen));
      } catch (error) {
        console.error('Error parsing seen announcements from localStorage:', error);
        setSeenAnnouncements(new Set());
      }
    }

    setLocalStorageLoaded(true);
  }, []);

  // Guardar anuncios ocultos en localStorage
  useEffect(() => {
    if (localStorageLoaded) {
      localStorage.setItem('hiddenAnnouncements', JSON.stringify([...hiddenAnnouncements]));
    }
  }, [hiddenAnnouncements, localStorageLoaded]);

  // Guardar anuncios vistos en localStorage
  useEffect(() => {
    if (localStorageLoaded) {
      localStorage.setItem('seenAnnouncements', JSON.stringify([...seenAnnouncements]));
    }
  }, [seenAnnouncements, localStorageLoaded]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/announcement/all');
        const data = await res.json();
        let allAnnouncements = data.announcements || [];

        // Filtrar anuncios ocultos por id (solo para usuarios no admin)
        if (user?.role !== 'admin') {
          allAnnouncements = allAnnouncements.filter(shouldShowAnnouncement);
        }

        setAnnouncements(allAnnouncements);
      } catch (error) {
        console.error('Error cargando anuncios:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    // Solo hacer fetch cuando user existe Y localStorage está cargado
    if (user && localStorageLoaded) {
      fetchAnnouncements();
    }
  }, [hiddenAnnouncements, user, localStorageLoaded]);

  // Marcar notificaciones como vistas cuando se cargan
  useEffect(() => {
    if (announcements.length > 0 && localStorageLoaded) {
      markAllAsSeen();
    }
  }, [announcements, localStorageLoaded]);

  // Función para agregar nuevas notificaciones (útil para WebSocket o polling)
  const addNewAnnouncement = (newAnnouncement: any) => {
    if (user?.role === 'admin') {
      // Admin ve todas las notificaciones
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    } else {
      // Usuario normal solo ve si no está oculta
      const idStr = newAnnouncement.id?.toString();
      if (idStr && !hiddenAnnouncements.has(idStr)) {
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      }
    }
  };

  // Función para verificar si una notificación debe mostrarse
  const shouldShowAnnouncement = (announcement: any) => {
    if (user?.role === 'admin') return true;
    const idStr = announcement.id?.toString();
    // No mostrar si está oculta
    return idStr ? !hiddenAnnouncements.has(idStr) : true;
  };

  // Función para verificar si una notificación ya fue vista
  const isAnnouncementSeen = (announcement: any) => {
    const idStr = announcement.id?.toString();
    return idStr ? seenAnnouncements.has(idStr) : false;
  };

  // Función para marcar una notificación como vista
  const markAsSeen = (id: string | number) => {
    const idStr = id.toString();
    setSeenAnnouncements(prev => new Set([...prev, idStr]));
  };

  // Función para marcar todas las notificaciones visibles como vistas
  const markAllAsSeen = () => {
    const visibleIds = announcements.map(a => a.id?.toString()).filter(Boolean);
    setSeenAnnouncements(prev => new Set([...prev, ...visibleIds]));
  };

  // Swipe para eliminar/ocultar anuncio
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = async (e: React.TouchEvent, id: number, isLocal?: boolean, message?: string) => {
    if (touchStartX.current !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(deltaX) > 80) {
        const idStr = id.toString();

        // Marcar como vista
        markAsSeen(id);

        if (user?.role === 'admin' && !isLocal) {
          // Admin puede eliminar de la BD
          await fetch(`/api/announcement/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
          setAnnouncements(announcements.filter(a => a.id !== id));
        } else {
          // Usuario normal solo oculta localmente
          setHiddenAnnouncements(prev => new Set([...prev, idStr]));
        }
      }
    }
    touchStartX.current = null;
  };

  // Eliminar/ocultar con botón
  const handleDelete = async (id: string | number) => {
    const idStr = id.toString();
    const idNum = typeof id === 'string' ? parseInt(id) : id;

    // Marcar como vista primero
    markAsSeen(id);

    if (user?.role === 'admin') {
      // Admin puede eliminar de la BD
      try {
        await fetch(`/api/announcement/${idStr}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        // Remover de la lista local
        setAnnouncements(announcements.filter(a => a.id !== idNum));
      } catch (error) {
        console.error('Error eliminando anuncio:', error);
      }
    } else {
      // Usuario normal solo oculta localmente
      setHiddenAnnouncements(prev => {
        const newSet = new Set([...prev, idStr]);
        localStorage.setItem('hiddenAnnouncements', JSON.stringify([...newSet]));
        // Remover de la lista visible
        setAnnouncements(announcements => announcements.filter(a => a.id?.toString() !== idStr));
        return newSet;
      });
    }
  };

  // Fecha y hora estilo Android
  const now = new Date();
  const fecha = now.toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: 'short' });
  const hora = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 420,
        mx: 'auto',
        mt: 5,
        px: { xs: 0, sm: 2 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 7,
          overflow: 'hidden',
          background: (theme) =>
            `rgba(${theme.palette.background.default.replace('#', '').match(/.{1,2}/g)?.map(x=>parseInt(x,16)).join(',')},0.7)` || 'rgba(40,40,40,0.7)',
          backdropFilter: 'blur(18px) saturate(1.2)',
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
          border: (theme) => `1.5px solid ${theme.palette.primary.main}22`,
        }}
      >
        {/* Header estilo Android */}
        <Box sx={{ px: 4, pt: 3, pb: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 0.5, color: 'text.primary' }}>{hora}</Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 500 }}>{fecha}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, color: 'text.primary' }}>
              Notificaciones
            </Typography>
            <Button
              size="small"
              variant="text"
              color="primary"
              onClick={() => {
                if (user?.role === 'admin') {
                  // Para admin, recargar todas las notificaciones
                  const fetchAll = async () => {
                    setLoading(true);
                    try {
                      const res = await fetch('/api/announcement/all');
                      const data = await res.json();
                      setAnnouncements(data.announcements || []);
                    } catch (error) {
                      console.error('Error recargando anuncios:', error);
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchAll();
                } else {
                  // Para usuarios normales, mostrar todas las ocultas y resetear vistas
                  setHiddenAnnouncements(new Set());
                  setSeenAnnouncements(new Set());
                  localStorage.removeItem('hiddenAnnouncements');
                  localStorage.removeItem('seenAnnouncements');
                }
              }}
              sx={{ fontWeight: 600, borderRadius: 99, px: 2, ml: 1 }}
            >
              {user?.role === 'admin' ? 'Recargar' : 'Mostrar todas'}
            </Button>
            {user?.role === 'admin' && (
              <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', ml: 2 }}>
                ADMIN
              </Typography>
            )}
          </Box>
        </Box>

        {/* Lista de notificaciones tipo burbuja */}
        <Box sx={{ px: 2.5, pb: 3, pt: 0 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : announcements.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No hay notificaciones.</Typography>
          ) : (
            <Stack spacing={2}>
              {announcements.map((a, idx) => {
                const isSeen = isAnnouncementSeen(a);
                return (
                  <Fade in timeout={400} key={a.id + '-' + (a.createdAt || '')}>
                    <Paper
                      elevation={0}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: (theme) => theme.palette.background.paper,
                        borderRadius: 5,
                        boxShadow: (theme) => `0 2px 12px 0 ${theme.palette.primary.main}22`,
                        p: 2,
                        border: (theme) => `1.5px solid ${theme.palette.primary.main}22`,
                        transition: 'box-shadow 0.2s, border 0.2s, opacity 0.2s',
                        opacity: isSeen ? 0.7 : 1,
                        ':hover': {
                          boxShadow: (theme) => `0 4px 24px 0 ${theme.palette.primary.main}44`,
                          border: (theme) => `2px solid ${theme.palette.primary.main}55`,
                          opacity: 1,
                        },
                        position: 'relative',
                        minHeight: 72,
                        overflow: 'hidden',
                      }}
                      onTouchStart={e => handleTouchStart(e, a.id)}
                      onTouchEnd={e => handleTouchEnd(e, a.id)}
                    >
                      <InfoIcon
                        sx={{
                          fontSize: 36,
                          color: isSeen ? 'text.secondary' : 'primary.main',
                          flexShrink: 0,
                          mr: 1.5,
                          ml: 0.5
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {a.message}
                          {isSeen && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', opacity: 0.6 }}>
                              Vista
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          Publicado por: {a.user?.name || 'Admin'} el {new Date(a.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <IconButton
                        edge="end"
                        aria-label={user?.role === 'admin' ? 'delete' : 'hide'}
                        onClick={() => handleDelete(a.id)}
                        title={user?.role === 'admin' ? 'Eliminar permanentemente' : 'Ocultar notificación'}
                        sx={{
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                          color: (theme) => theme.palette.primary.contrastText,
                          ml: 2,
                          boxShadow: 2,
                          '&:hover': {
                            bgcolor: (theme) => theme.palette.error.main,
                            color: (theme) => theme.palette.error.contrastText,
                          },
                          transition: 'background 0.2s, color 0.2s',
                        }}
                      >
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
