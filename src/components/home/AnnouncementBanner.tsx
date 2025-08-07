'use client';


import { useState, useEffect } from 'react';
import { Alert, Container, CircularProgress } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function AnnouncementBanner() {

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch('/api/announcement');
        const data = await res.json();
        setAnnouncement(data.message);
      } catch {
        setAnnouncement(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
    // Opcional: refrescar cada 30s
    const interval = setInterval(fetchAnnouncement, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Container sx={{ mt: 2 }}><CircularProgress size={24} /></Container>;
  if (!announcement) return null;

  return (
    <Container sx={{ mt: 2 }}>
      <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
        {announcement}
      </Alert>
    </Container>
  );
}
