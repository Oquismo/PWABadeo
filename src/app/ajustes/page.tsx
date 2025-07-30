import { Container, Typography } from '@mui/material';

export default function AjustesPage() {
  return (
    <Container>
      <Typography component="h1" variant="h3" fontWeight="bold" sx={{ mt: 4 }}>
        Ajustes
      </Typography>
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Aquí irían las opciones de configuración de la cuenta y la aplicación.
      </Typography>
    </Container>
  );
}