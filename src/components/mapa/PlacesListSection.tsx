'use client';

import { Box, Typography, List, ListItem, ListItemText, Divider, Avatar, ListItemAvatar } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Icono para lugares históricos

// Lista de lugares de interés que se mostrarán en el panel
const places = [
  {
    name: 'Oficina Barrio de Oportunidades',
    description: 'Plaza de España, Sevilla',
    icon: <BusinessIcon />
  },
  {
    name: 'Tu Alojamiento (Ejemplo)',
    description: 'Calle Falsa, 123',
    icon: <HomeIcon />
  },
  {
    name: 'Tu Empresa / Universidad (Ejemplo)',
    description: 'Isla de la Cartuja',
    icon: <SchoolIcon />
  },
  {
    name: 'Catedral de Sevilla',
    description: 'Av. de la Constitución, s/n',
    icon: <AccountBalanceIcon />
  },
  {
    name: 'Real Alcázar de Sevilla',
    description: 'Patio de Banderas, s/n',
    icon: <AccountBalanceIcon />
  }
];

export default function PlacesListSection() {
  return (
    <Box sx={{ p: 2 }}>
      <List>
        {places.map((place, index) => (
          <Box key={place.name}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {place.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={place.name} secondary={place.description} />
            </ListItem>
            {index < places.length - 1 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>
    </Box>
  );
}
