'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Importación dinámica para evitar problemas SSR
const OnboardingTour = dynamic(() => import('@/components/OnboardingTour'), { ssr: false });
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import loggerClient from '@/lib/loggerClient';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Tooltip, Stack, IconButton, InputAdornment, Paper, Avatar, Divider } from '@mui/material';
import GlobalLanguageSwitch from '@/components/GlobalLanguageSwitch';
import Link from 'next/link';
// import EngineeringIcon from '@mui/icons-material/Engineering';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import LockOutlined from '@mui/icons-material/LockOutlined';


export default function LoginPage() {
    // Traducción
    const { t } = require('@/hooks/useTranslation').useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showTour, setShowTour] = useState(false);
    const [tourDone, setTourDone] = useState(false);
    const router = useRouter();
    const { login } = useAuth();
    const { success: hapticSuccess, error: hapticError, buttonClick: hapticButtonClick } = useHaptics();

    // Mostrar el tour solo si es la primera vez (localStorage)
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const done = localStorage.getItem('onboardingTourDone');
        if (!done) {
          setShowTour(true);
        }
      }
    }, []);

    const handleFinishTour = () => {
      setShowTour(false);
      setTourDone(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboardingTourDone', 'true');
      }
    };

    const validate = () => {
      let tempErrors: any = {};
      if (!email) {
        tempErrors.email = 'El email es obligatorio.';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        tempErrors.email = 'El formato del email es inválido.';
      }
      if (!password) tempErrors.password = 'La contraseña es obligatoria.';
      setErrors(tempErrors);
      return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!validate()) return;

      setErrors({}); // Limpiar errores previos

      try {
        loggerClient.debug('🔐 Intentando login con:', email);

        const response = await fetch('/api/auth/login-retry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        loggerClient.debug('📋 Respuesta del servidor:', data);

        if (!response.ok) {
          setErrors({ api: data.error || 'Error al iniciar sesión' });
          await hapticError(); // Vibrar en caso de error
          return;
        }

        // Si llegamos aquí, el login fue exitoso
        loggerClient.info('✅ Login exitoso, usuario:', data.user);

        // Usar el contexto de auth para guardar el usuario
        await login(data.user);

        // Vibración de éxito
        await hapticSuccess();

        // Redirigir a la página principal
        router.push('/');

      } catch (error) {
        loggerClient.error('❌ Error en login:', error);
        setErrors({ api: 'Error de conexión. Intenta nuevamente.' });
        await hapticError(); // Vibrar en caso de error de conexión
      }
    };
  //     id: 0, // Cambiado a number para cumplir con el tipo User
  //     email: 'admin@badeo.com',
  //     name: 'Admin Bypass',
  //     role: 'admin' as const,
  //   };
  //   await login(fakeAdmin);
  //   router.push('/');
  // };

  return (
    <Container component="main" maxWidth="xs">
      {/* OnboardingTour solo si showTour */}
      {showTour && (
        <OnboardingTour run={showTour} onFinish={handleFinishTour} />
      )}
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={4} sx={{ width: '100%', p: 4, borderRadius: 2, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <GlobalLanguageSwitch />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight="bold">
              {t('login.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              {process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true' ? t('login.adminOnly') : t('login.subtitle')}
            </Typography>
          </Box>

          <Box id="login-form" component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('login.email')}
              name="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('login.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                      onClick={() => setShowPassword(p => !p)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.6, fontWeight: '600' }}>
              {t('login.submit')}
            </Button>
          {/* Botón Bypass admin oculto en producción */}
          {/*
          <Button onClick={handleBypassAdmin} fullWidth variant="outlined" color="secondary" sx={{ mb: 2, py: 1.5 }} startIcon={<AdminPanelSettingsIcon />}>
            Bypass admin
          </Button>
          */}
            {errors.api && (
              <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
                {errors.api}
              </Typography>
            )}
          {/* Enlaces de utilidad */}
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} href="/forgot-password" variant="body2" color="primary">
                {t('login.forgotPassword')}
              </MuiLink>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink id="register-link" component={Link} href="/registro" variant="body2">
                {t('login.noAccount')}
              </MuiLink>
            </Box>
          </Stack>
        </Box>
        </Paper>
      </Box>
    </Container>
  );
}
