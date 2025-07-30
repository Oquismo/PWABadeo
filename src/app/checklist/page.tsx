import { Box, Container, Typography } from '@mui/material';
import ArrivalChecklist from '@/components/checklist/ArrivalChecklist';

export default function ChecklistPage() {
  return (
    <Container>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Tareas de Llegada
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          Completa estos pasos para instalarte sin problemas.
        </Typography>
      </Box>
      <ArrivalChecklist />
    </Container>
  );
}