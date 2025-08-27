'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link as MuiLink, 
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const validate = () => {
    if (!email) {
      setError('El email es obligatorio.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('El formato del email es inválido.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setMessage('Si existe una cuenta con ese email, recibirás un enlace de recuperación en unos minutos.');
      } else {
        setError(data.error || 'Error al enviar el email de recuperación');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EmailIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="success.main">
            Email Enviado
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            {message}
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Revisa tu bandeja de entrada y la carpeta de spam. 
            El enlace expirará en 30 minutos.
          </Alert>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/login')}
            fullWidth
          >
            Volver al Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Recuperar Contraseña
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            margin="normal"
            required
            autoFocus
            placeholder="tu@email.com"
          />

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Enviando...
              </>
            ) : (
              'Enviar Enlace de Recuperación'
            )}
          </Button>

          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <MuiLink component={Link} href="/login" variant="body2">
              ← Volver al Login
            </MuiLink>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          💡 ¿Qué sucede después?
        </Typography>
        <Typography variant="body2">
          1. Verificaremos si existe una cuenta con ese email<br/>
          2. Si existe, enviaremos un enlace seguro de recuperación<br/>
          3. El enlace expirará en 30 minutos por seguridad<br/>
          4. Podrás crear una nueva contraseña
        </Typography>
      </Paper>
    </Container>
  );
}
