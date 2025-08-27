'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Grid, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PhotoCamera as PhotoCameraIcon, Face as FaceIcon, Person as PersonIcon } from '@mui/icons-material';

export default function EditarPerfilPage() {
  // 1. Traemos la nueva función updateUser
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    age: '',
    arrivalDate: '',
    departureDate: '',
  });

  const [profileImage, setProfileImage] = useState<string>('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  // Emoji de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '🥚';

  // Predefinir algunas opciones de avatar divertidas
  const predefinedAvatars = [
    '🥚', '😀', '😎', '🤖', '👑', '🦄', '🐱', '🐶', 
    '🦊', '🐸', '🐧', '🦉', '🦆', '🐢', '🦋', '🐝'
  ];

  useEffect(() => {
    if (user) {
      // Manejar el campo school que puede ser string o objeto
      let schoolValue = '';
      if (user.school) {
        if (typeof user.school === 'string') {
          schoolValue = user.school;
        } else if (typeof user.school === 'object' && 'name' in user.school) {
          schoolValue = user.school.name;
        }
      }

      setFormData({
        name: user.name || '',
        school: schoolValue,
        age: user.age ? String(user.age) : '',
        arrivalDate: user.arrivalDate || '',
        departureDate: user.departureDate || '',
      });
    }
  }, [user]);

  // Cargar imagen de perfil al inicializar
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('userProfileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 2. Llamamos a updateUser con los nuevos datos del formulario
    updateUser({
      name: formData.name,
      school: formData.school,
      age: Number(formData.age),
      arrivalDate: formData.arrivalDate,
      departureDate: formData.departureDate,
    });
    alert('Perfil actualizado con éxito');
    router.push('/perfil'); // Volvemos al perfil para ver los cambios
  };

  // Función para manejar el cambio de imagen de perfil
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);
        localStorage.setItem('userProfileImage', imageUrl);
        // Disparar evento personalizado para actualizar otras partes de la app
        window.dispatchEvent(new Event('profileImageChanged'));
        alert('📸 Imagen de perfil actualizada');
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para resetear a la imagen por defecto (huevo)
  const resetProfileImage = () => {
    setProfileImage('');
    localStorage.removeItem('userProfileImage');
    // Disparar evento personalizado para actualizar otras partes de la app
    window.dispatchEvent(new Event('profileImageChanged'));
    alert('🥚 Imagen de perfil restablecida al huevo por defecto');
  };

  const selectPredefinedAvatar = (emoji: string) => {
    setProfileImage(emoji);
    localStorage.setItem('userProfileImage', emoji);
    setShowProfileDialog(false);
    // Disparar evento personalizado para actualizar otras partes de la app
    window.dispatchEvent(new Event('profileImageChanged'));
    alert(`${emoji} Avatar actualizado`);
  };

  if (!user) {
    return null;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ pt: 4, position: 'relative' }}>
        <IconButton onClick={() => router.back()} sx={{ position: 'absolute', top: 16, left: 0 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography component="h1" variant="h4" fontWeight="bold" textAlign="center">
          Editar Perfil
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Sección de imagen de perfil */}
            <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={profileImage}
                sx={{ 
                  width: 100, 
                  height: 100,
                  fontSize: profileImage && !profileImage.startsWith('data:') ? '3rem' : 'inherit',
                  bgcolor: 'primary.light'
                }}
              >
                {!profileImage ? defaultEggAvatar : profileImage.startsWith('data:') ? null : profileImage}
              </Avatar>
              
              <Typography variant="caption" color="text.secondary" textAlign="center">
                {profileImage ? 'Imagen personalizada' : 'Imagen por defecto (Huevo de Twitter)'}
              </Typography>

              <Grid container spacing={1} sx={{ maxWidth: 400 }}>
                <Grid item xs={12} sm={4}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      size="small"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Subir
                    </Button>
                  </label>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={() => setShowProfileDialog(true)}
                    startIcon={<FaceIcon />}
                  >
                    Emoji
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    size="small"
                    onClick={resetProfileImage}
                    startIcon={<PersonIcon />}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField name="name" required fullWidth label="Nombre Completo" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="school" required fullWidth label="Escuela" value={formData.school} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="age" required fullWidth label="Edad" type="number" value={formData.age} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="arrivalDate" required fullWidth label="Fecha de Llegada" type="date" InputLabelProps={{ shrink: true }} value={formData.arrivalDate} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="departureDate" required fullWidth label="Fecha de Salida" type="date" InputLabelProps={{ shrink: true }} value={formData.departureDate} onChange={handleChange} />
            </Grid>
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
            Guardar Cambios
          </Button>
        </Box>

        {/* Diálogo para seleccionar avatares predefinidos */}
        <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaceIcon />
              Elegir Avatar Predefinido
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selecciona un emoji como tu avatar de perfil:
            </Typography>
            <Grid container spacing={1}>
              {predefinedAvatars.map((emoji, index) => (
                <Grid item xs={3} sm={2} key={index}>
                  <IconButton
                    onClick={() => selectPredefinedAvatar(emoji)}
                    sx={{
                      width: '100%',
                      height: 60,
                      fontSize: '1.5rem',
                      border: profileImage === emoji ? 2 : 1,
                      borderColor: profileImage === emoji ? 'primary.main' : 'divider',
                      borderStyle: 'solid',
                      bgcolor: profileImage === emoji ? 'primary.light' : 'transparent',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      }
                    }}
                  >
                    {emoji}
                  </IconButton>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowProfileDialog(false)}>Cancelar</Button>
            <Button onClick={() => selectPredefinedAvatar(defaultEggAvatar)} variant="outlined">
              🥚 Huevo por Defecto
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
