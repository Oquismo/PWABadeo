'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Container, 
  Box, 
  Typography, 
  Link as MuiLink, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Paper, 
  Divider, 
  InputAdornment 
} from '@mui/material';
import M3Button from '@/components/ui/M3Button';
import loggerClient from '@/lib/loggerClient';
import Material3LoadingIndicator from '@/components/ui/Material3LoadingIndicator';
import MaterialTextField from '@/components/ui/MaterialTextField';
import Link from 'next/link';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SchoolSelector from '@/components/registro/SchoolSelector';

// Hooks y utilidades refactorizadas
import { useForm, useToggle } from '@/hooks/useForm';
import { validateRegisterForm, RegisterFormData } from '@/utils/validation.utils';
import { apiClient } from '@/utils/api-client.utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useHaptics } from '@/hooks/useHaptics';
import type { User } from '@/context/AuthContext';
import { UserBase } from '@/types/api.types';

// Tipos
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

// Constantes de ubicaciones
const COUNTRY_CITIES: Record<string, string[]> = {
  'Italia': ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Venezia', 'Bari'],
  'España': ['Madrid', 'Barcelona', 'Toledo']
};

const CITY_TOWNS: Record<string, string[]> = {
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

const RESIDENCES = [
  { value: '', label: 'Ninguna' },
  { value: 'ONE', label: 'ONE (Residencia ONE)' },
  { value: 'AMBRO', label: 'AMBRO (Residencia AMRO)' },
  { value: 'ESTANISLAO', label: 'Estanislao' },
  { value: 'ARMENDARIZ', label: 'Armendáriz' },
];

const ADMIN_CODE = 'ADMIN2025';

export default function RegistroPageRefactored() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();
  const { success: hapticSuccess, error: hapticError } = useHaptics();
  
  // Estado para escuela y modo admin
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const { value: isClient, toggle: setIsClientTrue } = useToggle(false);
  
  // Hook de formulario con validación dinámica
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    setFieldError,
  } = useForm<RegisterFormData>({
    initialValues: {
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
      schoolId: undefined,
      isAdmin: false,
    },
    validate: (data) => {
      const isAdminRegistration = data.adminCode === ADMIN_CODE;
      return validateRegisterForm(data, isAdminRegistration);
    },
    onSubmit: handleRegistration,
  });

  // Detectar modo admin
  const isAdminRegistration = useMemo(() => values.adminCode === ADMIN_CODE, [values.adminCode]);

  // Ciudades disponibles según país
  const availableCities = useMemo(() => {
    return COUNTRY_CITIES[values.country || 'Italia'] || [];
  }, [values.country]);

  // Pueblos disponibles según ciudad
  const availableTowns = useMemo(() => {
    return CITY_TOWNS[values.city || ''] || [];
  }, [values.city]);

  // Efecto inicial para establecer isClient
  useEffect(() => {
    setIsClientTrue();
  }, []);

  // Actualizar ubicación cuando cambia el país
  useEffect(() => {
    if (values.country && !availableCities.includes(values.city || '')) {
      setFieldValue('city', '');
      setFieldValue('town', '');
    }
  }, [values.country, availableCities]);

  // Actualizar pueblo cuando cambia la ciudad
  useEffect(() => {
    if (values.city && !availableTowns.includes(values.town || '')) {
      setFieldValue('town', '');
    }
  }, [values.city, availableTowns]);

  // Actualizar ubicación cuando se selecciona una escuela
  useEffect(() => {
    if (selectedSchool && !isAdminRegistration) {
      setFieldValue('country', selectedSchool.country || 'Italia');
      setFieldValue('city', selectedSchool.city || '');
      setFieldValue('town', selectedSchool.town || '');
      setFieldValue('schoolId', selectedSchool.id);
      
      // Limpiar error de escuela
      if (errors.school) {
        setFieldError('school', '');
      }
    }
  }, [selectedSchool, isAdminRegistration]);

  // Limpiar error de escuela cuando se activa modo admin
  useEffect(() => {
    if (isAdminRegistration && errors.school) {
      setFieldError('school', '');
    }
  }, [isAdminRegistration]);

  // Función de registro
  async function handleRegistration(formData: RegisterFormData) {
    try {
      loggerClient.debug('📝 Intentando registro con:', formData.email);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        age: parseInt(String(formData.age), 10),
        schoolId: isAdminRegistration ? null : selectedSchool?.id,
        residence: formData.residence || null,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        country: selectedSchool?.country ?? formData.country,
        city: selectedSchool?.city ?? formData.city,
        town: selectedSchool?.town ?? formData.town,
        isAdmin: isAdminRegistration,
        adminCode: isAdminRegistration ? formData.adminCode : undefined,
      };

      // Usar cliente API refactorizado
      const response = await apiClient.post<{ user: UserBase }>('/api/auth/register', payload);

      if (!response.success) {
        setFieldError('api', response.error || 'Error en el registro');
        await hapticError();
        return;
      }

      // Registro exitoso
      if (response.data?.user) {
        loggerClient.info('✅ Registro exitoso, usuario:', response.data.user);

        // Preparar datos del usuario
        const userData: User = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          name: response.data.user.name || `${response.data.user.firstName} ${response.data.user.lastName}`,
          email: response.data.user.email,
          age: response.data.user.age,
          residence: response.data.user.residence || formData.residence || null,
          role: response.data.user.role || 'USER',
          arrivalDate: formData.arrivalDate,
          departureDate: formData.departureDate,
          schoolId: response.data.user.schoolId,
          school: selectedSchool ? selectedSchool.name : undefined,
        };

        // Login automático
        await login(userData);
        await hapticSuccess();

        // Redirigir
        router.push('/');
      }
    } catch (error) {
      loggerClient.error('❌ Error en registro:', error);
      setFieldError('api', 'Error de conexión. Intenta nuevamente.');
      await hapticError();
    }
  }

  // Handler para Select de MUI
  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFieldValue(name, value);
  };

  // No renderizar hasta que estemos en el cliente
  if (!isClient) {
    return null;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {t('register.title')}
        </Typography>

        <Paper 
          elevation={errors.api ? 12 : 6} 
          sx={{ 
            width: '100%', 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 4, 
            bgcolor: 'background.paper', 
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
            '&:hover': { boxShadow: '0 12px 40px rgba(20,20,30,0.12)' },
            '@keyframes shake': { 
              '0%': { transform: 'translateX(0)' }, 
              '25%': { transform: 'translateX(-5px)' }, 
              '50%': { transform: 'translateX(5px)' }, 
              '75%': { transform: 'translateX(-5px)' }, 
              '100%': { transform: 'translateX(0)' } 
            } 
          }}
        >
          <Box id="register-form" component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
            <Grid container spacing={2}>

              {/* Sección: Datos personales */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1 }}>
                  Datos personales
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaterialTextField
                  name="firstName"
                  required
                  fullWidth
                  label={t('register.firstName')}
                  autoFocus
                  value={values.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={isSubmitting}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><EngineeringIcon color="action" /></InputAdornment>,
                    sx: { 
                      borderRadius: 3, 
                      transition: 'all 0.3s ease', 
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, 
                      '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' } 
                    } 
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaterialTextField
                  name="lastName"
                  required
                  fullWidth
                  label={t('register.lastName')}
                  value={values.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12}>
                <MaterialTextField
                  name="email"
                  required
                  fullWidth
                  label={t('register.email')}
                  value={values.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={isSubmitting}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start">@</InputAdornment>,
                    sx: { 
                      borderRadius: 3, 
                      transition: 'all 0.3s ease', 
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, 
                      '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' } 
                    } 
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <MaterialTextField
                  name="age"
                  required
                  fullWidth
                  label="Edad"
                  type="number"
                  value={values.age}
                  onChange={handleChange}
                  error={!!errors.age}
                  helperText={errors.age}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <MaterialTextField
                  name="password"
                  required
                  fullWidth
                  label={t('register.password')}
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isSubmitting}
                  InputProps={{ 
                    sx: { 
                      borderRadius: 3, 
                      transition: 'all 0.3s ease', 
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }, 
                      '&.Mui-focused': { boxShadow: '0 6px 20px rgba(0,0,0,0.15)' } 
                    } 
                  }}
                />
              </Grid>

              {/* Sección: Escuela y residencia */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1 }}>
                  Centro / Residencia
                </Typography>
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
                        <Typography 
                          variant="body2" 
                          color="success.main" 
                          sx={{ 
                            p: 1, 
                            bgcolor: '#e8f5e8', 
                            borderRadius: 1, 
                            display: 'inline-block' 
                          }}
                        >
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
                            value={values.residence}
                            label="Residencia"
                            onChange={handleSelectChange}
                            disabled={isSubmitting}
                          >
                            {RESIDENCES.map((res) => (
                              <MenuItem key={res.value} value={res.value}>
                                {res.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Sección: Fechas */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 1 }}>
                  Fechas
                </Typography>
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
                      value={values.arrivalDate}
                      onChange={handleChange}
                      error={!!errors.arrivalDate}
                      helperText={errors.arrivalDate}
                      disabled={isSubmitting}
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
                      value={values.departureDate}
                      onChange={handleChange}
                      error={!!errors.departureDate}
                      helperText={errors.departureDate}
                      disabled={isSubmitting}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <MaterialTextField
                  name="adminCode"
                  fullWidth
                  label="Código Admin (opcional)"
                  value={values.adminCode}
                  onChange={handleChange}
                  type="password"
                  autoComplete="off"
                  disabled={isSubmitting}
                  helperText={
                    isAdminRegistration 
                      ? "✅ Registro como Admin activado" 
                      : "Deja vacío para registro normal"
                  }
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
                  sx={{ 
                    mt: 1, 
                    mb: 1.5, 
                    py: 1.8, 
                    fontWeight: 700, 
                    borderRadius: 3, 
                    transition: 'all 0.3s ease', 
                    '&:hover': { 
                      transform: 'translateY(-2px)', 
                      boxShadow: '0 8px 25px rgba(98,0,238,0.3)' 
                    }, 
                    '&:active': { transform: 'translateY(0)' }, 
                    '&:disabled': { transform: 'none' } 
                  }}
                  startIcon={isSubmitting ? <Material3LoadingIndicator size="small" /> : undefined}
                >
                  {isSubmitting ? t('common.loading') : t('register.registerButton')}
                </M3Button>
              </Grid>

              {errors.api && (
                <Grid item xs={12}>
                  <Typography 
                    color="error" 
                    sx={{ 
                      mt: 1, 
                      textAlign: 'center', 
                      animation: 'shake 0.5s ease-in-out' 
                    }}
                  >
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
