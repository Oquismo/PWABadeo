import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Rating, Box } from '@mui/material';
import { useTranslation } from '@/hooks/useTranslation';

const GOOGLE_PLACE_ID = 'ChIJvwFmR2JtEg0Rsj7IpWyGayQ'; // Barrio de Oportunidades (BaDeO)

export default function ReviewDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rating, setRating] = useState<number | null>(5);
  const { t } = useTranslation();

  const handleSend = () => {
  window.open(`https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`, '_blank');
  onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('review.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Rating
            value={rating}
            onChange={(_, value) => setRating(value)}
            size="large"
          />
        </Box>
        <Box sx={{ mt: 2, color: 'text.secondary', fontSize: '0.95rem', textAlign: 'center' }}>
          {t('review.motivationText')}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSend} variant="contained" color="primary">{t('common.continue')}</Button>
      </DialogActions>
    </Dialog>
  );
}
