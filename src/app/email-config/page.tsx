'use client';

import { useState } from 'react';
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
  Error as ErrorIcon
} from '@mui/icons-material';

export default function EmailConfigPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [configResult, setConfigResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

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
          Verifica la configuración de email en producción
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
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

        {/* Enviar Email de Prueba */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h5" gutterBottom>
            2. Enviar Email de Prueba
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
