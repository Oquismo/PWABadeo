'use client';
import { createTheme } from '@mui/material/styles';

// Nueva paleta de colores extraída de la última imagen
const palette = {
  primary: '#BEF264', // El verde/lima brillante para elementos activos
  secondary: '#D946EF', // El magenta/púrpura para otros acentos
  background: '#18181B', // Un fondo oscuro casi negro
  surface: 'rgba(39, 39, 42, 0.7)', // Gris oscuro translúcido para las superficies
  surfaceBorder: 'rgba(255, 255, 255, 0.1)', // Borde blanco muy sutil
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA', // Un gris más suave para texto secundario
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.primary,
    },
    secondary: {
      main: palette.secondary,
    },
    background: {
      default: palette.background,
      paper: palette.surface, // Las superficies usarán el color translúcido
    },
    text: {
      primary: palette.textPrimary,
      secondary: palette.textSecondary,
    },
  },
  typography: {
    fontFamily: [ 'Inter', 'sans-serif' ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
  },
  components: {
    // Definimos el estilo base para Paper y Card para que tengan el efecto cristal
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: `1px solid ${palette.surfaceBorder}`,
          boxShadow: 'none',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: palette.surface,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${palette.surfaceBorder}`,
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

export default theme;