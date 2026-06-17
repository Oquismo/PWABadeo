/**
 * Login Page - Versión Refactorizada
 * 
 * Ejemplo de cómo usar las nuevas utilidades para simplificar componentes
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();
  const { success: hapticSuccess, error: hapticError } = useHaptics();
  
  const [showTour, setShowTour] = useState(false);
  const { value: showPassword, toggle: toggleShowPassword } = useToggle(false);

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

  useEffect(() => {
    const tourDone = LocalStorage.has('onboardingTourDone');
    if (!tourDone) {
      setShowTour(true);
    }
  }, []);

  const handleFinishTour = () => {
    setShowTour(false);
    LocalStorage.set('onboardingTourDone', 'true');
  };

  async function handleLogin(formData: LoginFormData) {
    try {
      loggerClient.debug('🔐 Intentando login con:', formData.email);

      const response = await apiClient.post<{ user: UserBase }>('/api/auth/login-retry', {
        email: formData.email,
        password: formData.password,
      });

      if (!response.success) {
        setFieldError('api', response.error || 'Error al iniciar sesión');
        await hapticError();
        return;
      }

      if (response.data?.user) {
        loggerClient.info('✅ Login exitoso, usuario:', response.data.user);
        
        await login(response.data.user);
        await hapticSuccess();
        
        const from = searchParams.get('from') || '/';
        router.push(from);
      }
    } catch (error) {
      loggerClient.error('❌ Error en login:', error);
      setFieldError('api', 'Error de conexión. Intenta nuevamente.');
      await hapticError();
    }
  }

  const isAdminOnly = process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true';

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}
    >
      {showTour && <OnboardingTour run={showTour} onFinish={handleFinishTour} />}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
        <Box sx={{
          width: 72, height: 72, borderRadius: '22px', overflow: 'hidden',
          mb: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          <Box component="img" src="/img/erasmus-plus.svg" alt="Mi Erasmus App" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
        <Typography
          component="h1"
          sx={{
            fontSize: '1.5rem', fontWeight: 800, color: 'text.primary', textAlign: 'center',
            fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
          }}
        >
          Mi Erasmus App
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, textAlign: 'center' }}>
          {isAdminOnly ? t('login.adminOnly') : (t('login.subtitle') || 'Inicia sesión para continuar')}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
            {t('login.email') || 'Correo electrónico'}
          </Typography>
          <Box sx={{
            background: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            borderBottom: '2px solid', borderBottomColor: 'primary.main',
            borderRadius: '4px 4px 0 0',
            display: 'flex', alignItems: 'center', gap: 1.25, px: 2,
          }}>
            <Box component="span" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', py: 1.5 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </Box>
            <TextField
              required fullWidth name="email" autoComplete="email" autoFocus
              placeholder="tu@correo.com"
              value={values.email} onChange={handleChange}
              error={!!errors.email} helperText={errors.email}
              disabled={isSubmitting} variant="standard"
              InputProps={{ disableUnderline: true, sx: { fontSize: '0.875rem', color: 'text.primary' } }}
              sx={{ '& .MuiInputBase-root': { py: 0 } }}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
            {t('login.password') || 'Contraseña'}
          </Typography>
          <Box sx={{
            background: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            borderBottom: '2px solid', borderBottomColor: 'divider',
            borderRadius: '4px 4px 0 0',
            display: 'flex', alignItems: 'center', gap: 1.25, px: 2,
          }}>
            <Box component="span" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', py: 1.5 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </Box>
            <TextField
              required fullWidth name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password} onChange={handleChange}
              error={!!errors.password} helperText={errors.password}
              disabled={isSubmitting} variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '0.875rem', color: 'text.primary' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                      onClick={toggleShowPassword}
                      edge="end"
                      disabled={isSubmitting}
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiInputBase-root': { py: 0 } }}
            />
          </Box>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Link href="/forgot-password" passHref legacyBehavior>
            <MuiLink variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'none' }}>
              {t('login.forgotPassword') || '¿Olvidaste tu contraseña?'}
            </MuiLink>
          </Link>
        </Box>

        {errors.api && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
            {errors.api}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
            mt: 1, height: 48,
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '0.95rem',
            textTransform: 'none',
            background: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: '0 2px 8px rgba(190,242,100,0.30)',
            '&:hover': { filter: 'brightness(0.92)' },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          {isSubmitting ? 'Iniciando sesión...' : (t('login.submit') || 'Iniciar sesión')}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1, fontSize: '0.8rem' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/registro" passHref legacyBehavior>
            <MuiLink sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', textDecoration: 'none' }}>
              {t('login.noAccount') || 'Regístrate'}
            </MuiLink>
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default function LoginPageRefactored() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
