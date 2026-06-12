'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, Avatar, Skeleton, Chip } from '@mui/material';
import { PhotoLibrary as PhotoIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';

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

export default function AlbumSection() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/photos?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Álbum
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, overflow: 'hidden', px: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={140}
              height={140}
              sx={{ borderRadius: 3, flexShrink: 0 }}
              animation="wave"
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Álbum
          </Typography>
          <Chip
            label={photos.length}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'primary.main', color: 'primary.contrastText' }}
          />
        </Box>
        <Link href="/album" passHref style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'medium' }}>
              Ver todo
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Box>
        </Link>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          px: 2,
          pb: 1,
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {photos.slice(0, 10).map((photo) => (
          <Link href="/album" key={photo.id} passHref style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Card
              sx={{
                position: 'relative',
                width: 140,
                height: 140,
                overflow: 'hidden',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                scrollSnapAlign: 'start',
                transition: 'transform 0.2s ease',
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption || ''}
                  fill
                  sizes="140px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>

              {photo.caption && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 0.75,
                    pt: 2,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 'medium',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {photo.caption}
                  </Typography>
                </Box>
              )}

              {/* User avatar */}
              <Avatar
                src={photo.user.avatarUrl || undefined}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  border: '2px solid rgba(255,255,255,0.8)',
                  fontSize: '0.6rem',
                }}
              >
                {getInitials(photo.user.firstName, photo.user.lastName)}
              </Avatar>
            </Card>
          </Link>
        ))}
      </Box>
    </Box>
  );
}
