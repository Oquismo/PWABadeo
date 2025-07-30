'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Grid, Tooltip } from '@mui/material';
import Link from 'next/link';
import EngineeringIcon from '@mui/icons-material/Engineering';

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '', // 1. Añadimos el campo de edad
    school: '', // 2. Añadimos el campo de escuela
  });
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let tempErrors: any = {};
    if (!formData.firstName) tempErrors.firstName = 'El nombre es obligatorio.';
    if (!formData.lastName) tempErrors.lastName = 'Los apellidos son obligatorios.';
    if (!formData.email) {
      tempErrors.email = 'El email es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'El formato del email es inválido.';
    }
    if (!formData.password) {
      tempErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    // 3. Añadimos validación para los nuevos campos
    if (!formData.age) {
      tempErrors.age = 'La edad es obligatoria.';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      tempErrors.age = 'Introduce una edad válida.';
    }
    if (!formData.school) tempErrors.school = 'El nombre de la escuela es obligatorio.';
    
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
      // 4. Pasamos los nuevos datos al crear el usuario
      login({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        age: Number(formData.age),
        school: formData.school,
        avatarUrl: mockUser.avatarUrl, // Usamos un avatar de ejemplo por ahora
      });
      router.push('/');
    }
  };

  const handleBypassLogin = () => {
    login(mockUser);
    router.push('/');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Crear Cuenta
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            {/* ... Campos de Nombre y Apellidos (sin cambios) ... */}
            <Grid item xs={12} sm={6}>
              <TextField name="firstName" required fullWidth label="Nombre" autoFocus value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Apellidos" name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName}/>
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth label="Correo Electrónico" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email}/>
            </Grid>
            {/* 5. Añadimos los nuevos campos al formulario */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="age"
                required
                fullWidth
                label="Edad"
                type="number" // El tipo 'number' muestra un teclado numérico en móviles
                value={formData.age}
                onChange={handleChange}
                error={!!errors.age}
                helperText={errors.age}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="school"
                required
                fullWidth
                label="Escuela"
                value={formData.school}
                onChange={handleChange}
                error={!!errors.school}
                helperText={errors.school}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password}/>
            </Grid>
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Registrarse
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} href="/login" variant="body2">
              ¿Ya tienes una cuenta? Inicia sesión
            </MuiLink>
          </Box>
        </Box>
        
        {process.env.NODE_ENV === 'development' && (
          <Tooltip title="Entrada para desarrolladores">
            <Button
              onClick={handleBypassLogin}
              variant="text"
              startIcon={<EngineeringIcon />}
              sx={{ mt: 2 }}
            >
              Bypass Login
            </Button>
          </Tooltip>
        )}
      </Box>
    </Container>
  );
}