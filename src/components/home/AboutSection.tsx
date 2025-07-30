'use client';

import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid'; // Importamos Grid de su ruta exacta

const aboutImageUrl = 'https://images.unsplash.com/photo-1543269865-cbf427effbad';

export default function AboutSection() {
  return (
    <Container sx={{ py: 8 }}>
      <Grid container spacing={4} alignItems="center">
        {/* ASEGÚRATE DE QUE TU CÓDIGO SE VEA ASÍ, SIN 'item' */}
        <Grid xs={12} md={6}>
          <Typography 
            component="h2" 
            variant="h3" 
            fontWeight="bold" 
            gutterBottom
          >
            ¿Qué es Barrios de Oportunidades?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Barrios de Oportunidades es un proyecto de innovación social, 
            promovido por la Fundación Alalá y la Fundación Endesa, que nace 
            con el objetivo de transformar aquellos barrios de España con 
            mayor tasa de desempleo y abandono escolar.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            El proyecto busca fomentar la inserción socio-laboral de sus 
            vecinos, así como la transformación social y económica del barrio.
          </Typography>
        </Grid>
        
        {/* ASEGÚRATE DE QUE TU CÓDIGO SE VEA ASÍ, SIN 'item' */}
        
        <Grid xs={12} md={6}>
          <Box
            component="img"
            src={aboutImageUrl}
            alt="Personas de la comunidad interactuando"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: '24px',
              boxShadow: 3,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}