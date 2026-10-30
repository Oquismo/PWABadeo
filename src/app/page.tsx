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
import { useEventReminders } from '@/hooks/useEventReminders';
import loggerClient from '@/lib/loggerClient';

// Importaciones estáticas (críticas, se renderizan inmediatamente)
import HeroSection from "@/components/home/HeroSection";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import InlineBanner from '@/components/home/InlineBanner';
import NextEventHero from '@/components/home/design/NextEventHero';
import WeekStrip from '@/components/home/design/WeekStrip';
import BentoGrid from '@/components/home/design/BentoGrid';
import TodayTimeline from '@/components/home/design/TodayTimeline';
import ExploreRail from '@/components/home/design/ExploreRail';

function SectionSkeleton() {
  return (
    <Box sx={{ '& > div': { mb: 1.5 } }}>
      <Skeleton variant="text" width={140} height={24} />
      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

// Carga diferida para secciones pesadas
const CalendarSection = dynamic(
  () => import('@/components/home/CalendarSection/CalendarSection'),
  { loading: () => <SectionSkeleton />, ssr: false }
);

export default function Home() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEventReminders();

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
        <Box sx={{ pt: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <HeroSection />

          <NextEventHero />

          <WeekStrip />

          <BentoGrid />

          <InlineBanner />

          <TodayTimeline />

          <ExploreRail />

          <Suspense fallback={<Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />}>
            <CalendarSection />
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
