'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Skeleton,
  Chip,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  PhotoLibrary as PhotoIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/layout/PageTransition';

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export default function AlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos();
    try {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='));
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        setCurrentUserId(userData.id);
      }
    } catch (e) {
      console.error('Error reading user cookie:', e);
    }
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/photos?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Fetch photos failed:', data.error, 'status:', res.status);
        return;
      }
      console.log('Fetched photos:', data.photos?.length, data.photos);
      setPhotos(data.photos);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (caption) formData.append('caption', caption);

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Upload success, photo:', data.photo?.id, data.photo?.url);
        fetchPhotos();
        setOpenUploadDialog(false);
        setSelectedFile(null);
        setCaption('');
      } else {
        const errorData = await res.json();
        console.error('Upload failed:', errorData.error, 'status:', res.status);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex(prev => (prev - 1 + photos.length) % photos.length);
    } else {
      setLightboxIndex(prev => (prev + 1) % photos.length);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', pb: 10 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' }}
            >
              Álbum de Fotos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comparte tus mejores momentos con la comunidad
            </Typography>
          </Box>
          <IconButton onClick={fetchPhotos} sx={{ color: 'text.secondary' }}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, textAlign: 'center', background: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={(theme) => ({
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)',
                })}
              >
                {photos.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fotos
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Debug info - siempre visible */}
        <Card sx={{ mb: 2, bgcolor: 'rgba(255,0,0,0.1)', border: '1px solid', borderColor: 'error.main' }}>
          <CardContent>
            <Typography variant="caption" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              DEBUG: loading={String(loading)} count={photos.length}{'\n'}
              {photos.map(p => `[${p.id}] ${p.thumbnailUrl || p.url}`).join('\n')}
            </Typography>
          </CardContent>
        </Card>

        {/* Masonry Grid */}
        {loading ? (
          <Box sx={{ columns: { xs: 2, sm: 3, md: 4 }, columnGap: 2 }}>
            {[...Array(8)].map((_, i) => (
              <Box key={i} sx={{ mb: 2, breakInside: 'avoid' }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={150 + Math.random() * 100}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            ))}
          </Box>
        ) : photos.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <PhotoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Aún no hay fotos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sé el primero en compartir un momento
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ columns: { xs: 2, sm: 3, md: 4 }, columnGap: 2 }}>
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{ marginBottom: 8, breakInside: 'avoid' }}
                >
                  <Card
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'transform 0.25s cubic-bezier(0.2,0,0,1), box-shadow 0.25s cubic-bezier(0.2,0,0,1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                      },
                    }}
                    onClick={() => openLightbox(index)}
                  >
                    {/* Delete button */}
                    {currentUserId === photo.user.id && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          zIndex: 2,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}

                    {/* Image */}
                    <Box sx={{ position: 'relative', width: '100%', aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '1 / 1' }}>
                      <Image
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.caption || ''}
                        fill
                        sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>

                    {/* Caption overlay */}
                    {photo.caption && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 1,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          color: 'white',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                          {photo.caption}
                        </Typography>
                      </Box>
                    )}
                  </Card>

                  {/* User info below photo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, px: 0.5 }}>
                    <Avatar
                      src={photo.user.avatarUrl || undefined}
                      sx={{ width: 20, height: 20, mr: 0.5, bgcolor: 'primary.main', fontSize: '0.6rem' }}
                    >
                      {getInitials(photo.user.firstName, photo.user.lastName)}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                      {photo.user.firstName} {photo.user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDate(photo.createdAt)}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}

        {/* FAB - Upload */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 80, right: 16 }}
          onClick={() => setOpenUploadDialog(true)}
        >
          <AddIcon />
        </Fab>

        {/* Upload Dialog */}
        <Dialog
          open={openUploadDialog}
          onClose={() => setOpenUploadDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Subir foto</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <input
                accept="image/*"
                type="file"
                id="photo-upload"
                hidden
                onChange={handleFileSelect}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ py: 3, mb: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Seleccionar imagen'}
                </Button>
              </label>
              {selectedFile && (
                <Box sx={{ position: 'relative', width: '100%', height: 200, mb: 2 }}>
                  <Image
                    src={URL.createObjectURL(selectedFile)}
                    alt="preview"
                    fill
                    style={{ objectFit: 'contain', borderRadius: '8px' }}
                  />
                </Box>
              )}
              <TextField
                label="Descripción (opcional)"
                placeholder="¿Qué estás viendo?"
                fullWidth
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUploadDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lightbox */}
        <Dialog
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          fullScreen
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'rgba(0,0,0,0.95)',
              boxShadow: 'none',
            },
          }}
        >
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
            }}
            onClick={() => setLightboxOpen(false)}
          >
            <CloseIcon />
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
            }}
            onClick={() => navigateLightbox('prev')}
          >
            <ChevronLeftIcon />
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
            }}
            onClick={() => navigateLightbox('next')}
          >
            <ChevronRightIcon />
          </IconButton>

          {photos[lightboxIndex] && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 4,
              }}
            >
              <Box sx={{ position: 'relative', maxWidth: '100%', maxHeight: '80vh', width: '100%', height: '80vh' }}>
                <Image
                  src={photos[lightboxIndex].url}
                  alt={photos[lightboxIndex].caption || ''}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="100vw"
                  priority
                />
              </Box>
              {photos[lightboxIndex].caption && (
                <Typography
                  variant="h6"
                  sx={{ color: 'white', mt: 2, textAlign: 'center' }}
                >
                  {photos[lightboxIndex].caption}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Avatar
                  src={photos[lightboxIndex].user.avatarUrl || undefined}
                  sx={{ mr: 1, bgcolor: 'primary.main' }}
                >
                  {getInitials(
                    photos[lightboxIndex].user.firstName,
                    photos[lightboxIndex].user.lastName
                  )}
                </Avatar>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {photos[lightboxIndex].user.firstName} {photos[lightboxIndex].user.lastName}
                  {' · '}
                  {formatDate(photos[lightboxIndex].createdAt)}
                </Typography>
              </Box>
              <Chip
                label={`${lightboxIndex + 1} / ${photos.length}`}
                sx={{ mt: 2, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                variant="outlined"
              />
            </Box>
          )}
        </Dialog>
      </Box>
    </PageTransition>
  );
}
