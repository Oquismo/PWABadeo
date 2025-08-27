'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';

export default function TestLoginPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados del componente original
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [accessError, setAccessError] = useState('');

  // Verificación de seguridad
  useEffect(() => {
    const checkAccess = async () => {
      if (isAuthenticated === undefined) {
        return; // Aún cargando
      }

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user?.role !== 'admin') {
        setAccessError('🚫 Acceso denegado: Solo administradores pueden acceder a esta página');
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [isAuthenticated, user, router]);

  // Mostrar loading mientras se verifica acceso
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando permisos de administrador...
        </Typography>
      </Container>
    );
  }

  // Si hay error de acceso, mostrar mensaje
  if (accessError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {accessError}
        </Alert>
        <Typography variant="body2">
          Redirigiendo al inicio en unos segundos...
        </Typography>
      </Container>
    );
  }

  const handleLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data,
        success: response.ok
      });

    } catch (error) {
      setResult({
        status: 'Error',
        statusText: 'Network Error',
        data: { error: 'Error de red' },
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Login Debug
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Formulario de Login
            </Typography>
            
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              type="email"
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              type="password"
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Probando...' : 'Probar Login'}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resultado
            </Typography>
            
            {result && (
              <Box>
                <Alert 
                  severity={result.success ? 'success' : 'error'} 
                  sx={{ mb: 2 }}
                >
                  Status: {result.status} - {result.success ? 'Éxito' : 'Error'}
                </Alert>
                
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          💡 Instrucciones
        </Typography>
        <Typography variant="body2">
          1. Usa esta página para probar el login con diferentes credenciales
          <br />
          2. Ve a <strong>/debug/password</strong> para ver los usuarios y resetear contraseñas
          <br />
          3. Los logs detallados del servidor aparecen en la consola del terminal
        </Typography>
      </Paper>
    </Container>
  );
}
