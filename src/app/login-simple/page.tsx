'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, TextField, Button, Link, useTheme } from '@mui/material';

export default function SimpleLoginPage() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('🔐 Login attempt:', email);

      const response = await fetch('/api/auth/login-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Login exitoso!');
        console.log('User:', data.user);

        try {
          if (typeof window !== 'undefined' && (window as any).saveUserToLocal) {
            (window as any).saveUserToLocal(data.user);
          } else {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch (e) {
          console.error('Error guardando user en localStorage:', e);
        }

        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error de conexión');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = () => {
    setEmail('test@example.com');
    setPassword('password123');
  };

  const isSuccess = message.includes('✅');

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 2.5 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        🔐 Login Simple
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2.5 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2.5 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mb: 1.25 }}
        >
          {loading ? 'Conectando...' : 'Login'}
        </Button>
      </Box>

      <Button
        onClick={testLogin}
        variant="outlined"
        color="secondary"
        fullWidth
        sx={{ mb: 2 }}
      >
        🧪 Usar credenciales de prueba
      </Button>

      {message && (
        <Box
          sx={{
            p: 1.25,
            mb: 2,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: isSuccess ? theme.palette.success.light : theme.palette.error.light,
            color: isSuccess ? theme.palette.success.dark : theme.palette.error.dark,
          }}
        >
          <Typography variant="body2">{message}</Typography>
        </Box>
      )}

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          💡 Este es un login simplificado con Material-UI
        </Typography>
        <Link href="/test-login" underline="hover">
          <Typography variant="body2">Ver versión completa</Typography>
        </Link>
      </Box>
    </Box>
  );
}
