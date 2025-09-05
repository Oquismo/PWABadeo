'use client';

import { Box, Typography, List, ListItem, ListItemText, Divider, Avatar, ListItemAvatar, ListItemButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import HotelIcon from '@mui/icons-material/Hotel';
import { placesData, Place } from '@/data/places';

// Función para obtener el icono según la categoría
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Residencia':
      return <HotelIcon />;
    case 'Servicios':
      return <BusinessIcon />;
    case 'Cultural':
      return <AccountBalanceIcon />;
    case 'Transporte':
      return <DirectionsBusIcon />;
    case 'Metro':
      return <TrainIcon />;
    case 'Estudio':
      return <SchoolIcon />;
    default:
      return <BusinessIcon />;
  }
};

interface PlacesListSectionProps {
  onPlaceSelect?: (place: Place) => void;
}

export default function PlacesListSection({ onPlaceSelect }: PlacesListSectionProps) {
  const handlePlaceClick = (place: Place) => {
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <List>
        {placesData.map((place, index) => (
          <Box key={place.id}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handlePlaceClick(place)}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getCategoryIcon(place.category)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={place.name} 
                  secondary={place.address || `${place.coordinates.lat.toFixed(4)}, ${place.coordinates.lng.toFixed(4)}`} 
                />
              </ListItemButton>
            </ListItem>
            {index < placesData.length - 1 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>
    </Box>
  );
}
