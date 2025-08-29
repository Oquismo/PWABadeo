'use client';


import { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert, CircularProgress, Slide } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [seenAnnouncements, setSeenAnnouncements] = useState<Set<string>>(new Set());
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { sendNotification, permission } = usePushNotifications();

  // Función para enviar notificación push al servidor
  const sendPushNotification = async (title: string, body: string, url?: string) => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          icon: '/icons/icon_192x192.png',
          url: url || '/'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notificación push enviada:', result);
        return true;
      } else {
        console.error('Error enviando notificación push:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error enviando notificación push:', error);
      return false;
    }
  };

  // Cargar anuncios vistos y ocultos desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('seenAnnouncements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSeenAnnouncements(new Set(parsed));
      } catch (error) {
        console.error('Error parsing seenAnnouncements:', error);
        setSeenAnnouncements(new Set());
      }
    }

    const hidden = localStorage.getItem('hiddenAnnouncements');
    if (hidden) {
      try {
        const parsed = JSON.parse(hidden);
        setHiddenAnnouncements(new Set(parsed));
      } catch (error) {
        console.error('Error parsing hiddenAnnouncements:', error);
        setHiddenAnnouncements(new Set());
      }
    }

    setIsLoaded(true);
  }, []);

  // Guardar anuncios vistos en localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('seenAnnouncements', JSON.stringify([...seenAnnouncements]));
    }
  }, [seenAnnouncements, isLoaded]);

  // Actualización en tiempo real usando EventSource (Server-Sent Events) o polling rápido
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    
    let eventSource: EventSource | null = null;
    eventSource = new EventSource('/api/announcement/sse');
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const message = data.message;
        
        // Verificaciones adicionales
        if (message && message.trim() && !seenAnnouncements.has(message.trim()) && !hiddenAnnouncements.has(message.trim())) {
          const trimmedMessage = message.trim();

          // Intentar enviar notificación push
          const pushSent = await sendPushNotification(
            'Nuevo Anuncio',
            trimmedMessage,
            '/'
          );

          if (pushSent) {
            console.log('Notificación push enviada:', trimmedMessage);
            // Marcar como visto inmediatamente después de enviar push
            setSeenAnnouncements(prev => new Set([...prev, trimmedMessage]));
          } else {
            // Fallback: mostrar banner si no se pudo enviar push
            console.log('Fallback: mostrando banner para:', trimmedMessage);
            setAnnouncement(trimmedMessage);
            setOpen(true);
          }
        } else if (message) {
          console.log('Anuncio ya visto u oculto:', message);
        }
      } catch (error) {
        console.error('Error parsing announcement:', error);
      }
    };
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource?.close();
    };
    return () => {
      eventSource?.close();
    };
  }, [seenAnnouncements, hiddenAnnouncements, isLoaded]);

  // Auto-cierre a los 3 segundos
  useEffect(() => {
    if (open && announcement) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleClose();
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, announcement]);

  const handleClose = () => {
    setOpen(false);
    // Marcar como visto cuando se cierra
    if (announcement) {
      const trimmedMessage = announcement.trim();
      console.log('Marcando como visto:', trimmedMessage);
      setSeenAnnouncements(prev => new Set([...prev, trimmedMessage]));
    }
  };

  // Función de debug - Para testing: limpia el historial de anuncios vistos
  // Abre la consola del navegador (F12) y ejecuta: window.clearSeenAnnouncements()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).clearSeenAnnouncements = clearSeenAnnouncements;
    }
  }, []);

  // Función de debug (puedes quitar esto después)
  const clearSeenAnnouncements = () => {
    setSeenAnnouncements(new Set());
    localStorage.removeItem('seenAnnouncements');
    console.log('Historial de anuncios vistos limpiado');
  };

  // Debug: mostrar en consola
  useEffect(() => {
    console.log('Anuncios vistos actualmente:', [...seenAnnouncements]);
  }, [seenAnnouncements]);

  if (!announcement) return null;

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Slide}
      sx={{ zIndex: 1400 }}
    >
      <Alert
        icon={<InfoIcon sx={{ fontSize: 36, color: 'primary.main', mr: 1 }} />}
        severity="info"
        variant="filled"
        onClose={handleClose}
        sx={{
          bgcolor: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          boxShadow: 6,
          borderRadius: 6,
          fontWeight: 'bold',
          fontSize: '1.15rem',
          alignItems: 'center',
          minWidth: 340,
          maxWidth: 500,
          margin: 'auto',
          px: 3,
          py: 2.5,
          display: 'flex',
          gap: 2,
          border: (theme) => `2px solid ${theme.palette.primary.main}22`,
          backgroundImage: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light}11 0%, ${theme.palette.secondary.light}11 100%)`,
        }}
        action={
          <>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                fontWeight: 600,
                fontSize: '1rem',
                padding: '6px 16px',
                borderRadius: 24,
                cursor: 'pointer',
                backgroundColor: 'rgba(0,0,0,0.04)',
                marginLeft: 12,
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)')}
            >
              Cerrar
            </button>
          </>
        }
      >
        {announcement}
      </Alert>
    </Snackbar>
  );
}
