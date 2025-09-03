'use client';

import { Box, Typography, Container, Stack, Avatar, Divider, Link } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmergencyIcon from '@mui/icons-material/EmergencyShare'; // Icono para emergencias

const phoneNumbers = [
    { name: 'Emergencias Generales', number: '112', isEmergency: true },
    { name: 'Policía Nacional', number: '091', isEmergency: true },
    { name: 'Barrio de oportunidades emergencia', number: '+34649347760' },
    { name: 'Ayuntamiento', number: '955 47 00 00' },
    { name: 'Atención al Ciudadano', number: '010' },
    { name: 'Barrio de Oportunidades', number: '954 75 49 16' },
];

export default function PhoneList() {
    return (
        <Container sx={{ py: 4 }}>
            <Stack 
                divider={<Divider orientation="horizontal" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />} 
                spacing={2}
            >
                {phoneNumbers.map((phone) => (
                    <Box 
                        key={phone.name} 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            p: 2,
                            // Si es de emergencia, le damos un fondo y color distintivo
                            bgcolor: phone.isEmergency ? 'error.dark' : 'transparent',
                            borderRadius: '8px'
                        }}
                    >
                        <Avatar sx={{ bgcolor: phone.isEmergency ? 'error.main' : 'primary.main' }}>
                            {phone.isEmergency ? <EmergencyIcon /> : <PhoneIcon />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="medium">
                                {phone.name}
                            </Typography>
                            <Link href={`tel:${phone.number}`} color="inherit" underline="hover" sx={{ fontSize: '1.1rem' }}>
                                {phone.number}
                            </Link>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Container>
    );
}