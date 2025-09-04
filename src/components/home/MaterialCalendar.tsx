'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Grid, 
  Button,
  Stack,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import MaterialTextField from '@/components/ui/MaterialTextField';
import Material3Dialog from '@/components/ui/Material3Dialog';
import Material3LoadingIndicator from '@/components/ui/Material3LoadingIndicator';
import { EventAvailable as EventIcon } from '@mui/icons-material';
import { 
  ChevronLeft, 
  ChevronRight,
  Add as AddIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

interface Event {
  id?: number;
  date: Date;
  title: string;
  type: 'personal' | 'program' | 'holiday';
}

// Eventos predefinidos del programa
const programEvents: Event[] = [
  { date: new Date(2025, 7, 15), title: 'calendar.orientationDay', type: 'program' },
  { date: new Date(2025, 7, 20), title: 'calendar.welcomeDinner', type: 'program' },
  { date: new Date(2025, 7, 25), title: 'calendar.cityTour', type: 'program' },
  { date: new Date(2025, 7, 30), title: 'calendar.welcomeWorkshop', type: 'program' },
  { date: new Date(2025, 8, 5), title: 'calendar.culturalTapasNight', type: 'program' },
  { date: new Date(2025, 8, 15), title: 'calendar.beachTrip', type: 'program' },
  { date: new Date(2025, 8, 20), title: 'calendar.summerParty', type: 'program' },
  { date: new Date(2025, 9, 1), title: 'calendar.newTermStart', type: 'program' },
  { date: new Date(2025, 9, 12), title: 'calendar.heritageDay', type: 'holiday' },
  { date: new Date(2025, 9, 31), title: 'calendar.halloweenParty', type: 'program' },
  { date: new Date(2025, 10, 1), title: 'calendar.allSaintsDay', type: 'holiday' },
  { date: new Date(2025, 10, 15), title: 'calendar.autumnTrip', type: 'program' },
  { date: new Date(2025, 11, 6), title: 'calendar.constitutionDay', type: 'holiday' },
  { date: new Date(2025, 11, 8), title: 'calendar.immaculateDay', type: 'holiday' },
  { date: new Date(2025, 11, 25), title: 'calendar.familyChristmas', type: 'program' },
  { date: new Date(2025, 11, 31), title: 'calendar.newYearEve', type: 'program' },
  { date: new Date(2026, 0, 1), title: 'calendar.newYear', type: 'holiday' },
];

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MaterialCalendar() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Cargar eventos del usuario
  useEffect(() => {
    const loadUserEvents = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/user-events', {
          headers: { 'x-user-id': user.id.toString() }
        });
        
        if (response.ok) {
          const data = await response.json();
          const events = data.events.map((event: any) => ({
            ...event,
            date: new Date(event.date)
          }));
          setUserEvents(events);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    if (user?.id) {
      loadUserEvents();
    }
  }, [user?.id]);

  // Combinar todos los eventos
  const allEvents = useMemo(() => {
    const personalEvents: Event[] = [];
    
    if (user?.arrivalDate) {
      const [year, month, day] = user.arrivalDate.split('-').map(Number);
      personalEvents.push({
        date: new Date(year, month - 1, day),
        title: 'Mi Llegada',
        type: 'personal'
      });
    }
    
    if (user?.departureDate) {
      const [year, month, day] = user.departureDate.split('-').map(Number);
      personalEvents.push({
        date: new Date(year, month - 1, day),
        title: 'Mi Salida',
        type: 'personal'
      });
    }
    
    return [...programEvents, ...userEvents, ...personalEvents];
  }, [userEvents, user]);

  // Obtener días del mes actual
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lunes = 0
    
    const days: (Date | null)[] = [];
    
    // Días vacíos del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const getEventForDate = (date: Date) => {
    return allEvents.find(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/user-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          title: newEventTitle,
          date: newEventDate.toISOString(),
          type: 'personal'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newEvent = {
          id: data.event.id,
          title: data.event.title,
          date: new Date(data.event.date),
          type: 'personal' as const
        };
        setUserEvents(prev => [...prev, newEvent]);
        setIsModalOpen(false);
        setNewEventTitle('');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = allEvents
    .filter(event => {
      const now = new Date();
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(now.getDate() + 10);
      return event.date >= now && event.date <= tenDaysFromNow;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      {/* Calendar Container - Material 3 Style */}
      <Box
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : '#F3F4F6',
          borderRadius: '28px', // shapeAppearanceCornerExtraLarge
          p: 3,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)'
            : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          border: theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <IconButton 
              onClick={() => navigateMonth('prev')}
              size="small"
              sx={{ 
                color: theme.palette.primary.main,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08) 
                }
              }}
            >
              <ChevronLeft />
            </IconButton>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? '#E8EAED' : '#1F2937',
                fontSize: '1.125rem',
                fontFamily: '"Google Sans", "Roboto", sans-serif',
              }}
            >
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Typography>
            
            <IconButton 
              onClick={() => navigateMonth('next')}
              size="small"
              sx={{ 
                color: theme.palette.primary.main,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08) 
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </Stack>
        </Box>

        {/* Weekday Headers */}
        <Grid container spacing={0} sx={{ mb: 1 }}>
          {WEEKDAYS.map((day) => (
            <Grid item xs={12/7} key={day}>
              <Typography
                variant="caption"
                sx={{
                  textAlign: 'center',
                  display: 'block',
                  color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  p: 1,
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Days */}
        <Grid container spacing={0}>
          {getDaysInMonth().map((date, index) => {
            if (!date) {
              return <Grid item xs={12/7} key={`empty-${index}`} sx={{ height: 48 }} />;
            }

            const event = getEventForDate(date);
            const today = isToday(date);
            const selected = isSelected(date);

            return (
              <Grid item xs={12/7} key={date.toISOString()}>
                <Button
                  onClick={() => setSelectedDate(date)}
                  sx={{
                    minWidth: 0,
                    width: '100%',
                    height: 48,
                    borderRadius: '12px',
                    p: 0,
                    position: 'relative',
                    
                    // Default state
                    backgroundColor: 'transparent',
                    color: theme.palette.mode === 'dark' ? '#E8EAED' : '#374151',
                    
                    // Today state - Material 3 spec
                    ...(today && {
                      color: theme.palette.primary.main,
                      border: `1px solid ${theme.palette.primary.main}`,
                      fontWeight: 600,
                    }),
                    
                    // Selected state - Material 3 spec
                    ...(selected && {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                      }
                    }),
                    
                    // Event indicator
                    ...(event && !selected && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: event.type === 'personal' 
                          ? theme.palette.info.main
                          : event.type === 'holiday' 
                          ? theme.palette.error.main
                          : theme.palette.success.main,
                      }
                    }),
                    
                    // Hover state
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      ...(selected && {
                        backgroundColor: theme.palette.primary.main,
                      })
                    },
                    
                    // Transitions
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {date.getDate()}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Upcoming Events */}
      <Box sx={{ mt: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? '#E8EAED' : '#1F2937',
              fontSize: '1rem',
            }}
          >
            {t('calendar.upcomingEvents')}
          </Typography>
          
          {isAuthenticated && (
            <IconButton
              onClick={() => {
                setNewEventDate(selectedDate || new Date());
                setIsModalOpen(true);
              }}
              size="small"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Stack spacing={2}>
          {upcomingEvents.map((event, index) => (
            <Box
              key={`${event.date.toISOString()}-${index}`}
              sx={{
                p: 2,
                borderRadius: '16px',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? '#E8EAED' : '#374151',
                      mb: 0.5,
                    }}
                  >
                    {event.type === 'program' || event.type === 'holiday' 
                      ? t(event.title) 
                      : event.title
                    }
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#9AA0A6' : '#6B7280',
                    }}
                  >
                    {event.date.toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
                
                <Chip
                  label={event.type === 'personal' ? 'Personal' : 
                         event.type === 'holiday' ? 'Festivo' : 'Programa'}
                  size="small"
                  sx={{
                    backgroundColor: event.type === 'personal'
                      ? alpha(theme.palette.info.main, 0.1)
                      : event.type === 'holiday'
                      ? alpha(theme.palette.error.main, 0.1)
                      : alpha(theme.palette.success.main, 0.1),
                    color: event.type === 'personal'
                      ? theme.palette.info.main
                      : event.type === 'holiday'
                      ? theme.palette.error.main
                      : theme.palette.success.main,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Add Event Material 3 Dialog */}
      <Material3Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('calendar.addNewEvent')}
        icon={<EventIcon />}
        supportingText="Crea un evento personal para recordar fechas importantes durante tu estancia."
        actions={
          <>
            <Button
              variant="text"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleAddEvent}
              disabled={!newEventTitle.trim() || loading}
              startIcon={loading ? <Material3LoadingIndicator size="small" /> : undefined}
            >
              {loading ? t('calendar.creating') : t('calendar.createEvent')}
            </Button>
          </>
        }
      >
        <Stack spacing={3}>
          <MaterialTextField
            label={t('calendar.eventTitle')}
            value={newEventTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEventTitle(e.target.value)}
            fullWidth
            variant="outlined"
            supportingText="Ejemplo: Cita médica, Entrega de documentos, etc."
          />
          
          <MaterialTextField
            label={t('calendar.eventDate')}
            type="date"
            value={newEventDate.toISOString().split('T')[0]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEventDate(new Date(e.target.value))}
            fullWidth
            InputLabelProps={{ shrink: true }}
            variant="outlined"
          />
        </Stack>
      </Material3Dialog>
    </Box>
  );
}
