'use client';

import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  DialogProps,
  Box,
  Typography,
  IconButton,
  Button,
  styled,
  useTheme,
  alpha,
  Slide,
  Paper
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { Close as CloseIcon } from '@mui/icons-material';

// Transición personalizada para Material 3
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Container con estilo Material 3
const Material3DialogPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '28px', // --md-sys-shape-corner-extra-large según spec
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#2D3748' // Fondo sólido oscuro
    : '#FFFFFF', // Fondo sólido claro
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.08)'
    : '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.32)'
    : '0 8px 32px rgba(0, 0, 0, 0.12)',
  minWidth: '280px',
  maxWidth: '560px',
  margin: '48px', // backgroundInset según spec
  position: 'relative',
  overflow: 'hidden',
}));

// Título con estilo Material 3
const Material3DialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: '24px 24px 16px 24px',
  fontFamily: '"Google Sans", "Roboto", sans-serif',
  fontSize: '1.375rem', // --md-sys-typescale-headline-small
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000', // Colores más contrastados
  letterSpacing: '-0.025em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '64px',
}));

// Contenido con estilo Material 3
const Material3DialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '0 24px 16px 24px',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: '0.875rem', // --md-sys-typescale-body-medium
  fontWeight: 400,
  lineHeight: 1.5,
  color: theme.palette.mode === 'dark' ? '#E0E0E0' : '#333333', // Colores más contrastados
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
  },
}));

// Acciones con estilo Material 3
const Material3DialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 24px 24px 24px',
  gap: '8px',
  justifyContent: 'flex-end',
  
  '& .MuiButton-root': {
    borderRadius: '20px', // Material 3 button shape
    padding: '10px 24px',
    fontWeight: 500,
    fontSize: '0.875rem',
    textTransform: 'none',
    fontFamily: '"Google Sans", "Roboto", sans-serif',
    minWidth: '64px',
    
    // Text button style (for dialog actions)
    '&.MuiButton-text': {
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    },
    
    // Contained button style
    '&.MuiButton-contained': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
      },
    },
    
    // Outlined button style
    '&.MuiButton-outlined': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.12)' 
        : 'rgba(0, 0, 0, 0.12)',
      color: theme.palette.mode === 'dark' ? '#E8EAED' : '#374151',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        borderColor: theme.palette.primary.main,
      },
    },
  },
}));

// Backdrop con estilo Material 3
const Material3Backdrop = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.6)' // 60% dim según spec
    : 'rgba(0, 0, 0, 0.32)', // 32% dim según spec
  backdropFilter: 'blur(4px)',
}));

export interface Material3DialogProps extends Omit<DialogProps, 'PaperComponent' | 'BackdropComponent' | 'TransitionComponent' | 'title'> {
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  actions?: React.ReactNode;
  supportingText?: string;
  icon?: React.ReactNode;
}

export default function Material3Dialog({
  title,
  subtitle,
  showCloseButton = true,
  actions,
  supportingText,
  icon,
  children,
  onClose,
  ...props
}: Material3DialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      {...props}
      onClose={onClose}
      PaperComponent={Material3DialogPaper}
      slots={{
        backdrop: Material3Backdrop,
      }}
      TransitionComponent={Transition}
      transitionDuration={{
        enter: 300,
        exit: 200,
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center',
        },
        ...props.sx,
      }}
    >
      {(title || showCloseButton) && (
        <Material3DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {icon && (
              <Box 
                sx={{ 
                  color: theme.palette.secondary.main, // colorSecondary según spec
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '24px'
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              {title && (
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontSize: '1.375rem',
                    fontWeight: 600,
                    color: 'inherit',
                    lineHeight: 1.3,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    m: 0,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    mt: 0.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          {showCloseButton && (
            <IconButton
              onClick={(e) => onClose?.(e, 'backdropClick')}
              sx={{
                color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
                padding: '8px',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Material3DialogTitle>
      )}

      <Material3DialogContent>
        {supportingText && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              mb: supportingText && children ? 2 : 0,
            }}
          >
            {supportingText}
          </Typography>
        )}
        {children}
      </Material3DialogContent>

      {actions && (
        <Material3DialogActions>
          {actions}
        </Material3DialogActions>
      )}
    </Dialog>
  );
}

// Export también las partes styled para casos específicos
export { 
  Material3DialogPaper, 
  Material3DialogTitle, 
  Material3DialogContent, 
  Material3DialogActions,
  Material3Backdrop
};
