
"use client";
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { darkTheme as initialDarkTheme } from '@/theme/theme';

const ThemeContext = createContext<{ mode: 'dark' }>({ mode: 'dark' });


const darkTheme = createTheme(initialDarkTheme, {
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#252A3A',
          border: '1px solid #33374A',
          backdropFilter: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
  const theme = useMemo(() => darkTheme, []);
  return (
    <ThemeContext.Provider value={{ mode: 'dark' }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}



export function useThemeContext() {
  return useContext(ThemeContext);
}
