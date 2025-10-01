'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Box, Typography, Link as MuiLink, Grid, Tooltip, FormControl, InputLabel, Select, MenuItem, CircularProgress, Paper, Divider, InputAdornment, IconButton } from '@mui/material';
import M3Button from '@/components/ui/M3Button';
import loggerClient from '@/lib/loggerClient';
import Material3LoadingIndicator from '@/components/ui/Material3LoadingIndicator';
import MaterialTextField from '@/components/ui/MaterialTextField';
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
  // Traducción
  const { t } = require('@/hooks/useTranslation').useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    arrivalDate: '',
    departureDate: '',
    country: 'Italia',
    residence: '',
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
      loggerClient.debug('🔍 Validación de formulario:', {
        formData,
        isAdminRegistration,
        selectedSchool,
        tempErrors,
        errorsCount: Object.keys(tempErrors).length
      });
      loggerClient.debug('🚀 HandleSubmit llamado');
      loggerClient.warn('❌ Validación falló, no se enviará el formulario');
      loggerClient.info('✅ Validación pasó, enviando formulario');
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  loggerClient.debug('🚀 HandleSubmit llamado');
    
    if (!validate()) {
    loggerClient.warn('❌ Validación falló, no se enviará el formulario');
      return;
    }
    
  loggerClient.info('✅ Validación pasó, enviando formulario');
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
        residence: formData.residence || null, // Incluir residencia seleccionada
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        // Derivar ubicación desde la escuela seleccionada cuando esté presente
        country: selectedSchool?.country ?? formData.country,
        city: selectedSchool?.city ?? formData.city,
        town: selectedSchool?.town ?? formData.town,
        isAdmin: isAdminRegistration,
        adminCode: isAdminRegistration ? formData.adminCode : undefined,
      };
      
  loggerClient.debug('📝 Intentando registro con:', payload.email);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
  loggerClient.debug('📋 Respuesta del registro:', data);
      
      if (!response.ok) {
        setErrors({ api: data.error || 'Error en el registro' });
        setIsSubmitting(false);
        return;
      }
      
      // Si llegamos aquí, el registro fue exitoso
  loggerClient.info('✅ Registro exitoso, usuario:', data.user);
      
      // Preparar datos del usuario para el contexto con información de la escuela
      const userData: User = {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        name: data.user.name,
        email: data.user.email,
        age: data.user.age,
        residence: data.user.residence || formData.residence || null,
        role: data.user.role || 'USER',
        arrivalDate: data.user.arrivalDate,
        departureDate: data.user.departureDate,
        schoolId: data.user.schoolId,
        // Para evitar incluir 'level' en el registro, enviamos solo el nombre de la escuela como cadena.
        school: selectedSchool ? selectedSchool.name : undefined,
      };
      
      // Usar el contexto de auth para guardar el usuario
      await login(userData);
      
      // Redirigir a la página principal
      router.push('/');
      
    } catch (error) {
      loggerClient.error('❌ Error en registro:', error);
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
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {t('register.title')}
        </Typography>
        {/* Subtítulo eliminado por petición del usuario */}

        <Paper elevation={errors.api ? 12 : 6} sx={{ width: '100%', p: { xs: 3, sm: 4 }, borderRadius: 4, bgcolor: 'background.paper', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { boxShadow: '0 12px 40px rgba(20,20,30,0.12)' }, '@keyframes shake': { '0%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '50%': { transform: 'translateX(5px)' }, '75%': { transform: 'translateX(-5px)' }, '100%': { transform: 'translateX(0)' } } }}>
          <Box id="register-form" component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
            <Grid container spacing={2}>

              {/* Sección: Datos personales */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1 }}>Datos personales</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaterialTextField 
                  name="firstName" 
                  required 
                  fullWidth 
                  label={t('register.firstName')} 
                  autoFocus 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  error={!!errors.firstName} 
                  helperText={errors.firstName}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EngineeringIcon color="action" /></InputAdornment>, sx: { borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' } } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaterialTextField required fullWidth label={t('register.lastName')} name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName}/>
              </Grid>

              <Grid item xs={12}>
                <MaterialTextField required fullWidth label={t('register.email')} name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} InputProps={{ startAdornment: <InputAdornment position="start">@</InputAdornment>, sx: { borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' } } }} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <MaterialTextField name="age" required fullWidth label="Edad" type="number" value={formData.age} onChange={handleChange} error={!!errors.age} helperText={errors.age} />
              </Grid>

              <Grid item xs={12} sm={8}>
                <MaterialTextField 
                  name="password" 
                  required 
                  fullWidth 
                  label={t('register.password')} 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  error={!!errors.password} 
                  helperText={errors.password}
                  InputProps={{ sx: { borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' } } }}
                />
              </Grid>

              {/* Sección: Escuela y residencia */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1 }}>Centro / Residencia</Typography>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'transparent' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      {!isAdminRegistration && (
                        <div id="school-select">
                          <SchoolSelector
                            value={selectedSchool}
                            onChange={setSelectedSchool}
                            error={!!errors.school}
                            helperText={errors.school}
                            required
                          />
                        </div>
                      )}
                      {isAdminRegistration && (
                        <Typography variant="body2" color="success.main" sx={{ p: 1, bgcolor: '#e8f5e8', borderRadius: 1, display: 'inline-block' }}>
                          🔐 Modo Administrador: La selección de escuela no es requerida
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      {!isAdminRegistration && (
                        <FormControl fullWidth size="small">
                          <InputLabel id="residence-label">Residencia</InputLabel>
                          <Select
                            labelId="residence-label"
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
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Sección: Fechas y adminCode */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1 }}>Fechas</Typography>
              </Grid>

              {!isAdminRegistration && (
                <>
                  <Grid item xs={12} sm={6}>
                    <MaterialTextField
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
                    <MaterialTextField
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

              <Grid item xs={12} sm={6}>
                <MaterialTextField 
                  name="adminCode" 
                  fullWidth 
                  label="Código Admin (opcional)" 
                  value={formData.adminCode} 
                  onChange={handleChange} 
                  type="password"
                  autoComplete="off"
                  helperText={isAdminRegistration ? "✅ Registro como Admin activado" : "Deja vacío para registro normal"}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <M3Button
                  id="submit-register"
                  type="submit"
                  fullWidth
                  m3variant="filled"
                  disabled={isSubmitting}
                  sx={{ mt: 1, mb: 1.5, py: 1.8, fontWeight: 700, borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(98,0,238,0.3)' }, '&:active': { transform: 'translateY(0)' }, '&:disabled': { transform: 'none' } }}
                  startIcon={isSubmitting ? <Material3LoadingIndicator size="small" /> : undefined}
                >
                  {isSubmitting ? t('common.loading') : t('register.registerButton')}
                </M3Button>
              </Grid>

              {errors.api && (
                <Grid item xs={12}>
                  <Typography color="error" sx={{ mt: 1, textAlign: 'center', animation: 'shake 0.5s ease-in-out' }}>
                    {errors.api}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center' }}>
                  <MuiLink component={Link} href="/login" variant="body2">
                    {t('register.alreadyHaveAccount')} {t('register.loginHere')}
                  </MuiLink>
                </Box>
              </Grid>

            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
