'use client';

import { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useTranslation } from '@/hooks/useTranslation';

type TutorialVideo = {
  title: string;
  description: string;
  videoId?: string;
  fallbackSearch?: string;
  tags: string[];
  language: 'ES' | 'EN';
  duration?: string;
};

// TODO: Sustituye fallbackSearch por videoId cuando se definan tutoriales oficiales.
const tutorialVideos: TutorialVideo[] = [
  {
    title: 'Como hacer la maleta para tu Erasmus',
    description: 'Checklist rapida y trucos para viajar ligero pero con todo lo esencial.',
    fallbackSearch: 'como hacer la maleta erasmus',
    tags: ['Preparativos', 'Equipaje'],
    language: 'ES',
    duration: '8 min aprox',
  },
  {
    title: 'Tramites importantes al llegar a Sevilla',
    description: 'Resumen de empadronamiento, tarjeta sanitaria y otros pasos iniciales.',
    fallbackSearch: 'tramites empadronamiento sevilla estudiantes',
    tags: ['Documentacion', 'Primeros dias'],
    language: 'ES',
    duration: '9 min aprox',
  },
  {
    title: 'Como moverme por Sevilla',
    description: 'Tarjetas de transporte, bicicleta publica y apps utiles para desplazarte.',
    fallbackSearch: 'tarjeta transporte sevilla estudiantes',
    tags: ['Movilidad', 'Consejos practicos'],
    language: 'ES',
    duration: '6 min aprox',
  },
  {
    title: 'Consejos para convivir en residencia y piso compartido',
    description: 'Ideas para organizar tareas, gastos y convivencia con otros estudiantes.',
    fallbackSearch: 'convivir en residencia universitaria consejos',
    tags: ['Vida diaria', 'Convivencia'],
    language: 'ES',
    duration: '7 min aprox',
  }
];

export default function TutorialesPage() {
  const { t, language } = useTranslation();

  const localizedVideos = useMemo(() => {
    return tutorialVideos.filter((video) => video.language === (language === 'en' ? 'EN' : 'ES'));
  }, [language]);

  const videosToRender = localizedVideos.length > 0 ? localizedVideos : tutorialVideos;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography component="h1" variant="h3" fontWeight={700}>
          {t('pages.tutorials.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('pages.tutorials.subtitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('pages.tutorials.intro')}
        </Typography>
      </Stack>

      <Grid container spacing={4}>
        {videosToRender.map((video) => {
          const embedUrl = video.videoId
            ? `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`
            : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(video.fallbackSearch || video.title)}`;

          return (
            <Grid item xs={12} md={6} key={video.title}>
              <Card elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}>
                <Box
                  sx={{
                    position: 'relative',
                    pt: '56.25%',
                    bgcolor: 'grey.900'
                  }}
                >
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  />
                </Box>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h5" fontWeight={600}>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.description}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {video.duration && (
                        <Chip icon={<PlayArrowRoundedIcon />} label={video.duration} size="small" variant="outlined" />
                      )}
                      <Chip label={video.language === 'ES' ? 'ES' : 'EN'} size="small" />
                      {video.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="body2" color="text.secondary">
          {t('pages.tutorials.moreComing')}
        </Typography>
      </Box>
    </Container>
  );
}
