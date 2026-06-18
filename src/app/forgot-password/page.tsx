'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Link as MuiLink, 
  Alert,
  Paper
} from '@mui/material';
import Material3LoadingIndicator from '@/components/ui/Material3LoadingIndicator';
import MaterialTextField from '@/components/ui/MaterialTextField';
import { 
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import Link from 'next/link';

// Hooks y utilidades refactorizadas
import { useForm } from '@/hooks/useForm';
import { validators } from '@/utils/validation.utils';
import { apiClient } from '@/utils/api-client.utils';
import { FormErrors } from '@/types/api.types';
import loggerClient from '@/lib/loggerClient';
import { useHaptics } from '@/hooks/useHaptics';

// Tipo para el formulario de email
interface ForgotPasswordFormData extends Record<string, unknown> {
  email: string;
}

// Validador para forgot password
const validateForgotPasswordForm = (data: ForgotPasswordFormData): FormErrors => {
  const errors: FormErrors = {};

  const emailError = validators.required(data.email, 'email') || validators.email(data.email);
  if (emailError) errors[emailError.field] = emailError.message;

  return errors;
};

export default function ForgotPasswordPageRefactored() {
  const router = useRouter();
  const { success: hapticSuccess } = useHaptics();
  
  // Estado para controlar si el email fue enviado
  const [emailSent, setEmailSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Hook de formulario
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldError,
  } = useForm<ForgotPasswordFormData>({
    initialValues: {
      email: '',
    },
    validate: validateForgotPasswordForm,
    onSubmit: handleForgotPassword,
  });

  // Función para enviar email de recuperación
  async function handleForgotPassword(formData: ForgotPasswordFormData) {
    try {
      loggerClient.debug('📧 Solicitando recuperación de contraseña para:', formData.email);

      const response = await apiClient.post('/api/auth/forgot-password', {
        email: formData.email,
      });

      if (!response.success) {
        setFieldError('api', response.error || 'Error al enviar el email de recuperación');
        return;
      }

      // Éxito - mostrar mensaje genérico por seguridad
      setEmailSent(true);
      setSuccessMessage('Si existe una cuenta con ese email, recibirás un enlace de recuperación en unos minutos.');
      await hapticSuccess();
      loggerClient.info('✅ Email de recuperación enviado');
    } catch (error) {
      loggerClient.error('❌ Error al solicitar recuperación:', error);
      setFieldError('api', 'Error de conexión. Intenta nuevamente.');
    }
  }

  // Vista de éxito
  if (emailSent) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EmailIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="success.main">
            Email Enviado
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            {successMessage}
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

  // Formulario
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
          <MaterialTextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            margin="normal"
            required
            autoFocus
            disabled={isSubmitting}
            placeholder="tu@email.com"
          />

          {errors.api && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.api}
            </Alert>
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isSubmitting ? (
              <>
                <Material3LoadingIndicator size="small" sx={{ mr: 1 }} />
                Enviando...
              </>
            ) : (
              'Enviar Enlace de Recuperación'
            )}
          </Button>

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
