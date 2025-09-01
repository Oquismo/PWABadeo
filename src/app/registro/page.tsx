'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Grid, Tooltip } from '@mui/material';
import Link from 'next/link';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SchoolSelector from '@/components/registro/SchoolSelector';
import type { User } from '@/context/AuthContext';

// Tipo para la escuela seleccionada
interface School {
  id: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  type: string;
  level: string;
  description?: string;
}

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    arrivalDate: '',
    departureDate: '',
    adminCode: '',
  });
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { login } = useAuth();
  
  // Añadimos esta comprobación para evitar errores de renderizado
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Verificar si es código de admin
    if (name === 'adminCode') {
      const isAdmin = value === 'ADMIN2025'; // Código secreto para admin
      setIsAdminRegistration(isAdmin);
      if (isAdmin) {
        // Limpiar error de escuela si se activa modo admin
        setErrors((prev: any) => ({ ...prev, school: '' }));
      }
    }
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
    if (!formData.age) {
      tempErrors.age = 'La edad es obligatoria.';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      tempErrors.age = 'Introduce una edad válida.';
    }
    
    // Solo validar escuela si NO es registro de admin
    if (!isAdminRegistration && !selectedSchool) {
      tempErrors.school = 'La escuela es obligatoria.';
    }
    
    if (!formData.arrivalDate) tempErrors.arrivalDate = 'La fecha de llegada es obligatoria.';
    if (!formData.departureDate) tempErrors.departureDate = 'La fecha de salida es obligatoria.';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    
    setErrors({}); // Limpiar errores previos
    
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age, 10),
        schoolId: isAdminRegistration ? null : selectedSchool?.id,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        isAdmin: isAdminRegistration,
        adminCode: isAdminRegistration ? formData.adminCode : undefined,
      };
      
      console.log('📝 Intentando registro con:', payload.email);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      console.log('📋 Respuesta del registro:', data);
      
      if (!response.ok) {
        setErrors({ api: data.error || 'Error en el registro' });
        return;
      }
      
      // Si llegamos aquí, el registro fue exitoso
      console.log('✅ Registro exitoso, usuario:', data.user);
      
      // Preparar datos del usuario para el contexto con información de la escuela
      const userData: User = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        name: data.user.name,
        email: data.user.email,
        age: data.user.age,
        role: data.user.role || 'USER',
        arrivalDate: data.user.arrivalDate,
        departureDate: data.user.departureDate,
        schoolId: data.user.schoolId,
        school: selectedSchool ? {
          id: selectedSchool.id,
          name: selectedSchool.name,
          city: selectedSchool.city,
          type: selectedSchool.type,
          level: selectedSchool.level,
        } : undefined,
      };
      
      // Usar el contexto de auth para guardar el usuario
      login(userData);
      
      // Redirigir a la página principal
      router.push('/');
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      setErrors({ api: 'Error de conexión. Intenta nuevamente.' });
    }
  };

  // No renderizamos el formulario hasta que estemos en el navegador
  if (!isClient) {
    return null;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography component="h1" variant="h4" fontWeight="bold">
          Crear Cuenta
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="firstName" required fullWidth label="Nombre" autoFocus value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required fullWidth label="Apellidos" name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName}/>
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth label="Correo Electrónico" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="age" required fullWidth label="Edad" type="number" value={formData.age} onChange={handleChange} error={!!errors.age} helperText={errors.age} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                name="adminCode" 
                fullWidth 
                label="Código Admin (opcional)" 
                value={formData.adminCode} 
                onChange={handleChange} 
                placeholder="ADMIN2025"
                helperText={isAdminRegistration ? "✅ Registro como Admin activado" : "Deja vacío para registro normal"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isAdminRegistration ? '#e8f5e8' : 'inherit',
                  }
                }}
              />
            </Grid>
            {!isAdminRegistration && (
              <Grid item xs={12}>
                <SchoolSelector
                  value={selectedSchool}
                  onChange={setSelectedSchool}
                  error={!!errors.school}
                  helperText={errors.school}
                  required
                />
              </Grid>
            )}
            {isAdminRegistration && (
              <Grid item xs={12}>
                <Typography variant="body2" color="success.main" sx={{ textAlign: 'center', p: 1, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                  🔐 Modo Administrador: La selección de escuela no es requerida
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                name="arrivalDate"
                required
                fullWidth
                label="Fecha de Llegada"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.arrivalDate}
                onChange={handleChange}
                error={!!errors.arrivalDate}
                helperText={errors.arrivalDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="departureDate"
                required
                fullWidth
                label="Fecha de Salida"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.departureDate}
                onChange={handleChange}
                error={!!errors.departureDate}
                helperText={errors.departureDate}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password}/>
            </Grid>
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Registrarse
          </Button>
          {errors.api && (
            <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
              {errors.api}
            </Typography>
          )}
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} href="/login" variant="body2">
              ¿Ya tienes una cuenta? Inicia sesión
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
