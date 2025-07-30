import { Box, Container, Typography } from '@mui/material';
import InfoStats from '../info/InfoStats';
import ProcessTimeline from '../info/ProcessTimeline';
import InstagramFeed from '../info/InstagramFeed'; // 1. Importar

export default function InformacionPage() {
  return (
    <Container>
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" fontWeight="bold">
          Barrio de Oportunidades
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
          Un programa de movilidad internacional que impulsa el talento joven, conectando barrios con Europa.
        </Typography>
      </Box>

      <InfoStats />
      <ProcessTimeline />
      <InstagramFeed /> {/* 2. Añadir aquí */}

      {/* Solo nos faltaría la sección final de CTA */}
    </Container>
  );
}