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
  Divider,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  Link
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

const steps = [
  {
    label: 'Habilitar 2FA en Gmail',
    description: 'Ve a myaccount.google.com → Seguridad → Verificación en 2 pasos'
  },
  {
    label: 'Generar App Password',
    description: 'En Seguridad → Contraseñas de aplicaciones → Otra (personalizada) → "Badeo PWA"'
  },
  {
    label: 'Configurar Variables',
    description: 'Copia los valores en tu archivo .env.local'
  },
  {
    label: 'Probar Conexión',
    description: 'Usa el panel de abajo para probar que todo funciona'
  }
];

export default function ConfigureEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [activeStep, setActiveStep] = useState(0);

  // Ejemplo de configuración
  const [emailUser, setEmailUser] = useState('tu_email@gmail.com');
  const [emailPassword, setEmailPassword] = useState('abcd efgh ijkl mnop');

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('¡Copiado al portapapeles!');
    setTimeout(() => setMessage(''), 2000);
  };

  const envConfig = `# --- Configuración de Email REAL ---
EMAIL_PROVIDER=gmail
EMAIL_USER=${emailUser}
EMAIL_PASSWORD=${emailPassword}
EMAIL_FROM=${emailUser}
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
NEXTAUTH_URL=http://localhost:3001`;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            🚀 Configuración de Emails Reales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sigue estos pasos para activar el envío real de emails con Gmail
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Stepper de configuración */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              📋 Pasos de Configuración
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === 1 ? (
                        <Typography variant="caption">
                          ¡El paso más importante!
                        </Typography>
                      ) : null
                    }
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.description}</Typography>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(activeStep + 1)}
                          sx={{ mt: 1, mr: 1 }}
                          size="small"
                        >
                          {index === steps.length - 1 ? 'Finalizar' : 'Continuar'}
                        </Button>
                        {index > 0 && (
                          <Button
                            onClick={() => setActiveStep(activeStep - 1)}
                            sx={{ mt: 1, mr: 1 }}
                            size="small"
                          >
                            Atrás
                          </Button>
                        )}
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {activeStep === steps.length && (
              <Paper square elevation={0} sx={{ p: 3, bgcolor: 'grey.100' }}>
                <Typography>
                  ✅ ¡Configuración completada! Ahora prueba la conexión abajo.
                </Typography>
                <Button onClick={() => setActiveStep(0)} sx={{ mt: 1, mr: 1 }}>
                  Reiniciar
                </Button>
              </Paper>
            )}
          </Box>

          {/* Panel de configuración */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              ⚙️ Configuración .env.local
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Completa con tus datos:
                </Typography>
                
                <TextField
                  fullWidth
                  label="Tu email de Gmail"
                  value={emailUser}
                  onChange={(e) => setEmailUser(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="juan@gmail.com"
                />
                
                <TextField
                  fullWidth
                  label="Tu App Password de Gmail"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="abcd efgh ijkl mnop"
                  helperText="16 caracteres con espacios, generado en Google"
                />

                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Configuración para .env.local"
                    multiline
                    rows={8}
                    value={envConfig}
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.85rem' }
                    }}
                  />
                  <Button
                    startIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(envConfig)}
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      minWidth: 'auto',
                      bgcolor: 'background.paper'
                    }}
                    size="small"
                  >
                    Copiar
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Área de pruebas */}
            <Typography variant="h6" gutterBottom>
              🧪 Probar Configuración
            </Typography>

            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SettingsIcon color="primary" />
                    <Typography variant="subtitle1">Estado de Conexión SMTP</Typography>
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

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SendIcon color="primary" />
                    <Typography variant="subtitle1">Enviar Email de Prueba</Typography>
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
            </Stack>
          </Box>
        </Box>

        {/* Enlaces útiles */}
        <Divider sx={{ my: 4 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            🔗 Enlaces Útiles
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Link 
              href="https://myaccount.google.com/security" 
              target="_blank" 
              underline="hover"
            >
              Configuración de Seguridad de Google
            </Link>
            <Link 
              href="/forgot-password" 
              underline="hover"
            >
              Probar Recuperación de Contraseña
            </Link>
            <Link 
              href="/test-email" 
              underline="hover"
            >
              Página de Prueba Simple
            </Link>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
