'use client';

import { Typography, Box, Chip, useTheme } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { TaskData } from '@/data/tasks';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SchoolSelector from '@/components/SchoolSelector';
import Link from 'next/link';

function deriveStatus(task: TaskData): 'completado' | 'proceso' | 'pendiente' {
  if (task.status) return task.status;
  if (task.progress >= 100) return 'completado';
  if (task.progress > 0) return 'proceso';
  return 'pendiente';
}

function StatusChip({ status }: { status: 'completado' | 'proceso' | 'pendiente' }) {
  const theme = useTheme();
  const config = {
    completado: { color: theme.palette.success.main, label: 'Completado' },
    proceso:    { color: theme.palette.info?.main || theme.palette.primary.main, label: 'En proceso' },
    pendiente:  { color: theme.palette.error.main, label: 'Pendiente' },
  }[status];

  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.625,
      height: 24, px: '10px', borderRadius: 9999,
      background: config.color + '1A',
      border: `1px solid ${config.color}4D`,
      fontSize: '0.7rem', fontWeight: 700, color: config.color, flexShrink: 0,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
      {config.label}
    </Box>
  );
}

const CHIPS = ['Todos', 'Completados', 'En proceso', 'Pendientes'] as const;
type ChipFilter = typeof CHIPS[number];

// Helper to format date
function formatDate(raw?: string): string {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch {
    return raw;
  }
}

export default function ProjectsDashboard() {
  const theme = useTheme();
  const { tasks } = useTasks();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<ChipFilter>('Todos');

  const getStatusColor = (status: 'completado' | 'proceso' | 'pendiente') => {
    switch (status) {
      case 'completado': return theme.palette.success.main;
      case 'proceso': return theme.palette.info?.main || theme.palette.primary.main;
      case 'pendiente': return theme.palette.error.main;
    }
  };

  useEffect(() => { setIsHydrated(true); }, []);

  const filtered = tasks.filter(task => {
    if (filter === 'Todos') return true;
    const s = deriveStatus(task);
    if (filter === 'Completados') return s === 'completado';
    if (filter === 'En proceso')  return s === 'proceso';
    if (filter === 'Pendientes')  return s === 'pendiente';
    return true;
  });

  if (!isHydrated) {
    return (
      <Box sx={{ py: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary" variant="body2">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      {/* Section header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0, mb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
            color: 'text.primary',
          }}
        >
          {t('pages.home.projectsActive')}
        </Typography>
        <Link href="/proyectos" style={{ textDecoration: 'none' }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Ver todos
          </Typography>
        </Link>
      </Box>

      {/* School selector for admins */}
      <Box sx={{ mb: 1.5 }}>
        <SchoolSelector />
      </Box>

      {/* Filter chips */}
      <Box sx={{
        display: 'flex', gap: 1, mb: 1.5, overflowX: 'auto',
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}>
        {CHIPS.map(chip => {
          const sel = filter === chip;
          return (
              <Box
              key={chip}
              component="button"
              onClick={() => setFilter(chip)}
              sx={{
                flexShrink: 0, height: 32,
                px: sel ? '10px' : '14px',
                pl: sel ? '6px' : '14px',
                borderRadius: 1,
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                userSelect: 'none', border: 'none', outline: 'none',
                background: sel ? 'secondary.dark' : 'transparent',
                color: sel ? 'secondary.light' : 'text.secondary',
                borderColor: sel ? 'transparent' : 'divider',
                borderStyle: 'solid', borderWidth: '1px',
                transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
                '&:active': { transform: 'scale(0.97)' },
              }}
            >
              {sel && <CheckRoundedIcon sx={{ fontSize: 16, color: 'secondary.light' }} />}
              {chip}
            </Box>
          );
        })}
      </Box>

      {/* Task cards */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No hay proyectos en esta categoría.
          </Typography>
        ) : filtered.map((task, index) => {
          const status = deriveStatus(task);
          const accent = getStatusColor(status);
          return (
            <motion.div
              key={task.id || index}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <Box sx={{
                background: 'background.paper',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                padding: '12px 14px 12px 18px',
                transition: 'transform 200ms cubic-bezier(0.2,0,0,1), box-shadow 200ms cubic-bezier(0.2,0,0,1)',
                '@media (hover: hover) and (pointer: fine)': {
                  '&:hover': { transform: 'translateY(-3px) scale(1.005)' },
                },
                '&:active': { transform: 'translateY(1px) scale(0.998)' },
                // Left accent bar
                '&::before': {
                  content: '""', position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 4, background: accent,
                },
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3, color: 'text.primary', fontSize: '0.875rem' }}>
                    {task.title}
                  </Typography>
                  <StatusChip status={status} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.75rem' }}>
                    {task.description}
                  </Typography>
                  {task.date && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <CalendarTodayRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {formatDate(task.date)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}
