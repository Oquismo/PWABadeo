'use client';

import { useState, Suspense } from 'react';
import { Container, Box, Button, Typography, Skeleton } from "@mui/material";
import { FeedbackOutlined as FeedbackIcon } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import MaterialTextField from '@/components/ui/MaterialTextField';
import Material3Dialog from '@/components/ui/Material3Dialog';
import FabMenu from '@/components/ui/FabMenu';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import loggerClient from '@/lib/loggerClient';

// Importaciones estáticas (críticas, se renderizan inmediatamente)
import HeroSection from "@/components/home/HeroSection";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import InlineBanner from '@/components/home/InlineBanner';

// Carga diferida para secciones pesadas
const ProgramaFormativoSection = dynamic(
  () => import('@/components/home/ProgramaFormativoSection'),
  {
    loading: () => (
      <Box sx={{ py: 3, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={140} height={28} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, overflow: 'hidden' }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={220} height={140} sx={{ borderRadius: 3, flexShrink: 0 }} animation="wave" />
          ))}
        </Box>
      </Box>
    ),
    ssr: false,
  }
);

const CalendarSection = dynamic(
  () => import('@/components/home/CalendarSection/CalendarSection'),
  {
    loading: () => (
      <Box sx={{ py: 3, px: 2 }}>
        <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
      </Box>
    ),
    ssr: false,
  }
);

const ExternalInfoPanel = dynamic(
  () => import('@/components/home/ExternalInfoPanel'),
  {
    loading: () => (
      <Box sx={{ py: 3, px: 2 }}>
        <Skeleton variant="text" width={140} height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    ),
    ssr: false,
  }
);

export default function Home() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    loggerClient.info('📤 Enviando feedback', { message: feedback, language });

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedback, language }),
      });

      if (response.ok) {
        setFeedbackSent(true);
        setTimeout(() => {
          setFeedbackOpen(false);
          setFeedbackSent(false);
          setFeedback("");
        }, 2000);
      } else {
        const errorData = await response.json();
        loggerClient.error('❌ Error del servidor:', errorData);
      }
    } catch (error) {
      loggerClient.error('💥 Error de red:', error);
    }
  };

  return (
    <>
      <AnnouncementBanner />
      <Container>
        <Box sx={{ pt: 2, pb: 2 }}>
          {/* 1. Bienvenida (personal, inmediata) */}
          <HeroSection />

          {/* 2. Banner inline (info destacada) */}
          <InlineBanner />

          {/* 3. Programa formativo (estilo tarjetas con progreso) */}
          <Suspense fallback={<Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, my: 2 }} />}>
            <ProgramaFormativoSection />
          </Suspense>

          {/* 4. Calendario (planificación) */}
          <Suspense fallback={<Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, my: 2 }} />}>
            <CalendarSection />
          </Suspense>

          {/* 5. Info externa (recursos, menos prioritario) */}
          <Suspense fallback={<Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, my: 2 }} />}>
            <ExternalInfoPanel />
          </Suspense>
        </Box>
      </Container>

      {/* Feedback dialog */}
      <Material3Dialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title={t('feedback.title')}
        icon={<FeedbackIcon />}
        supportingText="Tu opinión nos ayuda a mejorar la experiencia de todos los estudiantes."
        actions={
          !feedbackSent ? (
            <>
              <Button variant="text" onClick={() => setFeedbackOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleSendFeedback} disabled={!feedback.trim()}>
                {t('feedback.send')}
              </Button>
            </>
          ) : null
        }
      >
        {feedbackSent ? (
          <Typography color="success.main" sx={{ textAlign: 'center', py: 2, fontWeight: 500 }}>
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

      <FabMenu phone={'+34649347760'} message={t('pages.home.welcomeMessage')} onOpenFeedback={() => setFeedbackOpen(true)} />
    </>
  );
}
