'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

// --- DEFINICIÓN DEL TEMA OSCURO ---
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#BEF264' },
    secondary: { main: '#D946EF' },
    background: { default: '#18181B', paper: 'rgba(39, 39, 42, 0.7)' },
    text: { primary: '#FFFFFF', secondary: '#A1A1AA' },
  },
  typography: { fontFamily: [ 'Inter', 'sans-serif' ].join(',') },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(39, 39, 42, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
          borderRadius: '16px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '9999px', textTransform: 'none', fontWeight: 'bold' },
      },
    },
  },
});

// --- DEFINICIÓN DEL TEMA CLARO ---
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3B82F6' },
    background: { default: '#F4F6F8', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
  },
  typography: { fontFamily: [ 'Inter', 'sans-serif' ].join(',') },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
          borderRadius: '16px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: '9999px', textTransform: 'none', fontWeight: 'bold' },
      },
    },
  },
});


// --- LÓGICA DEL PROVEEDOR Y DEL CONTEXTO ---
interface ThemeContextType {
  toggleTheme: () => void;
  mode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
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