'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Skeleton,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  QuestionAnswer as QuestionIcon,
  Visibility as ViewsIcon,
  CheckCircle as ResolvedIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';
import { useAuth } from '@/context/AuthContext';

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
  _count: {
    answers: number;
  };
}

export default function ComunidadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/community/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para hacer preguntas');
      return;
    }
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/community/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newQuestion, userId: user?.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setQuestions([data.question, ...questions]);
        setOpenDialog(false);
        setNewQuestion({ title: '', content: '' });
        setSnackbar('¡Pregunta publicada!');
      } else {
        setError(data.error || 'Error al publicar la pregunta');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 800, mx: 'auto', pb: 10 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Comunidad
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Pregunta a la comunidad y ayuda a otros estudiantes
          </Typography>
        </Box>

        {/* Not authenticated banner */}
        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Button color="inherit" size="small" onClick={() => router.push('/login')}>
              Inicia sesión
            </Button>{' '}
            para hacer preguntas y responder a la comunidad
          </Alert>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {questions.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preguntas
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {questions.filter((q) => q.isResolved).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resueltas
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Questions List */}
        <AnimatePresence>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} sx={{ mb: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            ))
          ) : questions.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <QuestionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Aún no hay preguntas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sé el primero en preguntar a la comunidad
                </Typography>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => router.push(`/comunidad/${question.id}`)}
                >
                  <CardContent>
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
                        <ResolvedIcon color="success" sx={{ ml: 1 }} />
                      )}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="h6" gutterBottom>
                      {question.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {question.content}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Chip
                        icon={<QuestionIcon fontSize="small" />}
                        label={`${question._count.answers} respuestas`}
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
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* FAB - solo si está autenticado */}
        {isAuthenticated && (
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            onClick={() => setOpenDialog(true)}
          >
            <AddIcon />
          </Fab>
        )}

        {/* New Question Dialog */}
        <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setError(null); }} fullWidth maxWidth="sm">
          <DialogTitle>Nueva pregunta</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              autoFocus
              label="Título"
              placeholder="¿Qué quieres saber?"
              fullWidth
              margin="normal"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
            />
            <TextField
              label="Descripción"
              placeholder="Describe tu pregunta con más detalle..."
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={newQuestion.content}
              onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenDialog(false); setError(null); }}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || !newQuestion.title.trim() || !newQuestion.content.trim()}
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar éxito */}
        <Snackbar
          open={!!snackbar}
          autoHideDuration={3000}
          onClose={() => setSnackbar(null)}
          message={snackbar}
        />
      </Box>
    </PageTransition>
  );
}


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  QuestionAnswer as QuestionIcon,
  Visibility as ViewsIcon,
  CheckCircle as ResolvedIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';

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
  _count: {
    answers: number;
  };
}

export default function ComunidadPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/community/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/community/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newQuestion, userId: user?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions([data.question, ...questions]);
        setOpenDialog(false);
        setNewQuestion({ title: '', content: '' });
      }
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 800, mx: 'auto', pb: 10 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Comunidad
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Pregunta a la comunidad y ayuda a otros estudiantes
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {questions.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preguntas
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {questions.filter((q) => q.isResolved).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Resueltas
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Questions List */}
        <AnimatePresence>
          {loading ? (
            // Skeleton loading
            [...Array(3)].map((_, i) => (
              <Card key={i} sx={{ mb: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            ))
          ) : questions.length === 0 ? (
            // Empty state
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <QuestionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Aún no hay preguntas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sé el primero en preguntar a la comunidad
                </Typography>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => router.push(`/comunidad/${question.id}`)}
                >
                  <CardContent>
                    {/* User info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={question.user.avatarUrl || undefined}
                        sx={{ mr: 1.5, bgcolor: 'primary.main' }}
                      >
                        {getInitials(
                          question.user.firstName,
                          question.user.lastName
                        )}
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
                        <ResolvedIcon color="success" sx={{ ml: 1 }} />
                      )}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Question content */}
                    <Typography variant="h6" gutterBottom>
                      {question.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {question.content}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Chip
                        icon={<QuestionIcon fontSize="small" />}
                        label={`${question._count.answers} respuestas`}
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
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* FAB - New Question */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 80, right: 16 }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>

        {/* New Question Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Nueva pregunta</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Título"
              placeholder="¿Qué quieres saber?"
              fullWidth
              margin="normal"
              value={newQuestion.title}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, title: e.target.value })
              }
            />
            <TextField
              label="Descripción"
              placeholder="Describe tu pregunta con más detalle..."
              fullWidth
              multiline
              rows={4}
              margin="normal"
              value={newQuestion.content}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, content: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !newQuestion.title.trim() ||
                !newQuestion.content.trim()
              }
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageTransition>
  );
}
