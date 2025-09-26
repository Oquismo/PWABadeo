'use client';

import React from 'react';
import { Box, Fab, Button, Stack, useTheme, Tooltip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FeedbackRoundedIcon from '@mui/icons-material/FeedbackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import { motion, AnimatePresence } from 'framer-motion';

interface FabMenuProps {
  // Si quieres acciones personalizadas, puedes pasarlas más tarde
  phone?: string;
  message?: string;
  onOpenFeedback?: () => void;
}

export default function FabMenu({ phone = '+34649347760', message = '', onOpenFeedback }: FabMenuProps) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  // Colores pensados para emular la imagen: fondo píldora lila muy claro y texto/ícono morado oscuro
  const pillBg = '#EDE6FF'; // pale lilac
  const pillIconBg = '#5E3C86'; // deep purple for icon area (slightly adjusted)
  const pillTextColor = '#4B2C83';

  // estilos para botones circulares (ajustados: más pequeños)
  const circleSx = {
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: '50%',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 28px rgba(45,35,95,0.14)',
    transition: 'transform 160ms ease'
  } as const;

  const circleIconSx = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: pillIconBg,
    color: 'white'
  } as const;

  const whatsappUrl = phone ? `https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(message || '')}` : undefined;

  const items = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
      onClick: () => {
        if (whatsappUrl) window.open(whatsappUrl, '_blank');
      }
    },
    {
      key: 'feedback',
      label: 'Feedback',
      Icon: FeedbackRoundedIcon,
      onClick: () => {
        if (onOpenFeedback) onOpenFeedback();
      }
    }
  ];

  return (
    <Box sx={{ position: 'fixed', right: 18, bottom: 8, zIndex: 1400 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ when: 'beforeChildren', staggerChildren: 0.06 }}
          >
            <Stack spacing={1} alignItems="flex-end" sx={{ mb: 1 }}>
              {items.map((it, idx) => (
                <motion.div
                  key={it.key}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 12, opacity: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  {/* botón circular icon-only con tooltip (accesible) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Tooltip title={it.label} placement="left" arrow>
                      <span>
                        <Button
                          onClick={() => { it.onClick(); setOpen(false); }}
                          sx={{
                            ...circleSx,
                            bgcolor: '#ffffff',
                            border: it.key === 'whatsapp' ? '2px solid #25D366' : `2px solid ${pillIconBg}`,
                            color: it.key === 'whatsapp' ? '#25D366' : pillIconBg,
                            '&:hover': { transform: 'translateY(-3px) scale(1.03)', bgcolor: '#fff' }
                          }}
                          aria-label={it.label}
                          title={it.label}
                        >
                          <Box sx={{ ...circleIconSx, background: 'transparent' }}>
                            <it.Icon sx={{ fontSize: 18, color: it.key === 'whatsapp' ? '#25D366' : pillIconBg }} />
                          </Box>
                        </Button>
                      </span>
                    </Tooltip>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Tooltip title={open ? 'Cerrar' : 'Abrir chat'} placement="left" arrow>
          <span>
            <Fab
              onClick={() => setOpen(v => !v)}
              sx={{
                bgcolor: '#5E3C86',
                color: 'white',
                width: 56,
                height: 56,
                boxShadow: '0 20px 36px rgba(45,35,95,0.28)'
              }}
              aria-label={open ? 'Cerrar menú rápido' : 'Abrir chat / menú rápido'}
              title={open ? 'Cerrar' : 'Abrir chat'}
            >
              {open ? (
                <CloseRoundedIcon />
              ) : (
                <ChatBubbleRoundedIcon sx={{ fontSize: 22 }} />
              )}
            </Fab>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
