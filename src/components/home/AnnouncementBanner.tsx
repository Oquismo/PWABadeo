'use client';


import { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert, CircularProgress, Slide } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Actualización en tiempo real usando EventSource (Server-Sent Events) o polling rápido
  useEffect(() => {
    let lastMessage = '';
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch('/api/announcement');
        const data = await res.json();
        if (data.message !== lastMessage) {
          setAnnouncement(data.message);
          setOpen(!!data.message);
          lastMessage = data.message;
        }
      } catch {
        setAnnouncement(null);
        setOpen(false);
      }
    };
    fetchAnnouncement();
    const interval = setInterval(fetchAnnouncement, 3000); // Actualiza cada 3s
    return () => clearInterval(interval);
  }, []);

  // Auto-cierre a los 3 segundos
  useEffect(() => {
    if (open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setOpen(false), 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, announcement]);

  if (!announcement) return null;

  return (
    <Snackbar
      open={open}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Slide}
      sx={{ zIndex: 1400 }}
    >
      <Alert
        icon={<InfoIcon fontSize="inherit" />} 
        severity="info"
        variant="filled"
        onClose={() => setOpen(false)}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 3,
          borderRadius: 3,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          alignItems: 'center',
          minWidth: 320,
          maxWidth: 480,
          margin: 'auto',
        }}
      >
        {announcement}
      </Alert>
    </Snackbar>
  );
}
