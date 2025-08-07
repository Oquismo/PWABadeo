'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, Button, TextField, Alert, Paper, Stack } from '@mui/material';

export default function TestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/auth/login-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.user);
        setResult({ success: true, message: 'Login exitoso!', user: data.user });
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setResult(null);
    setEmail('');
    setPassword('');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          🧪 Test de Login Funcional
        </Typography>
        
        {isAuthenticated ? (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ✅ Usuario Autenticado
            </Typography>
            <Typography><strong>ID:</strong> {user?.id}</Typography>
            <Typography><strong>Nombre:</strong> {user?.name}</Typography>
            <Typography><strong>Email:</strong> {user?.email}</Typography>
            <Typography><strong>Rol:</strong> 
              <span style={{ 
                color: user?.role === 'admin' ? 'red' : 'blue',
                fontWeight: 'bold'
              }}>
                {user?.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
              </span>
            </Typography>
            
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hemetmas@gmail.com"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <Button 
                variant="contained" 
                onClick={handleLogin}
                disabled={loading || !email || !password}
                fullWidth
              >
                {loading ? 'Conectando...' : 'Login'}
              </Button>
            </Stack>
          </Paper>
        )}

        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            {result.success ? (
              <div>
                <strong>{result.message}</strong>
                <br />
                Usuario: {result.user?.name} ({result.user?.email})
                <br />
                Rol: {result.user?.role}
              </div>
            ) : (
              <strong>Error: {result.error}</strong>
            )}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" align="center">
          💡 Usuario de prueba: hemetmas@gmail.com
        </Typography>
      </Box>
    </Container>
  );
}
