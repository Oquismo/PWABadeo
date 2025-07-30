'use client';

import { Container, Grid, Typography, Box } from '@mui/material';

const stats = [
  {
    value: '+200',
    label: 'Participantes',
    color: 'primary.main', // Usa el nuevo azul
  },
  {
    value: '+30',
    label: 'Proyectos',
    color: 'success.main', // Usa el nuevo verde
  },
  {
    value: '+15',
    label: 'Colaboradores',
    color: 'secondary.main', // Usa el nuevo amarillo
  },
];

export default function StatsSection() {
  // ... el resto del componente no cambia ...
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
      <Container>
        <Grid container spacing={4}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography
                component="div"
                variant="h2"
                fontWeight="900"
                sx={{ color: stat.color }}
              >
                {stat.value}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}