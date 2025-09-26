'use client';

import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export type M3Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'icon';

// Omit potential conflicting props from Anchor attributes (like 'color')
// Only allow minimal anchor props to avoid conflicting type definitions
interface M3ButtonProps extends ButtonProps {
  m3variant?: M3Variant;
  href?: string;
  target?: string;
  rel?: string;
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'm3variant'
})<M3ButtonProps>(({ theme, m3variant }) => {
  const common = {
    borderRadius: 14,
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 14px',
    boxShadow: 'none',
  } as any;

  switch (m3variant) {
    case 'filled':
      return {
        ...common,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.getContrastText(theme.palette.primary.main),
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      };
    case 'tonal':
      return {
        ...common,
        backgroundColor: theme.palette.mode === 'dark' ? '#3A2C4A' : '#EADDFF',
        color: theme.palette.mode === 'dark' ? '#E8DEF8' : '#381E72',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' ? '#4A3656' : '#E7D9FF',
        },
      };
    case 'outlined':
      return {
        ...common,
        backgroundColor: 'transparent',
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      };
    case 'text':
      return {
        ...common,
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
        padding: '6px 8px',
        fontWeight: 600,
      };
    case 'elevated':
      return {
        ...common,
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        color: theme.palette.text.primary,
      };
    case 'icon':
      return {
        ...common,
        minWidth: 40,
        width: 40,
        height: 40,
        padding: 0,
        borderRadius: 10,
        color: theme.palette.text.primary,
      };
    default:
      return common;
  }
});

export default function M3Button({ m3variant = 'filled', children, ...props }: M3ButtonProps) {
  // Map m3variant to MUI Button variant when applicable
  const variantMap: Record<M3Variant, ButtonProps['variant'] | undefined> = {
    filled: undefined,
    tonal: undefined,
    outlined: 'outlined',
    text: 'text',
    elevated: undefined,
    icon: 'contained',
  };

  const muiVariant = variantMap[m3variant];

  return (
    <StyledButton m3variant={m3variant} variant={muiVariant} {...props}>
      {children}
    </StyledButton>
  );
}
