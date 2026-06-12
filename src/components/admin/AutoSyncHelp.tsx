'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Link,
  Paper,
  Divider,
} from '@mui/material';
import {
  AutoFixHigh as AutoIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  CheckCircle as CheckIcon,
  OpenInNew as OpenIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

export default function AutoSyncHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        startIcon={<AutoIcon />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: 'none', fontSize: '0.8rem' }}
      >
        ¿Auto-sync?
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoIcon color="primary" />
          Sincronización Automática con Teamup
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium">
              Vercel Cron ya está configurado en el archivo vercel.json
            </Typography>
            <Typography variant="caption" color="inherit">
              Se ejecuta automáticamente a las 6:00 AM todos los días
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom>
            Paso 1: Generar un token secreto
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Genera un token largo y aleatorio (ejemplo):
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                wordBreak: 'break-all',
              }}
            >
              {`openssl rand -hex 32
# o usa un generador online
# Resultado: a1b2c3d4e5f6... (64 caracteres)`}
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Paso 2: Añadir a Vercel
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Ve al Dashboard de Vercel"
                  secondary="Selecciona tu proyecto"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Settings → Environment Variables"
                  secondary="Añade CRON_SECRET = tu-token-generado"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Redeploy del proyecto"
                  secondary="Para que el token esté disponible en producción"
                />
              </ListItem>
            </List>
            <Button
              component={Link}
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener"
              size="small"
              startIcon={<OpenIcon />}
              sx={{ mt: 1 }}
            >
              Abrir Dashboard de Vercel
            </Button>
          </Paper>

          <Typography variant="h6" gutterBottom>
            Paso 3: Verificar que funciona
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              El endpoint está en:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                wordBreak: 'break-all',
              }}
            >
              {`GET /api/cron/sync-events

# Autorizado si:
# - Vercel Cron envía header x-vercel-signature
# - O envías Authorization: Bearer <CRON_SECRET>
# - O tienes cookie de admin`}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Vercel Cron envía el header x-vercel-signature automáticamente
            </Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Requisitos
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip icon={<CloudIcon />} label="Vercel Pro Plan" size="small" variant="outlined" />
            <Chip icon={<TimerIcon />} label="6:00 AM UTC" size="small" variant="outlined" />
            <Chip icon={<CodeIcon />} label="CRON_SECRET env var" size="small" variant="outlined" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
