/**
 * Contenedor con Pinch-to-Zoom integrado
 * Wrapper que añade funcionalidad de zoom a cualquier contenido
 */

import React, { useRef, forwardRef } from 'react';
import { Box, IconButton, Fab, Paper } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import usePinchToZoom from '@/hooks/usePinchToZoom';

interface PinchZoomContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  controlsPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  enableHaptics?: boolean;
  onZoomChange?: (scale: number) => void;
}

const PinchZoomContainer = forwardRef<HTMLDivElement, PinchZoomContainerProps>(({
  children,
  className,
  style,
  showControls = false,
  controlsPosition = 'bottom-right',
  minZoom = 0.5,
  maxZoom = 4,
  initialZoom = 1,
  enableHaptics = true,
  onZoomChange,
  ...props
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    scale,
    isZooming,
    transformStyle,
    resetZoom,
    zoomIn,
    zoomOut,
    isPanning
  } = usePinchToZoom(containerRef, {
    minZoom,
    maxZoom,
    initialZoom,
    enableHaptics,
    onZoomChange
  });

  const getControlsPosition = () => {
    const positions = {
      'top-right': { top: 16, right: 16 },
      'top-left': { top: 16, left: 16 },
      'bottom-right': { bottom: 16, right: 16 },
      'bottom-left': { bottom: 16, left: 16 }
    };
    return positions[controlsPosition];
  };

  const controlsStyle = getControlsPosition();

  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        ...style
      }}
      {...props}
    >
      {/* Contenido con zoom */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          cursor: isZooming ? 'grabbing' : isPanning ? 'grab' : 'default',
          ...transformStyle
        }}
      >
        {children}
      </Box>

      {/* Controles de zoom */}
      {showControls && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            ...controlsStyle,
            borderRadius: 3,
            padding: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            background: 'rgba(18, 18, 27, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <IconButton
            size="small"
            onClick={zoomIn}
            disabled={scale >= maxZoom}
            sx={{
              color: 'white',
              '&:disabled': { opacity: 0.5 }
            }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={resetZoom}
            disabled={scale === initialZoom}
            sx={{
              color: 'white',
              '&:disabled': { opacity: 0.5 }
            }}
          >
            <CenterFocusStrongIcon fontSize="small" />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={zoomOut}
            disabled={scale <= minZoom}
            sx={{
              color: 'white',
              '&:disabled': { opacity: 0.5 }
            }}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      {/* Indicador de zoom */}
      {(isZooming || scale !== initialZoom) && (
        <Paper
          elevation={2}
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            px: 2,
            py: 1,
            borderRadius: 2,
            background: 'rgba(18, 18, 27, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: isZooming ? 1 : 0.7,
            transition: 'opacity 0.2s ease'
          }}
        >
          {Math.round(scale * 100)}%
        </Paper>
      )}
    </Box>
  );
});

PinchZoomContainer.displayName = 'PinchZoomContainer';

export default PinchZoomContainer;