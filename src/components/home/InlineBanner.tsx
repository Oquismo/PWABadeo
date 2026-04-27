'use client';

import { useState, useEffect } from 'react';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { IconButton } from '@mui/material';

export default function InlineBanner() {
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
    <div style={{
      margin: '0 0 12px',
      background: '#3A2C4A',
      border: '1px solid rgba(102,126,234,0.25)',
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
    }}>
      <CampaignRoundedIcon sx={{ color: '#8EA8F0', fontSize: 18, mt: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.8rem', color: '#E8DEF8', lineHeight: 1.5, fontWeight: 500 }}>
        {text}
      </div>
      <IconButton
        size="small"
        onClick={() => setDismissed(true)}
        sx={{ p: 0.25, color: '#A1A1AA', '&:hover': { color: '#E8DEF8' } }}
        aria-label="Cerrar anuncio"
      >
        <CloseRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </div>
  );
}
