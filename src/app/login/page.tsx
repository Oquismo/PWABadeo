'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Tooltip, Stack, IconButton, InputAdornment } from '@mui/material';
import Link from 'next/link';
// import EngineeringIcon from '@mui/icons-material/Engineering';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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
    }
  };


  // Bypass admin: usuario simulado
  const handleBypassAdmin = () => {
    const fakeAdmin: User = {
      id: 0, // Cambiado a number para cumplir con el tipo User
      email: 'admin@badeo.com',
      name: 'Admin Bypass',
      role: 'admin' as const,
    };
    login(fakeAdmin);
    router.push('/');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Iniciar Sesión
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          {process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true' ? 'Modo restringido: solo administradores.' : 'Ingresa con tu cuenta.'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Correo Electrónico"
            name="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Entrar
          </Button>
          <Button onClick={handleBypassAdmin} fullWidth variant="outlined" color="secondary" sx={{ mb: 2, py: 1.5 }} startIcon={<AdminPanelSettingsIcon />}>
            Bypass admin
          </Button>
            {errors.api && (
              <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
                {errors.api}
              </Typography>
            )}
          {/* Enlaces de utilidad */}
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} href="/forgot-password" variant="body2" color="primary">
                {"¿Has olvidado tu contraseña?"}
              </MuiLink>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} href="/registro" variant="body2">
                {"¿No tienes cuenta? Regístrate"}
              </MuiLink>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
