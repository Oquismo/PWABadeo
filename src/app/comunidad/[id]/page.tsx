'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  IconButton,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  QuestionAnswer as QuestionIcon,
  Visibility as ViewsIcon,
  CheckCircle as ResolvedIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';

interface Answer {
  id: number;
  content: string;
  isAccepted: boolean;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    school: {
      id: number;
      name: string;
    } | null;
  };
}

interface Question {
  id: number;
  title: string;
  content: string;
  isResolved: boolean;
  views: number;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    school: {
      id: number;
      name: string;
    } | null;
  };
  answers: Answer[];
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = parseInt(params.id as string);

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isNaN(questionId)) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/community/questions/${questionId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newAnswer }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuestion((prev) =>
          prev
            ? { ...prev, answers: [...prev.answers, data.answer] }
            : null
        );
        setNewAnswer('');
      }
    } catch (error) {
      console.error('Error creating answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <PageTransition>
        <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Box>
      </PageTransition>
    );
  }

  if (!question) {
    return (
      <PageTransition>
        <Box sx={{ p: 2, textAlign: 'center', mt: 10 }}>
          <Typography variant="h6">Pregunta no encontrada</Typography>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push('/comunidad')}
            sx={{ mt: 2 }}
          >
            Volver a la comunidad
          </Button>
        </Box>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 800, mx: 'auto', pb: 10 }}>
        {/* Back button */}
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/comunidad')}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>

        {/* Question Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {/* User info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={question.user.avatarUrl || undefined}
                sx={{ mr: 1.5, bgcolor: 'primary.main' }}
              >
                {getInitials(question.user.firstName, question.user.lastName)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  {question.user.firstName} {question.user.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {question.user.school && (
                    <Chip
                      label={question.user.school.name}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(question.createdAt)}
                  </Typography>
                </Box>
              </Box>
              {question.isResolved && (
                <Chip
                  icon={<ResolvedIcon />}
                  label="Resuelta"
                  color="success"
                  size="small"
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Question content */}
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {question.title}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {question.content}
            </Typography>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Chip
                icon={<QuestionIcon fontSize="small" />}
                label={`${question.answers.length} respuestas`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<ViewsIcon fontSize="small" />}
                label={`${question.views} vistas`}
                size="small"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Respuestas
        </Typography>

        <AnimatePresence>
          {question.answers.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 4 }}>
              <CardContent>
                <Typography variant="body1" color="text.secondary">
                  Aún no hay respuestas. ¡Sé el primero en ayudar!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            question.answers.map((answer, index) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ mb: 2, bgcolor: answer.isAccepted ? 'success.50' : 'background.paper' }}>
                  <CardContent>
                    {/* Answer user info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={answer.user.avatarUrl || undefined}
                        sx={{ mr: 1.5, bgcolor: 'secondary.main', width: 32, height: 32 }}
                      >
                        {getInitials(answer.user.firstName, answer.user.lastName)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {answer.user.firstName} {answer.user.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {answer.user.school && (
                            <Chip
                              label={answer.user.school.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(answer.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      {answer.isAccepted && (
                        <Chip
                          icon={<ResolvedIcon />}
                          label="Aceptada"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {answer.content}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Answer Form */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Añadir respuesta
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Escribe tu respuesta..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmitAnswer}
              disabled={submitting || !newAnswer.trim()}
              fullWidth
            >
              {submitting ? 'Enviando...' : 'Responder'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </PageTransition>
  );
}
