"use client";

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
  Fade,
  Zoom,
  Paper,
  Badge,
  Fab,
  useTheme,
  alpha,
  Grow
} from '@mui/material';
import M3Button from '@/components/ui/M3Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useRouter } from 'next/navigation';
import { sevillaRestaurants, Restaurant, cuisineTypes, calculateDistance, calculateWalkingTime } from '@/data/restaurants';

type RecomendacionesClientProps = {
  mode?: 'recomendaciones' | 'tour';
  defaultQuery?: string;
  initialRemoteRestaurants?: Restaurant[];
}

export default function RecomendacionesClient({ mode = 'recomendaciones', defaultQuery, initialRemoteRestaurants }: RecomendacionesClientProps) {
  const router = useRouter();
  const theme = useTheme();
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'relevance'>('distance');
  const [searchTerm, setSearchTerm] = useState<string>(defaultQuery || '');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [remoteRestaurants, setRemoteRestaurants] = useState<Restaurant[] | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  // Efecto para obtener ubicación del usuario
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Error obteniendo ubicación:', error)
      );
    } else {
      console.log('Geolocalización no soportada');
    }
  }, []);

  // Cargar favoritos del localStorage
  React.useEffect(() => {
    const savedFavorites = localStorage.getItem('restaurant-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Guardar favoritos en localStorage
  React.useEffect(() => {
    localStorage.setItem('restaurant-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Inicializar remoteRestaurants desde prop si viene (uso por Tour)
  React.useEffect(() => {
    if (initialRemoteRestaurants && Array.isArray(initialRemoteRestaurants)) {
      setRemoteRestaurants(initialRemoteRestaurants);
    }
  }, [initialRemoteRestaurants]);

  // Obtener recomendaciones desde la API del servidor (Yelp) con fallback a datos locales
  React.useEffect(() => {
    // Si el componente fue inicializado con datos remotos (por ejemplo desde /tour),
    // no debemos reconsultar automáticamente aquí para no sobrescribir lo recibido.
    if (initialRemoteRestaurants && Array.isArray(initialRemoteRestaurants) && initialRemoteRestaurants.length > 0) {
      // ya están en remoteRestaurants gracias al efecto que copia la prop
      return;
    }

    let aborted = false;
    async function fetchRecommendations() {
      if (!userLocation) return;
      setIsLoadingRemote(true);
      setRemoteError(null);
      try {
        const params = new URLSearchParams();
        params.set('lat', String(userLocation.lat));
        params.set('lng', String(userLocation.lng));
  params.set('limit', '30');
  if (selectedPrice) params.set('price', selectedPrice);
  if (selectedCuisine) params.set('category', selectedCuisine);
  if (searchTerm) params.set('query', searchTerm);
  if (sortBy) params.set('sort', sortBy);

        const res = await fetch(`/api/recommendations?${params.toString()}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (aborted) return;

        // Mapear el formato de la API a nuestro tipo Restaurant
        let mapped: Restaurant[] = (json.items || []).map((it: any) => ({
          id: it.id,
          name: it.name,
          cuisine: (it.categories && it.categories[0]) || 'Restaurante',
          priceRange: it.price || '€',
          rating: it.rating || 0,
          reviewCount: it.raw?.review_count || 0,
          address: it.address || (it.raw?.location?.display_address || []).join(', '),
          coordinates: { lat: it.lat || it.raw?.coordinates?.latitude || 0, lng: it.lng || it.raw?.coordinates?.longitude || 0 },
          image: (it.photos && it.photos[0]?.url) || it.raw?.image_url || '',
          openNow: Boolean(it.raw?.is_closed === false || it.raw?.hours?.[0]?.is_open_now === true || it.raw?.business_hours?.[0]?.hours_type),
          description: it.raw?.description || '',
          specialties: it.raw?.specialties || [],
          openingHours: (function() {
            // Normalize Yelp hours/business_hours to { dayName: "HH:MM-HH:MM" , status: 'Abierto ahora' }
            try {
              const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
              const oh: Record<string,string> = {};
              const rawHours = it.raw?.hours || it.raw?.business_hours;
              if (rawHours && Array.isArray(rawHours) && rawHours.length > 0) {
                const entry = rawHours[0];
                const openArr = entry.open || entry.hours || [];
                if (Array.isArray(openArr)) {
                  openArr.forEach((o: any) => {
                    const dayName = days[o.day] || String(o.day);
                    const fmt = (s: string) => s?.replace(/(\d{2})(\d{2})/, '$1:$2');
                    const start = fmt(o.start || o.open || '') || '';
                    const end = fmt(o.end || o.close || '') || '';
                    const range = start && end ? `${start}-${end}` : start || end || '';
                    if (range) {
                      if (oh[dayName]) oh[dayName] += `, ${range}`;
                      else oh[dayName] = range;
                    }
                  });
                }
                if (entry?.is_open_now !== undefined) {
                  oh['status'] = entry.is_open_now ? 'Abierto ahora' : 'Cerrado';
                }
              } else if (it.raw?.is_closed !== undefined) {
                oh['status'] = it.raw?.is_closed === false ? 'Abierto ahora' : 'Cerrado';
              }
              return Object.keys(oh).length ? oh : undefined;
            } catch (e) {
              return undefined;
            }
          })(),
          phoneNumber: it.raw?.phone || it.raw?.display_phone || undefined,
          website: it.url || it.raw?.url || undefined
        }));

        // No filtramos por radio en cliente (filtro eliminado)

        // Aplicar orden simple en cliente si la API no lo soporta
        if (sortBy === 'distance' && userLocation) {
          mapped.sort((a, b) => {
            const da = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng);
            const db = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng);
            return da - db;
          });
        } else if (sortBy === 'rating') {
          mapped.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setRemoteRestaurants(mapped);
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setRemoteError(String(err?.message || err));
        setRemoteRestaurants(null);
      } finally {
        setIsLoadingRemote(false);
      }
    }

    fetchRecommendations();
    return () => { aborted = true; };
  }, [userLocation, initialRemoteRestaurants, selectedPrice, selectedCuisine, searchTerm, sortBy]);

  // Filtrar restaurantes
  // Combinar resultados remotos (si hay) con el fallback local
  const sourceList = remoteRestaurants || sevillaRestaurants;

  // Enriquecer cada restaurante con distancia y tiempo a pie (si disponemos de userLocation)
  const enrichedList = React.useMemo(() => {
    return sourceList.map(r => {
      try {
        if (userLocation && r.coordinates) {
          const d = calculateDistance(userLocation.lat, userLocation.lng, r.coordinates.lat, r.coordinates.lng);
          return { ...r, distance: d, walkingTime: calculateWalkingTime(d) } as Restaurant;
        }
        return r;
      } catch (e) {
        return r;
      }
    });
  }, [sourceList, userLocation]);

  // Aplicar filtros sobre la lista enriquecida
  const filteredRestaurants = React.useMemo(() => {
    return enrichedList.filter(restaurant => {
      const matchesCuisine = !selectedCuisine || restaurant.cuisine === selectedCuisine;
      const matchesPrice = !selectedPrice || restaurant.priceRange === selectedPrice;
      const matchesSearch = !searchTerm || 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCuisine && matchesPrice && matchesSearch;
    });
  }, [enrichedList, selectedCuisine, selectedPrice, searchTerm]);

  // Añadir/quitar favoritos
  const toggleFavorite = (restaurantId: string) => {
    setFavorites(prev => 
      prev.includes(restaurantId) 
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  // Función para abrir Google Maps con ruta
  const openRoute = (restaurant: Restaurant) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}&travelmode=walking`;
    window.open(mapsUrl, '_blank');
  };

  // Función para obtener el color del precio
  const getPriceColor = (priceRange: string) => {
    switch (priceRange) {
      case '€': return 'success';
      case '€€': return 'warning';
      case '€€€': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.08)} 0%, 
        ${alpha(theme.palette.secondary.main, 0.04)} 50%, 
        ${alpha(theme.palette.primary.light, 0.06)} 100%)`
    }}>
      <Container maxWidth="lg" sx={{ pt: 2, pb: 8 }}>
        {/* Header con botón moderno estilo material */}
        <Box sx={{ mb: 3, pl: 1 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'inline-block',
              borderRadius: 6,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.15)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
              p: 0.5
            }}
          >
            <IconButton 
              onClick={() => router.back()}
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                width: 48,
                height: 48,
                borderRadius: 5,
                border: `2px solid ${alpha(theme.palette.common.white, 0.1)}`,
                boxShadow: `
                  0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}, 
                  inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)}
                `,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  transform: 'translateY(-1px) scale(1.02)',
                  boxShadow: `
                    0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}, 
                    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.3)}
                  `
                },
                '&:active': {
                  transform: 'translateY(0) scale(0.98)',
                  boxShadow: `
                    0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}, 
                    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                  `
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Paper>
        </Box>

        {/* Filtros modernos */}
        <Grow in={true} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
              backdropFilter: 'blur(15px)',
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
            }}
          >
            <Stack spacing={3}>
              {/* Barra de búsqueda */}
              <TextField
                fullWidth
                placeholder="Buscar restaurantes, cocina o especialidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: `2px solid ${theme.palette.primary.main}`,
                    }
                  }
                }}
              />

              {/* Filtros en fila */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de cocina</InputLabel>
                  <Select
                    value={selectedCuisine}
                    label="Tipo de cocina"
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }
                    }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {cuisineTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Rango de precio</InputLabel>
                  <Select
                    value={selectedPrice}
                    label="Rango de precio"
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }
                    }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="€">€ - Económico</MenuItem>
                    <MenuItem value="€€">€€ - Moderado</MenuItem>
                    <MenuItem value="€€€">€€€ - Premium</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel id="sort-label">Ordenar</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sortBy}
                    label="Ordenar"
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <MenuItem value={'distance'}>Distancia</MenuItem>
                    <MenuItem value={'rating'}>Valoración</MenuItem>
                    <MenuItem value={'relevance'}>Relevancia</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Paper>
        </Grow>

        {/* Lista de restaurantes */}
        {filteredRestaurants.length === 0 ? (
          <Fade in={true} timeout={600}>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              No se encontraron restaurantes que coincidan con tus filtros.
            </Alert>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {filteredRestaurants.map((restaurant, index) => (
              <Grid item xs={12} sm={6} lg={4} key={restaurant.id}>
                <Grow in={true} timeout={800 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                      backdropFilter: 'blur(15px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
                        '& .restaurant-image': {
                          transform: 'scale(1.05)'
                        }
                      }
                    }}
                  >
                    {/* Badge de favorito flotante */}
                    <Fab
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(restaurant.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        width: 40,
                        height: 40,
                        background: favorites.includes(restaurant.id) 
                          ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
                          : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                        backdropFilter: 'blur(10px)',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: `0 6px 25px ${alpha(theme.palette.common.black, 0.2)}`
                        }
                      }}
                    >
                      {favorites.includes(restaurant.id) ? (
                        <FavoriteRoundedIcon sx={{ color: 'white', fontSize: 20 }} />
                      ) : (
                        <FavoriteBorderRoundedIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                      )}
                    </Fab>

                    {/* Imagen del restaurante */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={restaurant.image}
                        alt={restaurant.name}
                        className="restaurant-image"
                        sx={{
                          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          filter: 'brightness(0.9)'
                        }}
                      />
                      {/* Overlay con gradiente */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '50%',
                          background: `linear-gradient(transparent, ${alpha(theme.palette.common.black, 0.6)})`,
                          display: 'flex',
                          alignItems: 'flex-end',
                          p: 2
                        }}
                      >
                        <Chip
                          label={restaurant.cuisine}
                          size="small"
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3, pb: 2 }}>
                      {/* Nombre del restaurante */}
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 1,
                          color: theme.palette.text.primary,
                          fontSize: '1.1rem'
                        }}
                      >
                        {restaurant.name}
                      </Typography>

                      {/* Fila con rating, reviews, precio y distancia (solo datos reales) */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        {typeof restaurant.rating === 'number' && (
                          <Chip
                            icon={<StarRoundedIcon sx={{ color: '#ffd700' }} />}
                            label={`${restaurant.rating}`}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        )}

                        {typeof restaurant.reviewCount === 'number' && (
                          <Typography variant="caption" color="text.secondary">{`${restaurant.reviewCount} reseñas`}</Typography>
                        )}

                        {restaurant.priceRange && (
                          <Chip label={restaurant.priceRange} size="small" color={getPriceColor(restaurant.priceRange) as any} sx={{ ml: 1 }} />
                        )}

                        {restaurant.walkingTime && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{restaurant.walkingTime}</Typography>
                        )}
                      </Stack>

                      {/* Categoría / etiquetas (solo si existen) */}
                      {restaurant.cuisine && (
                        <Box sx={{ mb: 1 }}>
                          <Chip label={restaurant.cuisine} size="small" sx={{ fontWeight: 600 }} />
                        </Box>
                      )}

                      {/* Información básica */}
                      <Stack spacing={2} sx={{ mb: 2 }}>
                        {/* Precio y tiempo */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={restaurant.priceRange}
                            size="small"
                            color={getPriceColor(restaurant.priceRange) as any}
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.8rem'
                            }}
                          />
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <LocationOnRoundedIcon color="action" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {restaurant.walkingTime || 'Calculando...'}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Especialidades */}
                        {restaurant.specialties && restaurant.specialties.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                              Especialidades:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                              {restaurant.specialties.slice(0, 3).join(' • ')}
                            </Typography>
                          </Box>
                        )}

                        {/* Horario */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {restaurant.openingHours ? (
                              restaurant.openingHours.status ? (
                                restaurant.openingHours.status
                              ) : Object.keys(restaurant.openingHours).length ? (
                                // Mostrar hasta 2 días de ejemplo
                                Object.entries(restaurant.openingHours)
                                  .filter(([k]) => k !== 'status')
                                  .slice(0,2)
                                  .map(([k,v]) => `${k.charAt(0).toUpperCase()+k.slice(1)}: ${v}`).join(' • ')
                              ) : 'Horario no disponible'
                            ) : 'Horario no disponible'}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Botones de acción */}
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <M3Button
                          m3variant="filled"
                          startIcon={<DirectionsRoundedIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRoute(restaurant);
                          }}
                          sx={{
                            flex: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          Ir
                        </M3Button>
                        
                        {restaurant.phoneNumber && (
                          <M3Button
                            m3variant="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${restaurant.phoneNumber}`, '_blank');
                            }}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                              color: 'white'
                            }}
                          >
                            <PhoneRoundedIcon fontSize="small" />
                          </M3Button>
                        )}

                        {restaurant.website && (
                          <M3Button
                            m3variant="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(restaurant.website, '_blank');
                            }}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                              color: 'white'
                            }}
                          >
                            <OpenInNewRoundedIcon fontSize="small" />
                          </M3Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}