'use client';
import { createTheme } from '@mui/material/styles';

// --- TEMA OSCURO (EL QUE YA TENÍAMOS) ---
const darkPalette = {
  primary: '#BEF264',
  secondary: '#D946EF',
  background: '#18181B',
  surface: 'rgba(39, 39, 42, 0.7)',
  surfaceBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: darkPalette.primary },
    secondary: { main: darkPalette.secondary },
    background: { default: darkPalette.background, paper: darkPalette.surface },
    text: { primary: darkPalette.textPrimary, secondary: darkPalette.textSecondary },
  },
  // --- CORRECCIÓN AQUÍ ---
  // Se ha añadido el objeto de tipografía que faltaba
  typography: {
    fontFamily: [ 'var(--font-inter)', 'Inter', 'sans-serif' ].join(','),
    h1: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
    h2: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
    h3: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
    h4: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: `1px solid ${darkPalette.surfaceBorder}`,
          boxShadow: 'none',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: darkPalette.surface,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${darkPalette.surfaceBorder}`,
          boxShadow: 'none',
          borderRadius: '16px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
});


// --- TEMA CLARO (NUEVO) ---
const lightPalette = {
  primary: '#3B82F6',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceBorder: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: lightPalette.primary },
    background: { default: lightPalette.background, paper: lightPalette.surface },
    text: { primary: lightPalette.textPrimary, secondary: lightPalette.textSecondary },
  },
  // --- CORRECCIÓN AQUÍ ---
  // Se ha añadido el objeto de tipografía que faltaba
  typography: {
    fontFamily: [ 'var(--font-inter)', 'Inter', 'sans-serif' ].join(','),
    h1: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
    h2: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
    h3: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
    h4: { fontWeight: 700, fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${lightPalette.surfaceBorder}`,
          boxShadow: 'none',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: lightPalette.surface,
          border: `1px solid ${lightPalette.surfaceBorder}`,
          boxShadow: 'none',
          borderRadius: '16px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
});
