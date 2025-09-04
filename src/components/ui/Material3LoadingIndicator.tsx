'use client';

import React from 'react';
import { 
  Box, 
  BoxProps, 
  keyframes, 
  useTheme, 
  styled,
  Typography
} from '@mui/material';

// Material 3 Loading Indicator Component según especificaciones oficiales
// https://m3.material.io/components/loading-indicator/overview

// Animación de morfeo de formas para el loading indicator
const morphSequence = keyframes`
  0%, 100% { 
    border-radius: 50%; 
    transform: scale(1);
  }
  25% { 
    border-radius: 20%; 
    transform: scale(1.1);
  }
  50% { 
    border-radius: 8px; 
    transform: scale(0.9);
  }
  75% { 
    border-radius: 20%; 
    transform: scale(1.1);
  }
`;

// Animación de rotación suave para el indicador
const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Componente base del indicador
const Material3LoadingIndicatorRoot = styled(Box, {
  shouldForwardProp: (prop) => 
    prop !== 'indicatorSize' && 
    prop !== 'containerWidth' && 
    prop !== 'containerHeight' &&
    prop !== 'contained' &&
    prop !== 'indicatorColor' &&
    prop !== 'containerColor'
})<{
  indicatorSize?: number;
  containerWidth?: number;
  containerHeight?: number;
  contained?: boolean;
  indicatorColor?: string;
  containerColor?: string;
}>(({ theme, indicatorSize = 38, containerWidth = 48, containerHeight = 48, contained = false, indicatorColor, containerColor }) => ({
  // 📐 Container dimensions
  width: contained ? containerWidth : indicatorSize,
  height: contained ? containerHeight : indicatorSize,
  
  // 🎨 Container styling (only for contained variant)
  ...(contained && {
    backgroundColor: containerColor || 'transparent',
    borderRadius: '50%', // Fully rounded container
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  
  // 🔄 Loading indicator itself
  '&::before': {
    content: '""',
    display: 'block',
    width: indicatorSize,
    height: indicatorSize,
    
    // 🎨 Indicator color - defaults to primary
    backgroundColor: indicatorColor || theme.palette.primary.main,
    
    // 📐 Shape morphing animation
    animation: `
      ${morphSequence} 2s infinite ease-in-out,
      ${rotateAnimation} 3s infinite linear
    `,
    
    // 🌟 Material Motion easing
    animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  
  // 🚧 Accessibility
  role: 'progressbar',
  'aria-label': 'Loading',
  'aria-valuemin': 0,
  'aria-valuemax': 100,
  'aria-valuenow': undefined, // Indeterminate
}));

export interface Material3LoadingIndicatorProps extends Omit<BoxProps, 'children'> {
  /** Size of the indicator in dp (default: 38dp) */
  indicatorSize?: number;
  /** Width of the container for contained variant (default: 48dp) */
  containerWidth?: number;
  /** Height of the container for contained variant (default: 48dp) */
  containerHeight?: number;
  /** Whether to show contained variant with background container */
  contained?: boolean;
  /** Color of the loading indicator */
  indicatorColor?: string;
  /** Background color of the container (contained variant only) */
  containerColor?: string;
  /** Show delay in milliseconds before indicator appears */
  showDelay?: number;
  /** Minimum delay in milliseconds before indicator can be hidden */
  minHideDelay?: number;
  /** Optional text to display below the indicator */
  text?: string;
  /** Size variant for quick styling */
  size?: 'small' | 'medium' | 'large';
}

export default function Material3LoadingIndicator({
  indicatorSize: customIndicatorSize,
  containerWidth: customContainerWidth,
  containerHeight: customContainerHeight,
  contained = false,
  indicatorColor,
  containerColor,
  showDelay = 0,
  minHideDelay = 0,
  text,
  size = 'medium',
  sx,
  ...props
}: Material3LoadingIndicatorProps) {
  const theme = useTheme();
  
  // 📏 Size variants
  const sizeVariants = {
    small: {
      indicatorSize: 24,
      containerWidth: 32,
      containerHeight: 32,
    },
    medium: {
      indicatorSize: 38,
      containerWidth: 48,
      containerHeight: 48,
    },
    large: {
      indicatorSize: 56,
      containerWidth: 64,
      containerHeight: 64,
    },
  };
  
  const finalSizes = {
    indicatorSize: customIndicatorSize || sizeVariants[size].indicatorSize,
    containerWidth: customContainerWidth || sizeVariants[size].containerWidth,
    containerHeight: customContainerHeight || sizeVariants[size].containerHeight,
  };
  
  // 🎨 Smart container color based on theme
  const smartContainerColor = containerColor || (
    theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)' 
      : 'rgba(0, 0, 0, 0.04)'
  );
  
  const [visible, setVisible] = React.useState(showDelay === 0);
  
  React.useEffect(() => {
    let showTimer: NodeJS.Timeout | undefined;
    
    if (showDelay > 0) {
      showTimer = setTimeout(() => setVisible(true), showDelay);
    }
    
    return () => {
      if (showTimer) clearTimeout(showTimer);
    };
  }, [showDelay]);
  
  if (!visible) return null;
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: text ? 2 : 0,
        ...sx
      }}
      {...props}
    >
      <Material3LoadingIndicatorRoot
        indicatorSize={finalSizes.indicatorSize}
        containerWidth={finalSizes.containerWidth}
        containerHeight={finalSizes.containerHeight}
        contained={contained}
        indicatorColor={indicatorColor}
        containerColor={smartContainerColor}
      />
      
      {text && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mt: 1,
            textAlign: 'center',
            fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '0.95rem' : '0.875rem'
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
}

// 🚀 Convenience components for common use cases
export const Material3LoadingIndicatorSmall = (props: Omit<Material3LoadingIndicatorProps, 'size'>) => (
  <Material3LoadingIndicator size="small" {...props} />
);

export const Material3LoadingIndicatorLarge = (props: Omit<Material3LoadingIndicatorProps, 'size'>) => (
  <Material3LoadingIndicator size="large" {...props} />
);

export const Material3LoadingIndicatorContained = (props: Omit<Material3LoadingIndicatorProps, 'contained'>) => (
  <Material3LoadingIndicator contained={true} {...props} />
);
