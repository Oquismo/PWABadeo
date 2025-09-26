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
import { useRouter } from 'next/navigation';
import { sevillaRestaurants, Restaurant, cuisineTypes, calculateDistance, calculateWalkingTime } from '@/data/restaurants';

export default function RecomendacionesClient() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

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

  // Filtrar restaurantes
  const filteredRestaurants = React.useMemo(() => {
    return sevillaRestaurants.filter(restaurant => {
      const matchesCuisine = !selectedCuisine || restaurant.cuisine === selectedCuisine;
      const matchesPrice = !selectedPrice || restaurant.priceRange === selectedPrice;
      const matchesSearch = !searchTerm || 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCuisine && matchesPrice && matchesSearch;
    });
  }, [selectedCuisine, selectedPrice, searchTerm]);

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
                            {restaurant.openingHours ? Object.values(restaurant.openingHours).slice(0,3).join(' • ') : 'Horario no disponible'}
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