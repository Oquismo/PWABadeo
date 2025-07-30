'use client';

import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// 1. Definimos los tipos que 'react-calendar' usa para las fechas
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const events = [
  { date: new Date(2025, 7, 5), title: 'Taller de Bienvenida' },
  { date: new Date(2025, 7, 12), title: 'Noche de Tapas Cultural' },
  { date: new Date(2025, 7, 23), title: 'Excursión a la Playa' },
];

export default function CalendarSection() {
  // 2. Usamos el tipo 'Value' para nuestro estado de fecha
  const [date, setDate] = useState<Value>(new Date());

  // 3. Creamos la función intermediaria que sí coincide con lo que espera onChange
  const handleDateChange = (value: Value) => {
    setDate(value);
  };

  return (
    <Box sx={{ py: 4 }}>
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
        .react-calendar__tile--hasActive { background: #333; }
      `}</style>

      <Calendar
        // 4. Usamos nuestra nueva función en el onChange
        onChange={handleDateChange}
        value={date}
        tileClassName={({ date, view }) => {
          if (view === 'month' && events.find(event => event.date.toDateString() === date.toDateString())) {
            return 'event-day';
          }
          return null;
        }}
      />

      <Typography variant="h5" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        Próximos Eventos
      </Typography>
      <List sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: 1 }}>
        {events.map((event, index) => (
          <Box key={index}>
            <ListItem>
              <ListItemText 
                primary={event.title} 
                secondary={event.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} 
              />
            </ListItem>
            {index < events.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />}
          </Box>
        ))}
      </List>
    </Box>
  );
}