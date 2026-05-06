'use client';

import { useState, useEffect } from 'react';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { IconButton, Box, useTheme } from '@mui/material';

export default function InlineBanner() {
  const theme = useTheme();
  const [text, setText] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/announcement', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.message) setText(d.message); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!text || dismissed) return null;

  return (
      <Box sx={{
      mb: 1.5,
      background: theme.palette.secondary.dark,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 3,
      p: '10px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.25,
    }}>
      <CampaignRoundedIcon sx={{ color: theme.palette.secondary.main, fontSize: 18, mt: '2px', flexShrink: 0 }} />
      <Box sx={{ flex: 1, fontSize: '0.8rem', color: theme.palette.secondary.light, lineHeight: 1.5, fontWeight: 500 }}>
        {text}
      </Box>
      <IconButton
        size="small"
        onClick={() => setDismissed(true)}
        sx={{ p: 0.25, color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary } }}
        aria-label="Cerrar anuncio"
      >
        <CloseRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}
