import { IconButton, IconButtonProps } from '@mui/material';
import { useHaptics } from '@/hooks/useHaptics';
import { forwardRef } from 'react';

interface HapticIconButtonProps extends IconButtonProps {
  hapticType?: 'tap' | 'buttonClick' | 'success' | 'warning' | 'error';
}

export const HapticIconButton = forwardRef<HTMLButtonElement, HapticIconButtonProps>(
  ({ hapticType = 'tap', onClick, ...props }, ref) => {
    const { tap, buttonClick, success, warning, error } = useHaptics();

    const getHapticFeedback = () => {
      switch (hapticType) {
        case 'tap':
          return tap;
        case 'success':
          return success;
        case 'warning':
          return warning;
        case 'error':
          return error;
        case 'buttonClick':
          return buttonClick;
        default:
          return tap;
      }
    };

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      // Ejecutar feedback háptico
      const hapticFeedback = getHapticFeedback();
      await hapticFeedback();

      // Ejecutar el onClick original si existe
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <IconButton
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

HapticIconButton.displayName = 'HapticIconButton';
