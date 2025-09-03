'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, TextField, Button, Link as MuiLink, Grid, Tooltip, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
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
  country?: string;
  town?: string;
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
    country: 'Italia',
    city: '',
    town: '',
    adminCode: '',
  });
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { login } = useAuth();
  
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
      // Resetear ciudad y pueblo si el país cambió
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

  // Inicializar ciudades disponibles al cargar el componente
  useEffect(() => {
    if (formData.country && countryCities[formData.country]) {
      setAvailableCities(countryCities[formData.country]);
    }
  }, []);

  // Efecto para actualizar ubicación cuando se selecciona una escuela
  useEffect(() => {
    if (selectedSchool && !isAdminRegistration) {
      // Actualizar los campos de ubicación con los datos de la escuela
      setFormData(prev => ({
        ...prev,
        country: selectedSchool.country || 'Italia',
        city: selectedSchool.city || '',
        town: selectedSchool.town || '',
      }));

      // Actualizar las ciudades y pueblos disponibles
      const schoolCountry = selectedSchool.country || 'Italia';
      if (countryCities[schoolCountry]) {
        setAvailableCities(countryCities[schoolCountry]);
      }
      
      const schoolCity = selectedSchool.city || '';
      if (schoolCity && cityTowns[schoolCity]) {
        setAvailableTowns(cityTowns[schoolCity]);
      }
    }
  }, [selectedSchool, isAdminRegistration]);
  
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

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
    
    // Validar edad siempre
    if (!formData.age) {
      tempErrors.age = 'La edad es obligatoria.';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      tempErrors.age = 'Introduce una edad válida.';
    }
    
    // Solo validar escuela si NO es registro de admin
    if (!isAdminRegistration && !selectedSchool) {
      tempErrors.school = 'La escuela es obligatoria.';
    }
    
    // Solo validar fechas si NO es registro de admin
    if (!isAdminRegistration) {
      if (!formData.arrivalDate) tempErrors.arrivalDate = 'La fecha de llegada es obligatoria.';
      if (!formData.departureDate) tempErrors.departureDate = 'La fecha de salida es obligatoria.';
    }
    
    console.log('🔍 Validación de formulario:', {
      formData,
      isAdminRegistration,
      selectedSchool,
      tempErrors,
      errorsCount: Object.keys(tempErrors).length
    });
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('🚀 HandleSubmit llamado');
    
    if (!validate()) {
      console.log('❌ Validación falló, no se enviará el formulario');
      return;
    }
    
    console.log('✅ Validación pasó, enviando formulario');
    setIsSubmitting(true);
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
        country: formData.country,
        city: formData.city,
        town: formData.town,
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
        setIsSubmitting(false);
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
      await login(userData);
      
      // Redirigir a la página principal
      router.push('/');
      
    } catch (error) {
      console.error('❌ Error en registro:', error);
      setErrors({ api: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
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
            {!isAdminRegistration && (
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
              </>
            )}
            
            {/* Campos de ubicación */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                Ubicación
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={!isAdminRegistration && selectedSchool !== null}>
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
                {!isAdminRegistration && selectedSchool && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    📍 Ubicación automática de la escuela seleccionada
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl 
                fullWidth 
                disabled={(!isAdminRegistration && selectedSchool !== null) || (!formData.country || availableCities.length === 0)}
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
                disabled={(!isAdminRegistration && selectedSchool !== null) || (!formData.city || availableTowns.length === 0)}
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
            <Grid item xs={12}>
              <TextField required fullWidth name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password}/>
            </Grid>
          </Grid>
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            color="primary" 
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
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
