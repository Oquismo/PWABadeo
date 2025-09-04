'use client';

import { useState, useEffect } from 'react';
import { Container, Fab, Fade, Box } from "@mui/material";
import { Button, Typography } from "@mui/material";
import MaterialTextField from '@/components/ui/MaterialTextField';
import Material3Dialog from '@/components/ui/Material3Dialog';
import { FeedbackOutlined as FeedbackIcon } from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';

// Importamos los componentes críticos de forma normal
import HeroSection from "@/components/home/HeroSection";
import NotificationsPanel from "@/components/home/NotificationsPanel";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import ProjectsDashboard from "@/components/home/ProjectsDashboard";
import CalendarSection from "@/components/home/CalendarSection/CalendarSection";
import ExternalInfoPanel from "@/components/home/ExternalInfoPanel";
// import SpotifyPlayer from "@/components/SpotifyPlayer";

export default function Home() {
  const [fadeIn, setFadeIn] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Información para el enlace de WhatsApp
  // const phoneNumber = "+34649347760"; // Reemplaza con el número de teléfono real
  // const message = t('pages.home.welcomeMessage'); // Usar traducción
  // const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    console.log('📤 Enviando feedback:', { message: feedback, language });

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: feedback,
          language: language,
        }),
      });

      console.log('📥 Respuesta del servidor:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Feedback enviado exitosamente:', data);
        setFeedbackSent(true);
        setTimeout(() => {
          setFeedbackOpen(false);
          setFeedbackSent(false);
          setFeedback("");
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
      }
    } catch (error) {
      console.error('💥 Error de red:', error);
    }
  };

  return (
    <>
      <AnnouncementBanner />
      <Container>
        <Fade in={fadeIn} timeout={1000}>
          <Box sx={{ pt: 2, pb: 2 }}>
            <HeroSection />
            {/* <SpotifyPlayer compact /> */}
            <ExternalInfoPanel />
            <ProjectsDashboard />
            <CalendarSection />
          </Box>
        </Fade>
      </Container>

      {/* Material 3 Dialog de feedback */}
      <Material3Dialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title={t('feedback.title')}
        icon={<FeedbackIcon />}
        supportingText="Tu opinión es muy valiosa para nosotros y nos ayuda a mejorar la experiencia de todos los estudiantes."
        actions={
          !feedbackSent ? (
            <>
              <Button
                variant="text"
                onClick={() => setFeedbackOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSendFeedback}
                disabled={!feedback.trim()}
              >
                {t('feedback.send')}
              </Button>
            </>
          ) : null
        }
      >
        {feedbackSent ? (
          <Typography 
            color="success.main" 
            sx={{ 
              textAlign: 'center', 
              py: 2,
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            {t('feedback.thanks')}
          </Typography>
        ) : (
          <MaterialTextField
            label={t('feedback.placeholder')}
            multiline
            rows={4}
            fullWidth
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            supportingText="Comparte tu experiencia, sugerencias o reporta cualquier problema"
            variant="outlined"
          />
        )}
      </Material3Dialog>

      {/* Botón flotante de feedback. Para restaurar WhatsApp, descomenta el bloque anterior. */}
      <Fab
        color="primary"
        aria-label={t('feedback.buttonLabel')}
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(64px + ${theme.spacing(2)})`,
          right: (theme) => theme.spacing(2),
          color: 'background.default'
        }}
        onClick={() => setFeedbackOpen(true)}
      >
        <FeedbackIcon />
      </Fab>
  </>)
}
