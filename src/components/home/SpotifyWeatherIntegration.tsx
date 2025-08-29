'use client';

import React from 'react';

interface SpotifyWeatherIntegrationProps {
  weatherCode: number;
  temperature: number;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

// Componente de Spotify temporalmente deshabilitado para futuras versiones
export default function SpotifyWeatherIntegration(props: SpotifyWeatherIntegrationProps) {
  return (
    <div style={{ display: 'none' }}>
      {/* Spotify Weather Integration UI oculta temporalmente */}
    </div>
  );
}
