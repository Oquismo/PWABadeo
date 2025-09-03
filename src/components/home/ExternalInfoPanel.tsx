'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  Skeleton,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  keyframes
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
// import SpotifyWeatherIntegration from '. ';

// Material Design 3 Motion Tokens
const motionTokens = {
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerated: 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
  },
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
    extraLong3: 900,
    extraLong4: 1000,
  }
};

// Material Design 3 Elevation System
const elevationTokens = {
  level0: {
    boxShadow: 'none',
    surfaceTint: 0,
  },
  level1: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    surfaceTint: 0.05,
  },
  level2: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
    surfaceTint: 0.08,
  },
  level3: {
    boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
    surfaceTint: 0.11,
  },
  level4: {
    boxShadow: '0px 2px 3px 0px rgba(0, 0, 0, 0.30), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
    surfaceTint: 0.12,
  },
  level5: {
    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.30), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
    surfaceTint: 0.14,
  },
};

// Material Design 3 State Layers
const stateLayers = {
  hover: 0.08,
  focus: 0.12,
  pressed: 0.12,
  dragged: 0.16,
};

// Keyframes para animaciones Material Design 3
const breatheAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const rippleAnimation = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
`;

// Coordenadas configurables vía variables de entorno (NEXT_PUBLIC_*)
// Fallback a Sevilla si no están definidas.
const LAT = process.env.NEXT_PUBLIC_WEATHER_LAT || '37.39';
const LON = process.env.NEXT_PUBLIC_WEATHER_LON || '-5.99';
const LOCATION_LABEL = process.env.NEXT_PUBLIC_WEATHER_LOCATION || 'Sevilla';

const buildWeatherUrl = (lat: string, lon: string) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=auto&forecast_days=4`;

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
}

interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  windspeed_10m_max: number[];
}

interface WeatherData {
  current_weather: CurrentWeather;
  daily: DailyForecast;
}

// Mapeo básico de códigos (Open-Meteo) a icono y descripción
const weatherCodeMap: Record<number, { label: string; icon: React.ReactElement }> = {
  0: { label: 'weather.clear', icon: <WbSunnyIcon fontSize="inherit" /> },
  1: { label: 'weather.mostlyClear', icon: <WbSunnyIcon fontSize="inherit" /> },
  2: { label: 'weather.partlyCloudy', icon: <CloudIcon fontSize="inherit" /> },
  3: { label: 'weather.cloudy', icon: <CloudIcon fontSize="inherit" /> },
  45: { label: 'weather.fog', icon: <CloudIcon fontSize="inherit" /> },
  48: { label: 'weather.frostFog', icon: <CloudIcon fontSize="inherit" /> },
  51: { label: 'weather.lightDrizzle', icon: <GrainIcon fontSize="inherit" /> },
  53: { label: 'weather.drizzle', icon: <GrainIcon fontSize="inherit" /> },
  55: { label: 'weather.heavyDrizzle', icon: <GrainIcon fontSize="inherit" /> },
  56: { label: 'weather.lightFreezingDrizzle', icon: <GrainIcon fontSize="inherit" /> },
  57: { label: 'weather.heavyFreezingDrizzle', icon: <GrainIcon fontSize="inherit" /> },
  61: { label: 'weather.lightRain', icon: <GrainIcon fontSize="inherit" /> },
  63: { label: 'weather.rain', icon: <GrainIcon fontSize="inherit" /> },
  65: { label: 'weather.heavyRain', icon: <GrainIcon fontSize="inherit" /> },
  66: { label: 'weather.lightFreezingRain', icon: <AcUnitIcon fontSize="inherit" /> },
  67: { label: 'weather.freezingRain', icon: <AcUnitIcon fontSize="inherit" /> },
  71: { label: 'weather.lightSnow', icon: <AcUnitIcon fontSize="inherit" /> },
  73: { label: 'weather.snow', icon: <AcUnitIcon fontSize="inherit" /> },
  75: { label: 'weather.heavySnow', icon: <AcUnitIcon fontSize="inherit" /> },
  77: { label: 'weather.snowGrains', icon: <AcUnitIcon fontSize="inherit" /> },
  80: { label: 'weather.lightShowers', icon: <GrainIcon fontSize="inherit" /> },
  81: { label: 'weather.showers', icon: <GrainIcon fontSize="inherit" /> },
  82: { label: 'Chubascos fuertes', icon: <GrainIcon fontSize="inherit" /> },
  85: { label: 'Chubascos de nieve ligeros', icon: <AcUnitIcon fontSize="inherit" /> },
  86: { label: 'Chubascos de nieve', icon: <AcUnitIcon fontSize="inherit" /> },
  95: { label: 'Tormenta', icon: <ThunderstormIcon fontSize="inherit" /> },
  96: { label: 'Tormenta', icon: <ThunderstormIcon fontSize="inherit" /> },
  99: { label: 'Tormenta', icon: <ThunderstormIcon fontSize="inherit" /> },
};

// Material Design 3 Weather Theme System
interface WeatherTheme {
  surface: string;
  surfaceVariant: string;
  surfaceTint: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
  stateLayer: {
    hover: string;
    focus: string;
    pressed: string;
  };
  elevation: {
    boxShadow: string;
    surfaceTint: number;
  };
  glowEffect: boolean;
  shimmerEffect: boolean;
  rippleEffect: boolean;
}

const createWeatherTheme = (weatherCode: number, temperature: number, isDark: boolean, theme: any): WeatherTheme => {
  // Base Material Design 3 tokens
  const baseTheme = {
    // Surface & Container tokens
    surface: isDark ? '#1e1e1e' : '#ffffff',
    surfaceVariant: isDark ? '#49454f' : '#f7f2fa',
    surfaceTint: '',

    // Text tokens
    onSurface: isDark ? '#e6e1e5' : '#1c1b1f',
    onSurfaceVariant: isDark ? '#cac4d0' : '#49454f',
    primary: theme.palette.primary?.main || (isDark ? '#d0bcff' : '#6750a4'),
    onPrimary: isDark ? '#381e72' : '#ffffff',

    // State layers
    stateLayer: {
      hover: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.hover),
      focus: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.focus),
      pressed: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.pressed),
    },
  };

  // Weather-specific theming
  if (weatherCode >= 0 && weatherCode <= 3) {
    // Sunny/Clear weather
    const sunnyPrimary = temperature >= 30 ? '#ff6b35' : temperature >= 25 ? '#ffb627' : '#4ade80';
    return {
      ...baseTheme,
      primary: sunnyPrimary,
      surfaceTint: alpha(sunnyPrimary, 0.08),
      elevation: elevationTokens.level1,
      glowEffect: temperature >= 30,
      shimmerEffect: true,
      rippleEffect: false,
      stateLayer: {
        hover: alpha(sunnyPrimary, stateLayers.hover),
        focus: alpha(sunnyPrimary, stateLayers.focus),
        pressed: alpha(sunnyPrimary, stateLayers.pressed),
      },
    };
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    // Fog/Mist
    const fogPrimary = '#94a3b8';
    return {
      ...baseTheme,
      primary: fogPrimary,
      surfaceTint: alpha(fogPrimary, 0.08),
      elevation: elevationTokens.level2,
      glowEffect: false,
      shimmerEffect: false,
      rippleEffect: false,
      stateLayer: {
        hover: alpha(fogPrimary, stateLayers.hover),
        focus: alpha(fogPrimary, stateLayers.focus),
        pressed: alpha(fogPrimary, stateLayers.pressed),
      },
    };
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    // Rain/Drizzle
    const rainPrimary = '#3b82f6';
    return {
      ...baseTheme,
      primary: rainPrimary,
      surfaceTint: alpha(rainPrimary, 0.08),
      elevation: elevationTokens.level3,
      glowEffect: false,
      shimmerEffect: false,
      rippleEffect: true,
      stateLayer: {
        hover: alpha(rainPrimary, stateLayers.hover),
        focus: alpha(rainPrimary, stateLayers.focus),
        pressed: alpha(rainPrimary, stateLayers.pressed),
      },
    };
  } else if (weatherCode >= 71 && weatherCode <= 86) {
    // Snow
    const snowPrimary = '#e0f2fe';
    return {
      ...baseTheme,
      primary: snowPrimary,
      surfaceTint: alpha(snowPrimary, 0.08),
      elevation: elevationTokens.level4,
      glowEffect: false,
      shimmerEffect: true,
      rippleEffect: false,
      stateLayer: {
        hover: alpha(snowPrimary, stateLayers.hover),
        focus: alpha(snowPrimary, stateLayers.focus),
        pressed: alpha(snowPrimary, stateLayers.pressed),
      },
    };
  } else if (weatherCode >= 95 && weatherCode <= 99) {
    // Thunderstorm
    const stormPrimary = '#7c3aed';
    return {
      ...baseTheme,
      primary: stormPrimary,
      surfaceTint: alpha(stormPrimary, 0.08),
      elevation: elevationTokens.level5,
      glowEffect: true,
      shimmerEffect: false,
      rippleEffect: true,
      stateLayer: {
        hover: alpha(stormPrimary, stateLayers.hover),
        focus: alpha(stormPrimary, stateLayers.focus),
        pressed: alpha(stormPrimary, stateLayers.pressed),
      },
    };
  }

  // Default theme
  return {
    ...baseTheme,
    primary: theme.palette.primary?.main || '#6750a4',
    surfaceTint: alpha(theme.palette.primary?.main || '#6750a4', 0.08),
    elevation: elevationTokens.level1,
    glowEffect: false,
    shimmerEffect: false,
    rippleEffect: false,
  };
};

export default function ExternalInfoPanel() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState(0); // 0: hoy, 1-3: próximos días
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useTheme();
  const url = buildWeatherUrl(LAT, LON);

  // Detectar tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Obtener tema dinámico basado en el clima actual
  const currentWeatherTheme = weather
    ? createWeatherTheme(weather.weathercode, weather.temperature, isDarkMode, theme)
    : null;

  const loadWeather = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('Respuesta no válida');
      const data: WeatherData = await res.json();
      setWeather(data.current_weather);
      setDailyForecast(data.daily);
      setLastUpdated(new Date());
    } catch (e) {
      setWeather(null);
      setDailyForecast(null);
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [url]);

  // Cargar datos iniciales
  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Soporte para gestos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentView < 3) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    }

    if (isRightSwipe && currentView > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  // Función para obtener el pronóstico del día específico
  const getForecastForDay = (dayIndex: number) => {
    if (!dailyForecast || !dailyForecast.time[dayIndex]) return null;

    return {
      date: new Date(dailyForecast.time[dayIndex]),
      weathercode: dailyForecast.weathercode[dayIndex],
      tempMax: dailyForecast.temperature_2m_max[dayIndex],
      tempMin: dailyForecast.temperature_2m_min[dayIndex],
      windSpeed: dailyForecast.windspeed_10m_max[dayIndex],
    };
  };

  // Usar tema basado en el pronóstico del día específico
  const forecastDay = getForecastForDay(currentView);
  const displayWeatherTheme = forecastDay && currentView > 0
    ? createWeatherTheme(forecastDay.weathercode, forecastDay.tempMax, isDarkMode, theme)
    : currentWeatherTheme;

  if (loading && !weather) {
    return (
      <Card
        sx={{
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.background.paper,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="text" width={80} height={20} />
        </Stack>
      </Card>
    );
  }

  if (error && !weather) {
    return (
      <Card
        sx={{
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.error.main,
          color: theme.palette.error.contrastText,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Error al cargar el clima
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {error}
        </Typography>
        <IconButton
          onClick={loadWeather}
          sx={{ color: 'inherit' }}
          disabled={refreshing}
        >
          <RefreshIcon />
        </IconButton>
      </Card>
    );
  }

  const currentWeather = weather;
  const { t } = useTranslation();
  const weatherInfo = currentWeather ? weatherCodeMap[currentWeather.weathercode] : null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 250,
        background: displayWeatherTheme?.surface || theme.palette.background.paper,
        borderRadius: 3,
        overflow: 'hidden',
        transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.standard}`,
        boxShadow: displayWeatherTheme?.elevation?.boxShadow || elevationTokens.level1.boxShadow,
        '&::before': displayWeatherTheme?.glowEffect ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at center, ${alpha(displayWeatherTheme.primary, 0.1)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        } : undefined,
      }}
    >
      {/* Header con navegación */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          pb: 1,
          background: alpha(displayWeatherTheme?.surface || theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {LOCATION_LABEL}
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Actualizado: {lastUpdated.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Indicadores de navegación */}
          <Stack direction="row" spacing={0.5}>
            {[0, 1, 2, 3].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: currentView === index
                    ? displayWeatherTheme?.primary || theme.palette.primary.main
                    : alpha(theme.palette.text.secondary, 0.3),
                  transition: `all ${motionTokens.duration.short2}ms ${motionTokens.easing.standard}`,
                }}
              />
            ))}
          </Stack>

          <Tooltip title="Actualizar">
            <IconButton
              onClick={loadWeather}
              disabled={refreshing}
              sx={{
                color: displayWeatherTheme?.primary || theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: displayWeatherTheme?.stateLayer?.hover || alpha(theme.palette.action.hover, 0.08),
                },
              }}
            >
              <RefreshIcon
                sx={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Contenido principal con transición */}
      <Fade in={!isTransitioning} timeout={300}>
        <Box
          sx={{
            p: 2,
            pt: 0,
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            cursor: { xs: 'grab', sm: 'default' },
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentView === 0 ? (
            // Vista del clima actual
            <Stack spacing={2} alignItems="center">
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    fontSize: { xs: 60, sm: 80 },
                    mb: 1,
                    animation: displayWeatherTheme?.shimmerEffect
                      ? `${shimmerAnimation} 3s ease-in-out infinite`
                      : `${breatheAnimation} 4s ease-in-out infinite`,
                    background: displayWeatherTheme?.shimmerEffect
                      ? `linear-gradient(90deg, ${displayWeatherTheme.primary} 0%, ${alpha(displayWeatherTheme.primary, 0.5)} 50%, ${displayWeatherTheme.primary} 100%)`
                      : 'none',
                    backgroundSize: '200px 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: displayWeatherTheme?.shimmerEffect ? 'transparent' : 'inherit',
                    color: displayWeatherTheme?.shimmerEffect ? undefined : displayWeatherTheme?.primary || theme.palette.text.primary,
                  }}
                >
                  {weatherInfo?.icon}
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 300,
                    mb: 1,
                    color: displayWeatherTheme?.primary || theme.palette.text.primary,
                  }}
                >
                  {currentWeather?.temperature}°C
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 1.5,
                    color: displayWeatherTheme?.onSurface || theme.palette.text.secondary,
                  }}
                >
                  {weatherInfo ? t(weatherInfo.label) : ''}
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                  <Box sx={{ textAlign: 'center' }}>
                    <AirIcon sx={{ mb: 0.5, opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {currentWeather?.windspeed} km/h
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          ) : (
            // Vista del pronóstico
            <Stack spacing={2} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {forecastDay?.date.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </Typography>

              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    fontSize: 56,
                    mb: 2,
                    color: displayWeatherTheme?.primary || theme.palette.text.primary,
                  }}
                >
                  {forecastDay ? weatherCodeMap[forecastDay.weathercode]?.icon : null}
                </Box>

                <Typography variant="h4" sx={{ mb: 1, fontWeight: 300 }}>
                  {forecastDay?.tempMax}° / {forecastDay?.tempMin}°
                </Typography>

                <Typography variant="body1" sx={{ mb: 1.5, opacity: 0.8 }}>
                  {forecastDay ? t(weatherCodeMap[forecastDay.weathercode]?.label || '') : ''}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <AirIcon sx={{ opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {forecastDay?.windSpeed} km/h
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </Box>
      </Fade>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes weather-particles {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(3px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 5px currentColor); }
          50% { filter: brightness(1.2) drop-shadow(0 0 15px currentColor); }
        }
      `}</style>
    </Box>
  );
}
