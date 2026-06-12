'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  PhotoLibrary as PhotoIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
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
    school: {
      id: number;
      name: string;
    } | null;
  };
}

export default function AlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const swiperRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/photos?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        showSnackbar(data.error || 'Error al cargar fotos', 'error');
        return;
      }
      setPhotos(data.photos);
    } catch (error) {
      showSnackbar('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
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
        showSnackbar('Foto subida correctamente', 'success');
        fetchPhotos();
        setOpenUploadDialog(false);
        setSelectedFile(null);
        setCaption('');
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      } else {
        const errorData = await res.json();
        showSnackbar(errorData.error || 'Error al subir', 'error');
      }
    } catch (error) {
      showSnackbar('Error de conexión', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    try {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        fetchPhotos();
        showSnackbar('Error al eliminar', 'error');
      } else {
        showSnackbar('Foto eliminada', 'success');
      }
    } catch (error) {
      fetchPhotos();
      showSnackbar('Error de conexión', 'error');
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

  const skeletonHeights = [180, 220, 160, 200, 240, 170, 190, 210];

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', pb: 10 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' }}
            >
              Álbum
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
            </Typography>
          </Box>
          <IconButton onClick={fetchPhotos} sx={{ color: 'text.secondary' }}>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Masonry Grid */}
        {loading ? (
          <Box sx={{ columns: { xs: 2, sm: 3, md: 4 }, columnGap: 1.5 }}>
            {skeletonHeights.map((h, i) => (
              <Box key={i} sx={{ mb: 1.5, breakInside: 'avoid' }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={h}
                  sx={{ borderRadius: 3 }}
                  animation="wave"
                />
              </Box>
            ))}
          </Box>
        ) : photos.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8, border: '1px dashed', borderColor: 'divider' }}>
            <CardContent>
              <PhotoIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Aún no hay fotos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toca + para compartir tu primer momento
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ columns: { xs: 2, sm: 3, md: 4 }, columnGap: 1.5 }}>
            {photos.map((photo) => (
              <Box
                key={photo.id}
                sx={{ mb: 1.5, breakInside: 'avoid' }}
                onClick={() => {
                  setLightboxIndex(photos.indexOf(photo));
                  setLightboxOpen(true);
                }}
              >
                <Card
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:active': {
                      transform: 'scale(0.97)',
                    },
                  }}
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
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        width: 28,
                        height: 28,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id);
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}

                  {/* Image */}
                  <Box sx={{ position: 'relative', width: '100%', paddingTop: photo.width && photo.height ? `${(photo.height / photo.width) * 100}%` : '100%' }}>
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
                        pt: 3,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        color: 'white',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'medium', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {photo.caption}
                      </Typography>
                    </Box>
                  )}
                </Card>

                {/* User info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.75, px: 0.5 }}>
                  <Avatar
                    src={photo.user.avatarUrl || undefined}
                    sx={{ width: 18, height: 18, mr: 0.5, bgcolor: 'primary.main', fontSize: '0.55rem' }}
                  >
                    {getInitials(photo.user.firstName, photo.user.lastName)}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {photo.user.firstName}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {formatDate(photo.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* FAB */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            boxShadow: '0 4px 12px rgba(196, 242, 120, 0.4)',
          }}
          onClick={() => setOpenUploadDialog(true)}
        >
          <AddIcon />
        </Fab>

        {/* Upload Dialog */}
        <Dialog
          open={openUploadDialog}
          onClose={() => {
            setOpenUploadDialog(false);
            setSelectedFile(null);
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>Subir foto</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <input
                ref={fileInputRef}
                accept="image/*"
                type="file"
                hidden
                onChange={handleFileSelect}
              />
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  py: 4,
                  mb: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 3,
                  flexDirection: 'column',
                  gap: 1,
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
                    <Image
                      src={previewUrl}
                      alt="preview"
                      fill
                      style={{ objectFit: 'cover', borderRadius: 12 }}
                    />
                  </Box>
                ) : (
                  <>
                    <AddIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Toca para seleccionar
                    </Typography>
                  </>
                )}
              </Button>
              <TextField
                label="Descripción (opcional)"
                placeholder="¿Qué estás viendo?"
                fullWidth
                size="small"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenUploadDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {uploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lightbox with Swiper */}
        <Dialog
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          fullScreen
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'black',
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
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
            onClick={() => setLightboxOpen(false)}
          >
            <CloseIcon />
          </IconButton>

          {photos.length > 0 && (
            <Swiper
              modules={[Navigation, Pagination, Zoom]}
              zoom
              pagination={{
                type: 'fraction',
                el: '.swiper-pagination-custom',
              }}
              initialSlide={lightboxIndex}
              onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              style={{ height: '100vh', width: '100%' }}
            >
              {photos.map((photo) => (
                <SwiperSlide key={photo.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100vh',
                      position: 'relative',
                    }}
                  >
                    <div className="swiper-zoom-container" style={{ width: '100%', height: '75vh' }}>
                      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Image
                          src={photo.url}
                          alt={photo.caption || ''}
                          fill
                          style={{ objectFit: 'contain' }}
                          sizes="100vw"
                        />
                      </Box>
                    </div>

                    {/* Info bar */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        pb: 4,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={photo.user.avatarUrl || undefined}
                          sx={{ mr: 1, bgcolor: 'primary.main', width: 32, height: 32 }}
                        >
                          {getInitials(photo.user.firstName, photo.user.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'medium' }}>
                            {photo.user.firstName} {photo.user.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {formatDate(photo.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                      {photo.caption && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'white',
                            maxWidth: '50%',
                            textAlign: 'right',
                            fontStyle: 'italic',
                          }}
                        >
                          "{photo.caption}"
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Custom pagination */}
          <Box
            className="swiper-pagination-custom"
            sx={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 'medium',
              bgcolor: 'rgba(0,0,0,0.4)',
              px: 2,
              py: 0.5,
              borderRadius: 2,
            }}
          />
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            iconMapping={{
              success: <CheckIcon fontSize="small" />,
              error: <ErrorIcon fontSize="small" />,
            }}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageTransition>
  );
}
