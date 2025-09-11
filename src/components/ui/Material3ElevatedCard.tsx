'use client';

import React from 'react';
import { 
  Card, 
  CardProps,
  useTheme,
  styled,
  ButtonBase
} from '@mui/material';

// Material 3 Elevated Card Component según especificaciones oficiales
// https://m3.material.io/components/cards/overview

const Material3ElevatedCardRoot = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isDragged' && prop !== 'isChecked'
})<{ isDragged?: boolean; isChecked?: boolean }>(({ theme, isDragged, isChecked }) => ({
  // 📐 Container Shape - Material 3 Medium Corner Radius (12dp)
  borderRadius: '12px',
  
  // 🎨 Container Color - Surface Container Low for Elevated
  backgroundColor: theme.palette.mode === 'dark'
    ? theme.palette.grey[900] // Surface container low dark
    : '#F7F2FA', // Surface container low light
  
  // 🏔️ Elevation - 1dp base elevation for elevated cards
  boxShadow: isDragged
    ? (theme.palette.mode === 'dark'
        ? '0 10px 24px rgba(0,0,0,0.6), 0 16px 40px rgba(0,0,0,0.45)'
        : '0px 8px 16px rgba(0, 0, 0, 0.24), 0px 16px 32px rgba(0, 0, 0, 0.12)') // Elevated when dragged
    : (theme.palette.mode === 'dark'
        ? '0 4px 12px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.4)'
        : '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)'), // Standard elevation
  
  // 🖱️ Interactive States
  // Transitions sólo sobre transform y box-shadow para reducir repaints
  transition: 'transform 200ms cubic-bezier(.2,.9,.3,1), box-shadow 200ms cubic-bezier(.2,.9,.3,1), opacity 120ms linear',
  willChange: 'transform, box-shadow, opacity',

  // Hover state (solo en dispositivos con hover pointer fine)
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      boxShadow: theme.palette.mode === 'dark'
        ? '0 18px 44px rgba(0,0,0,0.6), 0 10px 24px rgba(0,0,0,0.45)'
        : '0 12px 30px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.08)', // Elevation visual más marcada
      transform: 'translateY(-6px) scale(1.01)', // Lift más perceptible
    }
  },
  
  // Focus state
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    transform: 'translateY(-2px) scale(1.005)',
  },
  
  // Active/pressed state
  '&:active': {
    transform: 'translateY(0px) scale(0.999)', // Return to original position with slight press
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)', // Back to base elevation
  },
  
  // 🎯 Checked state overlay
  ...(isChecked && {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.primary.main,
      opacity: 0.08, // 8% overlay for checked state
      borderRadius: 'inherit',
      pointerEvents: 'none',
    }
  }),
  
  // 📱 Dragged state
  ...(isDragged && {
    backgroundColor: theme.palette.mode === 'dark'
      ? theme.palette.grey[800] // Darker when dragged
      : '#F3EAFD', // Surface container high light when dragged
    opacity: 0.9,
    transform: 'rotate(2deg) scale(1.02)', // Slight rotation and scale for dragged effect
  }),
  
  // 🖼️ Prevent corner overlap for images
  overflow: 'hidden',

  // 🖐️ Mobile-friendly defaults
  touchAction: 'manipulation', // reduce delayed taps
  WebkitTapHighlightColor: 'transparent',
  WebkitUserSelect: 'none',
  userSelect: 'none',

  // Tamaño mínimo y padding más cómodo en móvil para hit targets nativos
  [theme.breakpoints.down('sm')]: {
    borderRadius: '16px',
    minHeight: 68,
    padding: 8,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 18px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.42)'
      : '0 6px 16px rgba(0,0,0,0.10), 0 8px 22px rgba(0,0,0,0.08)',
    transition: 'transform 180ms cubic-bezier(.2,.9,.3,1), box-shadow 180ms ease'
  },
  
  // 📏 Default padding
  padding: 0, // Let CardContent handle padding
  
  // 🎪 Ripple effect color
  '& .MuiTouchRipple-root': {
    color: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

export interface Material3ElevatedCardProps extends Omit<CardProps, 'variant' | 'elevation'> {
  /** Whether the card is in a dragged state */
  isDragged?: boolean;
  /** Whether the card is checked/selected */
  isChecked?: boolean;
  /** Enable ripple effect for interactive cards */
  interactive?: boolean;
}

export default function Material3ElevatedCard({
  isDragged = false,
  isChecked = false,
  interactive = false,
  children,
  onClick,
  ...props
}: Material3ElevatedCardProps) {
  const theme = useTheme();
  
  return (
    <Material3ElevatedCardRoot
      {...props}
      isDragged={isDragged}
      isChecked={isChecked}
      data-interactive={interactive ? 'true' : undefined}
    >
      {interactive ? (
        <ButtonBase
          component="div"
          onClick={onClick}
          disableRipple={false}
          aria-pressed={isChecked ? true : undefined}
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            width: '100%',
            textAlign: 'left',
            borderRadius: 'inherit',
            overflow: 'hidden',
            padding: { xs: 1, sm: 0 },
            minHeight: { xs: 68, sm: 'auto' },
            touchAction: 'manipulation'
          }}
        >
          {children}
        </ButtonBase>
      ) : (
        <div
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          style={{ display: 'block', width: '100%' }}
        >
          {children}
        </div>
      )}
    </Material3ElevatedCardRoot>
  );
}
