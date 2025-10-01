'use client';

import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

// Material Design 3 Expressive Motion
const EMPHASIZED_DECELERATE = [0.05, 0.7, 0.1, 1.0] as const;

export default function PageSkeleton({ height = 220 }: { height?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.2, // 200ms - Material 3 fast duration
        ease: EMPHASIZED_DECELERATE 
      }}
      style={{ width: '100%' }}
    >
      <Box sx={{ width: '100%', py: 2 }}>
        {/* Contenedor principal con animación de onda más suave */}
        <Skeleton 
          variant="rectangular" 
          height={height} 
          animation="wave"
          sx={{
            borderRadius: 2,
            bgcolor: 'action.hover',
            '&::after': {
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }
          }}
        />
        
        {/* Líneas de texto con diferentes anchos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
          <Skeleton 
            variant="text" 
            width="75%" 
            height={32}
            animation="wave"
            sx={{ 
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          />
          <Skeleton 
            variant="text" 
            width="55%" 
            height={28}
            animation="wave"
            sx={{ 
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          />
          <Skeleton 
            variant="text" 
            width="65%" 
            height={24}
            animation="wave"
            sx={{ 
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          />
        </Box>

        {/* Botones circulares con espaciado mejorado */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'center' }}>
          <Skeleton 
            variant="circular" 
            width={48} 
            height={48}
            animation="wave"
            sx={{ bgcolor: 'action.hover' }}
          />
          <Skeleton 
            variant="circular" 
            width={48} 
            height={48}
            animation="wave"
            sx={{ bgcolor: 'action.hover' }}
          />
          <Skeleton 
            variant="circular" 
            width={48} 
            height={48}
            animation="wave"
            sx={{ bgcolor: 'action.hover' }}
          />
        </Box>

        {/* Línea adicional al final */}
        <Box sx={{ mt: 2 }}>
          <Skeleton 
            variant="text" 
            width="40%" 
            height={20}
            animation="wave"
            sx={{ 
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
}
