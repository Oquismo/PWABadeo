import React, { useEffect, useState, useCallback } from 'react';
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
// import SpotifyWeatherIntegration from './SpotifyWeatherIntegration';

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

// Coordenadas configurables vÃ­a variables de entorno (NEXT_PUBLIC_*)
// Fallback a Sevilla si no estÃ¡n definidas.
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

// Mapeo bÃ¡sico de cÃ³digos (Open-Meteo) a icono y descripciÃ³n
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

// Material Design 3 Weather Theme System
const createWeatherTheme = (weatherCode: number, temperature: number, isDark: boolean, theme: any) => {
  // Base Material Design 3 tokens
  const baseTheme = {
    // Surface & Container tokens
    surface: theme.palette.surface?.main || (isDark ? '#1e1e1e' : '#ffffff'),
    surfaceVariant: theme.palette.surfaceVariant?.main || (isDark ? '#49454f' : '#f7f2fa'),
    surfaceTint: '',

    // Text tokens
    onSurface: theme.palette.onSurface?.main || (isDark ? '#e6e1e5' : '#1c1b1f'),
    onSurfaceVariant: theme.palette.onSurfaceVariant?.main || (isDark ? '#cac4d0' : '#49454f'),
    primary: theme.palette.primary?.main || (isDark ? '#d0bcff' : '#6750a4'),
    onPrimary: theme.palette.onPrimary?.main || (isDark ? '#381e72' : '#ffffff'),

    // State layers
    stateLayer: {
      hover: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.hover),
      focus: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.focus),
      pressed: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.pressed),
    },

    // Elevation
    elevation: elevationTokens.level1,

    // Motion
    motion: {
      easing: motionTokens.easing.emphasized,
      duration: motionTokens.duration.medium2,
    },

    // Special effects
    glowEffect: false,
    shimmerEffect: false,
    breatheEffect: false,
    rippleEffect: false,
  };

  // Weather-specific theme overrides
  if (weatherCode === 0 || weatherCode === 1) {
    // Clear/Sunny - Primary color scheme
    const sunnyPrimary = temperature >= 30 ? '#ff9800' : '#ff6f00';

    return {
      ...baseTheme,
      primary: sunnyPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(sunnyPrimary, 0.1),
      elevation: elevationTokens.level2,
      glowEffect: temperature >= 30,
      shimmerEffect: true,
      stateLayer: {
        hover: alpha(sunnyPrimary, stateLayers.hover),
        focus: alpha(sunnyPrimary, stateLayers.focus),
        pressed: alpha(sunnyPrimary, stateLayers.pressed),
      },
    };
  }

  if (weatherCode >= 2 && weatherCode <= 3) {
    // Cloudy - Secondary color scheme
    const cloudyPrimary = '#607d8b';

    return {
      ...baseTheme,
      primary: cloudyPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(cloudyPrimary, 0.08),
      elevation: elevationTokens.level3,
      stateLayer: {
        hover: alpha(cloudyPrimary, stateLayers.hover),
        focus: alpha(cloudyPrimary, stateLayers.focus),
        pressed: alpha(cloudyPrimary, stateLayers.pressed),
      },
    };
  }

  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    // Rain - Tertiary color scheme
    const rainPrimary = '#2196f3';

    return {
      ...baseTheme,
      primary: rainPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(rainPrimary, 0.12),
      elevation: elevationTokens.level4,
      rippleEffect: true,
      stateLayer: {
        hover: alpha(rainPrimary, stateLayers.hover),
        focus: alpha(rainPrimary, stateLayers.focus),
        pressed: alpha(rainPrimary, stateLayers.pressed),
      },
    };
  }

  if (weatherCode >= 71 && weatherCode <= 77) {
    // Snow - Surface color scheme
    const snowPrimary = '#00bcd4';

    return {
      ...baseTheme,
      primary: snowPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(snowPrimary, 0.15),
      elevation: elevationTokens.level2,
      glowEffect: true,
      shimmerEffect: true,
      breatheEffect: true,
      stateLayer: {
        hover: alpha(snowPrimary, stateLayers.hover),
        focus: alpha(snowPrimary, stateLayers.focus),
        pressed: alpha(snowPrimary, stateLayers.pressed),
      },
    };
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    // Thunderstorm - Error color scheme
    const stormPrimary = '#ff5722';

    return {
      ...baseTheme,
      primary: stormPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(stormPrimary, 0.18),
      elevation: elevationTokens.level5,
      glowEffect: true,
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
  };
};

export default function ExternalInfoPanel() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState(0); // 0: hoy, 1-3: prÃ³ximos dÃ­as
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

  // Obtener tema dinÃ¡mico basado en el clima actual
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
      if (!res.ok) throw new Error('Respuesta no vÃ¡lida');
      const data: WeatherData = await res.json();
      setWeather(data.current_weather);
      setDailyForecast(data.daily);
      setLastUpdated(new Date());
    } catch (e) {
      setWeather(null);
      setDailyForecast(null);
      setError('No disponible');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [url]);

  useEffect(() => {
    loadWeather();
    // Auto-refresh cada 10 minutos
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    if (direction === 'left' && currentView < 3) {
      setCurrentView(prev => prev + 1);
    } else if (direction === 'right' && currentView > 0) {
      setCurrentView(prev => prev - 1);
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Soporte para gestos tÃ¡ctiles
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

    if (isLeftSwipe) {
      handleSwipe('left');
    } else if (isRightSwipe) {
      handleSwipe('right');
    }
  };

  const getDayLabel = (index: number) => {
    if (index === 0) return 'Hoy';
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  };

  const renderCurrentWeather = () => {
    if (!weather) return null;

    const codeInfo = weatherCodeMap[weather.weathercode];
    const weatherTheme = currentWeatherTheme;

    return (
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: weatherTheme?.primary || 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textShadow: weatherTheme?.glowEffect ? `0 0 10px ${weatherTheme.primary}40` : 'none',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              animation: weatherTheme?.breatheEffect ? `${breatheAnimation} 4s ease-in-out infinite` : 'none',
            }}
          >
            <DeviceThermostatIcon
              fontSize="large"
              sx={{
                opacity: 0.7,
                color: weatherTheme?.primary || 'inherit',
                filter: weatherTheme?.glowEffect ? `drop-shadow(0 0 8px ${weatherTheme.primary}60)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            />
            {Math.round(weather.temperature)}Â°C
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: weatherTheme?.onSurfaceVariant || 'text.primary',
            transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <AirIcon
            fontSize="small"
            sx={{
              color: weatherTheme?.primary || 'inherit',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          />
          {Math.round(weather.windspeed)} km/h
        </Typography>
        {codeInfo && (
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              opacity: 0.85,
              color: weatherTheme?.onSurfaceVariant || 'text.primary',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 18,
                lineHeight: 0,
                color: weatherTheme?.primary || 'inherit',
                filter: weatherTheme?.glowEffect ? `drop-shadow(0 0 6px ${weatherTheme.primary}80)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            >
              {codeInfo.icon}
            </Box>
            {codeInfo.label}
          </Typography>
        )}
        {lastUpdated && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              opacity: 0.7,
              color: weatherTheme?.onSurfaceVariant || 'text.secondary',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            Actualizado: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        )}
      </Stack>
    );
  };

  const renderForecastDay = (dayIndex: number) => {
    if (!dailyForecast || dayIndex >= dailyForecast.time.length) return null;

    const codeInfo = weatherCodeMap[dailyForecast.weathercode[dayIndex]];
    const maxTemp = Math.round(dailyForecast.temperature_2m_max[dayIndex]);
    const minTemp = Math.round(dailyForecast.temperature_2m_min[dayIndex]);
    const windSpeed = Math.round(dailyForecast.windspeed_10m_max[dayIndex]);

    // Usar tema basado en el pronÃ³stico del dÃ­a especÃ­fico
    const dayTheme = createWeatherTheme(dailyForecast.weathercode[dayIndex], maxTemp, isDarkMode, theme);

    return (
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: dayTheme.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textShadow: dayTheme.glowEffect ? `0 0 10px ${dayTheme.primary}40` : 'none',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              animation: dayTheme.breatheEffect ? `${breatheAnimation} 4s ease-in-out infinite` : 'none',
            }}
          >
            <DeviceThermostatIcon
              fontSize="large"
              sx={{
                opacity: 0.7,
                color: dayTheme.primary,
                filter: dayTheme.glowEffect ? `drop-shadow(0 0 8px ${dayTheme.primary}60)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            />
            {maxTemp}Â°C
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: dayTheme.onSurfaceVariant,
            transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Min: {minTemp}Â°C</span>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: dayTheme.onSurfaceVariant,
            transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <AirIcon
            fontSize="small"
            sx={{ color: dayTheme.primary }}
          />
          {windSpeed} km/h
        </Typography>
        {codeInfo && (
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              opacity: 0.85,
              color: dayTheme.onSurfaceVariant,
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 18,
                lineHeight: 0,
                color: dayTheme.primary,
                filter: dayTheme.glowEffect ? `drop-shadow(0 0 6px ${dayTheme.primary}80)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            >
              {codeInfo.icon}
            </Box>
            {codeInfo.label}
          </Typography>
        )}
      </Stack>
    );
  };

  const codeInfo = weather ? weatherCodeMap[weather.weathercode] : undefined;

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Card
        sx={{
          maxWidth: 520,
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          background: currentWeatherTheme?.surface || theme.palette.surface?.main || theme.palette.background.paper,
          border: `1px solid ${currentWeatherTheme?.surfaceVariant || theme.palette.divider}`,
          backdropFilter: 'blur(12px)',
          borderRadius: 3,
          boxShadow: currentWeatherTheme?.elevation?.boxShadow || elevationTokens.level1.boxShadow,
          userSelect: 'none',
          transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          '&::before': currentWeatherTheme?.shimmerEffect ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent, ${alpha(currentWeatherTheme.primary, 0.1)}, transparent)`,
            backgroundSize: '200px 100%',
            animation: `${shimmerAnimation} 3s ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0
          } : {},
          '& > *': {
            position: 'relative',
            zIndex: 1
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent sx={{ pb: 2 }}>
          {/* Header con navegaciÃ³n */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 1.2,
                  opacity: 0.8,
                  color: currentWeatherTheme?.onSurfaceVariant || 'text.secondary',
                  transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                }}
              >
                ðŸŒ¤ï¸ {getDayLabel(currentView)} Â· {LOCATION_LABEL}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Actualizar ahora">
                <span>
                  <IconButton
                    size="small"
                    onClick={loadWeather}
                    disabled={refreshing || loading}
                    sx={{
                      bgcolor: 'transparent',
                      transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                      '&:hover': {
                        bgcolor: currentWeatherTheme?.stateLayer?.hover || alpha(theme.palette.primary.main, stateLayers.hover),
                      },
                      '&:focus': {
                        bgcolor: currentWeatherTheme?.stateLayer?.focus || alpha(theme.palette.primary.main, stateLayers.focus),
                      },
                      '&:active': {
                        bgcolor: currentWeatherTheme?.stateLayer?.pressed || alpha(theme.palette.primary.main, stateLayers.pressed),
                      },
                    }}
                  >
                    <RefreshIcon
                      fontSize="small"
                      sx={{
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        color: currentWeatherTheme?.primary || 'primary.main',
                        transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Stack>

          {/* Contenido principal con transiciÃ³n */}
          <Box
            sx={{
              position: 'relative',
              minHeight: 120,
              overflow: 'hidden'
            }}
          >
            <Fade in={!isTransitioning} timeout={300}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box>
                  {loading ? (
                    <Stack spacing={1} sx={{ mt: 1, width: 180 }}>
                      <Skeleton
                        variant="text"
                        width={120}
                        height={32}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 1,
                        }}
                      />
                      <Skeleton
                        variant="text"
                        width={140}
                        height={20}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderRadius: 1,
                        }}
                      />
                      <Skeleton
                        variant="text"
                        width={100}
                        height={18}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          borderRadius: 1,
                        }}
                      />
                    </Stack>
                  ) : error ? (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: theme.palette.error.main,
                        transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                      }}
                    >
                      {error}
                    </Typography>
                  ) : currentView === 0 ? (
                    renderCurrentWeather()
                  ) : (
                    renderForecastDay(currentView)
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, pt: 0.5 }}>
                  {!loading && !error && (
                    <Box
                      sx={{
                        fontSize: 46,
                        lineHeight: 1,
                        color: currentWeatherTheme?.primary || 'text.primary',
                        opacity: 0.25,
                        transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                        filter: currentWeatherTheme?.glowEffect ? `drop-shadow(0 0 10px ${currentWeatherTheme.primary}40)` : 'none',
                      }}
                    >
                      {currentView === 0 && codeInfo ? codeInfo.icon :
                       dailyForecast && weatherCodeMap[dailyForecast.weathercode[currentView]]?.icon}
                    </Box>
                  )}
                </Box>
              </Stack>
            </Fade>
          </Box>

          {/* Indicadores de deslizamiento para mÃ³vil */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.5,
            mt: 2,
            opacity: 0.6
          }}>
            {[0, 1, 2, 3].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: currentView === index
                    ? (currentWeatherTheme?.primary || 'primary.main')
                    : 'action.disabled',
                  transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                  cursor: 'pointer',
                  boxShadow: currentView === index && currentWeatherTheme?.glowEffect
                    ? `0 0 8px ${currentWeatherTheme.primary}60`
                    : 'none'
                }}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentView(index);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }
                }}
              />
            ))}

            {/* IndicaciÃ³n de deslizamiento */}
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                opacity: 0.4,
                fontSize: '0.65rem',
                display: { xs: 'block', sm: 'none' }, // Solo visible en mÃ³vil
                color: currentWeatherTheme?.onSurfaceVariant || 'text.secondary',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            >
              â† Desliza â†’
            </Typography>
          </Box>
        </CardContent>
      </Card>

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

const shimmerAnimation = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const rippleAnimation = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
`;

// Coordenadas configurables vÃ­a variables de entorno (NEXT_PUBLIC_*)
// Fallback a Sevilla si no estÃ¡n definidas.
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

// Mapeo bÃ¡sico de cÃ³digos (Open-Meteo) a icono y descripciÃ³n
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

// Material Design 3 Weather Theme System
const createWeatherTheme = (weatherCode: number, temperature: number, isDark: boolean, theme: any) => {
  // Base Material Design 3 tokens
  const baseTheme = {
    // Surface & Container tokens
    surface: theme.palette.surface?.main || (isDark ? '#1e1e1e' : '#ffffff'),
    surfaceVariant: theme.palette.surfaceVariant?.main || (isDark ? '#49454f' : '#f7f2fa'),
    surfaceTint: '',

    // Text tokens
    onSurface: theme.palette.onSurface?.main || (isDark ? '#e6e1e5' : '#1c1b1f'),
    onSurfaceVariant: theme.palette.onSurfaceVariant?.main || (isDark ? '#cac4d0' : '#49454f'),
    primary: theme.palette.primary?.main || (isDark ? '#d0bcff' : '#6750a4'),
    onPrimary: theme.palette.onPrimary?.main || (isDark ? '#381e72' : '#ffffff'),

    // State layers
    stateLayer: {
      hover: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.hover),
      focus: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.focus),
      pressed: alpha(theme.palette.primary?.main || '#6750a4', stateLayers.pressed),
    },

    // Elevation
    elevation: elevationTokens.level1,

    // Motion
    motion: {
      easing: motionTokens.easing.emphasized,
      duration: motionTokens.duration.medium2,
    },

    // Special effects
    glowEffect: false,
    shimmerEffect: false,
    breatheEffect: false,
    rippleEffect: false,
  };

  // Weather-specific theme overrides
  if (weatherCode === 0 || weatherCode === 1) {
    // Clear/Sunny - Primary color scheme
    const sunnyPrimary = temperature >= 30 ? '#ff9800' : '#ff6f00';

    return {
      ...baseTheme,
      primary: sunnyPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(sunnyPrimary, 0.1),
      elevation: elevationTokens.level2,
      glowEffect: temperature >= 30,
      shimmerEffect: true,
      stateLayer: {
        hover: alpha(sunnyPrimary, stateLayers.hover),
        focus: alpha(sunnyPrimary, stateLayers.focus),
        pressed: alpha(sunnyPrimary, stateLayers.pressed),
      },
    };
  }

  if (weatherCode >= 2 && weatherCode <= 3) {
    // Cloudy - Secondary color scheme
    const cloudyPrimary = '#607d8b';

    return {
      ...baseTheme,
      primary: cloudyPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(cloudyPrimary, 0.08),
      elevation: elevationTokens.level3,
      stateLayer: {
        hover: alpha(cloudyPrimary, stateLayers.hover),
        focus: alpha(cloudyPrimary, stateLayers.focus),
        pressed: alpha(cloudyPrimary, stateLayers.pressed),
      },
    };
  }

  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    // Rain - Tertiary color scheme
    const rainPrimary = '#2196f3';

    return {
      ...baseTheme,
      primary: rainPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(rainPrimary, 0.12),
      elevation: elevationTokens.level4,
      rippleEffect: true,
      stateLayer: {
        hover: alpha(rainPrimary, stateLayers.hover),
        focus: alpha(rainPrimary, stateLayers.focus),
        pressed: alpha(rainPrimary, stateLayers.pressed),
      },
    };
  }

  if (weatherCode >= 71 && weatherCode <= 77) {
    // Snow - Surface color scheme
    const snowPrimary = '#00bcd4';

    return {
      ...baseTheme,
      primary: snowPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(snowPrimary, 0.15),
      elevation: elevationTokens.level2,
      glowEffect: true,
      shimmerEffect: true,
      breatheEffect: true,
      stateLayer: {
        hover: alpha(snowPrimary, stateLayers.hover),
        focus: alpha(snowPrimary, stateLayers.focus),
        pressed: alpha(snowPrimary, stateLayers.pressed),
      },
    };
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    // Thunderstorm - Error color scheme
    const stormPrimary = '#ff5722';

    return {
      ...baseTheme,
      primary: stormPrimary,
      onPrimary: '#ffffff',
      surfaceTint: alpha(stormPrimary, 0.18),
      elevation: elevationTokens.level5,
      glowEffect: true,
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
  };
};

export default function ExternalInfoPanel() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState(0); // 0: hoy, 1-3: prÃ³ximos dÃ­as
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

  // Obtener tema dinÃ¡mico basado en el clima actual
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
      if (!res.ok) throw new Error('Respuesta no vÃ¡lida');
      const data: WeatherData = await res.json();
      setWeather(data.current_weather);
      setDailyForecast(data.daily);
      setLastUpdated(new Date());
    } catch (e) {
      setWeather(null);
      setDailyForecast(null);
      setError('No disponible');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [url]);

  useEffect(() => {
    loadWeather();
    // Auto-refresh cada 10 minutos
    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    if (direction === 'left' && currentView < 3) {
      setCurrentView(prev => prev + 1);
    } else if (direction === 'right' && currentView > 0) {
      setCurrentView(prev => prev - 1);
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Soporte para gestos tÃ¡ctiles
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

    if (isLeftSwipe) {
      handleSwipe('left');
    } else if (isRightSwipe) {
      handleSwipe('right');
    }
  };

  const getDayLabel = (index: number) => {
    if (index === 0) return 'Hoy';
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  };

  const renderCurrentWeather = () => {
    if (!weather) return null;

    const codeInfo = weatherCodeMap[weather.weathercode];
    const weatherTheme = currentWeatherTheme;

    return (
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: weatherTheme?.primary || 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textShadow: weatherTheme?.glowEffect ? `0 0 10px ${weatherTheme.primary}40` : 'none',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              animation: weatherTheme?.breatheEffect ? `${breatheAnimation} 4s ease-in-out infinite` : 'none',
            }}
          >
            <DeviceThermostatIcon
              fontSize="large"
              sx={{
                opacity: 0.7,
                color: weatherTheme?.primary || 'inherit',
                filter: weatherTheme?.glowEffect ? `drop-shadow(0 0 8px ${weatherTheme.primary}60)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            />
            {Math.round(weather.temperature)}Â°C
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: weatherTheme?.onSurfaceVariant || 'text.primary',
            transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <AirIcon
            fontSize="small"
            sx={{
              color: weatherTheme?.primary || 'inherit',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          />
          {Math.round(weather.windspeed)} km/h
        </Typography>
        {codeInfo && (
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              opacity: 0.85,
              color: weatherTheme?.onSurfaceVariant || 'text.primary',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 18,
                lineHeight: 0,
                color: weatherTheme?.primary || 'inherit',
                filter: weatherTheme?.glowEffect ? `drop-shadow(0 0 6px ${weatherTheme.primary}80)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            >
              {codeInfo.icon}
            </Box>
            {codeInfo.label}
          </Typography>
        )}
        {lastUpdated && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              opacity: 0.7,
              color: weatherTheme?.onSurfaceVariant || 'text.secondary',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            Actualizado: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        )}
      </Stack>
    );
  };

  const renderForecastDay = (dayIndex: number) => {
    if (!dailyForecast || dayIndex >= dailyForecast.time.length) return null;

    const codeInfo = weatherCodeMap[dailyForecast.weathercode[dayIndex]];
    const maxTemp = Math.round(dailyForecast.temperature_2m_max[dayIndex]);
    const minTemp = Math.round(dailyForecast.temperature_2m_min[dayIndex]);
    const windSpeed = Math.round(dailyForecast.windspeed_10m_max[dayIndex]);

    // Usar tema basado en el pronÃ³stico del dÃ­a especÃ­fico
    const dayTheme = createWeatherTheme(dailyForecast.weathercode[dayIndex], maxTemp, isDarkMode, theme);

    return (
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: dayTheme.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textShadow: dayTheme.glowEffect ? `0 0 10px ${dayTheme.primary}40` : 'none',
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              animation: dayTheme.breatheEffect ? `${breatheAnimation} 4s ease-in-out infinite` : 'none',
            }}
          >
            <DeviceThermostatIcon
              fontSize="large"
              sx={{
                opacity: 0.7,
                color: dayTheme.primary,
                filter: dayTheme.glowEffect ? `drop-shadow(0 0 8px ${dayTheme.primary}60)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            />
            {maxTemp}Â°C
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: dayTheme.onSurfaceVariant,
            transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Min: {minTemp}Â°C</span>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: dayTheme.onSurfaceVariant,
            transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <AirIcon
            fontSize="small"
            sx={{ color: dayTheme.primary }}
          />
          {windSpeed} km/h
        </Typography>
        {codeInfo && (
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              opacity: 0.85,
              color: dayTheme.onSurfaceVariant,
              transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 18,
                lineHeight: 0,
                color: dayTheme.primary,
                filter: dayTheme.glowEffect ? `drop-shadow(0 0 6px ${dayTheme.primary}80)` : 'none',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            >
              {codeInfo.icon}
            </Box>
            {codeInfo.label}
          </Typography>
        )}
      </Stack>
    );
  };

  const codeInfo = weather ? weatherCodeMap[weather.weathercode] : undefined;

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Card
        sx={{
          maxWidth: 520,
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          background: currentWeatherTheme?.surface || theme.palette.surface?.main || theme.palette.background.paper,
          border: `1px solid ${currentWeatherTheme?.surfaceVariant || theme.palette.divider}`,
          backdropFilter: 'blur(12px)',
          borderRadius: 3,
          boxShadow: currentWeatherTheme?.elevation?.boxShadow || elevationTokens.level1.boxShadow,
          userSelect: 'none',
          transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          '&::before': currentWeatherTheme?.shimmerEffect ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent, ${alpha(currentWeatherTheme.primary, 0.1)}, transparent)`,
            backgroundSize: '200px 100%',
            animation: `${shimmerAnimation} 3s ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0
          } : {},
          '& > *': {
            position: 'relative',
            zIndex: 1
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent sx={{ pb: 2 }}>
          {/* Header con navegaciÃ³n */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 1.2,
                  opacity: 0.8,
                  color: currentWeatherTheme?.onSurfaceVariant || 'text.secondary',
                  transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                }}
              >
                ðŸŒ¤ï¸ {getDayLabel(currentView)} Â· {LOCATION_LABEL}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Actualizar ahora">
                <span>
                  <IconButton
                    size="small"
                    onClick={loadWeather}
                    disabled={refreshing || loading}
                    sx={{
                      bgcolor: 'transparent',
                      transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                      '&:hover': {
                        bgcolor: currentWeatherTheme?.stateLayer?.hover || alpha(theme.palette.primary.main, stateLayers.hover),
                      },
                      '&:focus': {
                        bgcolor: currentWeatherTheme?.stateLayer?.focus || alpha(theme.palette.primary.main, stateLayers.focus),
                      },
                      '&:active': {
                        bgcolor: currentWeatherTheme?.stateLayer?.pressed || alpha(theme.palette.primary.main, stateLayers.pressed),
                      },
                    }}
                  >
                    <RefreshIcon
                      fontSize="small"
                      sx={{
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        color: currentWeatherTheme?.primary || 'primary.main',
                        transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Stack>

          {/* Contenido principal con transiciÃ³n */}
          <Box
            sx={{
              position: 'relative',
              minHeight: 120,
              overflow: 'hidden'
            }}
          >
            <Fade in={!isTransitioning} timeout={300}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box>
                  {loading ? (
                    <Stack spacing={1} sx={{ mt: 1, width: 180 }}>
                      <Skeleton
                        variant="text"
                        width={120}
                        height={32}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 1,
                        }}
                      />
                      <Skeleton
                        variant="text"
                        width={140}
                        height={20}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderRadius: 1,
                        }}
                      />
                      <Skeleton
                        variant="text"
                        width={100}
                        height={18}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          borderRadius: 1,
                        }}
                      />
                    </Stack>
                  ) : error ? (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: theme.palette.error.main,
                        transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                      }}
                    >
                      {error}
                    </Typography>
                  ) : currentView === 0 ? (
                    renderCurrentWeather()
                  ) : (
                    renderForecastDay(currentView)
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, pt: 0.5 }}>
                  {!loading && !error && (
                    <Box
                      sx={{
                        fontSize: 46,
                        lineHeight: 1,
                        color: currentWeatherTheme?.primary || 'text.primary',
                        opacity: 0.25,
                        transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                        filter: currentWeatherTheme?.glowEffect ? `drop-shadow(0 0 10px ${currentWeatherTheme.primary}40)` : 'none',
                      }}
                    >
                      {currentView === 0 && codeInfo ? codeInfo.icon :
                       dailyForecast && weatherCodeMap[dailyForecast.weathercode[currentView]]?.icon}
                    </Box>
                  )}
                </Box>
              </Stack>
            </Fade>
          </Box>

          {/* Indicadores de deslizamiento para mÃ³vil */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.5,
            mt: 2,
            opacity: 0.6
          }}>
            {[0, 1, 2, 3].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: currentView === index
                    ? (currentWeatherTheme?.primary || 'primary.main')
                    : 'action.disabled',
                  transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
                  cursor: 'pointer',
                  boxShadow: currentView === index && currentWeatherTheme?.glowEffect
                    ? `0 0 8px ${currentWeatherTheme.primary}60`
                    : 'none'
                }}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentView(index);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }
                }}
              />
            ))}

            {/* IndicaciÃ³n de deslizamiento */}
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                opacity: 0.4,
                fontSize: '0.65rem',
                display: { xs: 'block', sm: 'none' }, // Solo visible en mÃ³vil
                color: currentWeatherTheme?.onSurfaceVariant || 'text.secondary',
                transition: `all ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
              }}
            >
              â† Desliza â†’
            </Typography>
          </Box>
        </CardContent>
      </Card>

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
