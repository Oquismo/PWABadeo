'use client';

import { Container, Typography, Box, Paper, Stack, Switch } from '@mui/material';
import { useThemeContext } from '@/context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Icono para modo oscuro
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Icono para modo claro

export default function AjustesPage() {
  // Usamos nuestro hook para obtener el modo actual y la función para cambiarlo
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 4 }}>
          Ajustes
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight="medium">
              Modo Oscuro
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Brightness7Icon sx={{ color: mode === 'light' ? 'primary.main' : 'text.disabled' }} />
              <Switch
                checked={mode === 'dark'}
                onChange={toggleTheme}
                color="primary"
              />
              <Brightness4Icon sx={{ color: mode === 'dark' ? 'primary.main' : 'text.disabled' }} />
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}