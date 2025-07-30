'use client';

import { Box, Typography, Container, Stack, Avatar } from '@mui/material';

const processSteps = [
  {
    step: '1',
    title: 'Application & Evaluation',
    description: 'We assess your profile and goals to find the ideal program for you.',
    color: 'primary.main',
  },
  {
    step: '2',
    title: 'Preparation & Training',
    description: 'Language and cultural preparation sessions to maximize your experience.',
    color: 'secondary.main',
  },
  {
    step: '3',
    title: 'Experience & Monitoring',
    description: 'Support throughout your stay abroad with personalized tutoring.',
    color: '#f59e0b',
  },
];

export default function ProcessTimeline() {
  return (
    <Container sx={{ py: 8 }}>
      <Typography component="h3" variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
        Nuestro Proceso
      </Typography>
      {/* Stack nos permite apilar elementos verticalmente con un espaciado definido */}
      <Stack spacing={4}>
        {processSteps.map((item) => (
          // Contenedor de cada paso en la línea de tiempo
          <Box key={item.step} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* El círculo numerado */}
            <Avatar sx={{ bgcolor: item.color, width: 40, height: 40, fontWeight: 'bold' }}>
              {item.step}
            </Avatar>
            {/* El contenido de texto */}
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}