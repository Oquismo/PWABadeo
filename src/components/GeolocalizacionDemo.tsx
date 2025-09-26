'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Alert, Chip } from '@mui/material';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import GpsFixedRoundedIcon from '@mui/icons-material/GpsFixedRounded';
import GpsOffRoundedIcon from '@mui/icons-material/GpsOffRounded';
import M3Button from '@/components/ui/M3Button';

export default function GeolocalizacionDemo() {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [showExplanation, setShowExplanation] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      return;
    }

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state as any);
        if (result.state === 'granted') setShowExplanation(false);
      });
    }
  }, []);

  const requestPermission = () => {
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización.');
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionState('granted');
        setShowExplanation(false);
        const accuracy = position.coords.accuracy;
        console.log(`✅ Permisos concedidos. Precisión: ${Math.round(accuracy)}m`);
        if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
        const toast = document.createElement('div');
        toast.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #4caf50; color: white; padding: 12px 24px; border-radius: 24px; z-index: 2000; font-family: system-ui; box-shadow: 0 4px 12px rgba(0,0,0,0.3);`;
        toast.textContent = `✅ ¡Ubicación activada correctamente!`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      },
      (error) => {
        console.error('❌ Error al solicitar permisos:', error);
        setPermissionState('denied');
        if ('vibrate' in navigator) navigator.vibrate([100, 100, 100, 100, 100]);
      },
      options
    );
  };

  if (!showExplanation || permissionState === 'granted') return null;

  return (
    <Card
      sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <LocationOnRoundedIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="h2">Ubicación GPS Precisa</Typography>
        </Box>

        {permissionState === 'unsupported' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">Tu dispositivo no soporta geolocalización. Podrás usar el mapa manualmente.</Typography>
          </Alert>
        )}

        {permissionState === 'denied' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>⚠️ Permisos de ubicación denegados</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Para activar la geolocalización precisa:</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              📱 <strong>Android:</strong> Ajustes → Apps → {typeof window !== 'undefined' && window.location.hostname} → Permisos → Ubicación → Permitir
              <br />
              🍎 <strong>iOS:</strong> Ajustes → Safari → Ubicación → Mientras usas la app
              <br />
              💡 <strong>Chrome:</strong> Icono de candado en la URL → Ubicación → Permitir
            </Typography>
          </Alert>
        )}

        {permissionState !== 'unsupported' && (permissionState === 'prompt' || permissionState === 'denied') && (
          <>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>🎯 <strong>Geolocalización de alta precisión</strong> para encontrar lugares exactos cerca de ti en Sevilla:</Typography>

            <Box sx={{ mb: 2 }}>
              <Chip icon={<GpsFixedRoundedIcon />} label="📍 Ubicación exacta en el mapa" variant="outlined" sx={{ mr: 1, mb: 1, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} size="small" />
              <Chip icon={<LocationOnRoundedIcon />} label="📏 Distancias precisas" variant="outlined" sx={{ mr: 1, mb: 1, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} size="small" />
              <Chip icon={<GpsFixedRoundedIcon />} label="🧭 Navegación GPS" variant="outlined" sx={{ mr: 1, mb: 1, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} size="small" />
            </Box>

            <Typography variant="body2" sx={{ mb: 2, fontSize: '0.9rem', opacity: 0.9 }}>ℹ️ Solo se solicitará una vez. Tu ubicación no se almacena ni comparte.</Typography>

            <M3Button
              m3variant="filled"
              onClick={requestPermission}
              startIcon={permissionState === 'denied' ? <GpsOffRoundedIcon /> : <GpsFixedRoundedIcon />}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }, fontWeight: 'bold', py: 1.5 }}
            >
              {permissionState === 'denied' ? '🔄 Reintentar Permisos' : '📍 Activar Ubicación GPS'}
            </M3Button>

            <M3Button m3variant="text" onClick={() => setShowExplanation(false)} sx={{ ml: 2, color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>
              Continuar sin GPS
            </M3Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
