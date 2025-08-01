'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, Stack, Button } from '@mui/material';
import { darkTheme as initialDarkTheme, lightTheme } from '@/theme/theme'; // Asumimos que theme.ts sigue existiendo
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  setTheme: (theme: ThemePreference) => void;
  mode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- NUEVO ESTILO PARA LAS TARJETAS EN MODO OSCURO ---
const darkTheme = createTheme(initialDarkTheme, {
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#252A3A', // Fondo azulado oscuro y sólido
          border: '1px solid #33374A', // Borde sutil para definir la forma
          backdropFilter: 'none', // Eliminamos el efecto de cristal
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Sombra muy discreta
        }
      }
    },
    MuiPaper: {
       styleOverrides: {
        root: {
          backgroundColor: '#252A3A',
          border: '1px solid #33374A',
          backdropFilter: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }
      }
    }
  }
});


export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [open, setOpen] = useState(false);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const mode = useMemo(() => {
    if (themePreference === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, prefersDarkMode]);

  useEffect(() => {
    const savedPreference = localStorage.getItem('themePreference') as ThemePreference | null;
    if (savedPreference) {
      setThemePreference(savedPreference);
    } else {
      setOpen(true);
    }
  }, []);

  const setTheme = (preference: ThemePreference) => {
    localStorage.setItem('themePreference', preference);
    setThemePreference(preference);
    setOpen(false);
  };

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
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

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
}
