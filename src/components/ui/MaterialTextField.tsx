'use client';

import React from 'react';
import { TextField, TextFieldProps, styled, useTheme, alpha } from '@mui/material';

// TextField con estilo Material 3
const Material3TextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px', // --md-sys-shape-corner-extra-small
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Container shape y color según Material 3
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.12)' 
        : 'rgba(0, 0, 0, 0.12)',
      borderWidth: '1px',
    },
    
    // Hover state
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.24)' 
        : 'rgba(0, 0, 0, 0.24)',
    },
    
    // Focus state - Material 3 primary color
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
    
    // Error state
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
    
    // Input text styling
    '& input': {
      color: theme.palette.mode === 'dark' ? '#E8EAED' : '#1F2937',
      fontSize: '1rem', // --md-sys-typescale-body-large
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
      
      // Placeholder
      '&::placeholder': {
        color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
        opacity: 1,
      },
    },
    
    // Textarea styling
    '& textarea': {
      color: theme.palette.mode === 'dark' ? '#E8EAED' : '#1F2937',
      fontSize: '1rem',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  
  // Label styling - Material 3 spec
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
    fontSize: '1rem', // --md-sys-typescale-body-large
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    
    // Focused label
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
    
    // Error label
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  
  // Helper text styling
  '& .MuiFormHelperText-root': {
    color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
    fontSize: '0.75rem', // --md-sys-typescale-body-small
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    marginLeft: '16px',
    marginRight: '16px',
    marginTop: '4px', // Supporting text spacing
    
    // Error helper text
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

// Variante filled con estilo Material 3
const Material3FilledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiFilledInput-root': {
    borderRadius: '4px 4px 0 0', // Material 3 filled shape
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.common.white, 0.05)
      : alpha(theme.palette.common.black, 0.06),
    border: 'none',
    
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.common.white, 0.08)
        : alpha(theme.palette.common.black, 0.08),
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.common.white, 0.12)
        : alpha(theme.palette.common.black, 0.12),
    },
    
    '&:before': {
      borderBottom: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.42)' 
        : 'rgba(0, 0, 0, 0.42)'}`,
    },
    
    '&:hover:before': {
      borderBottom: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.87)' 
        : 'rgba(0, 0, 0, 0.87)'}`,
    },
    
    '&:after': {
      borderBottom: `2px solid ${theme.palette.primary.main}`,
    },
    
    // Input text
    '& input, & textarea': {
      color: theme.palette.mode === 'dark' ? '#E8EAED' : '#1F2937',
      fontSize: '1rem',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
      
      '&::placeholder': {
        color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
        opacity: 1,
      },
    },
  },
  
  // Label for filled
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
    fontSize: '1rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
    
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  
  // Helper text
  '& .MuiFormHelperText-root': {
    color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
    fontSize: '0.75rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    marginLeft: '12px',
    marginRight: '12px',
    marginTop: '4px',
    
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

interface MaterialTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled';
  supportingText?: string;
}

export default function MaterialTextField({ 
  variant = 'outlined', 
  supportingText,
  helperText,
  ...props 
}: MaterialTextFieldProps) {
  const finalHelperText = supportingText || helperText;
  
  if (variant === 'filled') {
    return (
      <Material3FilledTextField
        {...props}
        variant="filled"
        helperText={finalHelperText}
      />
    );
  }
  
  return (
    <Material3TextField
      {...props}
      variant="outlined"
      helperText={finalHelperText}
    />
  );
}

// Export también los componentes styled para casos específicos
export { Material3TextField, Material3FilledTextField };
