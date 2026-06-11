"use client";
import { Box, Typography, Chip, CardContent, Stack, IconButton } from "@mui/material";
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import DirectionsIcon from '@mui/icons-material/Directions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useYelpPlace } from '@/hooks/useYelpPlace';

export default function PlazaEspanaPage() {
  const router = useRouter();
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const { t } = useTranslation();

  // Obtener datos dinámicos de Yelp para Plaza de España
  const { place: yelpPlace, loading, error } = useYelpPlace('Plaza de España Sevilla');

  // Datos dinámicos del sitio - usar Yelp si está disponible, sino fallback
  const spot = {
    name: yelpPlace?.name || t('sites.plazaEspana.name'),
    trainer: t('sites.plazaEspana.guide'), // Esto queda hardcodeado ya que no viene de Yelp
    nextSpots: "2 " + t('nav.of') + " 6",
    coordinates: yelpPlace ? `${yelpPlace.coordinates.lat},${yelpPlace.coordinates.lng}` : "37.3769,-5.9875",
    currentSpot: {
      name: t('sites.alcazar.name'),
      time: "25 min",
      distance: "800 m",
      difficulty: t('difficulty.historic')
    },
    description: yelpPlace?.description || t('sites.plazaEspana.description')
  };

  const openMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates}`;
    window.open(mapsUrl, '_blank');
  };

  // Mostrar loading mientras se cargan datos de Yelp
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          Cargando información del lugar...
        </Typography>
      </Box>
    );
  }

  // Mostrar error si falla la carga
  if (error) {
    console.warn('Error loading Yelp data, using fallback:', error);
  }
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      {/* Imagen principal con overlay */}
      <Box sx={{ 
        height: '100vh', 
        width: '100vw', 
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundImage: yelpPlace?.image 
          ? `url(${yelpPlace.image}), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)`
          : 'url("/img/plaza de españa.jpg"), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}>
        {/* Botón atrás */}
        <IconButton 
          onClick={() => router.back()}
          sx={{ position: 'absolute', top: 16, left: 16, color: 'text.primary', zIndex: 10 }}
        >
          <ArrowBackIcon />
        </IconButton>
        {/* Botón compartir */}
        <IconButton sx={{ position: 'absolute', top: 16, right: 16, color: 'text.primary', zIndex: 10 }}>
          <ShareIcon />
        </IconButton>
        {/* Botón de Maps */}
        <IconButton 
          onClick={openMaps}
          sx={{ position: 'absolute', top: 16, right: 70, color: 'text.primary', zIndex: 10 }}
        >
          <DirectionsIcon />
        </IconButton>
        
        {/* Texto superpuesto en la parte inferior */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 0, 
          right: 0, 
          p: 3,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
        }}>
          <Typography variant="h4" sx={{ 
            color: 'text.primary', 
            fontWeight: 800, 
            mb: 1,
            textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
            letterSpacing: '0.5px'
          }}>
            {spot.name}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
            fontWeight: 500
          }}>
            {spot.trainer}
          </Typography>
        </Box>
      </Box>

      {/* Contenido inferior - Panel deslizable */}
      <Box sx={{ 
        bgcolor: 'background.default', 
        px: 3, 
        py: 2,
        position: 'fixed',
        bottom: isPanelExpanded ? 0 : 'calc(-60vh + 30px)',
        left: 0,
        right: 0,
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        zIndex: 5,
        height: '60vh',
        transition: 'bottom 0.3s ease-in-out'
      }}>
        {/* Barrita deslizable */}
        <Box 
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          sx={{
            width: '60px',
            height: '6px',
            bgcolor: 'text.disabled',
            borderRadius: '3px',
            mx: 'auto',
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'text.secondary'
            }
          }} 
        />
        
        {/* Descripción */}
        <Typography variant="body2" sx={{ 
          color: 'text.secondary', 
          lineHeight: 1.8,
          mb: 3,
          fontWeight: 400,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          fontSize: '0.95rem',
          letterSpacing: '0.3px',
          textAlign: 'justify'
        }}>
          {spot.description}
        </Typography>

        {/* Next exercises */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={(theme) => ({ 
            color: theme.palette.text.primary, 
            fontWeight: 700,
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          })}>
            {t('nav.nextSites')}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'primary.main',
            fontWeight: 600,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            {spot.nextSpots}
          </Typography>
        </Box>

        {/* Card del sitio actual - clickeable */}
        <Link href="/alcazar-sevilla" style={{ textDecoration: 'none' }}>
          <Material3ElevatedCard 
            interactive={true}
            sx={{ 
            bgcolor: 'background.paper', 
            borderRadius: 2, 
            mb: 3,
            border: 'none',
            boxShadow: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }
          }}>
            <Box sx={{ display: 'flex', p: 2 }}>
              {/* Imagen pequeña del sitio */}
              <Box sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("/img/alcazar de sevilla.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', opacity: 0.3 }}>
                  IMG
                </Typography>
              </Box>
              
              {/* Contenido */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={(theme) => ({ 
                  color: theme.palette.text.primary, 
                  fontWeight: 700, 
                  mb: 1,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                  background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.text.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                })}>
                  {spot.currentSpot.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary', 
                  mb: 1,
                  fontWeight: 500,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {spot.currentSpot.time}
                </Typography>
                
                {/* Chips */}
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label={spot.currentSpot.distance} 
                    size="small"
                    sx={{ 
                      bgcolor: 'success.main', 
                      color: 'text.primary', 
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <Chip 
                    label={spot.currentSpot.difficulty} 
                    size="small"
                    sx={{ 
                      bgcolor: 'transparent', 
                      color: 'secondary.main', 
                      border: '1px solid', borderColor: 'secondary.main',
                      fontSize: '0.75rem'
                    }} 
                  />
                </Stack>
              </Box>
            </Box>
          </Material3ElevatedCard>
        </Link>
      </Box>
    </Box>
  );
}
