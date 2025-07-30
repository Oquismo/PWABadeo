import { Box, Container, Typography } from '@mui/material';
import PhoneList from '@/components/telefonos/PhoneList';

export default function TelefonosPage() {
  return (
    <Container>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Números de Interés
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          Contactos importantes de la comunidad.
        </Typography>
      </Box>

      <PhoneList />
      
    </Container>
  );
}