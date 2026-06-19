'use client';

import { useState } from 'react';
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
  Chip,
} from '@mui/material';
import {
  Celebration as WelcomeIcon,
  NotificationsActive as NotifIcon,
  CheckCircle as DoneIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

const STEPS = ['Bienvenido', 'Notificaciones', '¡Listo!'];

const STEP_ICONS = [WelcomeIcon, NotifIcon, DoneIcon];

export default function OnboardingWizard({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const { user, refreshUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(prev => prev + 1);
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
      await fetch('/api/user/onboarded', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      await refreshUser();
    } catch {
      // fallback: complete anyway so user isn't stuck
    } finally {
      setSaving(false);
      onComplete();
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
              Tus datos de escuela y fechas ya están configurados.
            </Typography>
          </Box>
        );

      case 1:
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

      case 2:
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
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleSkip}>
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
          <Button variant="contained" onClick={handleNext} disabled={saving}>
            {activeStep >= STEPS.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
