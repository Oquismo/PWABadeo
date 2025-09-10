'use client';

import { Box, Typography, Container, Stack, Avatar, Divider, Link } from '@mui/material';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import PhoneIcon from '@mui/icons-material/Phone';
import EmergencyIcon from '@mui/icons-material/EmergencyShare';
import { getTranslation, Language } from '@/lib/i18n';

// Detectar idioma (puedes mejorar esto según tu lógica global)
const lang: Language = typeof window !== 'undefined' && (localStorage.getItem('lang') as Language) || 'es';

const phoneNumbers = [
    { nameKey: 'emergencyGeneral', number: '112', isEmergency: true },
    { nameKey: 'police', number: '091', isEmergency: true },
    { nameKey: 'neighborhoodEmergency', number: '+34649347760' },
    { nameKey: 'municipal', number: '+34 955 010 010' },
    { nameKey: 'citizenService', number: '010' },
    { nameKey: 'neighborhood', number: '954 75 49 16' },
];

export default function PhoneList() {
    // Traducciones para los nombres de teléfono
    const nameTranslations: Record<string, string> = {
        emergencyGeneral: getTranslation(lang, 'pages.phones.emergency') + ' 112',
        police: getTranslation(lang, 'pages.phones.police'),
    neighborhoodEmergency: getTranslation(lang, 'pages.phones.emergency') + ' barrio',
        municipal: getTranslation(lang, 'pages.phones.municipal'),
        citizenService: getTranslation(lang, 'pages.phones.utilities'),
        neighborhood: getTranslation(lang, 'pages.phones.neighborhood'),
    };

    return (
        <Container sx={{ py: 4 }}>
            <Stack spacing={0}>
                {phoneNumbers.map((phone, idx) => (
                    <>
                        <Material3ElevatedCard key={phone.nameKey} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: phone.isEmergency ? 'error.dark' : undefined }}>
                            <Link href={`tel:${phone.number}`} sx={{ display: 'inline-flex' }}>
                                <Avatar sx={{ bgcolor: phone.isEmergency ? 'error.main' : 'primary.main', cursor: 'pointer' }}>
                                    {phone.isEmergency ? <EmergencyIcon /> : <PhoneIcon />}
                                </Avatar>
                            </Link>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="medium">
                                    {nameTranslations[phone.nameKey] || phone.number}
                                </Typography>
                                <Link href={`tel:${phone.number}`} color="inherit" underline="hover" sx={{ fontSize: '1.1rem' }}>
                                    {phone.number}
                                </Link>
                            </Box>
                        </Material3ElevatedCard>
                        {idx < phoneNumbers.length - 1 && (
                            <Divider variant="middle" sx={{ my: 2, mx: 4, borderColor: 'rgba(0,0,0,0.08)' }} />
                        )}
                    </>
                ))}
            </Stack>
        </Container>
    );
}