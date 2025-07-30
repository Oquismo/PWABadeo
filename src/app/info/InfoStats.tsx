'use client';

import { Grid, Typography, Paper, Container } from '@mui/material';

const stats = [
  {
    value: '5000+',
    label: 'Participantes en programas de movilidad',
    color: 'primary.main',
  },
  {
    value: '27',
    label: 'Países europeos colaboradores',
    color: 'secondary.main',
  },
  {
    value: '150+',
    label: 'Instituciones y empresas asociadas',
    color: '#f59e0b', // Naranja/amarillo
  },
];

export default function InfoStats() {
  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} md={4} key={stat.label}>
            {/* Usamos Paper para crear la tarjeta con su color de fondo */}
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                bgcolor: stat.color, 
                color: 'white', // El texto dentro será blanco
                borderRadius: '12px', // Bordes redondeados
              }}
            >
              <Typography variant="h3" component="div" fontWeight="900">
                {stat.value}
              </Typography>
              <Typography variant="body1" component="div" sx={{ mt: 1 }}>
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}