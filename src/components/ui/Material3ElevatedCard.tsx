'use client';

import React from 'react';
import { 
  Card, 
  CardProps,
  useTheme,
  styled 
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
    ? '0px 8px 16px rgba(0, 0, 0, 0.24), 0px 16px 32px rgba(0, 0, 0, 0.12)' // Elevated when dragged
    : '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)', // Standard elevation 1dp
  
  // 🖱️ Interactive States
  transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)', // Material motion easing
  
  // Hover state
  '&:hover': {
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.16), 0px 2px 4px rgba(0, 0, 0, 0.24)', // Elevation 2dp on hover
    transform: 'translateY(-1px)', // Subtle lift effect
  },
  
  // Focus state
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  
  // Active/pressed state
  '&:active': {
    transform: 'translateY(0px)', // Return to original position
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
      onClick={onClick}
      // Add interactive properties if needed
      {...(interactive && {
        component: 'button',
        role: 'button',
        tabIndex: 0,
        'aria-pressed': isChecked ? 'true' : 'false',
      })}
      // Accessibility
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
      })}
    >
      {children}
    </Material3ElevatedCardRoot>
  );
}
