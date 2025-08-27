'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Lock as LockIcon
} from '@mui/icons-material';

export default function EmailConfigPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [configResult, setConfigResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [tokensInfo, setTokensInfo] = useState<any>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const authStatus = sessionStorage.getItem('email-config-auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Contraseña simple para testing (en producción esto debería ser más seguro)
    const correctPassword = 'BadeoTest2025!';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('email-config-auth', 'authenticated');
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('email-config-auth');
    setPassword('');
    setConfigResult(null);
    setTestResult(null);
    setTokensInfo(null);
  };

  // Pantalla de autenticación
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="warning.main">
            Acceso Restringido
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Esta página contiene herramientas de diagnóstico sensibles.
            Ingresa la contraseña de administrador para continuar.
          </Typography>
          
          <Box component="form" onSubmit={handleAuth}>
            <TextField
              fullWidth
              type="password"
              label="Contraseña de Administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            
            {authError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {authError}
              </Alert>
            )}
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={!password}
            >
              Acceder
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <strong>Solo para desarrolladores:</strong><br/>
            Si necesitas acceso, contacta al administrador del sistema.
          </Alert>
        </Paper>
      </Container>
    );
  }

  const checkConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/email-config');
      const data = await response.json();
      setConfigResult(data);
    } catch (error) {
      setConfigResult({
        success: false,
        error: 'Error verificando configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTokens = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/tokens');
      const data = await response.json();
      setTokensInfo(data);
    } catch (error) {
      setTokensInfo({
        success: false,
        error: 'Error verificando tokens'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!email) {
      alert('Ingresa un email para la prueba');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Error enviando email de prueba'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Diagnóstico de Email
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Herramientas de diagnóstico para administradores
        </Typography>
        
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleLogout}
          sx={{ mt: 2 }}
          size="small"
        >
          Cerrar Sesión
        </Button>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>⚠️ Página de Administrador:</strong> Esta página contiene información sensible del sistema. 
        No compartas esta URL ni captures pantalla de esta información.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Verificar Configuración */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h5" gutterBottom>
            1. Verificar Configuración
          </Typography>
          
          <Button
            variant="contained"
            onClick={checkConfig}
            disabled={loading}
            fullWidth
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Verificar Config'}
          </Button>

          {configResult && (
            <Alert 
              severity={configResult.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              <strong>Estado:</strong> {configResult.message}
            </Alert>
          )}

          {configResult?.envVars && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Variables de Entorno:</Typography>
              <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                {JSON.stringify(configResult.envVars, null, 2)}
              </pre>
            </Box>
          )}

          {configResult?.missingVars && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Variables faltantes:</strong> {configResult.missingVars.join(', ')}
            </Alert>
          )}
        </Paper>

        {/* Verificar Tokens */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h5" gutterBottom>
            2. Verificar Tokens
          </Typography>
          
          <Button
            variant="contained"
            onClick={checkTokens}
            disabled={loading}
            fullWidth
            sx={{ mb: 2 }}
            color="secondary"
          >
            {loading ? <CircularProgress size={20} /> : 'Ver Tokens'}
          </Button>

          {tokensInfo && (
            <Alert 
              severity={tokensInfo.success ? 'info' : 'error'}
              sx={{ mb: 2 }}
            >
              <strong>Tokens en BD:</strong> {tokensInfo.success ? 'Consultados' : 'Error'}
            </Alert>
          )}

          {tokensInfo?.stats && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Estadísticas:</Typography>
              <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="body2">✅ Válidos: {tokensInfo.stats.valid || 0}</Typography>
                <Typography variant="body2">⏰ Expirados: {tokensInfo.stats.expired || 0}</Typography>
                <Typography variant="body2">✔️ Usados: {tokensInfo.stats.used || 0}</Typography>
              </Box>
            </Box>
          )}

          {tokensInfo?.recentTokens && tokensInfo.recentTokens.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Tokens Recientes:</Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {tokensInfo.recentTokens.slice(0, 3).map((token: any, index: number) => (
                  <Box key={index} sx={{ mb: 1, p: 1, background: '#f9f9f9', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>{token.email}</strong><br/>
                      Token: {token.tokenPreview}<br/>
                      Estado: <span style={{ color: token.status === 'VÁLIDO' ? 'green' : 'red' }}>
                        {token.status}
                      </span><br/>
                      {token.minutesRemaining > 0 && (
                        <>Expira en: {token.minutesRemaining} min</>
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
        {/* Enviar Email de Prueba */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h5" gutterBottom>
            3. Enviar Email de Prueba
          </Typography>
          
          <TextField
            fullWidth
            label="Email de prueba"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="tu-email@gmail.com"
          />

          <Button
            variant="contained"
            onClick={sendTestEmail}
            disabled={loading || !email}
            fullWidth
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Enviar Prueba'}
          </Button>

          {testResult && (
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {testResult.success ? (
                <>
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  Email enviado exitosamente
                </>
              ) : (
                <>
                  <ErrorIcon sx={{ mr: 1 }} />
                  Error: {testResult.error}
                </>
              )}
            </Alert>
          )}

          {testResult?.messageId && (
            <Typography variant="body2" color="text.secondary">
              Message ID: {testResult.messageId}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Instrucciones */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          📋 Configuración Requerida en Producción
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ mt: 2 }}>
          <strong>Variables de entorno necesarias:</strong>
        </Typography>
        
        <Box component="pre" sx={{ 
          background: '#f5f5f5', 
          p: 2, 
          borderRadius: 1, 
          fontSize: '14px',
          mt: 1,
          overflow: 'auto'
        }}>
{`EMAIL_PROVIDER=gmail
EMAIL_USER=badeoapp@gmail.com
EMAIL_PASSWORD=fqbp odjq dvwz meoy
NEXTAUTH_URL=https://tu-dominio.vercel.app`}
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Nota:</strong> Configura estas variables en tu proveedor de hosting (Vercel, Netlify, etc.)
        </Alert>
      </Paper>
    </Container>
  );
}
