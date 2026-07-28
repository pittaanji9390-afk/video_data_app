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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  LogoutOutlined,
  ArrowBack,
  VideocamOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  FactCheckOutlined,
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

export default function QCReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [reasonError, setReasonError] = useState('');

  // Confirmation Dialog State
  const [pendingDecision, setPendingDecision] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQCVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getVideoById(id);
      const video = res.data || res;
      setVideoData(video);

      // Check if existing QC review exists
      try {
        const qcRes = await apiService.getQCReviewByVideoId(id);
        const qcData = qcRes.data || qcRes;
        if (qcData && qcData.reject_reason) {
          setRejectReasonInput(qcData.reject_reason);
        }
      } catch (e) {
        // No existing QC review found, ignoring error
      }
    } catch (err) {
      setError(err.message || `Failed to fetch video for QC review ID: ${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQCVideo();
  }, [id]);

  const handleInitiateApprove = () => {
    setReasonError('');
    setPendingDecision('Approved');
    setConfirmDialogOpen(true);
  };

  const handleInitiateReject = () => {
    if (!rejectReasonInput.trim()) {
      setReasonError('A rejection reason is required before rejecting a video.');
      return;
    }
    setReasonError('');
    setPendingDecision('Rejected');
    setConfirmDialogOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!pendingDecision || !videoData) return;

    setSubmitting(true);
    const targetStatus = pendingDecision.toLowerCase();
    const finalReason = targetStatus === 'rejected' ? rejectReasonInput.trim() : undefined;

    try {
      await apiService.submitQCReview({
        video_id: videoData.id,
        status: targetStatus,
        reject_reason: finalReason,
        reviewer_id: '00000000-0000-0000-0000-000000000001',
      });

      setVideoData((prev) => ({
        ...prev,
        status: targetStatus,
      }));

      setConfirmDialogOpen(false);
      setPendingDecision(null);

      setFeedbackAlert({
        type: targetStatus === 'approved' ? 'success' : 'error',
        message: `QC Decision Submitted! Video ${videoData.id} has been marked as "${targetStatus.toUpperCase()}".`,
      });
    } catch (err) {
      alert(`Failed to submit QC review: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status = '') => {
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
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/videos')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <FactCheckOutlined sx={{ mr: 1.5, color: 'warning.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Quality Control (QC) Video Review (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submit QC reviews directly to backend API
              </Typography>
            </Box>

            <IconButton color="warning" onClick={fetchQCVideo} sx={{ mr: 1 }}>
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
              <CircularProgress color="warning" />
              <Typography color="text.secondary">Loading video for QC audit...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchQCVideo}>Retry</Button>} sx={{ mb: 4, borderRadius: 3 }}>
              {error}
            </Alert>
          ) : !videoData ? (
            <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
              Video record not found for QC audit.
            </Alert>
          ) : (
            <>
              <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/videos')} sx={{ textTransform: 'none' }}>
                    Back to Videos
                  </Button>
                  <Typography variant="h5" fontWeight="bold">
                    QC Review File: {videoData.id}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Current QC Status:</Typography>
                  {getStatusChip(videoData.status || 'Pending')}
                </Box>
              </Paper>

              {feedbackAlert && (
                <Alert severity={feedbackAlert.type} onClose={() => setFeedbackAlert(null)} sx={{ mb: 4, borderRadius: 3, fontWeight: 'bold' }}>
                  {feedbackAlert.message}
                </Alert>
              )}

              <Grid container spacing={4}>
                <Grid item xs={12} lg={7}>
                  <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Video Media Audit Player</Typography>
                    <Box sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', bgcolor: '#000', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                      <video controls width="100%" height="auto" style={{ display: 'block', maxHeight: '440px' }}>
                        <source src={videoData.file_path || videoData.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'} type="video/mp4" />
                        Your browser does not support video playback.
                      </video>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>Quality Control Audit Panel</Typography>
                      <Typography variant="body2" color="text.secondary">Inspect video quality and submit approval decisions to API.</Typography>
                    </Box>
                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        Rejection Reason <Typography component="span" color="error.main">* (Required if Rejecting)</Typography>
                      </Typography>
                      <TextField
                        id="qc-reject-reason-input"
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Specify reason for rejection..."
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

                    <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                      <Button id="qc-approve-button" fullWidth variant="contained" color="success" size="large" startIcon={<CheckCircleOutlined />} onClick={handleInitiateApprove} sx={{ py: 1.5, fontWeight: 'bold' }}>
                        Approve Video
                      </Button>

                      <Button id="qc-reject-button" fullWidth variant="contained" color="error" size="large" startIcon={<CancelOutlined />} onClick={handleInitiateReject} sx={{ py: 1.5, fontWeight: 'bold' }}>
                        Reject Video
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Container>

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm QC Review Submission</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to mark video <strong>{videoData?.id}</strong> as{' '}
              <strong style={{ color: pendingDecision === 'Approved' ? '#10b981' : '#ef4444' }}>
                {pendingDecision?.toUpperCase()}
              </strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setConfirmDialogOpen(false)} color="inherit" disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDecision} variant="contained" color={pendingDecision === 'Approved' ? 'success' : 'error'} disabled={submitting} sx={{ fontWeight: 'bold' }}>
              {submitting ? 'Submitting...' : 'Submit QC Decision'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
