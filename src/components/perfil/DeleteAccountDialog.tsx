'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  DeleteForever as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import M3Button from '@/components/ui/M3Button';
import Material3Dialog from '@/components/ui/Material3Dialog';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CONFIRM_TEXT = 'ELIMINAR';

  const handleDelete = async () => {
    // Validaciones
    if (!acceptedTerms) {
      setError('Debes aceptar los términos para continuar');
      return;
    }

    if (confirmText !== CONFIRM_TEXT) {
      setError(`Debes escribir exactamente "${CONFIRM_TEXT}" para confirmar`);
      return;
    }

    if (!password.trim()) {
      setError('Debes ingresar tu contraseña para confirmar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la cuenta');
      }

      // Limpiar localStorage
      localStorage.clear();
      sessionStorage.clear();

      // Cerrar sesión
      logout();

      // Redirigir a página de confirmación
      router.push('/cuenta-eliminada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPassword('');
      setConfirmText('');
      setAcceptedTerms(false);
      setError('');
      onClose();
    }
  };

  return (
    <Material3Dialog
      open={open}
      onClose={handleClose}
      title="⚠️ Eliminar Cuenta Permanentemente"
      icon={<DeleteIcon />}
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ p: 2 }}>
        {/* Advertencia principal */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Esta acción es IRREVERSIBLE
          </Typography>
          <Typography variant="body2">
            Se eliminarán permanentemente todos tus datos:
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Información de perfil y cuenta</li>
            <li>Progreso en cursos y quizzes</li>
            <li>Tareas y eventos personalizados</li>
            <li>Comentarios y feedbacks</li>
            <li>Historial de actividad</li>
          </ul>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
            ⏰ Los datos se eliminarán en un plazo de 30 días según nuestra política de privacidad.
          </Typography>
        </Alert>

        {/* Información RGPD */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <WarningIcon color="info" />
            <Typography variant="subtitle2" fontWeight={600}>
              Derechos RGPD
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Estás ejerciendo tu derecho al olvido según el RGPD (Reglamento General de Protección de Datos).
            Si tienes dudas o prefieres exportar tus datos primero, contacta con{' '}
            <strong>rovetta215@gmail.com</strong>
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Campo de confirmación de texto */}
          <Box>
            <Typography variant="body2" gutterBottom>
              Escribe <strong>{CONFIRM_TEXT}</strong> para confirmar:
            </Typography>
            <TextField
              fullWidth
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder={CONFIRM_TEXT}
              disabled={loading}
              error={confirmText !== '' && confirmText !== CONFIRM_TEXT}
              helperText={
                confirmText !== '' && confirmText !== CONFIRM_TEXT
                  ? `Debe ser exactamente "${CONFIRM_TEXT}"`
                  : ''
              }
            />
          </Box>

          {/* Campo de contraseña */}
          <Box>
            <Typography variant="body2" gutterBottom>
              Ingresa tu contraseña para confirmar:
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña actual"
              disabled={loading}
            />
          </Box>

          {/* Checkbox de aceptación */}
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={loading}
                color="error"
              />
            }
            label={
              <Typography variant="body2">
                Entiendo que esta acción es permanente y que todos mis datos serán eliminados
              </Typography>
            }
          />

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Botones */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <M3Button
              m3variant="text"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </M3Button>
            <M3Button
              m3variant="filled"
              onClick={handleDelete}
              disabled={loading || !acceptedTerms || confirmText !== CONFIRM_TEXT || !password}
              sx={{
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
            >
              {loading ? 'Eliminando...' : 'Eliminar mi cuenta'}
            </M3Button>
          </Stack>
        </Stack>
      </Box>
    </Material3Dialog>
  );
}
