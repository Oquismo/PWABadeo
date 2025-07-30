'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38A4DC', // Nuevo azul primario
    },
    secondary: {
      main: '#FCAE1F', // Nuevo amarillo/naranja secundario
    },
    success: {
      main: '#A5CE39', // Nuevo verde de éxito
    },
    background: {
      default: '#1F2937', 
      paper: '#2C3A4B',   
    },
    text: {
      primary: '#ffffff',
      secondary: '#bbbbbb',
    },
  },
  typography: {
    fontFamily: [
      'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 
      'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 
      'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', 
      '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px', 
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.12)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.2)',
          },
        },
      },
    },
  },
});

export default theme;