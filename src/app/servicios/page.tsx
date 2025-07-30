import { Box, Container, Typography } from '@mui/material';
import ServicesList from '@/components/servicios/ServicesList';

export default function ServiciosPage() {
  return (
    <Container>
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" fontWeight="bold">
          Nuestros Servicios
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
          Soluciones reales para tu movilidad internacional.
        </Typography>
      </Box>

      <ServicesList />
      
    </Container>
  );
}