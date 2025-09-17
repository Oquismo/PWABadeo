 'use client';

import { Box, Typography, Container, Grid, Avatar, Link, Chip, IconButton, Tooltip } from '@mui/material';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import PhoneIcon from '@mui/icons-material/Phone';
import EmergencyIcon from '@mui/icons-material/EmergencyShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getTranslation, Language } from '@/lib/i18n';
import useAuth from '@/context/AuthContext';

// Detectar idioma (puedes mejorar esto según tu lógica global)
const lang: Language = typeof window !== 'undefined' && (localStorage.getItem('lang') as Language) || 'es';

const basePhoneNumbers = [
    { nameKey: 'emergencyGeneral', number: '112', isEmergency: true },
    { nameKey: 'police', number: '091', isEmergency: true },
    { nameKey: 'neighborhoodEmergency', number: '+34649347760' },
    { nameKey: 'municipal', number: '+34 955 47 00 92' },
];

// Mapping simple entre claves de residencia y números asociados
const residencePhoneMap: Record<string, { nameKey: string; number: string }> = {
    'ONE': { nameKey: 'residenciaOne', number: '+34 955 11 22 33' },
    'AMBRO': { nameKey: 'residenciaAmro', number: '+34 644 93 47 760' },
    'ESTANISLAO': { nameKey: 'residenciaEstanislao', number: '+34 955 22 33 44' }
};

// Normaliza para href tel: (quita espacios y caracteres no numéricos excepto +)
function normalizeTelHref(raw: string) {
    return raw.replace(/[^+0-9]/g, '');
}

// Formatea para mostrar al usuario (simple, grouping para España +34)
function formatDisplayNumber(raw: string) {
    const n = normalizeTelHref(raw);
    // Si empieza con +34 y tiene 11 chars (+34 + 9 dígitos)
    if (n.startsWith('+34') && n.length === 12) {
        // +34 955 47 00 92 -> +34 955 47 00 92 (ya separado) — devolver con espacios cada 3/2/2
        const rest = n.slice(3); // 955470092
        return `+34 ${rest.slice(0,3)} ${rest.slice(3,5)} ${rest.slice(5,7)} ${rest.slice(7)}`;
    }
    // Si empieza con +34 y tiene 11 dígitos sin separadores (ej +34649347760 -> +34 649 34 77 60)
    if (n.startsWith('+34') && n.length === 12) {
        const rest = n.slice(3);
        return `+34 ${rest.slice(0,3)} ${rest.slice(3,5)} ${rest.slice(5,7)} ${rest.slice(7)}`;
    }
    // Fallback: insertar espacios cada 3 desde el inicio después del + si existe
    if (n.startsWith('+')) {
        const cc = n.slice(1,3);
        const rest = n.slice(3);
        return `+${cc} ${rest}`;
    }
    // Para números cortos (112/091) devolver tal cual
    return raw;
}

export default function PhoneList() {
    const { user } = useAuth();

    // Construir la lista final: base + posible número de residencia si el usuario tiene seleccionado
    const phoneNumbers = [...basePhoneNumbers];
    const rawResid = user && (user as any).residence ? String((user as any).residence).trim().toUpperCase() : null;
    if (rawResid && residencePhoneMap[rawResid]) {
        const mapped = residencePhoneMap[rawResid];
        phoneNumbers.push({ nameKey: mapped.nameKey, number: mapped.number });
    }

    // Traducciones para los nombres de teléfono
    const nameTranslations: Record<string, string> = {
        emergencyGeneral: getTranslation(lang, 'pages.phones.emergency') + ' 112',
        police: getTranslation(lang, 'pages.phones.police'),
        neighborhoodEmergency: getTranslation(lang, 'pages.phones.emergency') + ' barrio',
        municipal: getTranslation(lang, 'pages.phones.municipal'),
        residenciaOne: getTranslation(lang, 'places.residenciaOne.name') || 'Residencia ONE',
        residenciaAmro: getTranslation(lang, 'places.residenciaAmro.name') || 'Residencia AMRO',
        residenciaEstanislao: getTranslation(lang, 'places.residenciaEstanislao.name') || 'Residencia Estanislao'
    };

    return (
        <Container sx={{ py: 4 }}>
            <Grid container spacing={2}>
                {phoneNumbers.map((phone) => (
                    <Grid item key={phone.nameKey} xs={12} sm={6}>
                        <Material3ElevatedCard sx={{ p: 3, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, bgcolor: phone.isEmergency ? 'error.dark' : undefined }}>
                            <Link href={`tel:${normalizeTelHref(phone.number)}`} sx={{ display: 'inline-flex' }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: phone.isEmergency ? 'error.main' : 'primary.main', cursor: 'pointer' }}>
                                    {phone.isEmergency ? <EmergencyIcon fontSize="large" /> : <PhoneIcon fontSize="large" />}
                                </Avatar>
                            </Link>

                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                    <Typography variant="h6" fontWeight={700}>
                                        {phone.nameKey === 'neighborhoodEmergency' ? 'Emergencias (barrio)' : (nameTranslations[phone.nameKey] || phone.number)}
                                    </Typography>
                                    {
                                        (() => {
                                            const residenceKeys = ['residenciaOne', 'residenciaAmro', 'residenciaEstanislao'];
                                            const isResidence = phone.nameKey && residenceKeys.includes(phone.nameKey);
                                            const chipLabel = phone.isEmergency
                                                ? getTranslation(lang, 'pages.phones.emergency') || 'Emergencia'
                                                : (phone.nameKey === 'neighborhoodEmergency'
                                                    ? 'Badeo'
                                                    : isResidence
                                                        ? getTranslation(lang, 'map.categories.residence') || 'Residencia'
                                                        : (phone.nameKey === 'municipal' ? (
                                                            // Prefer a more specific label for municipal police
                                                            getTranslation(lang, 'pages.phones.municipalPolice') || getTranslation(lang, 'pages.phones.municipal') || 'Policía municipal'
                                                        ) : ''));
                                            return <Chip label={chipLabel} color={phone.isEmergency ? 'error' : 'primary'} size="small" />;
                                        })()
                                    }
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                    <Link href={`tel:${normalizeTelHref(phone.number)}`} color="inherit" underline="hover" sx={{ fontSize: '1.15rem', fontWeight: 600 }}>
                                        {formatDisplayNumber(phone.number)}
                                    </Link>

                                    <Tooltip title="Copiar número">
                                        <IconButton size="small" onClick={() => {
                                            try { navigator.clipboard.writeText(normalizeTelHref(phone.number)); } catch (e) {}
                                        }}>
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Material3ElevatedCard>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}