'use client';

import React from 'react';
import { 
  Box, 
  Container,
  Typography,
  Fade,
  useTheme
} from '@mui/material';
import Material3LoadingIndicator from './Material3LoadingIndicator';

export interface Material3LoadingPageProps {
  /** Text to display below the loading indicator */
  text?: string;
  /** Secondary text for additional context */
  subtitle?: string;
  /** Whether to show in fullscreen mode */
  fullScreen?: boolean;
  /** Custom container maxWidth */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to fade in/out */
  fade?: boolean;
  /** Whether the loading is visible */
  visible?: boolean;
  /** Size of the loading indicator */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Material 3 Loading Page Component
 * 
 * A full-page loading component following Material 3 design principles.
 * Useful for page transitions, data loading, and async operations.
 */
export default function Material3LoadingPage({
  text = 'Cargando...',
  subtitle,
  fullScreen = false,
  maxWidth = 'sm',
  fade = true,
  visible = true,
  size = 'large',
}: Material3LoadingPageProps) {
  const theme = useTheme();
  
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '60vh',
        py: 4,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Material3LoadingIndicator
        size={size}
        contained
        sx={{ mb: 3 }}
      />
      
      <Typography 
        variant="h6" 
        color="text.primary"
        sx={{ 
          mb: subtitle ? 1 : 0,
          fontWeight: 500,
        }}
      >
        {text}
      </Typography>
      
      {subtitle && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
  
  if (!visible) return null;
  
  const loadingContent = fullScreen ? (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.palette.background.default,
        zIndex: theme.zIndex.modal + 1,
      }}
    >
      {content}
    </Box>
  ) : (
    <Container maxWidth={maxWidth}>
      {content}
    </Container>
  );
  
  return fade ? (
    <Fade in={visible} timeout={300}>
      <div>{loadingContent}</div>
    </Fade>
  ) : (
    loadingContent
  );
}

/**
 * Convenience component for fullscreen loading
 */
export const Material3LoadingPageFullScreen = (
  props: Omit<Material3LoadingPageProps, 'fullScreen'>
) => (
  <Material3LoadingPage fullScreen {...props} />
);

/**
 * Convenience component for inline loading (e.g., within a card or section)
 */
export const Material3LoadingInline = (
  props: Omit<Material3LoadingPageProps, 'fullScreen' | 'maxWidth'>
) => (
  <Material3LoadingPage fullScreen={false} maxWidth="xs" {...props} />
);
