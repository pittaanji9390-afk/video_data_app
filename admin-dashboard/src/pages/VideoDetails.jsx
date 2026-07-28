import React from 'react';
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
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  AdminPanelSettings,
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
} from '@mui/icons-material';

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

// Static Dummy Video Data Repository
const DUMMY_VIDEO_DETAILS = {
  'VID-9001': {
    id: 'VID-9001',
    candidate_name: 'John Doe',
    candidate_code: 'CND-001',
    vendor_name: 'Acme Video Solutions',
    vendor_code: 'VENDOR-001',
    environment_tag: 'Kitchen',
    duration: '45 mins 12 secs',
    upload_date: '2026-07-28 14:30:22 EST',
    recording_date: '2026-07-28 10:15:00 EST',
    latitude: '37.774900',
    longitude: '-122.419400',
    status: 'Approved',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  'VID-9002': {
    id: 'VID-9002',
    candidate_name: 'Sarah Smith',
    candidate_code: 'CND-002',
    vendor_name: 'Apex Data Services',
    vendor_code: 'VENDOR-002',
    environment_tag: 'Bedroom',
    duration: '30 mins 05 secs',
    upload_date: '2026-07-28 12:00:10 EST',
    recording_date: '2026-07-28 09:45:00 EST',
    latitude: '40.712800',
    longitude: '-74.006000',
    status: 'Rejected',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
};

// Default fallback video data if ID is not matched
const DEFAULT_VIDEO = {
  id: 'VID-9001',
  candidate_name: 'John Doe',
  candidate_code: 'CND-001',
  vendor_name: 'Acme Video Solutions',
  vendor_code: 'VENDOR-001',
  environment_tag: 'Kitchen',
  duration: '45 mins 12 secs',
  upload_date: '2026-07-28 14:30:22 EST',
  recording_date: '2026-07-28 10:15:00 EST',
  latitude: '37.774900',
  longitude: '-122.419400',
  status: 'Approved',
  video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
};

export default function VideoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const video = DUMMY_VIDEO_DETAILS[id] || { ...DEFAULT_VIDEO, id: id || 'VID-9001' };

  const getStatusChip = (status) => {
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
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/videos')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <VideocamOutlined sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Video Details ({video.id})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Read-only candidate recording and geolocation metadata preview
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutOutlined />}
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Header Action Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/videos')}
                sx={{ textTransform: 'none' }}
              >
                Back to Video Management
              </Button>
              <Typography variant="h5" fontWeight="bold">
                Video File: {video.id}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                QC Status:
              </Typography>
              {getStatusChip(video.status)}
            </Box>
          </Paper>

          {/* 2-Column Responsive Grid */}
          <Grid container spacing={4}>
            {/* Left Column: HTML5 Video Player */}
            <Grid item xs={12} lg={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Video Media Playback
                </Typography>

                {/* HTML5 Video Element */}
                <Box
                  sx={{
                    width: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: '#000',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  <video
                    controls
                    width="100%"
                    height="auto"
                    poster=""
                    style={{ display: 'block', maxHeight: '480px' }}
                  >
                    <source src={video.video_url} type="video/mp4" />
                    Your browser does not support HTML5 video playback.
                  </video>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Read-Only Metadata Summary */}
            <Grid item xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Metadata Summary (Read-Only)
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Candidate Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonOutlined sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        CANDIDATE NAME
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {video.candidate_name} ({video.candidate_code})
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  {/* Vendor Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StorefrontOutlined sx={{ color: 'secondary.main', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        ASSIGNED VENDOR
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {video.vendor_name} ({video.vendor_code})
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  {/* Environment Tag */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SellOutlined sx={{ color: 'warning.main', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                        ENVIRONMENT TAG
                      </Typography>
                      <Chip label={video.environment_tag} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    </Box>
                  </Box>
                  <Divider />

                  {/* Duration */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTimeOutlined sx={{ color: 'info.main', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        DURATION
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {video.duration}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  {/* Upload Date & Recording Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarTodayOutlined sx={{ color: 'success.main', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        UPLOAD & RECORDING DATES
                      </Typography>
                      <Typography variant="body2">
                        <strong>Upload Date:</strong> {video.upload_date}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Recording Date:</strong> {video.recording_date}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  {/* GPS Coordinates */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOnOutlined sx={{ color: 'error.main', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        GPS COORDINATES
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: 'primary.light', fontFamily: 'monospace' }}>
                        Lat: {video.latitude}, Long: {video.longitude}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
