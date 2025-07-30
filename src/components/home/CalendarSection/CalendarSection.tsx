'use client';

import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, Modal, TextField, Stack } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '@/context/AuthContext';
import AddIcon from '@mui/icons-material/Add';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  date: Date;
  title: string;
}

const programEvents: Event[] = [
  { date: new Date(2025, 7, 5), title: 'Taller de Bienvenida' },
  { date: new Date(2025, 7, 12), title: 'Noche de Tapas Cultural' },
  { date: new Date(2025, 7, 23), title: 'Excursión a la Playa' },
];

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: 24,
  p: 4,
  borderRadius: '16px',
};

// Helper para formatear la fecha a YYYY-MM-DD sin problemas de zona horaria
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

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (isClient) {
      const savedEvents = localStorage.getItem('userCustomEvents');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date),
        }));
        setUserEvents(parsedEvents);
      }
    }
  }, [isClient]);

  const allEvents = useMemo(() => {
    const personalEvents: Event[] = [];
    if (user?.arrivalDate) {
      const [year, month, day] = user.arrivalDate.split('-').map(Number);
      personalEvents.push({ date: new Date(year, month - 1, day), title: 'Mi Llegada' });
    }
    if (user?.departureDate) {
      const [year, month, day] = user.departureDate.split('-').map(Number);
      personalEvents.push({ date: new Date(year, month - 1, day), title: 'Mi Salida' });
    }
    return [...programEvents, ...personalEvents, ...userEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [user, userEvents]);

  const handleDateChange = (value: Value) => { setDate(value); };
  const handleClose = () => setOpen(false);

  const handleOpen = () => {
    if (date && !Array.isArray(date)) {
      setNewEventDate(date);
    } else {
      setNewEventDate(new Date());
    }
    setOpen(true);
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim() === '') return;
    const newEvent = { title: newEventTitle, date: newEventDate };
    const updatedEvents = [...userEvents, newEvent];
    setUserEvents(updatedEvents);
    localStorage.setItem('userCustomEvents', JSON.stringify(updatedEvents));
    handleClose();
    setNewEventTitle('');
  };

  if (!isClient) { return null; }

  return (
    <Box sx={{ py: 4 }}>
      {/* --- ESTILO RESTAURADO --- */}
      <style>{`
        .react-calendar {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(39, 39, 42, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          color: #fff;
        }
        .react-calendar__tile--active, .react-calendar__tile--now {
          background: rgba(190, 242, 100, 0.15) !important;
          color: #BEF264 !important;
          border-radius: 8px;
        }
        .react-calendar__navigation button { color: #BEF264; }
        .react-calendar__month-view__weekdays__weekday { color: #A1A1AA; }
        .react-calendar__tile { color: #fff; }
        .react-calendar__tile:disabled { color: #555; }
        .event-day {
          background-color: rgba(56, 164, 220, 0.3);
          border-radius: 8px;
        }
      `}</style>
      
      <Calendar
        onChange={handleDateChange}
        value={date}
        tileClassName={({ date, view }) => {
          if (view === 'month' && allEvents.find(event => event.date.toDateString() === date.toDateString())) {
            return 'event-day';
          }
          return null;
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Próximos Eventos</Typography>
        {isAuthenticated && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Añadir</Button>
        )}
      </Box>
      <List sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: 1 }}>
        {allEvents.map((event, index) => (
          <Box key={index}>
            <ListItem>
              <ListItemText 
                primary={event.title} 
                secondary={event.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} 
                primaryTypographyProps={{ 
                  color: (event.title === 'Mi Llegada' || event.title === 'Mi Salida') ? 'primary.main' : 'text.primary',
                  fontWeight: (event.title === 'Mi Llegada' || event.title === 'Mi Salida') ? 'bold' : 'normal'
                }}
              />
            </ListItem>
            {index < allEvents.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />}
          </Box>
        ))}
      </List>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" fontWeight="bold">Añadir Nuevo Evento</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Título del Evento"
              variant="outlined"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <TextField
              label="Fecha"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={toISODateString(newEventDate)}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split('-').map(Number);
                const selectedDate = new Date(year, month - 1, day);
                setNewEventDate(selectedDate);
              }}
            />
            <Button variant="contained" onClick={handleAddEvent}>Guardar Evento</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}