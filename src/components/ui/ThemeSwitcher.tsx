'use client';

import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  SettingsBrightness as AutoIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';

interface ThemeSwitcherProps {
  variant?: 'icon' | 'button' | 'menu';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

export default function ThemeSwitcher({
  variant = 'icon',
  size = 'medium',
  showLabel = false,
  className
}: ThemeSwitcherProps) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getIcon = () => {
    return <DarkIcon />;
  };

  const getLabel = () => {
    return t('theme.dark');
  };

  if (variant === 'menu') {
    return (
      <>
        <IconButton
          onClick={handleMenuOpen}
          size={size}
          className={className}
          aria-label={t('theme.currentTheme')}
        >
          <motion.div
            key="dark"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {getIcon()}
          </motion.div>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          <MenuItem>
            <ListItemIcon>
              <DarkIcon />
            </ListItemIcon>
            <ListItemText primary={t('theme.dark')} />
            <Typography variant="caption" color="primary">✓</Typography>
          </MenuItem>

          <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
            {t('theme.constantDarkMode')}
          </Typography>
        </Menu>
      </>
    );
  }

  if (variant === 'button') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={true}
              disabled={true}
              size={size === 'large' ? 'medium' : size}
            />
          }
          label={showLabel ? getLabel() : undefined}
        />
        {showLabel && (
          <Typography variant="caption" color="text.secondary">
            {t('theme.constantMode')}
          </Typography>
        )}
      </Box>
    );
  }

  // Default: icon variant
  return (
    <IconButton
      size={size}
      className={className}
      disabled={true}
      aria-label={`${t('theme.currentTheme')}: ${getLabel()}`}
    >
      <motion.div
        key="dark"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {getIcon()}
      </motion.div>
      {showLabel && (
        <Typography variant="caption" sx={{ ml: 1 }}>
          {getLabel()}
        </Typography>
      )}
    </IconButton>
  );
}

// Componente simplificado para uso rápido
export function QuickThemeToggle() {
  const { isDark } = useTheme();

  return (
    <IconButton
      disabled={true}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        bgcolor: 'background.paper',
        boxShadow: 3,
        '&:hover': {
          bgcolor: 'background.paper',
          boxShadow: 4,
        }
      }}
      aria-label="Modo oscuro constante"
    >
      <motion.div
        key="dark"
        initial={{ rotate: 180 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DarkIcon />
      </motion.div>
    </IconButton>
  );
}