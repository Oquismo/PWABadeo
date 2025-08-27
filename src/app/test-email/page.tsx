'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Send as SendIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  const testConnection = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-connection' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        setConnectionStatus('success');
      } else {
        setError(data.message);
        setConnectionStatus('error');
      }
    } catch (err) {
      setError('Error probando conexión');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setError('Por favor introduce un email');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-test', email: testEmail }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`${data.message} - ID: ${data.messageId}`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error enviando email de prueba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            🧪 Prueba de Configuración de Email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verifica que el sistema de envío de emails esté funcionando correctamente
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Estado de conexión */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Estado de Conexión SMTP</Typography>
                {connectionStatus === 'success' && <Chip icon={<CheckIcon />} label="Conectado" color="success" />}
                {connectionStatus === 'error' && <Chip icon={<ErrorIcon />} label="Error" color="error" />}
                {connectionStatus === 'unknown' && <Chip label="Sin probar" color="default" />}
              </Box>
              
              <Button
                variant="outlined"
                onClick={testConnection}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SettingsIcon />}
                fullWidth
              >
                {loading ? 'Probando conexión...' : 'Probar Conexión SMTP'}
              </Button>
            </CardContent>
          </Card>

          <Divider />

          {/* Envío de email de prueba */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SendIcon color="primary" />
                <Typography variant="h6">Enviar Email de Prueba</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Email de destino"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                onClick={sendTestEmail}
                disabled={loading || !testEmail}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                fullWidth
              >
                {loading ? 'Enviando...' : 'Enviar Email de Prueba'}
              </Button>
            </CardContent>
          </Card>

          {/* Mensajes de resultado */}
          {message && (
            <Alert severity="success" icon={<CheckIcon />}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}

          {/* Información adicional */}
          <Card sx={{ bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Información
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Variables de entorno necesarias:</strong>
              </Typography>
              <Box component="pre" sx={{ fontSize: '0.8rem', bgcolor: 'grey.200', p: 2, borderRadius: 1 }}>
{`EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=noreply@badeo.com`}
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                📖 Consulta <strong>CONFIGURACION_EMAIL.md</strong> para instrucciones detalladas
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Paper>
    </Container>
  );
}
