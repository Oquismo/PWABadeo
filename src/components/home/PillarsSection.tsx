'use client';

import { Container, Grid, Typography, Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpaIcon from '@mui/icons-material/Spa';

const pillars = [
  {
    icon: <GroupsIcon sx={{ fontSize: 40, color: 'primary.main' }} />, // Usa el nuevo azul
    title: 'Comunidad',
    description: 'Construimos comunidades fuertes y conectadas a través de la participación activa.',
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, // Usa el nuevo amarillo
    title: 'Innovación',
    description: 'Aplicamos soluciones creativas y sostenibles para los desafíos urbanos y sociales.',
  },
  {
    icon: <SpaIcon sx={{ fontSize: 40, color: 'success.main' }} />, // Usa el nuevo verde
    title: 'Sostenibilidad',
    description: 'Promovemos el desarrollo económico y ambiental a largo plazo.',
  },
];


export default function PillarsSection() {
  // ... el resto del componente no cambia ...
  return (
    <Box sx={{ py: 8 }}>
      <Container>
        <Typography 
          component="h2" 
          variant="h4"
          fontWeight="bold" 
          textAlign="center"
          sx={{ mb: 8 }}
        >
          Nuestros Pilares
        </Typography>
        <Grid container spacing={5}>
          {pillars.map((pillar) => (
            <Grid item key={pillar.title} xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box mb={2}>{pillar.icon}</Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {pillar.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {pillar.description}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}