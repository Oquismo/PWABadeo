'use client';

import { Container, Grid, Typography, Card, CardContent } from '@mui/material';

const stats = [
  {
    value: '+200',
    label: 'Participantes',
    color: 'primary.main',
  },
  {
    value: '+30',
    label: 'Proyectos',
    color: '#A5CE39', // Verde del tema
  },
  {
    value: '+15',
    label: 'Colaboradores',
    color: 'secondary.main',
  },
];

export default function StatsSection() {
  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            {/* Usamos Card para un estilo consistente */}
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography
                  component="div"
                  variant="h3"
                  fontWeight="900"
                  sx={{ color: stat.color }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}