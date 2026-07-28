import React from 'react';
import { Box, Paper, Typography, Grid, Card, CardMedia, CardContent, Chip } from '@mui/material';

export default function UploadsPage() {
  const uploads = [
    { id: 'VID-8001', candidate: 'Alex Johnson', tag: 'Kitchen', duration: '45s', status: 'approved', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80' },
    { id: 'VID-8002', candidate: 'Maria Garcia', tag: 'Bedroom', duration: '60s', status: 'approved', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&auto=format&fit=crop&q=80' },
    { id: 'VID-8003', candidate: 'David Kim', tag: 'Living Room', duration: '30s', status: 'pending', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=80' },
    { id: 'VID-8004', candidate: 'Emma Watson', tag: 'Office Desk', duration: '90s', status: 'rejected', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&auto=format&fit=crop&q=80' },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        Video Collections Gallery
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        All candidate video logs recorded for Acme Video Solutions.
      </Typography>

      <Grid container spacing={3}>
        {uploads.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <Card sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <CardMedia component="img" height="140" image={item.img} alt={item.id} />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">{item.id}</Typography>
                  <Chip label={item.status} size="small" color={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'error' : 'warning'} />
                </Box>
                <Typography variant="body2" color="text.secondary">Candidate: {item.candidate}</Typography>
                <Typography variant="caption" color="primary.light">Environment: {item.tag} • {item.duration}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
