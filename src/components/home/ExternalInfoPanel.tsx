import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Card, CardContent, IconButton, Stack, Skeleton, Tooltip, Fade } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SpotifyWeatherIntegration from './SpotifyWeatherIntegration';

// Coordenadas configurables vía variables de entorno (NEXT_PUBLIC_*)
// Fallback a Sevilla si no están definidas.
const LAT = process.env.NEXT_PUBLIC_WEATHER_LAT || '37.39';
const LON = process.env.NEXT_PUBLIC_WEATHER_LON || '-5.99';
const LOCATION_LABEL = process.env.NEXT_PUBLIC_WEATHER_LOCATION || 'Sevilla';

const buildWeatherUrl = (lat: string, lon: string) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true&timezone=auto`;

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
}

// Mapeo básico de códigos (Open-Meteo) a icono y descripción
const weatherCodeMap: Record<number, { label: string; icon: React.ReactNode }> = {
  0: { label: 'Despejado', icon: <WbSunnyIcon fontSize="inherit" /> },
  1: { label: 'Parcial', icon: <WbSunnyIcon fontSize="inherit" /> },
  2: { label: 'Nubes dispersas', icon: <CloudIcon fontSize="inherit" /> },
  3: { label: 'Nublado', icon: <CloudIcon fontSize="inherit" /> },
  45: { label: 'Niebla', icon: <GrainIcon fontSize="inherit" /> },
  48: { label: 'Niebla', icon: <GrainIcon fontSize="inherit" /> },
  51: { label: 'Llovizna', icon: <GrainIcon fontSize="inherit" /> },
  53: { label: 'Llovizna', icon: <GrainIcon fontSize="inherit" /> },
  55: { label: 'Llovizna', icon: <GrainIcon fontSize="inherit" /> },
  61: { label: 'Lluvia ligera', icon: <GrainIcon fontSize="inherit" /> },
  63: { label: 'Lluvia', icon: <GrainIcon fontSize="inherit" /> },
  65: { label: 'Lluvia fuerte', icon: <GrainIcon fontSize="inherit" /> },
  66: { label: 'Aguanieve', icon: <AcUnitIcon fontSize="inherit" /> },
  67: { label: 'Aguanieve', icon: <AcUnitIcon fontSize="inherit" /> },
  71: { label: 'Nieve ligera', icon: <AcUnitIcon fontSize="inherit" /> },
  73: { label: 'Nieve', icon: <AcUnitIcon fontSize="inherit" /> },
  75: { label: 'Nieve intensa', icon: <AcUnitIcon fontSize="inherit" /> },
  95: { label: 'Tormenta', icon: <ThunderstormIcon fontSize="inherit" /> },
  96: { label: 'Tormenta', icon: <ThunderstormIcon fontSize="inherit" /> },
  99: { label: 'Tormenta', icon: <ThunderstormIcon fontSize="inherit" /> },
};

export default function ExternalInfoPanel() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const url = buildWeatherUrl(LAT, LON);

  const loadWeather = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
  const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('Respuesta no válida');
      const data = await res.json();
      setWeather(data.current_weather as CurrentWeather);
      setLastUpdated(new Date());
    } catch (e) {
      setWeather(null);
      setError('No disponible');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    // Auto-refresh cada 10 minutos
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  const codeInfo = weather ? weatherCodeMap[weather.weathercode] : undefined;
  const tempColor = (weather?.temperature ?? 0) >= 30 ? 'secondary.main' : 'primary.main';

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Card
        sx={theme => ({
          maxWidth: 520,
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? 'rgba(190,242,100,0.12)' : 'rgba(59,130,246,0.12)'} 0%, rgba(255,255,255,0) 70%)`,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.3)' 
              : '0 8px 32px rgba(0,0,0,0.1)'
        })}
      >
        <CardContent sx={{ pb: 2 }}>          
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 1.2, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                🌤️ Clima actual · {LOCATION_LABEL} {weather && '🎵'}
              </Typography>
              {loading ? (
                <Stack spacing={1} sx={{ mt: 1, width: 180 }}>
                  <Skeleton variant="text" width={120} height={32} />
                  <Skeleton variant="text" width={140} height={20} />
                  <Skeleton variant="text" width={100} height={18} />
                </Stack>
              ) : error ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{error}</Typography>
              ) : weather ? (
                <Fade in timeout={300}>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: tempColor, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeviceThermostatIcon fontSize="large" sx={{ opacity: 0.7 }} />
                        {Math.round(weather.temperature)}°C
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AirIcon fontSize="small" /> {Math.round(weather.windspeed)} km/h
                    </Typography>
                    {codeInfo && (
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.85 }}>
                        <Box component="span" sx={{ fontSize: 18, lineHeight: 0 }}>{codeInfo.icon}</Box> {codeInfo.label}
                      </Typography>
                    )}
                    {lastUpdated && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Actualizado: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    )}
                  </Stack>
                </Fade>
              ) : null}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, pt: 0.5 }}>
              <Tooltip title="Actualizar ahora">
                <span>
                  <IconButton
                    size="small"
                    onClick={loadWeather}
                    disabled={refreshing || loading}
                    sx={{
                      bgcolor: theme => theme.palette.action.hover,
                      '&:hover': { bgcolor: theme => theme.palette.action.selected }
                    }}
                  >
                    <RefreshIcon fontSize="small" sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                  </IconButton>
                </span>
              </Tooltip>
              {!loading && !error && codeInfo && (
                <Box sx={{ fontSize: 46, lineHeight: 1, color: 'text.primary', opacity: 0.25 }}>
                  {codeInfo.icon}
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>

        {/* Separador visual elegante */}
        {weather && (
          <Box sx={{ 
            position: 'relative',
            mx: 2, 
            my: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            },
            '&::after': {
              content: '"🎵"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }
          }} />
        )}

        {/* Integración de Spotify basada en el clima */}
        {weather && (
          <CardContent sx={{ pb: 2, pt: 0, px: 2 }}>
            <SpotifyWeatherIntegration
              weatherCode={weather.weathercode}
              temperature={weather.temperature}
            />
          </CardContent>
        )}

      </Card>
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
}
