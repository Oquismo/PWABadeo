/**
 * Indicador visual para 3D Touch / Force Touch
 * Muestra feedback visual progresivo según el nivel de presión
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface Force3DIndicatorProps {
  visible: boolean;
  level: number; // 0-3
  intensity: number; // 0-100
  position?: { x: number; y: number };
  labels?: string[];
}

const Force3DIndicator: React.FC<Force3DIndicatorProps> = ({
  visible,
  level,
  intensity,
  position = { x: 50, y: 50 }, // Porcentajes de la pantalla
  labels = ['Mantén presionado', 'Vista previa', 'Acción rápida', 'Acción completa']
}) => {
  if (!visible) {
    return null;
  }

  const getLevelColor = (currentLevel: number) => {
    switch (currentLevel) {
      case 1: return '#4CAF50'; // Verde - Peek
      case 2: return '#FF9800'; // Naranja - Pop
      case 3: return '#F44336'; // Rojo - Force
      default: return '#2196F3'; // Azul - Base
    }
  };

  const getCurrentLabel = () => {
    return labels[level] || labels[0];
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          style={{
            position: 'fixed',
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1500,
            pointerEvents: 'none'
          }}
        >
          {/* Círculo principal con ondas */}
          <Box
            sx={{
              position: 'relative',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Ondas de expansión */}
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: level >= ring ? [0.6, 0.2, 0.6] : 0,
                  scale: level >= ring ? [1, 1.5, 1] : 0.5
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: ring * 0.2
                }}
                style={{
                  position: 'absolute',
                  width: 60 + (ring * 20),
                  height: 60 + (ring * 20),
                  borderRadius: '50%',
                  border: `2px solid ${getLevelColor(level)}`,
                  background: `radial-gradient(circle, ${getLevelColor(level)}20, transparent)`
                }}
              />
            ))}

            {/* Círculo central */}
            <motion.div
              animate={{
                scale: 1 + (intensity * 0.01),
                backgroundColor: getLevelColor(level)
              }}
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: getLevelColor(level),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${getLevelColor(level)}50`,
                zIndex: 1
              }}
            >
              {/* Ícono de nivel */}
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {level === 0 ? '⭕' : level === 1 ? '👁️' : level === 2 ? '⚡' : '💥'}
              </Typography>
            </motion.div>
          </Box>

          {/* Etiqueta descriptiva */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: 16
            }}
          >
            <Paper
              elevation={4}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                background: 'rgba(18, 18, 27, 0.95)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${getLevelColor(level)}`,
                color: 'white',
                textAlign: 'center',
                minWidth: 120
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              >
                {getCurrentLabel()}
              </Typography>
              
              {/* Barra de progreso */}
              <Box
                sx={{
                  width: '100%',
                  height: 3,
                  mt: 0.5,
                  borderRadius: 1.5,
                  background: 'rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  animate={{ width: `${intensity}%` }}
                  style={{
                    height: '100%',
                    background: getLevelColor(level),
                    borderRadius: 'inherit'
                  }}
                />
              </Box>
            </Paper>
          </motion.div>

          {/* Indicadores de nivel en los lados */}
          <Box
            sx={{
              position: 'absolute',
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              ml: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            {[1, 2, 3].map((levelIndicator) => (
              <motion.div
                key={levelIndicator}
                animate={{
                  opacity: level >= levelIndicator ? 1 : 0.3,
                  scale: level === levelIndicator ? 1.2 : 1
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: getLevelColor(levelIndicator),
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              />
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Force3DIndicator;