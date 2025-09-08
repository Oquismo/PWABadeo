'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Link as MuiLink, 
  Alert,
  Paper,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import Material3LoadingIndicator from '@/components/ui/Material3LoadingIndicator';
import MaterialTextField from '@/components/ui/MaterialTextField';
import { 
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import Link from 'next/link';

// Componente que maneja los search params
function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido');
      setValidatingToken(false);
      return;
    }

    // Verificar validez del token
    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setError(data.error || 'Token inválido o expirado');
        }
      } catch (err) {
        setError('Error al validar el token');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const validate = () => {
    if (!password) {
      setError('La contraseña es obligatoria.');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '' };
    if (password.length < 6) return { strength: 25, label: 'Muy débil', color: 'error' };
    if (password.length < 8) return { strength: 50, label: 'Débil', color: 'warning' };
    if (password.length < 12) return { strength: 75, label: 'Buena', color: 'info' };
    return { strength: 100, label: 'Muy fuerte', color: 'success' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage('Contraseña restablecida exitosamente');
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Estado de carga inicial
  if (validatingToken) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Material3LoadingIndicator 
            contained
            text="Validando enlace de recuperación..."
            sx={{ mb: 2 }}
          />
        </Paper>
      </Container>
    );
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="error.main">
            Enlace Inválido
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            {error}
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            El enlace puede haber expirado o ya haber sido usado.
            Los enlaces de recuperación expiran en 30 minutos.
          </Alert>
          
          <Button
            variant="contained"
            onClick={() => router.push('/forgot-password')}
            fullWidth
          >
            Solicitar Nuevo Enlace
          </Button>

          <Box sx={{ mt: 2 }}>
            <MuiLink component={Link} href="/login" variant="body2">
              ← Volver al Login
            </MuiLink>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Éxito
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="success.main">
            ¡Contraseña Restablecida!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Tu contraseña ha sido restablecida exitosamente.
            Ya puedes iniciar sesión con tu nueva contraseña.
          </Typography>
          
          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            fullWidth
          >
            Iniciar Sesión
          </Button>
        </Paper>
      </Container>
    );
  }

  // Formulario de reseteo
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <LockIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Nueva Contraseña
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ingresa tu nueva contraseña segura
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <MaterialTextField
            fullWidth
            label="Nueva Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            margin="normal"
            required
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {password && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Fortaleza de la contraseña: {passwordStrength.label}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.strength}
                color={passwordStrength.color as any}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          <MaterialTextField
            fullWidth
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? (
              <>
                <Material3LoadingIndicator size="small" sx={{ mr: 1 }} />
                Restableciendo...
              </>
            ) : (
              'Restablecer Contraseña'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <MuiLink component={Link} href="/login" variant="body2">
              ← Volver al Login
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

// Componente principal que envuelve en Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Material3LoadingIndicator 
            contained
            text="Cargando..."
          />
        </Paper>
      </Container>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}