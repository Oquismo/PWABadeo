'use client';

import { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const SEEN_KEY = 'announcement-seen';

function getSeen(): Set<number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<number>();
  }
}

function saveSeen(ids: Set<number>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage may be full or unavailable
  }
}

export default function AnnouncementBanner() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [id, setId] = useState<number | null>(null);
  const seenRef = useRef<Set<number>>(getSeen());

  useEffect(() => {
    let mounted = true;
    let lastId: number | null = null;

    const poll = async () => {
      try {
        const res = await fetch('/api/announcement');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.message || !mounted) return;

        const newId = data.id;
        if (newId === lastId) return;
        lastId = newId;

        if (seenRef.current.has(newId)) return;

        setId(newId);
        setMessage(data.message);
        setOpen(true);
      } catch {
        // silent — banner is non-critical
      }
    };

    poll();
    const interval = setInterval(poll, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (id !== null) {
      seenRef.current = new Set([...seenRef.current, id]);
      saveSeen(seenRef.current);
    }
  };

  if (!message) return null;

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Slide}
      sx={{ zIndex: 1400 }}
    >
      <Alert
        icon={<InfoIcon sx={{ fontSize: 28 }} />}
        severity="info"
        variant="filled"
        onClose={handleClose}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 6,
          borderRadius: 3,
          fontWeight: 600,
          fontSize: '1rem',
          alignItems: 'center',
          minWidth: 300,
          maxWidth: 500,
          px: 2.5,
          py: 1.5,
          border: '1px solid',
          borderColor: 'primary.main',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
