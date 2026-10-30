'use client';
import { createTheme } from '@mui/material/styles';

// ============================================================
// Material Design 3 — Tema claro de Mi Erasmus App
// Seed primary: #BEF264 (brand lime)
// ============================================================

export const md3Tokens = {
  primary: '#2F5200',
  onPrimary: '#E7FFB0',
  primaryContainer: '#C4F278',
  onPrimaryContainer: '#1A2E00',
  secondary: '#5C6350',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E9EDDD',
  onSecondaryContainer: '#14170E',
  tertiary: '#B8461A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFDBCB',
  onTertiaryContainer: '#2A0F00',
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  surface: '#F3F5EC',
  onSurface: '#14170E',
  onSurfaceVariant: '#555B47',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F8FAF1',
  surfaceContainer: '#FFFFFF',
  surfaceContainerHigh: '#E9EDDD',
  surfaceContainerHighest: '#DFE4D0',
  outline: '#8A9078',
  outlineVariant: '#D7DCC8',
  inverseSurface: '#14170E',
  inverseOnSurface: '#EEF1E4',
  inversePrimary: '#C4F278',
} as const;

export const md3Shape = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
} as const;

const brandFont = 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)';
const plainFont = 'var(--font-inter, Inter, Roboto, sans-serif)';

const md3Typography = {
  fontFamily: plainFont,
  h1: { fontFamily: brandFont, fontSize: '3.5625rem', fontWeight: 400, lineHeight: '4rem', letterSpacing: '-0.25px' },
  h2: { fontFamily: brandFont, fontSize: '2.8125rem', fontWeight: 400, lineHeight: '3.25rem', letterSpacing: '0px' },
  h3: { fontFamily: brandFont, fontSize: '2.25rem', fontWeight: 400, lineHeight: '2.75rem', letterSpacing: '0px' },
  h4: { fontFamily: brandFont, fontSize: '2rem', fontWeight: 400, lineHeight: '2.5rem', letterSpacing: '0px' },
  h5: { fontFamily: brandFont, fontSize: '1.75rem', fontWeight: 400, lineHeight: '2.25rem', letterSpacing: '0px' },
  h6: { fontFamily: brandFont, fontSize: '1.5rem', fontWeight: 400, lineHeight: '2rem', letterSpacing: '0px' },
  subtitle1: { fontFamily: plainFont, fontSize: '1.375rem', fontWeight: 400, lineHeight: '1.75rem', letterSpacing: '0px' },
  subtitle2: { fontFamily: plainFont, fontSize: '1rem', fontWeight: 500, lineHeight: '1.5rem', letterSpacing: '0.15px' },
  body1: { fontFamily: plainFont, fontSize: '1rem', fontWeight: 400, lineHeight: '1.5rem', letterSpacing: '0.5px' },
  body2: { fontFamily: plainFont, fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.25rem', letterSpacing: '0.25px' },
  caption: { fontFamily: plainFont, fontSize: '0.75rem', fontWeight: 400, lineHeight: '1rem', letterSpacing: '0.4px' },
  button: { fontFamily: plainFont, fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.25rem', letterSpacing: '0.1px', textTransform: 'none' as const },
  overline: { fontFamily: plainFont, fontSize: '0.6875rem', fontWeight: 500, lineHeight: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase' as const },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: md3Tokens.primary,
      contrastText: md3Tokens.onPrimary,
      dark: md3Tokens.primaryContainer,
      light: md3Tokens.onPrimaryContainer,
    },
    secondary: {
      main: md3Tokens.secondary,
      contrastText: md3Tokens.onSecondary,
      dark: md3Tokens.secondaryContainer,
      light: md3Tokens.onSecondaryContainer,
    },
    error: {
      main: md3Tokens.error,
      contrastText: md3Tokens.onError,
      dark: md3Tokens.errorContainer,
      light: md3Tokens.onErrorContainer,
    },
    background: {
      default: md3Tokens.surface,
      paper: md3Tokens.surfaceContainer,
    },
    text: {
      primary: md3Tokens.onSurface,
      secondary: md3Tokens.onSurfaceVariant,
    },
    divider: md3Tokens.outlineVariant,
  },
  typography: md3Typography,
  shape: {
    borderRadius: md3Shape.medium,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: md3Tokens.surfaceContainer,
          border: `1px solid ${md3Tokens.outlineVariant}`,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: md3Shape.medium,
          backgroundColor: md3Tokens.surfaceContainerLow,
          border: `1px solid ${md3Tokens.outlineVariant}`,
          boxShadow: 'none',
          transition: 'background-color 200ms cubic-bezier(0.2,0,0,1), box-shadow 200ms cubic-bezier(0.2,0,0,1)',
          '&:hover': {
            backgroundColor: md3Tokens.surfaceContainer,
            boxShadow: '0 1px 2px rgba(30,45,0,0.14), 0 1px 3px 1px rgba(30,45,0,0.08)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: md3Shape.full,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          letterSpacing: '0.1px',
          padding: '10px 24px',
          minHeight: 40,
          boxShadow: 'none',
          transition: 'background-color 200ms cubic-bezier(0.2,0,0,1), box-shadow 200ms cubic-bezier(0.2,0,0,1), transform 150ms cubic-bezier(0.2,0,0,1)',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          backgroundColor: md3Tokens.primary,
          color: md3Tokens.onPrimary,
          '&:hover': {
            backgroundColor: md3Tokens.onPrimaryContainer,
            boxShadow: '0 1px 2px rgba(30,45,0,0.14), 0 1px 3px 1px rgba(30,45,0,0.08)',
          },
        },
        containedSecondary: {
          backgroundColor: md3Tokens.secondaryContainer,
          color: md3Tokens.onSecondaryContainer,
          '&:hover': {
            backgroundColor: md3Tokens.onSecondaryContainer,
            color: md3Tokens.secondaryContainer,
            boxShadow: '0 1px 2px rgba(30,45,0,0.14), 0 1px 3px 1px rgba(30,45,0,0.08)',
          },
        },
        outlined: {
          borderColor: md3Tokens.outline,
          color: md3Tokens.primary,
          '&:hover': {
            backgroundColor: 'rgba(47,82,0,0.08)',
            borderColor: md3Tokens.onSurfaceVariant,
          },
        },
        text: {
          color: md3Tokens.primary,
          padding: '10px 12px',
          '&:hover': {
            backgroundColor: 'rgba(47,82,0,0.08)',
          },
        },
        sizeSmall: {
          minHeight: 32,
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          minHeight: 48,
          padding: '12px 32px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: md3Shape.full,
          color: md3Tokens.onSurfaceVariant,
          transition: 'background-color 150ms cubic-bezier(0.2,0,0,1)',
          '&:hover': {
            backgroundColor: 'rgba(20,23,14,0.06)',
          },
        },
        colorPrimary: {
          color: md3Tokens.primary,
          '&:hover': {
            backgroundColor: 'rgba(47,82,0,0.12)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: md3Shape.large,
          backgroundColor: md3Tokens.primaryContainer,
          color: md3Tokens.onPrimaryContainer,
          boxShadow: '0 4px 8px 3px rgba(30,45,0,0.08), 0 1px 3px rgba(30,45,0,0.14)',
          transition: 'box-shadow 200ms cubic-bezier(0.2,0,0,1), transform 200ms cubic-bezier(0.2,0,0,1)',
          '&:hover': {
            boxShadow: '0 6px 10px 4px rgba(30,45,0,0.08), 0 2px 3px rgba(30,45,0,0.14)',
            transform: 'translateY(-1px)',
          },
        },
        sizeSmall: {
          borderRadius: md3Shape.medium,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: md3Tokens.surfaceContainer,
          color: md3Tokens.onSurface,
          boxShadow: 'none',
          borderBottom: `1px solid ${md3Tokens.outlineVariant}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: md3Shape.extraLarge,
          backgroundColor: md3Tokens.surfaceContainerHigh,
          border: `1px solid ${md3Tokens.outlineVariant}`,
          boxShadow: '0 4px 8px 3px rgba(30,45,0,0.08), 0 1px 3px rgba(30,45,0,0.14)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: md3Shape.small,
          backgroundColor: md3Tokens.surfaceContainerLowest,
          '& fieldset': {
            borderColor: md3Tokens.outline,
          },
          '&:hover fieldset': {
            borderColor: md3Tokens.onSurfaceVariant,
          },
          '&.Mui-focused fieldset': {
            borderColor: md3Tokens.primary,
            borderWidth: 2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: md3Shape.small,
          height: 32,
          backgroundColor: md3Tokens.surfaceContainerHigh,
          color: md3Tokens.onSurfaceVariant,
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'background-color 150ms cubic-bezier(0.2,0,0,1)',
          '&:hover': {
            backgroundColor: md3Tokens.surfaceContainerHighest,
          },
        },
        colorPrimary: {
          backgroundColor: md3Tokens.primaryContainer,
          color: md3Tokens.onPrimaryContainer,
          '&:hover': {
            backgroundColor: md3Tokens.onPrimaryContainer,
            color: md3Tokens.primaryContainer,
          },
        },
        colorSecondary: {
          backgroundColor: md3Tokens.secondaryContainer,
          color: md3Tokens.onSecondaryContainer,
          '&:hover': {
            backgroundColor: md3Tokens.onSecondaryContainer,
            color: md3Tokens.secondaryContainer,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: md3Tokens.outlineVariant,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: md3Tokens.surfaceContainerLow,
          borderRight: `1px solid ${md3Tokens.outlineVariant}`,
          borderRadius: 0,
        },
        paperAnchorBottom: {
          borderRadius: `${md3Shape.extraLarge}px ${md3Shape.extraLarge}px 0 0`,
          borderTop: `1px solid ${md3Tokens.outlineVariant}`,
          borderRight: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: md3Shape.small,
          backgroundColor: md3Tokens.inverseSurface,
          color: md3Tokens.inverseOnSurface,
          fontSize: '0.75rem',
          fontWeight: 400,
          padding: '8px 12px',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: md3Shape.small,
          backgroundColor: md3Tokens.surfaceContainer,
          border: `1px solid ${md3Tokens.outlineVariant}`,
          boxShadow: '0 1px 2px rgba(30,45,0,0.14), 0 2px 6px 2px rgba(30,45,0,0.08)',
        },
      },
    },
  },
});
