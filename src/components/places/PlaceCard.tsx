// src/components/places/PlaceCard.tsx
'use client';

import { Box, Card, CardContent, Typography, Button, CardMedia, Chip, Stack } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import LaunchIcon from '@mui/icons-material/Launch';
import MapIcon from '@mui/icons-material/Map';
import Image from 'next/image';
import { Place } from '@/data/places'; // Importa la interfaz Place

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&travelmode=transit`;

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        mb: 2, 
        borderRadius: '16px', 
        boxShadow: 3,
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
              <Button
                size="small"
                variant="outlined"
                href={place.link}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<LaunchIcon />}
              >
                Web
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DirectionsIcon />}
            >
              Cómo llegar
            </Button>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}