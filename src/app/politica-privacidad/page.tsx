'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PrivacyTip as PrivacyIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  ContactMail as ContactIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import M3Button from '@/components/ui/M3Button';

export default function PoliticaPrivacidadPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <PrivacyIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Política de Privacidad
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Fecha de entrada en vigor: 17 de octubre de 2025
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Introducción */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="body1" paragraph>
          Bienvenido/a a <strong>Barrio de oportunidades</strong> (en adelante, "la Aplicación"), 
          una aplicación diseñada para ayudar y acompañar a estudiantes y profesores del programa 
          Erasmus durante su estancia en Sevilla.
        </Typography>
        <Typography variant="body1" paragraph>
          El responsable del tratamiento de tus datos es <strong>Romolo Rovetta</strong> (en adelante, "nosotros"), 
          con correo electrónico de contacto <strong>rovetta215@gmail.com</strong>.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esta Política de Privacidad describe qué datos personales recopilamos, cómo los usamos, 
          con quién los compartimos y los derechos que tienes sobre tu información. Al registrarte 
          y utilizar nuestros servicios, aceptas las prácticas descritas en este documento.
        </Typography>
      </Paper>

      {/* 1. Información que Recopilamos */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            📋 1. Información que Recopilamos
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:
          </Typography>

          <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
            a) Información que nos proporcionas directamente:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Datos de Registro"
                secondary="Cuando creas una cuenta, te solicitamos tu dirección de correo electrónico y una contraseña. También podrás proporcionar un nombre de usuario o nombre real para personalizar tu experiencia."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Comunicaciones"
                secondary="Si te pones en contacto con nosotros por correo electrónico, guardaremos un registro de esa correspondencia para poder ayudarte."
              />
            </ListItem>
          </List>

          <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
            b) Información que recopilamos automáticamente con tu permiso:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <LocationIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Datos de Ubicación Precisa"
                secondary="La función principal de la Aplicación es guiarte por Sevilla. Para ello, con tu consentimiento explícito, recopilaremos datos de tu ubicación (GPS, Wi-Fi, redes móviles). Esta información solo se recopilará mientras la aplicación esté en uso activo."
              />
            </ListItem>
          </List>

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.main', color: 'white' }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              📍 Uso de tu ubicación:
            </Typography>
            <Typography variant="body2" component="div">
              • Mostrarte tu posición en un mapa<br />
              • Ofrecerte indicaciones para llegar a puntos de interés<br />
              • Sugerirte lugares, eventos o servicios cercanos relevantes para tu experiencia Erasmus
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              Nunca compartiremos tu ubicación precisa en tiempo real con otros usuarios sin tu permiso.
            </Typography>
          </Paper>

          <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
            Datos de Uso y del Dispositivo:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Recopilamos información sobre cómo interactúas con la Aplicación, como las funciones que utilizas, 
            el tiempo que pasas en la app, así como información técnica de tu dispositivo (modelo, sistema operativo, 
            identificadores únicos del dispositivo y datos de fallos o "crash logs") para mejorar la estabilidad y el rendimiento.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 2. Cómo Utilizamos tu Información */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            🎯 2. Cómo Utilizamos tu Información
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Usamos la información recopilada con los siguientes propósitos:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="✅ Para prestar el servicio"
                secondary="Crear y gestionar tu cuenta, permitirte iniciar sesión, y recuperar tu contraseña si la olvidas."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="✅ Para proporcionar las funcionalidades principales"
                secondary="Usar tu ubicación para ofrecerte los servicios de guía y acompañamiento en Sevilla."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="✅ Para comunicarnos contigo"
                secondary="Enviarte correos electrónicos importantes relacionados con tu cuenta (como confirmación de registro, restablecimiento de contraseña) o avisos sobre el servicio."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="✅ Para mejorar la Aplicación"
                secondary="Analizar el uso de la app para entender qué funcionalidades son más populares, solucionar errores y planificar futuras mejoras."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="✅ Para garantizar la seguridad"
                secondary="Proteger la seguridad de nuestros usuarios y de la plataforma."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* 3. Base Legal para el Tratamiento de Datos (RGPD) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            ⚖️ 3. Base Legal para el Tratamiento de Datos (RGPD)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Tratamos tus datos personales basándonos en las siguientes bases legales:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Consentimiento"
                secondary="Para el tratamiento de datos sensibles como tu ubicación precisa. Siempre te pediremos permiso antes de acceder a ella."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Necesidad contractual"
                secondary="Para cumplir con los términos de servicio y proporcionarte las funcionalidades básicas para las que te registraste (gestión de cuenta)."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Interés legítimo"
                secondary="Para mejorar la aplicación, realizar análisis y garantizar la seguridad, siempre que nuestros intereses no prevalezcan sobre tus derechos y libertades."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* 4. Con Quién Compartimos tu Información */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            🔗 4. Con Quién Compartimos tu Información
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.main', color: 'white' }}>
            <Typography variant="body2" fontWeight={600}>
              ⚠️ No vendemos ni alquilamos tus datos personales a terceros.
            </Typography>
          </Paper>

          <Typography variant="body1" paragraph>
            Sin embargo, podemos compartir información con proveedores de servicios que nos ayudan a operar la Aplicación, tales como:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Proveedores de Hosting"
                secondary="Nuestra aplicación y base de datos están alojadas en servicios en la nube como Vercel y NEON."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Proveedores de Mapas y Geolocalización"
                secondary="Para ofrecerte los servicios de mapas, utilizamos APIs de terceros como Google Maps o Mapbox."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Requerimientos Legales"
                secondary="Podremos divulgar tu información si así lo exige la ley o una orden judicial válida."
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Estos proveedores están obligados contractualmente a proteger tu información y solo pueden usarla 
            para los fines específicos para los que fueron contratados.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 5. Seguridad de los Datos */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            🔒 5. Seguridad de los Datos
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <SecurityIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Medidas de seguridad implementadas:
            </Typography>
          </Stack>
          <List dense>
            <ListItem>
              <ListItemText primary="• Uso de conexiones seguras (HTTPS)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Almacenamiento de contraseñas de forma cifrada (hashed)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Limitación del acceso a los datos personales solo al personal autorizado" />
            </ListItem>
          </List>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Sin embargo, ningún método de transmisión por Internet o de almacenamiento electrónico es 100% seguro.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 6. Retención de Datos */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            ⏳ 6. Retención de Datos
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Conservaremos tus datos personales mientras mantengas una cuenta activa en nuestra Aplicación.
          </Typography>
          <Typography variant="body1">
            Si decides eliminar tu cuenta, tus datos serán eliminados de forma permanente en un plazo de 
            <strong> 30 días</strong>, salvo que estemos obligados a conservarlos durante más tiempo por motivos legales.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 7. Tus Derechos como Usuario */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            ✅ 7. Tus Derechos como Usuario
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            De acuerdo con el RGPD, tienes los siguientes derechos sobre tus datos:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Derecho de Acceso"
                secondary="A solicitar una copia de los datos que tenemos sobre ti."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Derecho de Rectificación"
                secondary="A corregir cualquier dato que sea inexacto o incompleto."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Derecho de Supresión (Derecho al olvido)"
                secondary="A solicitar la eliminación de tu cuenta y todos tus datos personales."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Derecho a la Limitación del Tratamiento"
                secondary="A solicitar que limitemos el uso de tus datos."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Derecho a la Portabilidad"
                secondary="A recibir tus datos en un formato estructurado y de uso común."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Derecho de Oposición"
                secondary="A oponerte a que usemos tus datos para ciertos fines."
              />
            </ListItem>
          </List>

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="body2">
              Puedes ejercer la mayoría de estos derechos a través de la configuración de tu cuenta en la Aplicación 
              o contactándonos directamente en <strong>rovetta215@gmail.com</strong>
            </Typography>
          </Paper>
        </AccordionDetails>
      </Accordion>

      {/* 8. Privacidad de los Menores */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            👶 8. Privacidad de los Menores
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Nuestros servicios están dirigidos a <strong>mayores de 16 años</strong>.
          </Typography>
          <Typography variant="body1" paragraph>
            No recopilamos de forma intencionada información personal de menores de 16 años. Si detectamos que 
            hemos recopilado datos de un menor sin el consentimiento de sus padres o tutores, tomaremos las 
            medidas necesarias para eliminarlos.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 9. Cambios en esta Política de Privacidad */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            🔄 9. Cambios en esta Política de Privacidad
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" paragraph>
            Podemos actualizar esta política ocasionalmente. Te notificaremos de cualquier cambio significativo 
            publicando la nueva política en esta página y, si los cambios son sustanciales, te avisaremos por 
            correo electrónico o mediante una notificación dentro de la Aplicación.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 10. Contacto */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <ContactIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight={600}>
            📧 10. Contacto
          </Typography>
        </Stack>
        <Typography variant="body1" paragraph>
          Si tienes alguna pregunta sobre esta Política de Privacidad, por favor, contacta con nosotros en:
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
          <Typography variant="h6" fontWeight={600} color="primary.dark">
            rovetta215@gmail.com
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Responsable: Romolo Rovetta
          </Typography>
        </Paper>
      </Paper>

      {/* Botón de volver */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <M3Button
          m3variant="filled"
          onClick={() => router.back()}
          sx={{ minWidth: 200 }}
        >
          Volver
        </M3Button>
      </Box>

      {/* Footer legal */}
      <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 4 }}>
        © 2025 Barrio de oportunidades. Esta política cumple con el RGPD (Reglamento (UE) 2016/679).
      </Typography>
    </Container>
  );
}
