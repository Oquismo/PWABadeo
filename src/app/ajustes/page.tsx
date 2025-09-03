'use client';

import { Container, Typography, Box, Paper, Stack, Switch, CircularProgress } from '@mui/material';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function AjustesPage() {
  // Usamos una variable temporal para el contexto para poder verificarlo
  const themeContext = useThemeContext();
  const { user, isLoading: authLoading } = useAuth();

  // --- SOLUCIÓN: Verificación de seguridad ---
  // Si el contexto aún no está disponible, mostramos un indicador de carga.
  // Esto previene el error de renderizado.
  if (!themeContext || authLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }


  // Solo modo oscuro, extraemos solo mode si se usa, pero no setTheme
  const { mode } = themeContext;

  // Verificar si el usuario es admin
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
          Ajustes
        </Typography>

        {isAdmin && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight="medium">
                Modo Oscuro (Solo para Administradores)
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Brightness7Icon sx={{ color: mode === 'light' ? 'primary.main' : 'text.disabled' }} />
                <Switch
                  checked={mode === 'dark'}
                  onChange={() => setTheme(mode === 'light' ? 'dark' : 'light')}
                  color="primary"
                />
                <Brightness4Icon sx={{ color: mode === 'dark' ? 'primary.main' : 'text.disabled' }} />
              </Stack>
            </Stack>
          </Paper>
        )}

        {!isAdmin && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Los ajustes de apariencia están temporalmente deshabilitados para usuarios regulares.
              Solo los administradores pueden modificar el modo oscuro por motivos de prueba.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
