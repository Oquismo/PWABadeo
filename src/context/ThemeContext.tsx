'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, Stack, Button } from '@mui/material';
import { darkTheme, lightTheme } from '@/theme/theme'; // Asumimos que theme.ts sigue existiendo
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  setTheme: (theme: ThemePreference) => void;
  mode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [open, setOpen] = useState(false);

  // Detecta la preferencia del sistema operativo
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Determina el modo actual (light o dark) basándose en la preferencia y el sistema
  const mode = useMemo(() => {
    if (themePreference === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, prefersDarkMode]);

  // Al cargar, comprueba si ya se ha hecho una elección
  useEffect(() => {
    const savedPreference = localStorage.getItem('themePreference') as ThemePreference | null;
    if (savedPreference) {
      setThemePreference(savedPreference);
    } else {
      // Si es la primera vez, abrimos el pop-up
      setOpen(true);
    }
  }, []);

  const setTheme = (preference: ThemePreference) => {
    localStorage.setItem('themePreference', preference);
    setThemePreference(preference);
    setOpen(false); // Cierra el pop-up al hacer una elección
  };

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
        {/* El Pop-up (Dialog) para elegir el tema */}
        <Dialog open={open} onClose={() => setTheme('system')}>
          <DialogTitle fontWeight="bold">Elige tu apariencia</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Button variant="outlined" startIcon={<Brightness7Icon />} onClick={() => setTheme('light')}>
                Modo Claro
              </Button>
              <Button variant="outlined" startIcon={<Brightness4Icon />} onClick={() => setTheme('dark')}>
                Modo Oscuro
              </Button>
              <Button variant="outlined" startIcon={<SettingsBrightnessIcon />} onClick={() => setTheme('system')}>
                Usar configuración del sistema
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
}
