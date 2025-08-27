'use client';

import { Alert, Box, Typography, Chip } from '@mui/material';
import { Security as SecurityIcon, Warning as WarningIcon } from '@mui/icons-material';

interface SecurityWarningProps {
  level?: 'warning' | 'error';
  title?: string;
  message?: string;
}

export default function SecurityWarning({ 
  level = 'error', 
  title = 'Zona de Administración',
  message = 'Esta área contiene herramientas de debug y administración. Solo accesible para administradores.'
}: SecurityWarningProps) {
  return (
    <Alert 
      severity={level} 
      icon={level === 'error' ? <SecurityIcon /> : <WarningIcon />}
      sx={{ 
        mb: 3,
        border: level === 'error' ? '2px solid #d32f2f' : '2px solid #ed6c02',
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          🔒 {title}
        </Typography>
        <Chip 
          label="ADMIN ONLY" 
          color={level} 
          size="small" 
          variant="filled"
        />
      </Box>
      
      <Typography variant="body2">
        {message}
      </Typography>
      
      <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
        ⚠️ Cualquier modificación en esta sección puede afectar el funcionamiento de la aplicación.
      </Typography>
    </Alert>
  );
}
