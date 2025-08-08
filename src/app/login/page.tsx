'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Tooltip, Stack } from '@mui/material';
import Link from 'next/link';
// import EngineeringIcon from '@mui/icons-material/Engineering';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
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
  
  // 1. Definimos dos usuarios de ejemplo: uno admin y uno normal
  const mockAdminUser = {
    id: 999,
    name: 'Admin User',
    email: 'admin@badeo.app',
    role: 'admin' as 'admin',
    age: 30,
    school: 'Badeo Staff',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    arrivalDate: '2025-01-01',
    departureDate: '2026-12-31',
  };

  const mockRegularUser = {
    id: 998,
    name: 'Usuario Ejemplo',
    email: 'usuario@ejemplo.com',
    role: 'user' as 'user',
    age: 24,
    school: 'Centro Educativo Sol',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    arrivalDate: '2025-09-01',
    departureDate: '2026-06-30',
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

  // 2. Dos funciones de bypass separadas
  // const handleBypassUserLogin = () => {
  //   login(mockRegularUser);
  //   router.push('/');
  // };

  const handleBypassAdminLogin = () => {
    login(mockAdminUser);
    router.push('/');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Iniciar Sesión
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Entrar
          </Button>
            {errors.api && (
              <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
                {errors.api}
              </Typography>
            )}
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} href="/registro" variant="body2">
              {"¿No tienes cuenta? Regístrate"}
            </MuiLink>
          </Box>
        </Box>
        
        {/* 3. Dos botones de bypass en un Stack */}
        <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
          {/* <Tooltip title="Entrada rápida como Usuario Normal"> */}
            {/* <Button
              onClick={handleBypassUserLogin}
              variant="text"
              startIcon={<EngineeringIcon />}
            >
              Bypass Usuario
            </Button> */}
          {/* </Tooltip> */}
          <Tooltip title="Entrada rápida como Administrador">
            <Button
              onClick={handleBypassAdminLogin}
              variant="text"
              startIcon={<AdminPanelSettingsIcon />}
              color="secondary"
            >
              Bypass Admin
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </Container>
  );
}
