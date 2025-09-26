// src/components/places/PlaceCard.tsx
'use client';

import { Box, CardContent, Typography, CardMedia, Chip, Stack } from '@mui/material';
import M3Button from '@/components/ui/M3Button';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import DirectionsRoundedIcon from '@mui/icons-material/DirectionsRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import Image from 'next/image';
import { Place } from '@/data/places'; // Importa la interfaz Place

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;

  return (
    <Material3ElevatedCard 
      interactive={true}
      sx={{ 
        display: 'flex', 
        mb: 2, 
        overflow: 'hidden',
        flexDirection: { xs: 'column', sm: 'row' } // En móvil, apila verticalmente
      }}
    >
      {place.imageUrl && place.imageUrl.startsWith('http') && (
        <CardMedia sx={{ width: { xs: '100%', sm: 150 }, height: { xs: 150, sm: 'auto' }, flexShrink: 0, position: 'relative' }}>
          <Image
            src={place.imageUrl}
            alt={place.name}
            layout="fill"
            objectFit="cover"
            sizes="(max-width: 600px) 100vw, 150px"
          />
        </CardMedia>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="h3" variant="h6" fontWeight="bold">
            {place.name}
          </Typography>
          <Chip 
            label={place.category} 
            size="small" 
            sx={{ mt: 0.5, mb: 1, bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }} 
          />
          <Typography variant="body2" color="text.secondary">
            {place.description}
          </Typography>
          {place.address && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {place.address}
            </Typography>
          )}
        </CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pt: 0 }}>
          <Stack direction="row" spacing={1}>
            {place.link && (
              <M3Button
                m3variant="outlined"
                size="small"
                href={place.link}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<LaunchRoundedIcon />}
              >
                Web
              </M3Button>
            )}
            <M3Button
              m3variant="filled"
              size="small"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DirectionsRoundedIcon />}
            >
              Cómo llegar
            </M3Button>
          </Stack>
        </Box>
      </Box>
    </Material3ElevatedCard>
  );
}