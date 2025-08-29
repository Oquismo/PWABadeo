'use client';

import React from 'react';

interface SpotifyPlayerProps {
  compact?: boolean;
  showControls?: boolean;
}

// UI de Spotify temporalmente deshabilitada para futuras versiones
export default function SpotifyPlayer({ compact = false, showControls = true }: SpotifyPlayerProps) {
  return (
    <div style={{ display: 'none' }}>
      {/* Spotify Player UI oculta temporalmente */}
    </div>
  );
}
