'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import M3Button from '@/components/ui/M3Button';
import { useRouter } from 'next/navigation';

export default function CuentaEliminadaPage() {
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <SuccessIcon sx={{ fontSize: 80, color: 'white' }} />
          
          <Typography variant="h4" fontWeight={700}>
            Cuenta Eliminada
          </Typography>
          
          <Typography variant="body1">
            Tu cuenta y todos tus datos han sido eliminados correctamente de nuestros sistemas.
          </Typography>
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          ¿Qué sucede ahora?
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              ✅ Tu cuenta ha sido desactivada inmediatamente
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              🗑️ Todos tus datos personales serán eliminados permanentemente en un plazo de 30 días
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              📧 No recibirás más notificaciones ni comunicaciones de nuestra parte
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              🔐 Tu dirección de correo electrónico quedará disponible para registro futuro
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'info.light' }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          ¿Cambiaste de opinión?
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Si eliminaste tu cuenta por error, tienes <strong>30 días</strong> para contactarnos
          y solicitar la recuperación de tus datos antes de que sean eliminados permanentemente.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Contacto: <strong>rovetta215@gmail.com</strong>
        </Typography>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <M3Button
          m3variant="filled"
          onClick={() => router.push('/')}
          startIcon={<HomeIcon />}
        >
          Ir a la página principal
        </M3Button>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        align="center"
        display="block"
        sx={{ mt: 4 }}
      >
        Gracias por haber sido parte de Barrio de oportunidades.
        <br />
        Te deseamos lo mejor en tu experiencia Erasmus. 🎓
      </Typography>
    </Container>
  );
}
