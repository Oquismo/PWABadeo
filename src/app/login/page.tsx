'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Tooltip } from '@mui/material';
import Link from 'next/link';
import EngineeringIcon from '@mui/icons-material/Engineering';

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
  
  const mockUser = {
    name: 'Usuario Ejemplo',
    email: 'usuario@ejemplo.com',
    age: 24,
    school: 'Centro Educativo Sol',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      login({ ...mockUser, email: email });
      router.push('/');
    }
  };

  const handleBypassLogin = () => {
    login(mockUser);
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
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} href="/registro" variant="body2">
              {"¿No tienes cuenta? Regístrate"}
            </MuiLink>
          </Box>
        </Box>
        
        {/* Botón de Bypass ahora siempre visible */}
        <Tooltip title="Entrada rápida para pruebas">
          <Button
            onClick={handleBypassLogin}
            variant="text"
            startIcon={<EngineeringIcon />}
            sx={{ mt: 4 }}
          >
            Bypass Login
          </Button>
        </Tooltip>
      </Box>
    </Container>
  );
}