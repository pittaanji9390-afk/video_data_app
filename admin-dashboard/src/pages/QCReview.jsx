import React, { useState } from 'react';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
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
  LocationOnOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  FactCheckOutlined,
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

// Static Dummy Video Data Repository for QC Review
const DUMMY_QC_VIDEOS = {
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
    status: 'Pending',
    reject_reason: '',
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
    reject_reason: 'Audio is distorted and background noise is too loud',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
};

const DEFAULT_QC_VIDEO = {
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
  status: 'Pending',
  reject_reason: '',
  video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
};

export default function QCReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialVideo = DUMMY_QC_VIDEOS[id] || { ...DEFAULT_QC_VIDEO, id: id || 'VID-9001' };

  // Local State
  const [videoData, setVideoData] = useState(initialVideo);
  const [rejectReasonInput, setRejectReasonInput] = useState(initialVideo.reject_reason || '');
  const [reasonError, setReasonError] = useState('');

  // Confirmation Dialog State
  const [pendingDecision, setPendingDecision] = useState(null); // 'Approved' | 'Rejected' | null
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState(null);

  // Trigger Approve Confirmation
  const handleInitiateApprove = () => {
    setReasonError('');
    setPendingDecision('Approved');
    setConfirmDialogOpen(true);
  };

  // Trigger Reject Confirmation (Enforces Rejection Reason)
  const handleInitiateReject = () => {
    if (!rejectReasonInput.trim()) {
      setReasonError('A rejection reason is required before rejecting a video.');
      return;
    }
    setReasonError('');
    setPendingDecision('Rejected');
    setConfirmDialogOpen(true);
  };

  // Submit Final QC Decision Locally
  const handleConfirmDecision = () => {
    if (!pendingDecision) return;

    const newStatus = pendingDecision;
    const finalReason = newStatus === 'Rejected' ? rejectReasonInput.trim() : '';

    setVideoData((prev) => ({
      ...prev,
      status: newStatus,
      reject_reason: finalReason,
    }));

    setConfirmDialogOpen(false);
    setPendingDecision(null);

    setFeedbackAlert({
      type: newStatus === 'Approved' ? 'success' : 'error',
      message: `QC Decision Submitted! Video ${videoData.id} has been marked as "${newStatus.toUpperCase()}".`,
    });
  };

  const getStatusChip = (status) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Chip icon={<CheckCircleOutlined />} label="APPROVED" color="success" sx={{ fontWeight: 'bold' }} />;
      case 'REJECTED':
        return <Chip icon={<CancelOutlined />} label="REJECTED" color="error" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip icon={<HourglassEmptyOutlined />} label="PENDING QC REVIEW" color="warning" sx={{ fontWeight: 'bold' }} />;
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
            <FactCheckOutlined sx={{ mr: 1.5, color: 'warning.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Quality Control (QC) Video Review
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Audit video dataset quality, verify metadata, and approve or reject submissions
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

        {/* Main Content Container */}
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
                Back to Videos
              </Button>
              <Typography variant="h5" fontWeight="bold">
                QC Review File: {videoData.id}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Current QC Status:
              </Typography>
              {getStatusChip(videoData.status)}
            </Box>
          </Paper>

          {/* Feedback Alert Banner */}
          {feedbackAlert && (
            <Alert
              severity={feedbackAlert.type}
              onClose={() => setFeedbackAlert(null)}
              sx={{ mb: 4, borderRadius: 3, fontWeight: 'bold' }}
            >
              {feedbackAlert.message}
            </Alert>
          )}

          {/* 2-Column Responsive Layout */}
          <Grid container spacing={4}>
            {/* Left Column: Video Media & Details */}
            <Grid item xs={12} lg={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Video Media Audit Player
                </Typography>

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
                    style={{ display: 'block', maxHeight: '440px' }}
                  >
                    <source src={videoData.video_url} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                </Box>
              </Paper>

              {/* Video Metadata Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Submission Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">CANDIDATE</Typography>
                    <Typography variant="body1" fontWeight="bold">{videoData.candidate_name} ({videoData.candidate_code})</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">VENDOR</Typography>
                    <Typography variant="body1" fontWeight="bold">{videoData.vendor_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">ENVIRONMENT</Typography>
                    <Typography variant="body1" fontWeight="bold">{videoData.environment_tag}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">DURATION</Typography>
                    <Typography variant="body1" fontWeight="bold">{videoData.duration}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">GPS LOCATION</Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                      {videoData.latitude}, {videoData.longitude}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Right Column: QC Action Decision Panel */}
            <Grid item xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Quality Control Audit Panel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inspect the video sample for distortion, audio clarity, and environmental tag compliance.
                  </Typography>
                </Box>

                <Divider />

                {/* Display Current Status & Saved Rejection Reason */}
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                    CURRENT QC AUDIT STATUS
                  </Typography>
                  {getStatusChip(videoData.status)}

                  {videoData.status === 'Rejected' && videoData.reject_reason && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="error.main" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                        REJECTION REASON RECORDED:
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', bgcolor: 'rgba(239, 68, 68, 0.1)', p: 1.5, borderRadius: 2 }}>
                        "{videoData.reject_reason}"
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Rejection Reason Input Field */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Rejection Reason <Typography component="span" color="error.main">* (Required if Rejecting)</Typography>
                  </Typography>
                  <TextField
                    id="qc-reject-reason-input"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Specify why the video is rejected (e.g. Low lighting, distorted audio, wrong environment)..."
                    value={rejectReasonInput}
                    onChange={(e) => {
                      setRejectReasonInput(e.target.value);
                      if (e.target.value.trim()) setReasonError('');
                    }}
                    error={Boolean(reasonError)}
                    helperText={reasonError}
                    variant="outlined"
                  />
                </Box>

                {/* Approve & Reject Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                  <Button
                    id="qc-approve-button"
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<CheckCircleOutlined />}
                    onClick={handleInitiateApprove}
                    sx={{
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    Approve Video
                  </Button>

                  <Button
                    id="qc-reject-button"
                    fullWidth
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<CancelOutlined />}
                    onClick={handleInitiateReject}
                    sx={{
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    Reject Video
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Confirmation Dialog Before Submitting */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Confirm QC Review Submission
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to mark video <strong>{videoData.id}</strong> as{' '}
              <strong style={{ color: pendingDecision === 'Approved' ? '#10b981' : '#ef4444' }}>
                {pendingDecision?.toUpperCase()}
              </strong>?
            </Typography>

            {pendingDecision === 'Rejected' && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                <Typography variant="caption" color="error.main" fontWeight="bold">
                  Rejection Reason:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  "{rejectReasonInput.trim()}"
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDecision}
              variant="contained"
              color={pendingDecision === 'Approved' ? 'success' : 'error'}
              sx={{ fontWeight: 'bold' }}
            >
              Submit QC Decision
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
