'use client';

import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import SosRoundedIcon from '@mui/icons-material/SosRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import useAuth from '@/context/AuthContext';

interface PhoneEntry {
  name: string;
  num: string;
  icon: React.ReactNode;
}

interface PhoneCategory {
  title: string;
  color: string;
  phones: PhoneEntry[];
}

const residencePhoneMap: Record<string, PhoneEntry> = {
  ONE: { name: 'Residencia ONE', num: '+34 955 11 22 33', icon: <HomeRoundedIcon /> },
  AMRO: { name: 'Residencia AMRO', num: '+34 644 93 47 760', icon: <HomeRoundedIcon /> },
  ESTANISLAO: { name: 'Residencia Estanislao', num: '+34 955 22 33 44', icon: <HomeRoundedIcon /> },
};

function normalizeTel(raw: string) {
  return raw.replace(/[^+0-9]/g, '');
}

function PhoneCard({ phone, accentColor }: { phone: PhoneEntry; accentColor: string }) {
  const handleCopy = () => {
    try { navigator.clipboard.writeText(normalizeTel(phone.num)); } catch {}
  };

  return (
    <Box
      component="a"
      href={`tel:${normalizeTel(phone.num)}`}
      aria-label={`Llamar a ${phone.name}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        p: '15px',
        borderRadius: '24px',
        bgcolor: 'var(--md-surface)',
        border: '1px solid var(--md-outline-variant)',
        textDecoration: 'none',
        color: 'inherit',
        '&:active': { transform: 'scale(0.99)' },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '16px',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          bgcolor: `${accentColor}22`,
          color: accentColor,
          '& .MuiSvgIcon-root': { fontSize: 22 },
        }}
      >
        {phone.icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box component="b" sx={{ display: 'block', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {phone.name}
        </Box>
        <Box
          component="span"
          sx={{
            display: 'block',
            mt: '2px',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '0.95rem',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--md-on-surface)',
          }}
        >
          {phone.num}
        </Box>
      </Box>
      <Tooltip title="Copiar número">
        <IconButton
          size="small"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy(); }}
          sx={{ color: 'text.secondary', flexShrink: 0 }}
          aria-label={`Copiar ${phone.name}`}
        >
          <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function PhoneList() {
  const { user } = useAuth();

  const residence = (user as { residence?: string | null } | null)?.residence;
  const residenceKey = residence ? String(residence).trim().toUpperCase() : null;

  const residenceSection: PhoneCategory | null = residenceKey && residencePhoneMap[residenceKey]
    ? {
        title: 'Mi residencia',
        color: '#BEF264',
        phones: [residencePhoneMap[residenceKey]],
      }
    : null;

  const categories: PhoneCategory[] = [
    {
      title: 'Emergencias',
      color: '#FF5252',
      phones: [
        { name: 'Emergencias generales', num: '112', icon: <SosRoundedIcon /> },
        { name: 'Policía Local', num: '092', icon: <SecurityRoundedIcon /> },
        { name: 'Guardia Civil', num: '062', icon: <ShieldRoundedIcon /> },
      ],
    },
    {
      title: 'Programa AMRO',
      color: '#8EA8F0',
      phones: [
        { name: 'Coordinador del programa', num: '+34 649 347 760', icon: <PersonRoundedIcon /> },
        { name: 'Secretaría AMRO', num: '+34 954 000 000', icon: <ApartmentRoundedIcon /> },
      ],
    },
    {
      title: 'Servicios locales',
      color: '#00E676',
      phones: [
        { name: 'Centro de Salud Norte', num: '+34 954 111 222', icon: <LocalHospitalRoundedIcon /> },
        { name: 'Ayuntamiento de Sevilla', num: '+34 955 470 000', icon: <AccountBalanceRoundedIcon /> },
        { name: 'EMT Sevilla (Bus)', num: '+34 900 010 059', icon: <DirectionsBusRoundedIcon /> },
      ],
    },
    ...(residenceSection ? [residenceSection] : []),
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
          color: 'text.primary',
          mb: 0.5,
        }}
      >
        Teléfonos de ayuda
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.8rem' }}>
        Toca el número para copiarlo
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {categories.map((cat) => (
          <Box key={cat.title}>
            {/* Category header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 4, height: 16, background: cat.color, borderRadius: 1, flexShrink: 0 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700, color: cat.color,
                  letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.72rem',
                }}
              >
                {cat.title}
              </Typography>
            </Box>
            {/* Phone cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {cat.phones.map((p) => (
                <PhoneCard key={p.num} phone={p} accentColor={cat.color} />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
