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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Material3Dialog from '@/components/ui/Material3Dialog';
import Material3LoadingPage from '@/components/ui/Material3LoadingPage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PhotoCamera as PhotoCameraIcon, Face as FaceIcon, Person as PersonIcon, Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import loggerClient from '@/lib/loggerClient';

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
    country: '',
    city: '',
    town: '',
    residence: '',
  });

  const [profileImage, setProfileImage] = useState<string>('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Verificar si el usuario es admin
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  // Ciudades por país
  const countryCities: Record<string, string[]> = {
    'Italia': ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Venezia', 'Bari'],
    'España': ['Madrid', 'Barcelona', 'Toledo']
  };

  // Pueblos/localidades por ciudad
  const cityTowns: Record<string, string[]> = {
    // Italia
    'Roma': ['Albano Laziale', 'Anzio', 'Bracciano', 'Castel Gandolfo', 'Ciampino', 'Frascati', 'Genzano di Roma', 'Guidonia Montecelio', 'Ladispoli', 'Marino', 'Nettuno', 'Ostia', 'Palestrina', 'Pomezia', 'Tivoli', 'Velletri', 'Viterbo'],
    'Milano': ['Abbiategrasso', 'Arese', 'Assago', 'Bergamo', 'Bollate', 'Brescia', 'Busto Arsizio', 'Cinisello Balsamo', 'Como', 'Corsico', 'Cremona', 'Gallarate', 'Legnano', 'Lodi', 'Magenta', 'Mantova', 'Monza', 'Novara', 'Pavia', 'Rho', 'Saronno', 'Sesto San Giovanni', 'Varese'],
    'Napoli': ['Acerra', 'Afragola', 'Aversa', 'Bacoli', 'Baiano', 'Calvizzano', 'Capri', 'Casalnuovo di Napoli', 'Caserta', 'Castellammare di Stabia', 'Ercolano', 'Giugliano in Campania', 'Ischia', 'Marano di Napoli', 'Nola', 'Pompei', 'Portici', 'Pozzuoli', 'Procida', 'San Giorgio a Cremano', 'Sorrento', 'Torre del Greco', 'Torre Annunziata'],
    'Torino': ['Alba', 'Alessandria', 'Asti', 'Avigliana', 'Beinasco', 'Biella', 'Borgaro Torinese', 'Chieri', 'Chivasso', 'Collegno', 'Cuneo', 'Grugliasco', 'Ivrea', 'Moncalieri', 'Nichelino', 'Novara', 'Orbassano', 'Pinerolo', 'Rivoli', 'Settimo Torinese', 'Venaria Reale', 'Verbania', 'Vercelli'],
    'Palermo': ['Bagheria', 'Balestrate', 'Carini', 'Castelvetrano', 'Cefalù', 'Corleone', 'Ficarazzi', 'Gangi', 'Lercara Friddi', 'Marsala', 'Mazara del Vallo', 'Misilmeri', 'Monreale', 'Partinico', 'Petralia Soprana', 'Pollina', 'San Giuseppe Jato', 'Termini Imerese', 'Trabia', 'Trapani'],
    'Genova': ['Arenzano', 'Bogliasco', 'Camogli', 'Chiavari', 'Cogoleto', 'La Spezia', 'Lavagna', 'Nervi', 'Pegli', 'Portofino', 'Rapallo', 'Recco', 'Santa Margherita Ligure', 'Savona', 'Sestri Levante', 'Sori', 'Varazze', 'Voltri'],
    'Bologna': ['Anzola dell\'Emilia', 'Budrio', 'Calderara di Reno', 'Casalecchio di Reno', 'Castel Maggiore', 'Castenaso', 'Cento', 'Crevalcore', 'Faenza', 'Ferrara', 'Imola', 'Medicina', 'Modena', 'Molinella', 'Ozzano dell\'Emilia', 'Parma', 'Pianoro', 'Ravenna', 'Reggio Emilia', 'Rimini', 'San Giovanni in Persiceto', 'San Lazzaro di Savena', 'Zola Predosa'],
    'Firenze': ['Bagno a Ripoli', 'Borgo San Lorenzo', 'Calenzano', 'Campi Bisenzio', 'Empoli', 'Fiesole', 'Figline e Incisa Valdarno', 'Impruneta', 'Lastra a Signa', 'Pontassieve', 'Prato', 'Reggello', 'Rignano sull\'Arno', 'San Casciano in Val di Pesa', 'Scandicci', 'Sesto Fiorentino', 'Signa', 'Vaglia'],
    'Venezia': ['Caorle', 'Cavallino-Treporti', 'Chioggia', 'Dolo', 'Eraclea', 'Jesolo', 'Marcon', 'Martellago', 'Mira', 'Mirano', 'Musile di Piave', 'Noale', 'Padova', 'Portogruaro', 'Quarto d\'Altino', 'San Donà di Piave', 'Spinea', 'Treviso', 'Verona', 'Vicenza'],
    'Bari': ['Acquaviva delle Fonti', 'Alberobello', 'Altamura', 'Andria', 'Barletta', 'Bitonto', 'Brindisi', 'Canosa di Puglia', 'Casamassima', 'Castellana Grotte', 'Conversano', 'Corato', 'Foggia', 'Gravina in Puglia', 'Lecce', 'Locorotondo', 'Martina Franca', 'Molfetta', 'Monopoli', 'Polignano a Mare', 'Putignano', 'Ruvo di Puglia', 'Taranto', 'Trani'],
    // España
    'Madrid': ['Alcalá de Henares', 'Alcobendas', 'Alcorcón', 'Aranjuez', 'Boadilla del Monte', 'Collado Villalba', 'Coslada', 'El Escorial', 'Fuenlabrada', 'Getafe', 'Las Rozas', 'Leganés', 'Majadahonda', 'Móstoles', 'Parla', 'Pozuelo de Alarcón', 'San Lorenzo de El Escorial', 'Torrejón de Ardoz', 'Tres Cantos', 'Valdemoro'],
    'Barcelona': ['Badalona', 'Hospitalet de Llobregat', 'Sabadell', 'Terrassa', 'Santa Coloma de Gramenet', 'Cornellà de Llobregat', 'Sant Boi de Llobregat', 'Mataró', 'Granollers', 'Manresa', 'Vic', 'Igualada', 'Vilanova i la Geltrú', 'Girona', 'Lleida', 'Tarragona', 'Reus', 'Sitges', 'Figueres', 'Blanes'],
    'Toledo': ['Talavera de la Reina', 'Illescas', 'Seseña', 'Azuqueca de Henares', 'Guadalajara', 'Yepes', 'Ocaña', 'Quintanar de la Orden', 'Villacañas', 'Madridejos', 'Consuegra', 'Mora', 'Torrijos', 'Fuensalida', 'La Puebla de Montalbán', 'Sonseca', 'Orgaz', 'Tembleque']
  };

  // Estados disponibles
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  // Efecto para actualizar ciudades cuando cambia el país
  useEffect(() => {
    if (formData.country && countryCities[formData.country]) {
      setAvailableCities(countryCities[formData.country]);
      // Resetear ciudad y pueblo si el país cambió y la ciudad no está disponible
      if (!countryCities[formData.country].includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '', town: '' }));
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '', town: '' }));
    }
  }, [formData.country]);

  // Efecto para actualizar pueblos cuando cambia la ciudad
  useEffect(() => {
    if (formData.city && cityTowns[formData.city]) {
      setAvailableTowns(cityTowns[formData.city]);
      // Resetear pueblo si no está disponible para la nueva ciudad
      if (!cityTowns[formData.city].includes(formData.town)) {
        setFormData(prev => ({ ...prev, town: '' }));
      }
    } else {
      setAvailableTowns([]);
      setFormData(prev => ({ ...prev, town: '' }));
    }
  }, [formData.city]);

  // Inicializar ciudades y pueblos al cargar el componente
  useEffect(() => {
    if (formData.country && countryCities[formData.country]) {
      setAvailableCities(countryCities[formData.country]);
    }
    if (formData.city && cityTowns[formData.city]) {
      setAvailableTowns(cityTowns[formData.city]);
    }
  }, [formData.country, formData.city]);

  // Imagen de huevo por defecto (como el antiguo Twitter)
  const defaultEggAvatar = '/img/twittereggavatar.jpg';

  // Predefinir algunas opciones de avatar divertidas
  const predefinedAvatars = [
    '/img/twittereggavatar.jpg', '😀', '😎', '🤖', '👑', '🦄', '🐱', '🐶',
    '🦊', '🐸', '🐧', '🦉', '🦆', '🐢', '🦋', '🐝'
  ];

  useEffect(() => {
    if (user) {
      // Manejar el campo school que puede ser string o objeto
      let schoolValue = '';
      if (user.school && !isAdmin) {
        if (typeof user.school === 'string') {
          schoolValue = user.school;
        } else if (typeof user.school === 'object' && 'name' in user.school) {
          schoolValue = user.school.name;
        }
      }

      setFormData({
        name: user.name || '',
        school: isAdmin ? '' : schoolValue,
        age: isAdmin ? '' : (user.age ? String(user.age) : ''),
        arrivalDate: isAdmin ? '' : (user.arrivalDate || ''),
        departureDate: isAdmin ? '' : (user.departureDate || ''),
        country: user.country || 'Italia',
        city: user.city || '',
        town: user.town || '',
        residence: user.residence || '',
      });

      // Si el usuario no es admin y tiene una escuela, actualizar ubicación con datos de la escuela
      if (!isAdmin && user.school && typeof user.school === 'object' && 'country' in user.school) {
        const school = user.school as any;
        if (school.country || school.city || school.town) {
          setFormData(prev => ({
            ...prev,
            country: school.country || user.country || 'Italia',
            city: school.city || user.city || '',
            town: school.town || user.town || '',
          }));

          // Actualizar ciudades y pueblos disponibles
          const schoolCountry = school.country || 'Italia';
          if (countryCities[schoolCountry]) {
            setAvailableCities(countryCities[schoolCountry]);
          }
          
          const schoolCity = school.city || '';
          if (schoolCity && cityTowns[schoolCity]) {
            setAvailableTowns(cityTowns[schoolCity]);
          }
        }
      }
    }
  }, [user, isAdmin]);

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
          loggerClient.error('Error al cargar avatar:', error);
        }
      }
    };
    loadAvatar();
  }, [user?.id, user?.avatarUrl]);

  useEffect(() => {
    // Solo redirigir si la carga ha terminado y no hay usuario autenticado
    if (!isLoading && !isAuthenticated && !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // 2. Llamamos a updateUser con los nuevos datos del formulario
      const updateData: any = {
        name: formData.name,
        country: formData.country,
        city: formData.city,
        town: formData.town,
        residence: formData.residence || null,
      };

      // Solo agregar campos específicos para usuarios no-admin
      if (!isAdmin) {
        updateData.school = formData.school;
        updateData.age = Number(formData.age);
        updateData.arrivalDate = formData.arrivalDate;
        updateData.departureDate = formData.departureDate;
      }

      await updateUser(updateData);

      setSuccessMessage('Perfil actualizado con éxito');
      setTimeout(() => {
        router.push('/perfil'); // Volvemos al perfil para ver los cambios
      }, 1500);
    } catch (error) {
      loggerClient.error('Error al actualizar perfil:', error);
      // Mostrar alerta al usuario pero con mensaje genérico
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
          loggerClient.error('Error al guardar avatar:', error);
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
      loggerClient.error('Error al eliminar avatar:', error);
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
      loggerClient.error('Error al guardar avatar:', error);
      setSuccessMessage('Error al guardar el avatar');
    }

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (isLoading) {
    return (
      <Material3LoadingPage 
        text="Cargando editor..."
        subtitle="Preparando tu información para editar"
      />
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
                        src={profileImage || defaultEggAvatar}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: 'auto',
                          fontSize: profileImage && !profileImage.startsWith('data:') && profileImage !== defaultEggAvatar ? '3rem' : 'inherit',
                          bgcolor: 'primary.light',
                          border: '4px solid',
                          borderColor: 'background.paper',
                          boxShadow: 3
                        }}
                      >
                        {!profileImage ? undefined : profileImage.startsWith('data:') ? null : profileImage === defaultEggAvatar ? undefined : profileImage}
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
                <Grid item xs={12} md={8}>
                  {/* Mostrar chip de residencia actual */}
                  {user && (user as any).residence && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Residencia seleccionada</Typography>
                      <Chip label={(user as any).residence} color="primary" />
                    </Box>
                  )}
                </Grid>

                {/* Campo para editar la residencia */}
                {!isAdmin && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="edit-residence-label">Residencia</InputLabel>
                      <Select
                        labelId="edit-residence-label"
                        name="residence"
                        value={formData.residence}
                        label="Residencia"
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="">Ninguna</MenuItem>
                        <MenuItem value="ONE">ONE (Residencia ONE)</MenuItem>
                        <MenuItem value="AMBRO">AMBRO (Residencia AMRO)</MenuItem>
                        <MenuItem value="ESTANISLAO">Estanislao</MenuItem>
                        <MenuItem value="ARMENDARIZ">Armendáriz</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* Campos del formulario */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                  {/* RESIDENCE FIELD TEMPORARILY DISABLED
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="edit-residence-label">Residencia</InputLabel>
                      <Select
                        labelId="edit-residence-label"
                        name="residence"
                        value={formData.residence}
                        label="Residencia"
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="">Ninguna</MenuItem>
                        <MenuItem value="ONE">ONE</MenuItem>
                        <MenuItem value="AMBRO">Ambro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  */}
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

                    {!isAdmin && (
                      <>
                        {/* Campo 'Escuela' ocultado por petición: mantenemos el estado `formData.school` y
                            la lógica de envío (updateData.school) para compatibilidad, pero retiramos el
                            input de la UI de forma conservadora. */}
                        {/*
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
                        */}

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
                      </>
                    )}

                    {!isAdmin && (
                      <>
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
                      </>
                    )}

                    {/* Campos de ubicación ocultados: la ubicación seguirá derivándose desde la escuela
                        o desde el estado interno, pero la UI para País/Ciudad/Localidad está oculta
                        por petición del product owner. Se mantiene la lógica y los efectos que actualizan
                        `formData.country`, `formData.city` y `formData.town`. */}
                    {/*
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                        Ubicación
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={!isAdmin && user?.school && typeof user.school === 'object' ? true : false}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
                      >
                        <InputLabel>País</InputLabel>
                        <Select
                          name="country"
                          value={formData.country}
                          label="País"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="Italia">Italia</MenuItem>
                          <MenuItem value="España">España</MenuItem>
                        </Select>
                        {!isAdmin && user?.school && typeof user.school === 'object' && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            📍 Ubicación automática de tu escuela
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={(!isAdmin && user?.school && typeof user.school === 'object') || (!formData.country || availableCities.length === 0)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
                      >
                        <InputLabel>Ciudad</InputLabel>
                        <Select
                          name="city"
                          value={formData.city}
                          label="Ciudad"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="">Selecciona una ciudad</MenuItem>
                          {availableCities.map((city) => (
                            <MenuItem key={city} value={city}>{city}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        disabled={(!isAdmin && user?.school && typeof user.school === 'object') || (!formData.city || availableTowns.length === 0)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3
                          }
                        }}
                      >
                        <InputLabel>Localidad</InputLabel>
                        <Select
                          name="town"
                          value={formData.town}
                          label="Localidad"
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="">Selecciona una localidad</MenuItem>
                          {availableTowns.map((town) => (
                            <MenuItem key={town} value={town}>{town}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    */}
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

      {/* Material 3 Dialog para seleccionar avatares predefinidos */}
      <Material3Dialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        title="Elegir Avatar"
        icon={<FaceIcon />}
        supportingText="Selecciona un emoji como tu avatar de perfil:"
        maxWidth="sm"
        fullWidth
        actions={
          <>
            <Button
              onClick={() => setShowProfileDialog(false)}
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => selectPredefinedAvatar(defaultEggAvatar)}
              variant="outlined"
              startIcon={<Avatar src={defaultEggAvatar} sx={{ width: 20, height: 20 }} />}
              sx={{ borderRadius: 2 }}
            >
              Huevo por Defecto
            </Button>
          </>
        }
      >

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
                {emoji.startsWith('/img/')
                  ? <Avatar src={emoji} sx={{ width: 32, height: 32, mx: 'auto' }} />
                  : emoji}
              </IconButton>
            </Grid>
          ))}
        </Grid>
      </Material3Dialog>
    </Container>
  );
}
