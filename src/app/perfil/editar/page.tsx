'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Stack,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PhotoCamera as PhotoCameraIcon, Face as FaceIcon, Person as PersonIcon, Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';

export default function EditarPerfilPage() {
  // 1. Traemos las funciones del contexto incluyendo las nuevas de avatar
  const { user, isAuthenticated, isLoading, updateUser, updateAvatar, deleteAvatar } = useAuth();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  // Cargar imagen de perfil desde el servidor
  useEffect(() => {
    const loadAvatar = async () => {
      if (user?.id) {
        try {
          // Aquí podríamos llamar a refreshAvatar si está disponible en el contexto
          // Por ahora, usamos el avatar que ya viene en el user
          if (user.avatarUrl) {
            setProfileImage(user.avatarUrl);
          }
        } catch (error) {
          console.error('Error al cargar avatar:', error);
        }
      }
    };
    loadAvatar();
  }, [user?.id, user?.avatarUrl]);

  useEffect(() => {
    // Solo redirigir si definitivamente no hay usuario después de que termine la carga
    if (!isAuthenticated && !user) {
      // Dar tiempo adicional para que el contexto se inicialice en producción
      const timer = setTimeout(() => {
        if (!isAuthenticated && !user) {
          router.push('/login');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // 2. Llamamos a updateUser con los nuevos datos del formulario
      await updateUser({
        name: formData.name,
        school: formData.school,
        age: Number(formData.age),
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
      });

      setSuccessMessage('Perfil actualizado con éxito');
      setTimeout(() => {
        router.push('/perfil'); // Volvemos al perfil para ver los cambios
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar el cambio de imagen de perfil
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);

        try {
          await updateAvatar(imageUrl);
          setSuccessMessage('📸 Imagen de perfil actualizada correctamente');
          // Disparar evento para sincronizar con otras páginas
          window.dispatchEvent(new Event('profileImageChanged'));
        } catch (error) {
          console.error('Error al guardar avatar:', error);
          setSuccessMessage('Error al guardar la imagen');
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para resetear a la imagen por defecto (huevo)
  const resetProfileImage = async () => {
    setProfileImage('');

    try {
      await deleteAvatar();
      setSuccessMessage('🥚 Imagen de perfil restablecida al huevo por defecto');
      // Disparar evento para sincronizar con otras páginas
      window.dispatchEvent(new Event('profileImageChanged'));
    } catch (error) {
      console.error('Error al eliminar avatar:', error);
      setSuccessMessage('Error al restablecer la imagen');
    }

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const selectPredefinedAvatar = async (emoji: string) => {
    setProfileImage(emoji);
    setShowProfileDialog(false);

    try {
      await updateAvatar(emoji);
      setSuccessMessage(`${emoji} Avatar actualizado correctamente`);
      // Disparar evento para sincronizar con otras páginas
      window.dispatchEvent(new Event('profileImageChanged'));
    } catch (error) {
      console.error('Error al guardar avatar:', error);
      setSuccessMessage('Error al guardar el avatar');
    }

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (isLoading) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography variant="h6" color="text.secondary">Cargando...</Typography>
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container component="main" maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography variant="h6" color="text.secondary">Verificando autenticación...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{
            mr: 2,
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Editar Perfil
        </Typography>
      </Box>

      {/* Mensaje de éxito */}
      {successMessage && (
        <Fade in={true}>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            {successMessage}
          </Alert>
        </Fade>
      )}

      <Box component="form" noValidate onSubmit={handleSubmit}>
        {/* Card principal del perfil */}
        <Fade in={true} timeout={600}>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Información Personal
              </Typography>

              <Grid container spacing={3}>
                {/* Sección de imagen de perfil */}
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      bgcolor: 'action.hover'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Foto de Perfil
                    </Typography>

                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Avatar
                        src={profileImage}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          fontSize: profileImage && !profileImage.startsWith('data:') ? '3rem' : 'inherit',
                          bgcolor: 'primary.light',
                          border: '4px solid',
                          borderColor: 'background.paper',
                          boxShadow: 3
                        }}
                      >
                        {!profileImage ? defaultEggAvatar : profileImage.startsWith('data:') ? null : profileImage}
                      </Avatar>
                    </Box>

                    <Chip
                      label={profileImage ? 'Imagen personalizada' : 'Imagen por defecto'}
                      size="small"
                      color={profileImage ? 'primary' : 'default'}
                      sx={{ mb: 2 }}
                    />

                    <Stack spacing={1}>
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
                          sx={{ borderRadius: 2 }}
                        >
                          Subir Foto
                        </Button>
                      </label>

                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        onClick={() => setShowProfileDialog(true)}
                        startIcon={<FaceIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Elegir Emoji
                      </Button>

                      <Button
                        variant="outlined"
                        color="warning"
                        fullWidth
                        size="small"
                        onClick={resetProfileImage}
                        startIcon={<PersonIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Restablecer
                      </Button>
                    </Stack>
                  </Card>
                </Grid>

                {/* Campos del formulario */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        name="name"
                        required
                        fullWidth
                        label="Nombre Completo"
                        value={formData.name}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
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
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="age"
                        required
                        fullWidth
                        label="Edad"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
                      />
                    </Grid>

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
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
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
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Botón de guardar */}
        <Fade in={true} timeout={800}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? undefined : <SaveIcon />}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Fade>
      </Box>

      {/* Diálogo para seleccionar avatares predefinidos */}
      <Dialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaceIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Elegir Avatar
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                    fontSize: '1.8rem',
                    border: profileImage === emoji ? 2 : 1,
                    borderColor: profileImage === emoji ? 'primary.main' : 'divider',
                    borderStyle: 'solid',
                    borderRadius: 2,
                    bgcolor: profileImage === emoji ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {emoji}
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setShowProfileDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => selectPredefinedAvatar(defaultEggAvatar)}
            variant="outlined"
            startIcon={<span>🥚</span>}
            sx={{ borderRadius: 2 }}
          >
            Huevo por Defecto
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
