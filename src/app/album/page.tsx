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
  PlayArrow as PlayIcon,
  Videocam as VideoIcon,
} from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import PageTransition from '@/components/layout/PageTransition';

import { useAuth } from '@/context/AuthContext';

interface School {
  id: number;
  name: string;
}

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  type: 'image' | 'video';
  duration: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
  schoolId: number | null;
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

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [previewTypes, setPreviewTypes] = useState<('image' | 'video')[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { user, isLoading } = useAuth();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const swiperRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | 'all'>('all');
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  useEffect(() => {
    if (isAdmin && user) {
      fetchSchools();
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (!isLoading) {
      fetchPhotos();
    }
  }, [selectedSchoolId, isLoading]);

  const fetchSchools = async () => {
    try {
      setSchoolsLoading(true);
      const res = await fetch('/api/schools');
      const data = await res.json();
      if (res.ok) {
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setSchoolsLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchPhotos = async () => {
    try {
      let url = `/api/photos?t=${Date.now()}`;
      
      if (isAdmin && selectedSchoolId !== 'all') {
        url += `&schoolId=${selectedSchoolId}`;
      }

      const res = await fetch(url, {
        cache: 'no-store',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        showSnackbar(data.error || 'Error al cargar', 'error');
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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
      setPreviewTypes(files.map(file => file.type.startsWith('video/') ? 'video' : 'image'));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('files', file));
      if (caption) {
        selectedFiles.forEach(() => formData.append('captions', caption));
      }

      let res: Response;
      try {
        res = await fetch('/api/photos/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } catch (fetchError) {
        const msg = fetchError instanceof Error ? fetchError.message : 'No se pudo conectar al servidor';
        showSnackbar(`Error de red: ${msg}`, 'error');
        return;
      }

      const responseText = await res.text();

      if (res.ok) {
        const data = JSON.parse(responseText);
        const hasVideos = selectedFiles.some(f => f.type.startsWith('video/'));
        const hasImages = selectedFiles.some(f => f.type.startsWith('image/'));
        let msg = '';
        if (hasImages && hasVideos) msg = `${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''} subido${selectedFiles.length > 1 ? 's' : ''}`;
        else if (hasVideos) msg = `${selectedFiles.length} video${selectedFiles.length > 1 ? 's' : ''} subido${selectedFiles.length > 1 ? 's' : ''}`;
        else msg = `${selectedFiles.length} foto${selectedFiles.length > 1 ? 's' : ''} subida${selectedFiles.length > 1 ? 's' : ''}`;
        showSnackbar(msg, 'success');
        fetchPhotos();
        setOpenUploadDialog(false);
        setSelectedFiles([]);
        setCaption('');
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setPreviewTypes([]);
      } else {
        let errorMsg = `Error del servidor (${res.status})`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) errorMsg = errorData.error;
          if (errorData.details) errorMsg += ` - ${errorData.details}`;
        } catch {}
        showSnackbar(errorMsg, 'error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      showSnackbar(`Error inesperado: ${message}`, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
        showSnackbar('Eliminado correctamente', 'success');
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

  const photoCount = photos.filter(p => p.type === 'image').length;
  const videoCount = photos.filter(p => p.type === 'video').length;

  const skeletonHeights = [180, 220, 160, 200, 240, 170, 190, 210];

  return (
    <PageTransition>
      <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', pb: 10 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ fontFamily: 'var(--font-bricolage, "Bricolage Grotesque", Inter, sans-serif)' }}
            >
              Álbum
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {photos.length} {photos.length === 1 ? 'archivo' : 'archivos'}
              {photoCount > 0 && videoCount > 0 && <> · {photoCount} fotos, {videoCount} videos</>}
              {photoCount > 0 && videoCount === 0 && photos.length === 1 && <> · foto</>}
              {photoCount > 0 && videoCount === 0 && photos.length > 1 && <> · fotos</>}
              {photoCount === 0 && videoCount > 0 && photos.length === 1 && <> · video</>}
              {photoCount === 0 && videoCount > 0 && photos.length > 1 && <> · videos</>}
              {isAdmin && selectedSchoolId !== 'all' && schools.find(s => s.id === selectedSchoolId) && (
                <> · {schools.find(s => s.id === selectedSchoolId)?.name}</>
              )}
              {isAdmin && selectedSchoolId === 'all' && <> · Todas las escuelas</>}
              {!isAdmin && user?.schoolId && photos[0]?.user?.school && <> · {photos[0]?.user?.school?.name}</>}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton onClick={fetchPhotos} sx={{ color: 'text.secondary' }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* School Filter Chips (Admin only) */}
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            <Chip
              label="Todas"
              onClick={() => setSelectedSchoolId('all')}
              color={selectedSchoolId === 'all' ? 'primary' : 'default'}
              variant={selectedSchoolId === 'all' ? 'filled' : 'outlined'}
              size="small"
              sx={{ flexShrink: 0 }}
            />
            {schoolsLoading && (
              <CircularProgress size={20} sx={{ alignSelf: 'center' }} />
            )}
            {schools.map((school) => (
              <Chip
                key={school.id}
                label={school.name}
                onClick={() => setSelectedSchoolId(school.id)}
                color={selectedSchoolId === school.id ? 'primary' : 'default'}
                variant={selectedSchoolId === school.id ? 'filled' : 'outlined'}
                size="small"
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Box>
        )}

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
                Aún no hay contenido
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toca + para compartir fotos o videos
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
                  {(user?.id === photo.user.id || user?.role?.toLowerCase() === 'admin') && (
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

                  {/* Media */}
                  <Box sx={{ position: 'relative', width: '100%', paddingTop: photo.width && photo.height ? `${(photo.height / photo.width) * 100}%` : '100%' }}>
                    {photo.type === 'video' ? (
                      <>
                        <Image
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.caption || ''}
                          fill
                          sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                          style={{ objectFit: 'cover' }}
                        />
                        {/* Play overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.25)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255,255,255,0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                          >
                            <PlayIcon sx={{ fontSize: 32, color: '#1a1a1a', ml: 0.5 }} />
                          </Box>
                        </Box>
                        {/* Duration badge */}
                        {photo.duration && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 6,
                              left: 6,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                            }}
                          >
                            {formatDuration(photo.duration)}
                          </Box>
                        )}
                      </>
                    ) : (
                      <Image
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.caption || ''}
                        fill
                        sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
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
                    {isAdmin && selectedSchoolId === 'all' && photo.user.school && (
                      <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>
                        · {photo.user.school.name}
                      </Box>
                    )}
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
            bottom: 88,
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
            setSelectedFiles([]);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
            setPreviewTypes([]);
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            Subir {selectedFiles.length > 0 ? `${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''}` : 'fotos y videos'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <input
                ref={fileInputRef}
                accept="image/*,video/*"
                type="file"
                multiple
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
                {previewUrls.length > 0 ? (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                      {previewUrls.map((url, i) => (
                        <Box key={i} sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0, borderRadius: 2, overflow: 'hidden' }}>
                          {previewTypes[i] === 'video' ? (
                            <video
                              src={url}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              muted
                            />
                          ) : (
                            <Image
                              src={url}
                              alt={`preview-${i}`}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          )}
                          {previewTypes[i] === 'video' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0,0,0,0.3)',
                              }}
                            >
                              <PlayIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''} seleccionado{selectedFiles.length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <VideoIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Toca para seleccionar fotos o videos (máx. 10)
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      Videos máx. 50MB
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
              disabled={uploading || selectedFiles.length === 0}
              startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {uploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lightbox with Swiper */}
        <Dialog
          open={lightboxOpen}
          onClose={() => {
            setLightboxOpen(false);
            // Pause any playing videos
            Object.values(videoRefs.current).forEach(v => {
              if (v) v.pause();
            });
          }}
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
            onClick={() => {
              setLightboxOpen(false);
              Object.values(videoRefs.current).forEach(v => {
                if (v) v.pause();
              });
            }}
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
              onSlideChange={(swiper) => {
                setLightboxIndex(swiper.activeIndex);
                // Pause videos when sliding away
                Object.values(videoRefs.current).forEach(v => {
                  if (v) v.pause();
                });
              }}
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
                        {photo.type === 'video' ? (
                          <video
                            ref={el => { videoRefs.current[photo.id] = el; }}
                            src={photo.url}
                            controls
                            playsInline
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              background: '#000',
                            }}
                          />
                        ) : (
                          <Image
                            src={photo.url}
                            alt={photo.caption || ''}
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="100vw"
                          />
                        )}
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
                            {photo.type === 'video' && photo.duration && (
                              <> · {formatDuration(photo.duration)}</>
                            )}
                            {isAdmin && selectedSchoolId === 'all' && photo.user.school && (
                              <> · {photo.user.school.name}</>
                            )}
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
