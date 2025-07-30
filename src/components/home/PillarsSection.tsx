'use client';

import { Container, Grid, Typography, Box, Card, CardContent } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpaIcon from '@mui/icons-material/Spa';

const pillars = [
  {
    icon: <GroupsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Comunidad',
    description: 'Construimos comunidades fuertes y conectadas a través de la participación activa.',
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 40, color: '#A5CE39' }} />,
    title: 'Innovación',
    description: 'Aplicamos soluciones creativas y sostenibles para los desafíos urbanos y sociales.',
  },
  {
    icon: <SpaIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    title: 'Sostenibilidad',
    description: 'Promovemos el desarrollo económico y ambiental a largo plazo.',
  },
];

export default function PillarsSection() {
  return (
    <Box sx={{ py: 8 }}>
      <Container>
        <Typography 
          component="h2" 
          variant="h4" 
          fontWeight="bold" 
          textAlign="center"
          sx={{ mb: 6 }}
        >
          Nuestros Pilares
        </Typography>
        <Grid container spacing={4}>
          {pillars.map((pillar) => (
            <Grid item key={pillar.title} xs={12} md={4}>
              {/* Volvemos a usar el componente Card */}
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <CardContent>
                  <Box mb={2}>{pillar.icon}</Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {pillar.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {pillar.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}