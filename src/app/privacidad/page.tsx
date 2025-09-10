import React from "react";
import { Container, Box, Typography, Link } from "@mui/material";

export default function PrivacyPolicyApp() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ background: '#fff', borderRadius: 4, boxShadow: 2, p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Política de Privacidad
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Esta política de privacidad describe cómo la app <strong>Barrio de Oportunidades</strong> recopila, utiliza y protege la información de los usuarios.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>1. Información que recopilamos</Typography>
        <ul>
          <li>Datos de registro (nombre, correo electrónico, etc.)</li>
          <li>Información de uso y actividad dentro de la app</li>
          <li>Datos de ubicación (si el usuario lo permite)</li>
        </ul>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>2. Uso de la información</Typography>
        <ul>
          <li>Mejorar la experiencia y los servicios ofrecidos</li>
          <li>Personalizar el contenido y las notificaciones</li>
          <li>Contactar al usuario en caso necesario</li>
        </ul>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>3. Protección de datos</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          La información se almacena de forma segura y no se comparte con terceros salvo obligación legal o consentimiento explícito del usuario.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>4. Derechos del usuario</Typography>
        <ul>
          <li>Acceder, modificar o eliminar sus datos personales</li>
          <li>Solicitar información sobre el tratamiento de sus datos</li>
          <li>Retirar el consentimiento en cualquier momento</li>
        </ul>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>5. Cambios en la política</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Nos reservamos el derecho de modificar esta política. Se notificará a los usuarios sobre cambios importantes.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Contacto</Typography>
        <Typography variant="body1">
          Para cualquier duda o solicitud relacionada con la privacidad, puedes escribir a <Link href="mailto:info@barriodeoportunidades.com">info@barriodeoportunidades.com</Link>.
        </Typography>
      </Box>
    </Container>
  );
}
