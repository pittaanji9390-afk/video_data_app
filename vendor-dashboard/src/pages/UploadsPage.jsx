import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip, Button } from '@mui/material';

export default function UploadsPage() {
  const [filter, setFilter] = useState('All');
  const [uploads, setUploads] = useState([]);

  const loadUploads = () => {
    const raw = localStorage.getItem('platform_qc_submissions');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const mapped = parsed.map((item) => ({
          id: item.id || `VID-${Math.floor(Math.random() * 9000 + 1000)}`,
          candidate: item.candidateName || 'Vasavi Kandula',
          tag: item.env || 'Kitchen',
          duration: item.duration || '30:00 Mins',
          status: (item.status || 'pending').toLowerCase(),
          img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80',
        }));
        setUploads(mapped);
        return;
      } catch (e) {
        console.error('Error parsing qc submissions:', e);
      }
    }
    setUploads([
      { id: 'VID-8001', candidate: 'Vasavi Kandula', tag: 'Kitchen', duration: '30:00 Mins', status: 'approved', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80' },
      { id: 'VID-8002', candidate: 'Rahul Kumar', tag: 'Bedroom', duration: '24:18 Mins', status: 'pending', img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300&auto=format&fit=crop&q=80' },
      { id: 'VID-8003', candidate: 'Anji', tag: 'Garden', duration: '30:00 Mins', status: 'approved', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=80' },
      { id: 'VID-8004', candidate: 'Vasavi Kandula', tag: 'Bathroom', duration: '12:00 Mins', status: 'rejected', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&auto=format&fit=crop&q=80' },
    ]);
  };

  useEffect(() => {
    loadUploads();
    let bc;
    try {
      bc = new BroadcastChannel('platform_realtime_channel');
      bc.onmessage = () => {
        loadUploads();
      };
    } catch (_) {}
    window.addEventListener('storage', loadUploads);
    window.addEventListener('qc_store_updated', loadUploads);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', loadUploads);
      window.removeEventListener('qc_store_updated', loadUploads);
    };
  }, []);

  const filteredUploads = uploads.filter(
    (item) => filter === 'All' || item.status.toLowerCase() === filter.toLowerCase()
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
            Video Collections Gallery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All candidate video logs recorded for Acme Video Solutions.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            const headers = ['Video ID', 'Candidate', 'Environment Tag', 'Duration', 'Status'];
            const rows = uploads.map((u) => [u.id, u.candidate, u.tag, u.duration, u.status]);
            const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `vendor_video_uploads.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          sx={{ borderRadius: 3, textTransform: 'none', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)' }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Upload Status Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <Chip
            key={status}
            label={status}
            color={
              filter === status
                ? status === 'Rejected'
                  ? 'error'
                  : status === 'Approved'
                  ? 'success'
                  : status === 'Pending'
                  ? 'warning'
                  : 'primary'
                : 'default'
            }
            variant={filter === status ? 'filled' : 'outlined'}
            onClick={() => setFilter(status)}
            sx={{ fontWeight: 'bold', cursor: 'pointer', color: filter === status ? '#fff' : '#94a3b8' }}
          />
        ))}
      </Box>

      <Grid container spacing={3}>
        {filteredUploads.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <Card sx={{ bgcolor: '#1e293b', color: '#fff', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <CardMedia component="img" height="140" image={item.img} alt={item.id} />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">{item.id}</Typography>
                  <Chip
                    label={item.status.toUpperCase()}
                    size="small"
                    color={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'error' : 'warning'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">Candidate: {item.candidate}</Typography>
                <Typography variant="caption" color="primary.light">Environment: {item.tag} • {item.duration}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredUploads.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
          No videos found with status "{filter}".
        </Typography>
      )}
    </Box>
  );
}
