/**
 * Componente de Menú Contextual para Long Press
 * Renderiza menús contextuales con animaciones nativas
 */

import React from 'react';
import {
  Portal,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  Typography,
  Box
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenuItem, ContextMenuPosition } from '@/hooks/useLongPressMenu';

interface ContextMenuProps {
  visible: boolean;
  position: ContextMenuPosition | null;
  items: ContextMenuItem[];
  onClose: () => void;
  onItemClick: (item: ContextMenuItem) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  position,
  items,
  onClose,
  onItemClick
}) => {
  if (!visible || !position || items.length === 0) {
    return null;
  }

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      onItemClick(item);
      item.action();
      onClose();
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {visible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.1)',
                zIndex: 1300,
                backdropFilter: 'blur(2px)'
              }}
              onClick={onClose}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                y: -10
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                y: -10
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 1400,
                transformOrigin: 'top left'
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  minWidth: 180,
                  maxWidth: 280,
                  borderRadius: 2,
                  overflow: 'hidden',
                  background: 'rgba(18, 18, 27, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <MenuList dense sx={{ py: 0.5 }}>
                  {items.map((item, index) => (
                    <Box key={item.id}>
                      {index > 0 && item.id.startsWith('separator') && (
                        <Divider sx={{ my: 0.5, opacity: 0.3 }} />
                      )}
                      
                      <MenuItem
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        sx={{
                          py: 1,
                          px: 2,
                          minHeight: 40,
                          color: item.destructive ? 'error.main' : 'text.primary',
                          '&:hover': {
                            backgroundColor: item.destructive 
                              ? 'rgba(244, 67, 54, 0.1)' 
                              : 'rgba(255, 255, 255, 0.1)'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        {item.icon && (
                          <ListItemIcon
                            sx={{
                              minWidth: 36,
                              color: 'inherit',
                              fontSize: '1.2rem'
                            }}
                          >
                            {typeof item.icon === 'string' ? (
                              <span role="img" aria-label={item.label}>
                                {item.icon}
                              </span>
                            ) : (
                              item.icon
                            )}
                          </ListItemIcon>
                        )}
                        
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500
                          }}
                        />
                        
                        {item.shortcut && (
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.6,
                              ml: 2,
                              fontSize: '0.75rem'
                            }}
                          >
                            {item.shortcut}
                          </Typography>
                        )}
                      </MenuItem>
                    </Box>
                  ))}
                </MenuList>
              </Paper>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default ContextMenu;