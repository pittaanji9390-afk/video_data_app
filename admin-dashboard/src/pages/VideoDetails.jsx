import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  LogoutOutlined,
  ArrowBack,
  VideocamOutlined,
  PersonOutlined,
  StorefrontOutlined,
  SellOutlined,
  AccessTimeOutlined,
  CalendarTodayOutlined,
  LocationOnOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  Refresh,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#0ea5e9',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
});

export default function VideoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getVideoById(id);
      setVideo(res.data || res);
    } catch (err) {
      setError(err.message || `Failed to fetch video details for ID: ${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const getStatusChip = (status = '') => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Chip icon={<CheckCircleOutlined />} label="APPROVED" color="success" sx={{ fontWeight: 'bold' }} />;
      case 'REJECTED':
        return <Chip icon={<CancelOutlined />} label="REJECTED" color="error" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip icon={<HourglassEmptyOutlined />} label="PENDING QC" color="warning" sx={{ fontWeight: 'bold' }} />;
    }
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        {/* Navigation Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/videos')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <VideocamOutlined sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Video Details ({id})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Read-only metadata connected to backend REST API
              </Typography>
            </Box>

            <IconButton color="primary" onClick={fetchDetails} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>

            <Button variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12, gap: 2 }}>
              <CircularProgress color="primary" />
              <Typography color="text.secondary">Loading video details from API...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchDetails}>Retry</Button>} sx={{ mb: 4, borderRadius: 3 }}>
              {error}
            </Alert>
          ) : !video ? (
            <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
              Video record not found on backend.
            </Alert>
          ) : (
            <>
              <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/videos')} sx={{ textTransform: 'none' }}>
                    Back to Videos
                  </Button>
                  <Typography variant="h5" fontWeight="bold">
                    Video ID: {video.id}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">QC Status:</Typography>
                  {getStatusChip(video.status || 'Pending')}
                </Box>
              </Paper>

              <Grid container spacing={4}>
                <Grid item xs={12} lg={7}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Video Media Playback</Typography>
                    <Box sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', bgcolor: '#000', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                      <video controls width="100%" height="auto" style={{ display: 'block', maxHeight: '480px' }}>
                        <source src={video.file_path || video.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'} type="video/mp4" />
                        Your browser does not support HTML5 video playback.
                      </video>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Backend Metadata Summary</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PersonOutlined sx={{ color: 'primary.main', fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">CANDIDATE ID</Typography>
                          <Typography variant="body1" fontWeight="bold">{video.candidate_name || video.candidate_id || 'N/A'}</Typography>
                        </Box>
                      </Box>
                      <Divider />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <StorefrontOutlined sx={{ color: 'secondary.main', fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">VENDOR</Typography>
                          <Typography variant="body1" fontWeight="bold">{video.vendor_name || video.vendor_id || 'N/A'}</Typography>
                        </Box>
                      </Box>
                      <Divider />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SellOutlined sx={{ color: 'warning.main', fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>ENVIRONMENT TAG</Typography>
                          <Chip label={video.environment_tag || 'Dataset'} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                        </Box>
                      </Box>
                      <Divider />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AccessTimeOutlined sx={{ color: 'info.main', fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">DURATION</Typography>
                          <Typography variant="body1" fontWeight="bold">{video.duration_seconds ? `${video.duration_seconds} secs` : video.duration || 'N/A'}</Typography>
                        </Box>
                      </Box>
                      <Divider />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CalendarTodayOutlined sx={{ color: 'success.main', fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">CREATED AT</Typography>
                          <Typography variant="body2">{video.created_at ? new Date(video.created_at).toLocaleString() : 'N/A'}</Typography>
                        </Box>
                      </Box>
                      <Divider />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocationOnOutlined sx={{ color: 'error.main', fontSize: 24 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">GPS COORDINATES</Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: 'primary.light', fontFamily: 'monospace' }}>
                            Lat: {video.latitude || video.gps_latitude || '0.0'}, Long: {video.longitude || video.gps_longitude || '0.0'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
