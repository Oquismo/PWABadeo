/**
 * Indicadores visuales para Edge Swipe Navigation
 * Muestra feedback visual cuando el usuario hace swipe desde los bordes
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { EdgePosition, EdgeSwipeAction } from '@/hooks/useEdgeSwipeNavigation';

interface EdgeSwipeIndicatorProps {
  visible: boolean;
  edge: EdgePosition | null;
  progress: number; // 0-100
  actions: EdgeSwipeAction[];
  isActive: boolean;
}

const EdgeSwipeIndicator: React.FC<EdgeSwipeIndicatorProps> = ({
  visible,
  edge,
  progress,
  actions,
  isActive
}) => {
  if (!visible || !edge || actions.length === 0) {
    return null;
  }

  const getIndicatorPosition = () => {
    switch (edge) {
      case 'left':
        return {
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          borderRadius: '0 12px 12px 0'
        };
      case 'right':
        return {
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          borderRadius: '12px 0 0 12px'
        };
      case 'top':
        return {
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '0 0 12px 12px'
        };
      case 'bottom':
        return {
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '12px 12px 0 0'
        };
    }
  };

  const getSwipeDirection = () => {
    switch (edge) {
      case 'left': return '→';
      case 'right': return '←';
      case 'top': return '↓';
      case 'bottom': return '↑';
    }
  };

  const isHorizontal = edge === 'left' || edge === 'right';
  const action = actions[0]; // Mostrar primera acción por simplicidad

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ 
            opacity: 0,
            scale: 0.8,
            ...(isHorizontal 
              ? { x: edge === 'left' ? -20 : 20 }
              : { y: edge === 'top' ? -20 : 20 }
            )
          }}
          animate={{ 
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0
          }}
          exit={{ 
            opacity: 0,
            scale: 0.8
          }}
          style={{
            position: 'fixed',
            zIndex: 1200,
            pointerEvents: 'none',
            ...getIndicatorPosition()
          }}
        >
          <Paper
            elevation={6}
            sx={{
              background: `linear-gradient(135deg, ${action.color || '#2196F3'}20, ${action.color || '#2196F3'}40)`,
              backdropFilter: 'blur(20px)',
              border: `2px solid ${action.color || '#2196F3'}`,
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: isHorizontal ? 120 : 'auto',
              minHeight: isHorizontal ? 'auto' : 120,
              flexDirection: isHorizontal ? 'row' : 'column',
              borderRadius: '12px',
              transform: `scale(${0.8 + (progress * 0.004)})`,
              transition: 'transform 0.1s ease'
            }}
          >
            {/* Ícono de la acción */}
            <Box
              sx={{
                fontSize: '1.5rem',
                opacity: 0.9
              }}
            >
              {typeof action.icon === 'string' ? (
                <span role="img" aria-label={action.label}>
                  {action.icon}
                </span>
              ) : (
                action.icon
              )}
            </Box>

            {/* Etiqueta */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                fontSize: '0.75rem',
                opacity: 0.9
              }}
            >
              {action.label}
            </Typography>

            {/* Indicador de dirección */}
            <Box
              sx={{
                fontSize: '1.2rem',
                opacity: 0.7,
                animation: isActive ? 'pulse 1s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 }
                }
              }}
            >
              {getSwipeDirection()}
            </Box>
          </Paper>

          {/* Barra de progreso */}
          <Box
            sx={{
              position: 'absolute',
              ...(isHorizontal 
                ? {
                    bottom: -8,
                    left: 0,
                    right: 0,
                    height: 4
                  }
                : {
                    right: -8,
                    top: 0,
                    bottom: 0,
                    width: 4
                  }
              ),
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ [isHorizontal ? 'width' : 'height']: '0%' }}
              animate={{ [isHorizontal ? 'width' : 'height']: `${progress}%` }}
              style={{
                background: action.color || '#2196F3',
                [isHorizontal ? 'height' : 'width']: '100%',
                borderRadius: 'inherit'
              }}
            />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EdgeSwipeIndicator;