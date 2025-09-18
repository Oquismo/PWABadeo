'use client';

import React from 'react';
import { Box, Skeleton as MuiSkeleton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const wave = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const SkeletonContainer = styled(Box)<{ animation: string }>(({ theme, animation }) => ({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[200],
  borderRadius: theme.shape.borderRadius,

  '&::after': animation === 'wave' ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, transparent, ${theme.palette.common.white}, transparent)`,
    animation: `${wave} 1.5s infinite`,
  } : {},

  ...(animation === 'pulse' && {
    animation: `${pulse} 1.5s ease-in-out infinite`,
  }),
}));

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  sx?: any;
}

export function Skeleton({
  variant = 'rectangular',
  width = '100%',
  height,
  animation = 'pulse',
  className,
  sx
}: SkeletonProps) {
  const getHeight = () => {
    if (height) return height;
    switch (variant) {
      case 'text':
        return '1rem';
      case 'circular':
        return width;
      default:
        return '1rem';
    }
  };

  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return '50%';
      case 'rounded':
        return '8px';
      default:
        return '4px';
    }
  };

  return (
    <SkeletonContainer
      animation={animation}
      className={className}
      sx={{
        width,
        height: getHeight(),
        borderRadius: getBorderRadius(),
        ...sx
      }}
    />
  );
}

// Componentes específicos para diferentes tipos de contenido
export function CardSkeleton() {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </Box>
  );
}

export function ListItemSkeleton() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="50%" height={16} />
      </Box>
      <Skeleton variant="rectangular" width={60} height={24} />
    </Box>
  );
}

export function ProfileSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
      <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={100} height={16} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, width: '100%', maxWidth: 300 }}>
        <Skeleton variant="rectangular" height={36} sx={{ flex: 1 }} />
        <Skeleton variant="rectangular" height={36} sx={{ flex: 1 }} />
      </Box>
    </Box>
  );
}

export function MapSkeleton() {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
      <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
        <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
      </Box>
    </Box>
  );
}

export default Skeleton;