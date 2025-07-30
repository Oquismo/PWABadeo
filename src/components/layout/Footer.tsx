'use client';

import { Box, Container, Grid, Typography, IconButton, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main', // Usamos el azul oscuro de la marca
        color: 'white',
        py: 4,
        mt: 8, // Margen superior para separarlo del contenido
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between" alignItems="center">
          
          {/* Columna de Logos/Partners */}
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Promueven
            </Typography>
            <Typography variant="body2">Fundación Alalá</Typography>
            <Typography variant="body2">Fundación Endesa</Typography>
          </Grid>
          
          {/* Columna de Copyright */}
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} Barrio de Oportunidades
            </Typography>
            <Typography variant="caption">
              Todos los derechos reservados.
            </Typography>
          </Grid>

          {/* Columna de Redes Sociales */}
          <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <IconButton href="#" color="inherit" aria-label="Facebook">
              <FacebookIcon />
            </IconButton>
            <IconButton href="#" color="inherit" aria-label="Twitter">
              <TwitterIcon />
            </IconButton>
            <IconButton href="#" color="inherit" aria-label="Instagram">
              <InstagramIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}