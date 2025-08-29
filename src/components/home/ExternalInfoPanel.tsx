import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Card, CardContent, IconButton, Stack, Skeleton, Tooltip, Fade, Chip, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AirIcon from '@mui/icons-material/Air';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SpotifyWeatherIntegration from './SpotifyWeatherIntegration';

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

// Sistema de temas dinámicos basados en el clima
const getWeatherTheme = (weatherCode: number, temperature: number, isDark: boolean) => {
  const baseTheme = {
    cardBackground: '',
    textPrimary: '',
    textSecondary: '',
    iconColor: '',
    shadowColor: '',
    borderColor: '',
    gradientStart: '',
    gradientEnd: '',
    accentColor: '',
    glowEffect: false,
    particles: false
  };

  // Temas según condiciones meteorológicas
  if (weatherCode === 0 || weatherCode === 1) {
    // Día soleado
    if (temperature >= 30) {
      // Calor extremo - tema naranja/rojo
      return {
        ...baseTheme,
        cardBackground: isDark 
          ? 'linear-gradient(135deg, rgba(255,140,0,0.15) 0%, rgba(255,69,0,0.08) 50%, rgba(0,0,0,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(255,200,87,0.2) 0%, rgba(255,154,0,0.12) 50%, rgba(255,255,255,0.3) 100%)',
        textPrimary: isDark ? '#FFB74D' : '#FF8F00',
        textSecondary: isDark ? '#FFCC02' : '#F57C00',
        iconColor: '#FF9800',
        shadowColor: isDark ? 'rgba(255,152,0,0.3)' : 'rgba(255,152,0,0.2)',
        borderColor: isDark ? 'rgba(255,193,7,0.3)' : 'rgba(255,193,7,0.4)',
        gradientStart: '#FFB74D',
        gradientEnd: '#FF8F00',
        accentColor: '#FF9800',
        glowEffect: true
      };
    } else {
      // Día normal soleado - tema azul/dorado
      return {
        ...baseTheme,
        cardBackground: isDark 
          ? 'linear-gradient(135deg, rgba(100,181,246,0.12) 0%, rgba(255,193,7,0.08) 50%, rgba(0,0,0,0.02) 100%)'
          : 'linear-gradient(135deg, rgba(144,202,249,0.25) 0%, rgba(255,241,118,0.15) 50%, rgba(255,255,255,0.4) 100%)',
        textPrimary: isDark ? '#81C784' : '#2E7D32',
        textSecondary: isDark ? '#A5D6A7' : '#388E3C',
        iconColor: '#FFC107',
        shadowColor: isDark ? 'rgba(129,199,132,0.25)' : 'rgba(46,125,50,0.15)',
        borderColor: isDark ? 'rgba(165,214,167,0.3)' : 'rgba(129,199,132,0.4)',
        gradientStart: '#81C784',
        gradientEnd: '#4CAF50',
        accentColor: '#66BB6A'
      };
    }
  }

  if (weatherCode >= 2 && weatherCode <= 3) {
    // Nublado - tema gris/azul
    return {
      ...baseTheme,
      cardBackground: isDark 
        ? 'linear-gradient(135deg, rgba(96,125,139,0.15) 0%, rgba(69,90,100,0.08) 50%, rgba(0,0,0,0.02) 100%)'
        : 'linear-gradient(135deg, rgba(176,190,197,0.3) 0%, rgba(144,164,174,0.2) 50%, rgba(255,255,255,0.4) 100%)',
      textPrimary: isDark ? '#90A4AE' : '#455A64',
      textSecondary: isDark ? '#B0BEC5' : '#546E7A',
      iconColor: '#78909C',
      shadowColor: isDark ? 'rgba(144,164,174,0.2)' : 'rgba(96,125,139,0.15)',
      borderColor: isDark ? 'rgba(176,190,197,0.25)' : 'rgba(144,164,174,0.3)',
      gradientStart: '#90A4AE',
      gradientEnd: '#607D8B',
      accentColor: '#78909C'
    };
  }

  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    // Lluvia - tema azul/gris oscuro
    return {
      ...baseTheme,
      cardBackground: isDark 
        ? 'linear-gradient(135deg, rgba(33,150,243,0.18) 0%, rgba(21,101,192,0.12) 50%, rgba(0,0,0,0.05) 100%)'
        : 'linear-gradient(135deg, rgba(100,181,246,0.25) 0%, rgba(66,165,245,0.18) 50%, rgba(255,255,255,0.3) 100%)',
      textPrimary: isDark ? '#64B5F6' : '#1976D2',
      textSecondary: isDark ? '#90CAF9' : '#1E88E5',
      iconColor: '#2196F3',
      shadowColor: isDark ? 'rgba(100,181,246,0.3)' : 'rgba(33,150,243,0.2)',
      borderColor: isDark ? 'rgba(144,202,249,0.35)' : 'rgba(100,181,246,0.4)',
      gradientStart: '#64B5F6',
      gradientEnd: '#1976D2',
      accentColor: '#2196F3',
      particles: true // Efecto de gotas
    };
  }

  if (weatherCode >= 71 && weatherCode <= 77) {
    // Nieve - tema blanco/azul claro
    return {
      ...baseTheme,
      cardBackground: isDark 
        ? 'linear-gradient(135deg, rgba(224,247,250,0.12) 0%, rgba(178,235,242,0.08) 50%, rgba(0,0,0,0.02) 100%)'
        : 'linear-gradient(135deg, rgba(240,248,255,0.8) 0%, rgba(227,242,253,0.6) 50%, rgba(255,255,255,0.9) 100%)',
      textPrimary: isDark ? '#81D4FA' : '#0277BD',
      textSecondary: isDark ? '#B3E5FC' : '#0288D1',
      iconColor: '#00BCD4',
      shadowColor: isDark ? 'rgba(129,212,250,0.25)' : 'rgba(2,119,189,0.15)',
      borderColor: isDark ? 'rgba(179,229,252,0.3)' : 'rgba(129,212,250,0.4)',
      gradientStart: '#81D4FA',
      gradientEnd: '#0277BD',
      accentColor: '#00ACC1',
      particles: true, // Efecto de copos de nieve
      glowEffect: true
    };
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    // Tormenta - tema púrpura/amarillo
    return {
      ...baseTheme,
      cardBackground: isDark 
        ? 'linear-gradient(135deg, rgba(156,39,176,0.15) 0%, rgba(103,58,183,0.12) 50%, rgba(0,0,0,0.05) 100%)'
        : 'linear-gradient(135deg, rgba(186,104,200,0.25) 0%, rgba(149,117,205,0.18) 50%, rgba(255,255,255,0.3) 100%)',
      textPrimary: isDark ? '#BA68C8' : '#7B1FA2',
      textSecondary: isDark ? '#CE93D8' : '#8E24AA',
      iconColor: '#9C27B0',
      shadowColor: isDark ? 'rgba(186,104,200,0.35)' : 'rgba(123,31,162,0.2)',
      borderColor: isDark ? 'rgba(206,147,216,0.4)' : 'rgba(186,104,200,0.45)',
      gradientStart: '#BA68C8',
      gradientEnd: '#7B1FA2',
      accentColor: '#9C27B0',
      glowEffect: true,
      particles: true // Efecto de rayos
    };
  }

  // Tema por defecto (niebla, etc.)
  return {
    ...baseTheme,
    cardBackground: isDark 
      ? 'linear-gradient(135deg, rgba(190,242,100,0.12) 0%, rgba(155,193,75,0.08) 50%, rgba(0,0,0,0.02) 100%)'
      : 'linear-gradient(135deg, rgba(200,230,201,0.3) 0%, rgba(165,214,167,0.2) 50%, rgba(255,255,255,0.4) 100%)',
    textPrimary: isDark ? '#AED581' : '#689F38',
    textSecondary: isDark ? '#C5E1A5' : '#7CB342',
    iconColor: '#8BC34A',
    shadowColor: isDark ? 'rgba(174,213,129,0.25)' : 'rgba(104,159,56,0.15)',
    borderColor: isDark ? 'rgba(197,225,165,0.3)' : 'rgba(174,213,129,0.35)',
    gradientStart: '#AED581',
    gradientEnd: '#689F38',
    accentColor: '#8BC34A'
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
    ? getWeatherTheme(weather.weathercode, weather.temperature, isDarkMode)
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
    const theme = currentWeatherTheme;
    const tempColor = theme ? theme.textPrimary : (weather.temperature >= 30 ? 'secondary.main' : 'primary.main');

    return (
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              color: tempColor,
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              textShadow: theme?.glowEffect ? `0 0 10px ${theme.accentColor}40` : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <DeviceThermostatIcon 
              fontSize="large" 
              sx={{ 
                opacity: 0.7,
                color: theme?.iconColor || 'inherit',
                filter: theme?.glowEffect ? `drop-shadow(0 0 8px ${theme.accentColor}60)` : 'none'
              }} 
            />
            {Math.round(weather.temperature)}°C
          </Typography>
        </Stack>
        <Typography 
          variant="body2" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: theme?.textSecondary || 'text.primary'
          }}
        >
          <AirIcon 
            fontSize="small" 
            sx={{ color: theme?.iconColor || 'inherit' }}
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
              color: theme?.textSecondary || 'text.primary'
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                fontSize: 18, 
                lineHeight: 0,
                color: theme?.iconColor || 'inherit',
                filter: theme?.glowEffect ? `drop-shadow(0 0 6px ${theme.accentColor}80)` : 'none'
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
            color="text.secondary" 
            sx={{ 
              mt: 0.5,
              opacity: 0.7
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
    
    // Usar tema basado en el pronóstico del día específico
    const dayTheme = getWeatherTheme(dailyForecast.weathercode[dayIndex], maxTemp, isDarkMode);

    return (
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              color: dayTheme.textPrimary,
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              textShadow: dayTheme.glowEffect ? `0 0 10px ${dayTheme.accentColor}40` : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <DeviceThermostatIcon 
              fontSize="large" 
              sx={{ 
                opacity: 0.7,
                color: dayTheme.iconColor,
                filter: dayTheme.glowEffect ? `drop-shadow(0 0 8px ${dayTheme.accentColor}60)` : 'none'
              }} 
            />
            {maxTemp}°C
          </Typography>
        </Stack>
        <Typography 
          variant="body2" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: dayTheme.textSecondary
          }}
        >
          <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Min: {minTemp}°C</span>
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: dayTheme.textSecondary
          }}
        >
          <AirIcon 
            fontSize="small" 
            sx={{ color: dayTheme.iconColor }}
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
              color: dayTheme.textSecondary
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                fontSize: 18, 
                lineHeight: 0,
                color: dayTheme.iconColor,
                filter: dayTheme.glowEffect ? `drop-shadow(0 0 6px ${dayTheme.accentColor}80)` : 'none'
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
        sx={theme => {
          const weatherTheme = currentWeatherTheme;
          const baseBackground = weatherTheme?.cardBackground || 
            `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? 'rgba(190,242,100,0.12)' : 'rgba(59,130,246,0.12)'} 0%, rgba(255,255,255,0) 70%)`;
          
          return {
            maxWidth: 520,
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            background: baseBackground,
            border: `1px solid ${weatherTheme?.borderColor || theme.palette.divider}`,
            backdropFilter: 'blur(12px)',
            borderRadius: 3,
            boxShadow: weatherTheme?.shadowColor 
              ? `0 8px 32px ${weatherTheme.shadowColor}, 0 0 20px ${weatherTheme.shadowColor}` 
              : theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0,0,0,0.3)' 
                : '0 8px 32px rgba(0,0,0,0.1)',
            userSelect: 'none',
            transition: 'all 0.5s ease',
            '&::before': weatherTheme?.particles ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: weather && weather.weathercode >= 71 && weather.weathercode <= 77 
                ? `radial-gradient(circle at 20% 80%, ${weatherTheme.accentColor}15 1px, transparent 1px),
                   radial-gradient(circle at 80% 20%, ${weatherTheme.accentColor}15 1px, transparent 1px),
                   radial-gradient(circle at 40% 40%, ${weatherTheme.accentColor}10 1px, transparent 1px)`
                : weatherTheme.particles
                ? `linear-gradient(45deg, transparent 40%, ${weatherTheme.accentColor}05 50%, transparent 60%)`
                : 'none',
              backgroundSize: '30px 30px, 50px 50px, 20px 20px',
              animation: weatherTheme.particles ? 'weather-particles 20s linear infinite' : 'none',
              pointerEvents: 'none',
              zIndex: 0
            } : {},
            '& > *': {
              position: 'relative',
              zIndex: 1
            }
          };
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent sx={{ pb: 2 }}>
          {/* Header con navegación */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="overline" sx={{ letterSpacing: 1.2, opacity: 0.8 }}>
                🌤️ {getDayLabel(currentView)} · {LOCATION_LABEL}
              </Typography>
              {/* Icono de música oculto temporalmente */}
              {/* {weather && currentView === 0 && (
                <Typography variant="overline" sx={{ opacity: 0.6 }}>🎵</Typography>
              )} */}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => handleSwipe('right')}
                disabled={currentView === 0 || isTransitioning}
                sx={{ opacity: currentView === 0 ? 0.3 : 1 }}
              >
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
              
              <Chip 
                label={`${currentView + 1}/4`} 
                size="small" 
                variant="outlined"
                sx={{ mx: 0.5, fontSize: '0.7rem', height: 20 }}
              />
              
              <IconButton
                size="small"
                onClick={() => handleSwipe('left')}
                disabled={currentView === 3 || isTransitioning}
                sx={{ opacity: currentView === 3 ? 0.3 : 1 }}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              
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
            </Box>
          </Stack>

          {/* Contenido principal con transición */}
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
                      <Skeleton variant="text" width={120} height={32} />
                      <Skeleton variant="text" width={140} height={20} />
                      <Skeleton variant="text" width={100} height={18} />
                    </Stack>
                  ) : error ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{error}</Typography>
                  ) : currentView === 0 ? (
                    renderCurrentWeather()
                  ) : (
                    renderForecastDay(currentView)
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, pt: 0.5 }}>
                  {!loading && !error && (
                    <Box sx={{ fontSize: 46, lineHeight: 1, color: 'text.primary', opacity: 0.25 }}>
                      {currentView === 0 && codeInfo ? codeInfo.icon : 
                       dailyForecast && weatherCodeMap[dailyForecast.weathercode[currentView]]?.icon}
                    </Box>
                  )}
                </Box>
              </Stack>
            </Fade>
          </Box>

          {/* Indicadores de deslizamiento para móvil */}
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
                    ? (currentWeatherTheme?.accentColor || 'primary.main')
                    : 'action.disabled',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: currentView === index && currentWeatherTheme?.glowEffect 
                    ? `0 0 8px ${currentWeatherTheme.accentColor}60` 
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
            
            {/* Indicación de deslizamiento */}
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 2, 
                opacity: 0.4, 
                fontSize: '0.65rem',
                display: { xs: 'block', sm: 'none' }, // Solo visible en móvil
                color: currentWeatherTheme?.textSecondary || 'text.secondary'
              }}
            >
              ← Desliza →
            </Typography>
          </Box>
        </CardContent>

        {/* Separador visual elegante (OCULTO TEMPORALMENTE - relacionado con Spotify) */}
        {/* 
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
        */}

        {/* Integración de Spotify basada en el clima (OCULTA TEMPORALMENTE) */}
        {/* 
        {false && weather && weather.weathercode && weather.temperature && (
          <CardContent sx={{ pb: 2, pt: 0, px: 2 }}>
            <SpotifyWeatherIntegration
              weatherCode={weather.weathercode}
              temperature={weather.temperature}
            />
          </CardContent>
        )}
        */}

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
