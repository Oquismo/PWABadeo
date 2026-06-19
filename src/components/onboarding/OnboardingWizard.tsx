'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import {
  Celebration as WelcomeIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  NotificationsActive as NotifIcon,
  CheckCircle as DoneIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

interface School {
  id: number;
  name: string;
  city: string | null;
}

const STEPS = ['Bienvenido', 'Tu escuela', 'Tus fechas', 'Notificaciones', '¡Listo!'];

const STEP_ICONS = [WelcomeIcon, SchoolIcon, CalendarIcon, NotifIcon, DoneIcon];

export default function OnboardingWizard({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const { user, updateUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch('/api/schools')
      .then(r => r.json())
      .then(d => { if (d.success) setSchools(d.schools || []); })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (user?.schoolId) setSelectedSchoolId(user.schoolId);
    if (user?.arrivalDate) setArrivalDate(user.arrivalDate);
    if (user?.departureDate) setDepartureDate(user.departureDate);
  }, [open, user]);

  const needsSchool = !user?.schoolId && schools.length > 0;
  const needsDates = !user?.arrivalDate || !user?.departureDate;

  const handleNext = () => {
    if (activeStep === 0) {
      if (needsSchool) setActiveStep(1);
      else if (needsDates) setActiveStep(2);
      else setActiveStep(3);
    } else if (activeStep === 1) {
      if (needsDates) setActiveStep(2);
      else setActiveStep(3);
    } else if (activeStep === 2) {
      setActiveStep(3);
    } else if (activeStep === 3) {
      setActiveStep(4);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (selectedSchoolId && selectedSchoolId !== user?.schoolId) {
        const school = schools.find(s => s.id === selectedSchoolId);
        if (school) updates.school = school.name;
      }
      if (arrivalDate && arrivalDate !== user?.arrivalDate) updates.arrivalDate = arrivalDate;
      if (departureDate && departureDate !== user?.departureDate) updates.departureDate = departureDate;

      if (Object.keys(updates).length > 0) {
        await updateUser(updates as any);
      }

      await fetch('/api/user/onboarded', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      onComplete();
    } catch {
      // fallback: complete anyway so user isn't stuck
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <WelcomeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              ¡Bienvenido a Mi Erasmus App!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Aquí podrás ver tu programa formativo, gestionar tu calendario,
              conectarte con la comunidad y seguir tus tareas — todo en un solo lugar.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Vamos a configurar tu perfil en unos segundos.
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Selecciona tu escuela</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Elige la escuela a la que perteneces para ver tu programa formativo personalizado.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Escuela</InputLabel>
              <Select
                value={selectedSchoolId ?? ''}
                label="Escuela"
                onChange={(e) => setSelectedSchoolId(e.target.value as number)}
              >
                {schools.map(s => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}{s.city ? ` — ${s.city}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Tus fechas</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Indica las fechas de tu estancia Erasmus para que podamos mostrarte eventos relevantes.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Fecha de llegada"
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fecha de salida"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <NotifIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Notificaciones
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
              Te avisaremos cuando haya eventos próximos, nuevos anuncios o respuestas en la comunidad.
            </Typography>
            <Chip
              label="Puedes activarlas o desactivarlas desde el menú en cualquier momento"
              variant="outlined"
              color="info"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        );

      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <DoneIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              ¡Todo listo!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
              Ya puedes empezar a usar la app. Explora las secciones desde la barra inferior.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle sx={{ pb: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <Step key={label}>
                <StepLabel StepIconComponent={() => <Icon sx={{ fontSize: 20, color: i <= activeStep ? 'primary.main' : 'text.disabled' }} />}>
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 280 }}>
        {renderStep()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleSkip} color="inherit" disabled={saving}>
          Saltar
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={saving}>
              Atrás
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              saving ||
              (activeStep === 1 && !selectedSchoolId && needsSchool)
            }
          >
            {activeStep >= STEPS.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
