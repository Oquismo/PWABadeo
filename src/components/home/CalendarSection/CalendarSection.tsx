'use client';

import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, Modal, TextField, Stack, IconButton, Chip } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '@/context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import { migrateLocalStorageEvents, shouldMigrateEvents } from '@/utils/migrateEvents';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  id?: string;
  date: Date;
  title: string;
  type: 'program' | 'personal' | 'holiday';
}

// Eventos del programa con fechas realistas para 2025
const programEvents: Event[] = [
  { date: new Date(2025, 7, 30), title: 'Taller de Bienvenida', type: 'program' },
  { date: new Date(2025, 8, 5), title: 'Noche de Tapas Cultural', type: 'program' },
  { date: new Date(2025, 8, 15), title: 'Excursión a la Playa', type: 'program' },
  { date: new Date(2025, 8, 20), title: 'Fiesta de Verano', type: 'program' },
  { date: new Date(2025, 9, 1), title: 'Inicio del Nuevo Trimestre', type: 'program' },
  { date: new Date(2025, 9, 12), title: 'Día del Patrimonio', type: 'holiday' },
  { date: new Date(2025, 9, 31), title: 'Halloween Party', type: 'program' },
  { date: new Date(2025, 10, 1), title: 'Día de Todos los Santos', type: 'holiday' },
  { date: new Date(2025, 10, 15), title: 'Excursión Otoñal', type: 'program' },
  { date: new Date(2025, 11, 6), title: 'Día de la Constitución', type: 'holiday' },
  { date: new Date(2025, 11, 8), title: 'Día de la Inmaculada', type: 'holiday' },
  { date: new Date(2025, 11, 25), title: 'Navidad en Familia', type: 'program' },
  { date: new Date(2025, 11, 31), title: 'Nochevieja', type: 'program' },
  { date: new Date(2026, 0, 1), title: 'Año Nuevo', type: 'holiday' },
  { date: new Date(2026, 0, 6), title: 'Día de Reyes', type: 'holiday' },
];

// Helper para formatear la fecha
const toISODateString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarSection() {
  const [date, setDate] = useState<Value>(new Date());
  const { user, isAuthenticated } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar eventos desde la API
  const loadUserEvents = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/user-events', {
        headers: {
          'x-user-id': user.id.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const events = data.events.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          type: event.type
        }));
        setUserEvents(events);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && user?.id && user?.email) {
      // Verificar si necesita migración de localStorage
      if (shouldMigrateEvents(user.email)) {
        migrateLocalStorageEvents(user.email, user.id).then((result) => {
          if (result.success && result.migrated > 0) {
            console.log(`Migrados ${result.migrated} eventos desde localStorage`);
          }
          // Cargar eventos después de la migración
          loadUserEvents();
        });
      } else {
        // Cargar eventos normalmente
        loadUserEvents();
      }
    }
  }, [isClient, user?.id, user?.email]);

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

  const handleDateChange = (value: Value) => {
    setDate(value);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewEventTitle('');
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
          type: data.event.type as 'personal'
        };
        setUserEvents(prev => [...prev, newEvent]);
        handleClose();
      } else {
        console.error('Error creando evento');
      }
    } catch (error) {
      console.error('Error creando evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.id || !eventId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/user-events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id.toString()
        }
      });

      if (response.ok) {
        setUserEvents(prev => prev.filter(event => event.id !== eventId));
      } else {
        console.error('Error eliminando evento');
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Cargando calendario...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <style>{`
        /* Reset completo del calendario */
        .react-calendar {
          width: 100%;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.24),
            0 0 0 1px rgba(255, 255, 255, 0.08);
          padding: 24px;
          font-family: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Navegación */
        .react-calendar__navigation {
          margin-bottom: 16px;
          background: transparent;
          border-radius: 16px;
          padding: 8px;
          backdrop-filter: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .react-calendar__navigation button {
          color: #E8EAED;
          font-weight: 600;
          font-size: 18px;
          padding: 12px 16px;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border: none;
          min-width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .react-calendar__navigation button:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.02);
        }

        .react-calendar__navigation button:enabled:focus {
          background: rgba(190, 242, 100, 0.12);
          color: #BEF264;
          outline: 2px solid rgba(190, 242, 100, 0.3);
          outline-offset: 2px;
        }

        .react-calendar__navigation__label {
          color: #E8EAED;
          font-weight: 600;
          font-size: 18px;
          text-transform: capitalize;
          letter-spacing: -0.025em;
          pointer-events: none;
          flex: 1;
          text-align: center;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .react-calendar__navigation__label__labelText {
          background: transparent !important;
          color: #E8EAED !important;
        }

        /* Días de la semana - SIN GRID PERSONALIZADO */
        .react-calendar__month-view__weekdays {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          margin-bottom: 12px;
          padding: 8px 0;
        }

        .react-calendar__month-view__weekdays__weekday {
          color: #9AA0A6;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: center;
          line-height: 1;
        }

        /* Grid de días - SIN PERSONALIZACIÓN */
        .react-calendar__month-view__days {
          /* Dejamos que react-calendar maneje el layout */
        }

        /* Tiles de días */
        .react-calendar__tile {
          color: #E8EAED;
          font-weight: 500;
          font-size: 15px;
          padding: 14px 10px;
          border-radius: 16px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          min-width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          line-height: 1;
          cursor: pointer;
        }

        .react-calendar__tile:enabled:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .react-calendar__tile:enabled:focus {
          background: rgba(190, 242, 100, 0.12);
          color: #BEF264;
          outline: 2px solid rgba(190, 242, 100, 0.3);
          outline-offset: 2px;
        }

        /* Día actual */
        .react-calendar__tile--now {
          background: rgba(190, 242, 100, 0.08);
          color: #BEF264;
          font-weight: 600;
          box-shadow: inset 0 0 0 1px rgba(190, 242, 100, 0.2);
        }

        .react-calendar__tile--now:hover {
          background: rgba(190, 242, 100, 0.15);
          box-shadow: inset 0 0 0 1px rgba(190, 242, 100, 0.3);
        }

        /* Día seleccionado */
        .react-calendar__tile--active {
          background: #BEF264;
          color: #202124;
          font-weight: 600;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 1px 2px rgba(0, 0, 0, 0.24),
            0 0 0 1px rgba(190, 242, 100, 0.3);
        }

        .react-calendar__tile--active:hover {
          background: #BEF264;
          transform: scale(1.05);
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.15),
            0 4px 16px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(190, 242, 100, 0.4);
        }

        /* Días de meses vecinos */
        .react-calendar__tile--neighboringMonth {
          color: #9AA0A6;
          background: rgba(255, 255, 255, 0.02);
          opacity: 0.5;
        }

        .react-calendar__tile--neighboringMonth:hover {
          background: rgba(255, 255, 255, 0.05);
          opacity: 0.7;
        }

        /* Días deshabilitados */
        .react-calendar__tile:disabled {
          color: #5F6368;
          background: transparent;
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Eventos */
        .event-day {
          background: rgba(56, 164, 220, 0.15);
          color: #8AB4F8;
          font-weight: 600;
          position: relative;
          border: 1px solid rgba(56, 164, 220, 0.3);
        }

        .event-day::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background: #8AB4F8;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(138, 180, 248, 0.5);
        }

        .event-day:hover {
          background: rgba(56, 164, 220, 0.25);
          border-color: rgba(56, 164, 220, 0.5);
        }

        .event-day.event-personal {
          background: rgba(190, 242, 100, 0.15);
          color: #BEF264;
          border-color: rgba(190, 242, 100, 0.3);
        }

        .event-day.event-personal::after {
          background: #BEF264;
          box-shadow: 0 0 4px rgba(190, 242, 100, 0.5);
        }

        .event-day.event-holiday {
          background: rgba(244, 67, 54, 0.15);
          color: #F44336;
          border-color: rgba(244, 67, 54, 0.3);
        }

        .event-day.event-holiday::after {
          background: #F44336;
          box-shadow: 0 0 4px rgba(244, 67, 54, 0.5);
        }

        /* Responsive */
        @media (max-width: 600px) {
          .react-calendar {
            padding: 16px;
            border-radius: 20px;
          }

          .react-calendar__tile {
            padding: 10px 6px;
            min-width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .react-calendar__navigation button {
            padding: 8px 12px;
            font-size: 16px;
            min-width: 40px;
            height: 40px;
          }

          .react-calendar__month-view__weekdays__weekday {
            font-size: 10px;
            padding: 8px 0;
          }
        }
      `}</style>

      <Calendar
        onChange={handleDateChange}
        value={date}
        locale="es-ES"
        showNeighboringMonth={true}
        minDetail="month"
        maxDetail="month"
        nextLabel="›"
        prevLabel="‹"
        next2Label={null}
        prev2Label={null}
        calendarType="iso8601"
        tileClassName={({ date, view }) => {
          if (view === 'month') {
            const event = allEvents.find(event =>
              event.date.toDateString() === date.toDateString()
            );
            if (event) {
              return `event-day event-${event.type}`;
            }
          }
          return null;
        }}
        formatMonthYear={(locale, date) => {
          return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        }}
      />      {/* Sección de eventos con Material You */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight="700"
          sx={{
            color: '#E8EAED',
            fontSize: { xs: '1.375rem', md: '1.5rem' },
            letterSpacing: '-0.025em',
            fontFamily: '"Google Sans", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: 0,
              width: '40px',
              height: '3px',
              background: 'linear-gradient(90deg, #BEF264 0%, #9ACD32 100%)',
              borderRadius: '2px',
            }
          }}
        >
          Próximos Eventos
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              borderRadius: '20px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              background: 'linear-gradient(135deg, #BEF264 0%, #9ACD32 100%)',
              color: '#1A1A1A',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #9ACD32 0%, #BEF264 100%)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(190, 242, 100, 0.2)',
                transform: 'translateY(-1px) scale(1.02)'
              },
              '&:active': {
                transform: 'translateY(0) scale(0.98)'
              }
            }}
          >
            Añadir
          </Button>
        )}
      </Box>

      <Box sx={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        borderRadius: '24px',
        padding: '20px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `
          0 1px 3px rgba(0, 0, 0, 0.12),
          0 1px 2px rgba(0, 0, 0, 0.24),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          borderRadius: '24px 24px 0 0',
        }
      }}>
        {allEvents
          .filter(event => {
            const now = new Date();
            const tenDaysFromNow = new Date();
            tenDaysFromNow.setDate(now.getDate() + 10);
            
            // Solo eventos en los próximos 10 días
            const isWithinTenDays = event.date >= now && event.date <= tenDaysFromNow;
            
            return isWithinTenDays;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 5)
          .map((event, index, array) => (
            <Box key={`${event.date.toISOString()}-${index}`}>
              <Box
                sx={{
                  borderRadius: '16px',
                  padding: '16px 20px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'transparent',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                    transform: 'translateX(8px) scale(1.01)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                    '&::before': {
                      opacity: 1,
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    background: event.type === 'personal' ? 
                      'linear-gradient(180deg, #8AB4F8 0%, #4285F4 100%)' :
                      event.type === 'holiday' ? 
                      'linear-gradient(180deg, #F44336 0%, #D32F2F 100%)' :
                      'linear-gradient(180deg, #BEF264 0%, #9ACD32 100%)',
                    borderRadius: '0 2px 2px 0',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: event.type === 'personal' ? '#8AB4F8' :
                               event.type === 'holiday' ? '#F87171' : '#E8EAED',
                        fontWeight: 600,
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                        mb: 0.5,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {event.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#9AA0A6',
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        textTransform: 'capitalize',
                        fontFamily: '"Roboto", sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CalendarTodayIcon sx={{ fontSize: '16px', opacity: 0.7 }} />
                      {event.date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                  
                  {/* Chip indicador del tipo de evento y botón eliminar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={
                        event.type === 'personal' ? 'Personal' :
                        event.type === 'holiday' ? 'Festivo' : 'Programa'
                      }
                      sx={{
                        background: event.type === 'personal' ? 
                          'rgba(138, 180, 248, 0.15)' :
                          event.type === 'holiday' ? 
                          'rgba(244, 67, 54, 0.15)' :
                          'rgba(190, 242, 100, 0.15)',
                        color: event.type === 'personal' ? '#8AB4F8' :
                               event.type === 'holiday' ? '#F44336' : '#BEF264',
                        border: `1px solid ${
                          event.type === 'personal' ? 'rgba(138, 180, 248, 0.3)' :
                          event.type === 'holiday' ? 'rgba(244, 67, 54, 0.3)' :
                          'rgba(190, 242, 100, 0.3)'
                        }`,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: '24px',
                        '& .MuiChip-label': {
                          px: 1,
                        }
                      }}
                    />
                    
                    {/* Botón eliminar solo para eventos creados por el usuario */}
                    {event.id && userEvents.some(userEvent => userEvent.id === event.id) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id!);
                        }}
                        disabled={loading}
                        sx={{
                          color: '#F87171',
                          opacity: loading ? 0.5 : 0.7,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            opacity: 1,
                            background: 'rgba(248, 113, 113, 0.1)',
                            transform: 'scale(1.1)',
                          },
                          '&:disabled': {
                            opacity: 0.3,
                          }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
              
              {index < array.length - 1 && (
                <Box
                  sx={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.08) 80%, transparent 100%)',
                    my: 1,
                    mx: 2,
                  }}
                />
              )}
            </Box>
          ))}
        
        {/* Estado vacío con diseño Material You */}
        {allEvents.filter(event => {
          const now = new Date();
          const tenDaysFromNow = new Date();
          tenDaysFromNow.setDate(now.getDate() + 10);
          return event.date >= now && event.date <= tenDaysFromNow;
        }).length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            color: '#9AA0A6'
          }}>
            <CalendarTodayIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 500, 
              mb: 1,
              fontFamily: '"Google Sans", "Roboto", sans-serif',
            }}>
              No hay eventos próximos
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Los eventos aparecerán aquí en los próximos 10 días
            </Typography>
          </Box>
        )}
      </Box>

      {/* Modal para añadir eventos */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 450 },
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          p: 4,
          borderRadius: '28px',
          outline: 'none'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h6"
              component="h2"
              fontWeight="600"
              sx={{
                color: '#E8EAED',
                fontSize: '1.5rem',
                letterSpacing: '-0.025em'
              }}
            >
              Añadir Nuevo Evento
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{
                color: '#9AA0A6',
                '&:hover': {
                  color: '#E8EAED',
                  background: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Stack spacing={3}>
            <TextField
              label="Título del Evento"
              variant="outlined"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#BEF264',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#9AA0A6',
                  '&.Mui-focused': {
                    color: '#BEF264',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#E8EAED',
                },
              }}
            />
            <TextField
              label="Fecha"
              type="date"
              InputLabelProps={{
                shrink: true,
                sx: { color: '#9AA0A6' }
              }}
              value={toISODateString(newEventDate)}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split('-').map(Number);
                const selectedDate = new Date(year, month - 1, day);
                setNewEventDate(selectedDate);
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#BEF264',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#E8EAED',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddEvent}
              disabled={!newEventTitle.trim() || loading}
              sx={{
                borderRadius: '16px',
                padding: '12px 24px',
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                background: 'linear-gradient(135deg, #BEF264 0%, #9ACD32 100%)',
                color: '#1A1A1A',
                border: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #9ACD32 0%, #BEF264 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(190, 242, 100, 0.2)',
                  transform: 'translateY(-1px) scale(1.02)'
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  transform: 'none',
                  boxShadow: 'none'
                }
              }}
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
