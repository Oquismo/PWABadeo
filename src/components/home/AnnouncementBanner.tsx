'use client';

import { useState, useEffect } from 'react';
import { Alert, Container } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedAnnouncement = localStorage.getItem('globalAnnouncement');
      setAnnouncement(savedAnnouncement);

      const handleStorageChange = () => {
        setAnnouncement(localStorage.getItem('globalAnnouncement'));
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isClient]);

  if (!isClient || !announcement) {
    return null;
  }

  return (
    <Container sx={{ mt: 2 }}>
      <Alert icon={<InfoIcon fontSize="inherit" />} severity="info">
        {announcement}
      </Alert>
    </Container>
  );
}
