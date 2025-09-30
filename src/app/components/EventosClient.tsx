"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  CardActions,
  Avatar,
  Stack,
  Divider,
  Container,
  Paper,
  Fade,
  Grow,
  TextField,
  InputAdornment,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Euro as EuroIcon,
  Launch as LaunchIcon,
  MusicNote as MusicIcon,
  TheaterComedy as TheaterIcon,
  SportsSoccer as SportsIcon,
  Celebration as CelebrationIcon,
  LocalActivity as TicketIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  url: string;
  venue: string;
  address: string;
  image: string;
  category: string;
  format: string;
  isFree: boolean;
  ticketAvailability: boolean;
  minPrice?: { currency: string; value: number } | null;
  maxPrice?: { currency: string; value: number } | null;
}

export default function EventosClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  
  // Nuevos estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const { t } = useTranslation();

  // Categorías disponibles para filtrar
  const categories = [
    { key: 'todos', label: 'Todos', icon: <EventIcon /> },
    { key: 'music', label: 'Música', icon: <MusicIcon /> },
    { key: 'theater', label: 'Teatro', icon: <TheaterIcon /> },
    { key: 'sports', label: 'Deportes', icon: <SportsIcon /> }
  ];

  // Filtrar eventos basado en búsqueda y categoría
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'todos' || 
        (selectedCategory === 'music' && (event.category.toLowerCase().includes('music') || event.category.toLowerCase().includes('concierto'))) ||
        (selectedCategory === 'theater' && (event.category.toLowerCase().includes('theater') || event.category.toLowerCase().includes('teatro'))) ||
        (selectedCategory === 'sports' && (event.category.toLowerCase().includes('sports') || event.category.toLowerCase().includes('deporte')));
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  // Función para obtener el icono según la categoría
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('music') || cat.includes('concierto') || cat.includes('concert')) {
      return <MusicIcon />;
    }
    if (cat.includes('theater') || cat.includes('teatro') || cat.includes('comedy')) {
      return <TheaterIcon />;
    }
    if (cat.includes('sports') || cat.includes('deporte') || cat.includes('soccer')) {
      return <SportsIcon />;
    }
    if (cat.includes('celebration') || cat.includes('festival') || cat.includes('party')) {
      return <CelebrationIcon />;
    }
    return <EventIcon />;
  };

  // Función para obtener colores según la categoría
  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('music') || cat.includes('concierto')) {
      return { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' };
    }
    if (cat.includes('sports') || cat.includes('deporte')) {
      return { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' };
    }
    if (cat.includes('theater') || cat.includes('teatro')) {
      return { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' };
    }
    return { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#000' };
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiMessage(null);

      const response = await fetch('/api/events?location=Sevilla&limit=20');
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || t('events.errorLoading'));
      }

      setEvents(data.events || []);
      setApiMessage(data.message || null);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || t('events.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (event: Event) => {
    if (event.isFree) return 'Gratuito';
    if (event.minPrice && event.maxPrice) {
      if (event.minPrice.value === event.maxPrice.value) {
        return `${event.minPrice.value} ${event.minPrice.currency}`;
      }
      return `${event.minPrice.value} - ${event.maxPrice.value} ${event.minPrice.currency}`;
    }
    return 'Precio no disponible';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 4,
              bgcolor: 'rgba(254, 107, 139, 0.1)',
              color: '#FE6B8B'
            }}
          >
            <CircularProgress size={60} sx={{ color: '#FE6B8B' }} />
          </Avatar>

          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🎭 {t('events.loading')}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Conectando con Ticketmaster para traerte los mejores eventos de Sevilla...
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <Paper
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    p: 0,
                    animation: `shimmer 2s ease-in-out ${i * 0.1}s infinite`
                  }}
                >
                  <Skeleton variant="rectangular" height={240} sx={{ width: '100%' }} />
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="text" height={28} width="80%" sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="40%" sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="text" height={20} width="30%" />
                    </Box>
                    <Skeleton variant="rectangular" height={36} width="100%" sx={{ borderRadius: 2 }} />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <style jsx>{`
            @keyframes shimmer {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}</style>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 4,
              bgcolor: 'rgba(254, 107, 139, 0.1)',
              color: '#FE6B8B'
            }}
          >
            <EventIcon sx={{ fontSize: 60 }} />
          </Avatar>

          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            🎭 Eventos en Sevilla
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
              Ticketmaster Discovery API
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
              {apiMessage || 'No se encontraron eventos próximos publicados en Ticketmaster para Sevilla. Esto puede deberse a que no hay eventos programados actualmente o que los organizadores aún no los han publicado.'}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<CelebrationIcon />}
                label="Conciertos"
                sx={{ bgcolor: 'rgba(254, 107, 139, 0.1)', color: '#FE6B8B' }}
              />
              <Chip
                icon={<TheaterIcon />}
                label="Teatro"
                sx={{ bgcolor: 'rgba(255, 142, 83, 0.1)', color: '#FF8E53' }}
              />
              <Chip
                icon={<SportsIcon />}
                label="Deportes"
                sx={{ bgcolor: 'rgba(79, 172, 254, 0.1)', color: '#4facfe' }}
              />
            </Box>
          </Paper>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 4,
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Los eventos se cargan desde Ticketmaster en tiempo real.
            ¡Vuelve pronto para ver las últimas novedades!
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header minimalista */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          EVENTOS
        </Typography>
      </Box>

      {/* Controles de búsqueda y filtros */}
      <Box sx={{ mb: 4 }}>
        {/* Campo de búsqueda */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder={t('events.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{
              width: { xs: '100%', md: '60%' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ color: 'text.secondary' }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Filtros por categoría */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? 'contained' : 'outlined'}
              startIcon={category.icon}
              onClick={() => setSelectedCategory(category.key)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: selectedCategory === category.key 
                  ? 'linear-gradient(135deg, #FE6B8B 0%, #FF8E53 100%)'
                  : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: selectedCategory === category.key ? '#fff' : 'text.primary',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  background: selectedCategory === category.key 
                    ? 'linear-gradient(135deg, #FE6B8B 0%, #FF8E53 100%)'
                    : 'rgba(255,255,255,0.9)'
                }
              }}
            >
              {category.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {filteredEvents.map((event, index) => {
          const categoryStyle = getCategoryColor(event.category);

          return (
            <Grid item xs={12} sm={6} lg={4} key={event.id}>
              <Grow in={true} timeout={300 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.03)',
                      boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      '& .event-image': {
                        transform: 'scale(1.15)'
                      },
                      '& .event-overlay': {
                        opacity: 1
                      },
                      '& .event-content': {
                        transform: 'translateY(-4px)'
                      }
                    }
                  }}
                >
                  {/* Imagen del evento con overlay */}
                  <Box sx={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                    {event.image ? (
                      <CardMedia
                        component="img"
                        className="event-image"
                        image={event.image}
                        alt={event.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          background: categoryStyle.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white'
                          }}
                        >
                          {getCategoryIcon(event.category)}
                        </Avatar>
                      </Box>
                    )}

                    {/* Overlay con información de precio */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {event.isFree ? t('events.free') : formatPrice(event)}
                      </Typography>
                    </Box>

                    {/* Overlay de hover */}
                    <Box
                      className="event-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        backdropFilter: 'blur(2px)'
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<LaunchIcon />}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: 'text.primary',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'white'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(event.url, '_blank');
                        }}
                      >
                        {t('events.viewEvent')}
                      </Button>
                    </Box>

                    {/* Chip de categoría */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16
                      }}
                    >
                      <Chip
                        icon={getCategoryIcon(event.category)}
                        label={event.category}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: 'text.primary',
                          fontWeight: 600,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          '& .MuiChip-icon': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent className="event-content" sx={{ flexGrow: 1, p: 3, transition: 'transform 0.3s ease' }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '3.9rem'
                      }}
                    >
                      {event.name}
                    </Typography>

                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <TimeIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {formatDate(event.startDate).split(',')[0]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(event.startDate).split(',')[1]?.trim()}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                          <LocationIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              lineHeight: 1.2,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {event.venue}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {event.address}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    {event.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 2,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {event.description.replace(/<[^>]*>/g, '')}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      endIcon={<LaunchIcon />}
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                        boxShadow: '0 3px 15px rgba(254, 107, 139, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FE6B8B 50%, #FF8E53 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 25px rgba(254, 107, 139, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Comprar Entradas
                    </Button>
                  </CardActions>
                </Card>
              </Grow>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}