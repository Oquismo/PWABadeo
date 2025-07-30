'use client';

import { useAuth } from '@/context/AuthContext';
import { AppBar, Toolbar, IconButton, Avatar, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomAppBar() {
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence>
      {isAuthenticated && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1100 }}
        >
          <AppBar component="nav" position="static" sx={{ backgroundColor: 'background.paper' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {/* Icono de Perfil a la Izquierda */}
              <Link href="/perfil" passHref>
                <IconButton>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }} />
                </IconButton>
              </Link>

              {/* Espacio central (puedes poner un logo o título si quieres) */}
              <Box />

              {/* Icono de Ajustes a la Derecha */}
              <Link href="/ajustes" passHref>
                <IconButton>
                  <SettingsIcon sx={{ color: 'text.secondary' }} />
                </IconButton>
              </Link>
            </Toolbar>
          </AppBar>
        </motion.div>
      )}
    </AnimatePresence>
  );
}