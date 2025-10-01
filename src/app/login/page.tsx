/**
 * Login Page - Versión Refactorizada
 * 
 * Ejemplo de cómo usar las nuevas utilidades para simplificar componentes
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Hooks y utilidades refactorizadas
import { useAuth } from '@/context/AuthContext';
import { useForm } from '@/hooks/useForm';
import { useToggle } from '@/hooks/useForm';
import { validateLoginForm, LoginFormData } from '@/utils/validation.utils';
import { apiClient } from '@/utils/api-client.utils';
import { LocalStorage } from '@/utils/storage.utils';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';
import loggerClient from '@/lib/loggerClient';

// Tipos
import { UserBase } from '@/types/api.types';

// Importación dinámica del tour
const OnboardingTour = dynamic(() => import('@/components/OnboardingTour'), { ssr: false });

export default function LoginPageRefactored() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();
  const { success: hapticSuccess, error: hapticError } = useHaptics();
  
  // Estado del tour
  const [showTour, setShowTour] = useState(false);
  
  // Toggle para mostrar/ocultar contraseña
  const { value: showPassword, toggle: toggleShowPassword } = useToggle(false);

  // Hook de formulario con validación integrada
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldError,
  } = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: validateLoginForm,
    onSubmit: handleLogin,
  });

  // Verificar si mostrar el tour
  useEffect(() => {
    const tourDone = LocalStorage.has('onboardingTourDone');
    if (!tourDone) {
      setShowTour(true);
    }
  }, []);

  // Handler del tour
  const handleFinishTour = () => {
    setShowTour(false);
    LocalStorage.set('onboardingTourDone', 'true');
  };

  // Función de login (usada por el hook de formulario)
  async function handleLogin(formData: LoginFormData) {
    try {
      loggerClient.debug('🔐 Intentando login con:', formData.email);

      // Usar el cliente API refactorizado
      const response = await apiClient.post<{ user: UserBase }>('/api/auth/login-retry', {
        email: formData.email,
        password: formData.password,
      });

      // Manejar error
      if (!response.success) {
        setFieldError('api', response.error || 'Error al iniciar sesión');
        await hapticError();
        return;
      }

      // Login exitoso
      if (response.data?.user) {
        loggerClient.info('✅ Login exitoso, usuario:', response.data.user);
        
        // Usar contexto de autenticación
        await login(response.data.user);
        
        // Feedback háptico
        await hapticSuccess();
        
        // Redirigir
        router.push('/');
      }
    } catch (error) {
      loggerClient.error('❌ Error en login:', error);
      setFieldError('api', 'Error de conexión. Intenta nuevamente.');
      await hapticError();
    }
  }

  // Determinar si es modo admin-only
  const isAdminOnly = process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true';

  return (
    <Container
      component="main"
      maxWidth={false}
      disableGutters
      sx={{
        bgcolor: 'background.paper',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Tour de bienvenida */}
      {showTour && <OnboardingTour run={showTour} onFinish={handleFinishTour} />}

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 6 }}>
        <Paper
          elevation={errors.api ? 12 : 6}
          sx={{
            width: '100%',
            maxWidth: 460,
            p: 5,
            borderRadius: 4,
            bgcolor: 'background.default',
            boxShadow: '0 8px 30px rgba(20,20,30,0.06)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(20,20,30,0.12)',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight="bold">
              {t('login.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              {isAdminOnly ? t('login.adminOnly') : t('login.subtitle')}
            </Typography>
          </Box>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            {/* Campo Email */}
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('login.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={values.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSubmitting}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                  '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' },
                },
              }}
            />

            {/* Campo Password */}
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('login.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isSubmitting}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                      onClick={toggleShowPassword}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                  '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' },
                },
              }}
            />

            {/* Error de API */}
            {errors.api && (
              <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                {errors.api}
              </Typography>
            )}

            {/* Botón de Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {isSubmitting ? 'Iniciando sesión...' : t('login.submit')}
            </Button>

            {/* Enlaces */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Link href="/forgot-password" passHref legacyBehavior>
                <MuiLink variant="body2" sx={{ cursor: 'pointer' }}>
                  {t('login.forgotPassword')}
                </MuiLink>
              </Link>
              <Link href="/registro" passHref legacyBehavior>
                <MuiLink variant="body2" sx={{ cursor: 'pointer' }}>
                  {t('login.noAccount')}
                </MuiLink>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
