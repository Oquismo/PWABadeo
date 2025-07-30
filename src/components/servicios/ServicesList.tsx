'use client';

import { Box, Typography, Container, Stack, Avatar, Divider } from '@mui/material';
import HouseIcon from '@mui/icons-material/House';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ForumIcon from '@mui/icons-material/Forum';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PublicIcon from '@mui/icons-material/Public';

const services = [
    { icon: <HouseIcon />, title: 'Personalized accommodation' },
    { icon: <LocalShippingIcon />, title: 'Logistics and transfers' },
    { icon: <HandshakeIcon />, title: 'Internship matching' },
    { icon: <ForumIcon />, title: 'Coordination and support' },
    { icon: <MenuBookIcon />, title: 'Training courses' },
    { icon: <PublicIcon />, title: 'Training internships' },
];

export default function ServicesList() {
    return (
        <Container sx={{ py: 4 }}>
            <Stack 
                divider={<Divider orientation="horizontal" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />} 
                spacing={3}
            >
                {services.map((service) => (
                    <Box key={service.title} sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {service.icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight="medium">
                            {service.title}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Container>
    );
}