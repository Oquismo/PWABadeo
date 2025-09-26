import { ButtonProps } from '@mui/material';
import M3Button from './ui/M3Button';
import { useHaptics } from '@/hooks/useHaptics';
import { forwardRef } from 'react';

interface HapticButtonProps extends ButtonProps {
  hapticType?: 'tap' | 'buttonClick' | 'success' | 'warning' | 'error';
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticType = 'buttonClick', onClick, ...props }, ref) => {
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
        default:
          return buttonClick;
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
      <M3Button
        ref={ref as any}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

HapticButton.displayName = 'HapticButton';
