"use client";
import { Box, Typography, Chip, Card, CardContent, Stack, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import DirectionsIcon from '@mui/icons-material/Directions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function AlcazarSevillaPage() {
  const router = useRouter();
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const { t } = useTranslation();

  // Datos dinámicos del sitio
  const spot = {
    name: t('sites.alcazar.name'),
    trainer: t('sites.alcazar.guide'),
    nextSpots: "3 " + t('nav.of') + " 6",
    coordinates: "37.3829,-5.9901", // Coordenadas del Alcázar
    currentSpot: {
      name: t('sites.barrioSantaCruz.name'),
      time: "20 min",
      distance: "400 m",
      difficulty: t('difficulty.picturesque')
    },
    description: t('sites.alcazar.description')
  };

  const openMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates}`;
    window.open(mapsUrl, '_blank');
  };
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      {/* Imagen principal con overlay */}
      <Box sx={{ 
        height: '100vh', 
        width: '100vw', 
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundImage: 'url("/img/alcazar de sevilla.jpg"), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}>
        {/* Botón atrás */}
        <IconButton 
          onClick={() => router.back()}
          sx={{ position: 'absolute', top: 16, left: 16, color: '#fff', zIndex: 10 }}
        >
          <ArrowBackIcon />
        </IconButton>
        {/* Botón compartir */}
        <IconButton sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', zIndex: 10 }}>
          <ShareIcon />
        </IconButton>
        {/* Botón de idioma */}
        <LanguageSwitch />
        {/* Botón de Maps */}
        <IconButton 
          onClick={openMaps}
          sx={{ position: 'absolute', top: 16, right: 70, color: '#fff', zIndex: 10 }}
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
            color: '#fff', 
            fontWeight: 800, 
            mb: 1,
            textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
            letterSpacing: '0.5px'
          }}>
            {spot.name}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#e0e0e0',
            textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
            fontWeight: 500
          }}>
            {spot.trainer}
          </Typography>
        </Box>
      </Box>

      {/* Contenido inferior - Panel deslizable */}
      <Box sx={{ 
        bgcolor: '#1a1a1a', 
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
            bgcolor: '#888',
            borderRadius: '3px',
            mx: 'auto',
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#aaa'
            }
          }} 
        />
        
        {/* Descripción */}
        <Typography variant="body2" sx={{ 
          color: '#d0d0d0', 
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
          <Typography variant="h6" sx={{ 
            color: '#fff', 
            fontWeight: 700,
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
            background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {t('nav.nextSites')}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#90caf9',
            fontWeight: 600,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            {spot.nextSpots}
          </Typography>
        </Box>

        {/* Card del sitio actual - clickeable */}
        <Link href="/barrio-santa-cruz" style={{ textDecoration: 'none' }}>
          <Card sx={{ 
            bgcolor: '#2a2a2a', 
            borderRadius: 2, 
            mb: 3,
            border: 'none',
            boxShadow: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#333',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }
          }}>
            <Box sx={{ display: 'flex', p: 2 }}>
              {/* Imagen pequeña del sitio */}
              <Box sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#3a3a3a', 
                borderRadius: 2, 
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("/img/barrio-santa-cruz.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <Typography variant="caption" sx={{ color: '#666', opacity: 0.3 }}>
                  IMG
                </Typography>
              </Box>
              
              {/* Contenido */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  color: '#fff', 
                  fontWeight: 700, 
                  mb: 1,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.4)',
                  background: 'linear-gradient(135deg, #ffffff, #f5f5f5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {spot.currentSpot.name}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#b3b3b3', 
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
                      bgcolor: '#4caf50', 
                      color: '#fff', 
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                  <Chip 
                    label={spot.currentSpot.difficulty} 
                    size="small"
                    sx={{ 
                      bgcolor: 'transparent', 
                      color: '#e91e63', 
                      border: '1px solid #e91e63',
                      fontSize: '0.75rem'
                    }} 
                  />
                </Stack>
              </Box>
            </Box>
          </Card>
        </Link>
      </Box>
    </Box>
  );
}
