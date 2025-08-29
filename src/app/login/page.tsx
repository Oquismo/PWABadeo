'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Tooltip,
  Stack,
  IconButton,
  InputAdornment,
  Paper,
  useTheme,
  alpha,
  keyframes
} from '@mui/material';
import Link from 'next/link';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

// Material Design 3 Motion Tokens
const motionTokens = {
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasized: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerated: 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
  },
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
    extraLong3: 900,
    extraLong4: 1000,
  }
};

// Material Design 3 Elevation System
const elevationTokens = {
  level1: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  },
  level2: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  },
  level3: {
    boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
  },
};

// Material Design 3 State Layers
const stateLayers = {
  hover: 0.08,
  focus: 0.12,
  pressed: 0.12,
};

// Keyframes para animaciones Material Design 3
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const theme = useTheme();

  // Función para obtener el saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return 'Buenos días';
    } else if (hour >= 12 && hour < 20) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
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
    setIsLoading(true);

    try {
      console.log('🔐 Intentando login con:', email);

      const response = await fetch('/api/auth/login-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📋 Respuesta del servidor:', data);

      if (!response.ok) {
        setErrors({ api: data.error || 'Error al iniciar sesión' });
        return;
      }

      // Si llegamos aquí, el login fue exitoso
      console.log('✅ Login exitoso, usuario:', data.user);

      // Usar el contexto de auth para guardar el usuario
      login(data.user);

      // Redirigir a la página principal
      router.push('/');

    } catch (error) {
      console.error('❌ Error en login:', error);
      setErrors({ api: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Dos funciones de bypass separadas
  // const handleBypassUserLogin = () => {
  //   login(mockRegularUser);
  //   router.push('/');
  // };

  // Bypass eliminado: ahora solo login real

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: elevationTokens.level3.boxShadow,
          animation: `${fadeInUp} ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        }}
      >
        {/* Header con ícono y título */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: elevationTokens.level2.boxShadow,
              animation: `${fadeInUp} ${motionTokens.duration.medium1}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            <PersonIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            fontWeight="bold"
            sx={{
              mb: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${fadeInUp} ${motionTokens.duration.medium2}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            {getGreeting()}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              mb: 1,
              animation: `${fadeInUp} ${motionTokens.duration.medium3}ms ${motionTokens.easing.emphasized}`,
            }}
          >
            {process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true'
              ? 'Modo restringido: solo administradores.'
              : 'Ingresa con tu cuenta para continuar'}
          </Typography>
        </Box>

        {/* Formulario */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            animation: `${fadeInUp} ${motionTokens.duration.medium4}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  transition: `all ${motionTokens.duration.short2}ms ${motionTokens.easing.standard}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, stateLayers.hover),
                  },
                  '&.Mui-focused': {
                    backgroundColor: alpha(theme.palette.primary.main, stateLayers.focus),
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />

            <TextField
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowPassword(p => !p)}
                      edge="end"
                      size="small"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, stateLayers.hover),
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  transition: `all ${motionTokens.duration.short2}ms ${motionTokens.easing.standard}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, stateLayers.hover),
                  },
                  '&.Mui-focused': {
                    backgroundColor: alpha(theme.palette.primary.main, stateLayers.focus),
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />

            {errors.api && (
              <Typography
                color="error"
                sx={{
                  textAlign: 'center',
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                {errors.api}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: elevationTokens.level1.boxShadow,
                transition: `all ${motionTokens.duration.short2}ms ${motionTokens.easing.standard}`,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: elevationTokens.level2.boxShadow,
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  transition: `all ${motionTokens.duration.medium1}ms ${motionTokens.easing.standard}`,
                  transform: 'translate(-50%, -50%)',
                },
                '&:active::before': {
                  width: 300,
                  height: 300,
                },
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Stack>
        </Box>

        {/* Enlaces de utilidad */}
        <Stack
          spacing={2}
          sx={{
            mt: 3,
            animation: `${fadeInUp} ${motionTokens.duration.extraLong1}ms ${motionTokens.easing.emphasized}`,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink
              component={Link}
              href="/forgot-password"
              variant="body2"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                transition: `all ${motionTokens.duration.short2}ms ${motionTokens.easing.standard}`,
                '&:hover': {
                  color: theme.palette.primary.dark,
                  textDecoration: 'underline',
                },
              }}
            >
              ¿Has olvidado tu contraseña?
            </MuiLink>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <MuiLink
              component={Link}
              href="/registro"
              variant="body2"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontWeight: 500,
                transition: `all ${motionTokens.duration.short2}ms ${motionTokens.easing.standard}`,
                '&:hover': {
                  color: theme.palette.primary.main,
                  textDecoration: 'underline',
                },
              }}
            >
              ¿No tienes cuenta? Regístrate
            </MuiLink>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
