"use client";
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { darkTheme } from '@/theme/theme';

const ThemeContext = createContext<{ mode: 'dark' }>({ mode: 'dark' });

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
