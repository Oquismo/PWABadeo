/**
 * Página de Cuestionario de Español con Sistema de Niveles
 * Ruta: /cursos/espanol
 * 
 * Sistema de 10 niveles con progresión gamificada
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Box, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Fade,
  Alert,
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon,
  CloudDone as CloudDoneIcon,
  CloudQueue as CloudQueueIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { spanishLevels } from '@/data/quizzes/spanish-levels';

const QuizCard = dynamic(() => import('@/components/quiz/QuizCard'), { ssr: false });
const LevelSelector = dynamic(() => import('@/components/levels/LevelSelector'), { ssr: false });
import { useProgression } from '@/hooks/useProgression';
import { QuizResult } from '@/types/quiz.types';
import { LevelCompletionResult } from '@/types/progression.types';

export default function SpanishLevelsPage() {
  const router = useRouter();
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionResult, setCompletionResult] = useState<LevelCompletionResult | null>(null);
  
  const {
    progress,
    stats,
    newAchievements,
    isLoading,
    isSaving,
    lastSaved,
    completeLevel,
    clearNewAchievements,
  } = useProgression();

  /**
   * Seleccionar un nivel para jugar
   */
  const handleLevelSelect = (levelId: number) => {
    const levelProgress = progress.levelsProgress[levelId];
    
    // Solo permitir jugar niveles disponibles o completados
    if (levelProgress?.status === 'locked') {
      return;
    }
    
    setSelectedLevelId(levelId);
  };

  /**
   * Volver al selector de niveles
   */
  const handleBackToSelector = () => {
    setSelectedLevelId(null);
    setShowCompletionModal(false);
    setCompletionResult(null);
  };

  /**
   * Manejar completación del quiz
   */
  const handleQuizComplete = (result: QuizResult) => {
    if (selectedLevelId === null) return;
    
    console.log('🎯 Quiz completado:', result);
    
    // Completar el nivel y obtener resultado
    const levelResult = completeLevel(selectedLevelId, result);
    console.log('📊 Resultado del nivel:', levelResult);
    console.log('💾 Estado del progreso después de completar:', {
      currentLevel: progress.currentLevel,
      completedLevels: progress.completedLevels,
      totalScore: progress.totalScore
    });
    
    setCompletionResult(levelResult);
    setShowCompletionModal(true);
    
    // Guardar en localStorage para persistencia adicional
    const savedResults = localStorage.getItem('quiz-results') || '[]';
    const results = JSON.parse(savedResults);
    results.push({
      levelId: selectedLevelId,
      quizResult: result,
      levelResult,
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem('quiz-results', JSON.stringify(results));
    
    console.log('⏱️ Esperando guardado automático (2 segundos)...');
  };

  /**
   * Continuar al siguiente nivel
   */
  const handleContinueToNext = () => {
    setShowCompletionModal(false);
    
    // Si hay un nivel desbloqueado, seleccionarlo
    if (completionResult && completionResult.unlockedLevels.length > 0) {
      const nextLevelId = completionResult.unlockedLevels[0];
      setSelectedLevelId(nextLevelId);
      setCompletionResult(null);
    } else {
      // Volver al selector
      handleBackToSelector();
    }
  };

  /**
   * Reintentar el nivel actual
   */
  const handleRetryLevel = () => {
    setShowCompletionModal(false);
    setCompletionResult(null);
    // No cambiar selectedLevelId, solo cerrar el modal
  };

  // Obtener datos del nivel seleccionado
  const selectedLevel = selectedLevelId 
    ? spanishLevels.find(l => l.id === selectedLevelId)
    : null;

  return (
    <Container maxWidth="xl">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Header con navegación */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1.0] as const }}
          >
            <IconButton
              onClick={selectedLevelId ? handleBackToSelector : () => router.back()}
              sx={{
                bgcolor: 'rgba(124, 77, 255, 0.1)',
                color: '#b388ff',
                '&:hover': {
                  bgcolor: 'rgba(124, 77, 255, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              <BackIcon />
            </IconButton>
          </motion.div>

          {/* INDICADOR DE GUARDADO/CARGA */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoading && (
              <Fade in>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#7c4dff' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Cargando progreso...
                  </Typography>
                </Box>
              </Fade>
            )}
            
            {!isLoading && isSaving && (
              <Fade in>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudQueueIcon sx={{ fontSize: 20, color: '#40c4ff' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Guardando...
                  </Typography>
                </Box>
              </Fade>
            )}
            
            {!isLoading && !isSaving && lastSaved && (
              <Fade in>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudDoneIcon sx={{ fontSize: 20, color: '#00e676' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Guardado {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s atrás
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1.0] as const }}
          >
            <IconButton
              onClick={() => router.push('/')}
              sx={{
                bgcolor: 'rgba(64, 196, 255, 0.1)',
                color: '#40c4ff',
                '&:hover': {
                  bgcolor: 'rgba(64, 196, 255, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              <HomeIcon />
            </IconButton>
          </motion.div>
        </Box>

        {/* PANTALLA DE CARGA INICIAL */}
        {isLoading && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 3
            }}
          >
            <CircularProgress size={60} sx={{ color: '#7c4dff' }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Cargando tu progreso...
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Estamos recuperando tu progreso desde la base de datos
            </Typography>
          </Box>
        )}

        {/* Contenido Principal: Selector o Quiz */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            {selectedLevel === null ? (
              // Mostrar selector de niveles
              <motion.div
                key="level-selector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1.0] as const }}
              >
                <LevelSelector
                  levels={spanishLevels}
                  userProgress={progress}
                  onLevelSelect={handleLevelSelect}
                />
              </motion.div>
          ) : selectedLevel ? (
            // Mostrar quiz del nivel seleccionado
            <motion.div
              key={`quiz-${selectedLevel.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1.0] as const }}
            >
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
                    color: selectedLevel.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{selectedLevel.icon}</span>
                  {selectedLevel.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}
                >
                  {selectedLevel.description}
                </Typography>
              </Box>

              <QuizCard
                quiz={selectedLevel.quiz}
                onComplete={handleQuizComplete}
                onExit={handleBackToSelector}
              />
            </motion.div>
          ) : null}
          </AnimatePresence>
        )}

        {/* Modal de Completación */}
        <Dialog
          open={showCompletionModal}
          onClose={() => {}}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '24px',
            },
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
            <TrophyIcon sx={{ fontSize: '4rem', color: '#ffd700', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
              {completionResult?.passed ? '¡Nivel Completado!' : 'Intenta de Nuevo'}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
            {completionResult && (
              <>
                {/* Calificación */}
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: completionResult.grade === 'S' || completionResult.grade === 'A' 
                      ? '#00e676' 
                      : completionResult.grade === 'B' || completionResult.grade === 'C'
                      ? '#ff9800'
                      : '#ff5252',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  <Typography variant="h2" sx={{ fontWeight: 900, color: '#fff' }}>
                    {completionResult.grade}
                  </Typography>
                </Box>

                <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
                  {completionResult.percentage}%
                </Typography>

                {/* Mensajes especiales */}
                {completionResult.isPerfect && (
                  <Typography sx={{ color: '#ffd700', fontWeight: 700, mb: 2 }}>
                    💯 ¡Puntuación Perfecta!
                  </Typography>
                )}

                {completionResult.isNewBest && !completionResult.isPerfect && (
                  <Typography sx={{ color: '#00e676', fontWeight: 600, mb: 2 }}>
                    ⭐ ¡Nuevo Récord Personal!
                  </Typography>
                )}

                {/* Niveles desbloqueados */}
                {completionResult.unlockedLevels.length > 0 && (
                  <Typography sx={{ color: '#40c4ff', fontWeight: 600, mb: 2 }}>
                    🔓 ¡Nivel {completionResult.unlockedLevels[0]} Desbloqueado!
                  </Typography>
                )}

                {/* Achievements */}
                {completionResult.earnedAchievements.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#fff' }}>
                      🏆 Logros Desbloqueados:
                    </Typography>
                    {completionResult.earnedAchievements.map((achievement) => (
                      <Typography 
                        key={achievement.id}
                        sx={{ color: '#ffd700', fontWeight: 600 }}
                      >
                        {achievement.icon} {achievement.title}
                      </Typography>
                    ))}
                  </Box>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleRetryLevel}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                borderWidth: 2,
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Reintentar
            </Button>

            <Button
              variant="contained"
              onClick={handleContinueToNext}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {completionResult?.unlockedLevels && completionResult.unlockedLevels.length > 0
                ? 'Siguiente Nivel'
                : 'Volver'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}