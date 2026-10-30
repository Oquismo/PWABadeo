"use client";
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { lightTheme } from '@/theme/theme';

const ThemeContext = createContext<{ mode: 'light' }>({ mode: 'light' });

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => lightTheme, []);
  return (
    <ThemeContext.Provider value={{ mode: 'light' }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
