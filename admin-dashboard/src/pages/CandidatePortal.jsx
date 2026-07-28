import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Alert,
  Paper,
  LinearProgress,
  Avatar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Videocam,
  Stop,
  PlayArrow,
  Replay,
  CloudUpload,
  CheckCircle,
  Logout,
  Kitchen,
  Weekend,
  Bed,
  Work,
  Park,
  Timer,
  LocationOn,
} from '@mui/icons-material';

const candidateTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#10b981' },
    secondary: { main: '#6366f1' },
    background: { default: '#0f172a', paper: '#1e293b' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
  shape: { borderRadius: 16 },
});

export default function CandidatePortal() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedTag, setSelectedTag] = useState('Kitchen');
  const [cameraError, setCameraError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const environments = [
    { label: 'Kitchen', icon: <Kitchen /> },
    { label: 'Living Room', icon: <Weekend /> },
    { label: 'Bedroom', icon: <Bed /> },
    { label: 'Office Desk', icon: <Work /> },
    { label: 'Outdoor', icon: <Park /> },
  ];

  const [submissions, setSubmissions] = useState([
    { id: 'VID-8001', tag: 'Kitchen', duration: '45s', date: '2026-07-28', status: 'Approved' },
    { id: 'VID-8002', tag: 'Bedroom', duration: '60s', date: '2026-07-28', status: 'Pending QC' },
  ]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error or permission denied:', err);
      setCameraError('Camera access denied or unavailable. Simulation mode enabled.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleStartRecording = () => {
    chunksRef.current = [];
    setRecordingTime(0);
    setRecording(true);
    setRecordedUrl('');
    setRecordedBlob(null);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    if (stream) {
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          setRecordedBlob(blob);
          setRecordedUrl(URL.createObjectURL(blob));
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn('MediaRecorder error:', err);
      }
    }
  };

  const handleStopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulation fallback blob
      const dummyBlob = new Blob(['sample video stream content'], { type: 'video/webm' });
      setRecordedBlob(dummyBlob);
      setRecordedUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setRecordedUrl('');
    setRecordingTime(0);
    startCamera();
  };

  const handleSubmitVideo = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSubmitSuccess(true);
      const newSubmission = {
        id: `VID-${Math.floor(1000 + Math.random() * 9000)}`,
        tag: selectedTag,
        duration: `${recordingTime || 45}s`,
        date: 'Just Now',
        status: 'Pending QC',
      };
      setSubmissions([newSubmission, ...submissions]);
    }, 1200);
  };

  const handleSignOut = () => {
    stopCamera();
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ThemeProvider theme={candidateTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            py: 2,
            px: 4,
            bgcolor: '#1e293b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>AJ</Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff' }}>
                Alex Johnson (Candidate)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Assigned Vendor: Acme Video Solutions • ID: CAND-901
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleSignOut}
            sx={{ borderRadius: 3, fontWeight: 'bold' }}
          >
            Sign Out
          </Button>
        </Paper>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {cameraError && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
              {cameraError} You can still record and test video submission using simulation mode!
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Column: Camera Recording Studio */}
            <Grid item xs={12} md={7}>
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', p: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Videocam color="primary" /> Live Video Recording Studio
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Position yourself clearly in frame and record your data collection video sample.
                </Typography>

                {/* Viewfinder Window */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 340,
                    bgcolor: '#020617',
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: recording ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {recordedUrl ? (
                    <video
                      src={recordedUrl}
                      controls
                      autoPlay
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  {/* Recording Status Overlay */}
                  {recording && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        px: 2,
                        py: 0.5,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ width: 10, height: 10, bgcolor: '#fff', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                      <Typography variant="caption" fontWeight="bold">
                        REC {formatTime(recordingTime)}
                      </Typography>
                    </Box>
                  )}

                  {/* Location Stamp Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      bgcolor: 'rgba(15, 23, 42, 0.8)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <LocationOn sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography variant="caption" color="text.secondary">
                      GPS: 37.7749, -122.4194 • {selectedTag}
                    </Typography>
                  </Box>
                </Box>

                {/* Control Action Buttons */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {!recording && !recordedUrl && (
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<Videocam />}
                      onClick={handleStartRecording}
                      sx={{ py: 1.5, px: 4, fontWeight: 'bold', borderRadius: 3 }}
                    >
                      Start Camera Recording
                    </Button>
                  )}

                  {recording && (
                    <Button
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<Stop />}
                      onClick={handleStopRecording}
                      sx={{ py: 1.5, px: 4, fontWeight: 'bold', borderRadius: 3 }}
                    >
                      Stop & Save Recording
                    </Button>
                  )}

                  {recordedUrl && (
                    <>
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="large"
                        startIcon={<Replay />}
                        onClick={handleRetake}
                        sx={{ py: 1.5, px: 3, borderRadius: 3 }}
                      >
                        Retake
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={uploading}
                        startIcon={<CloudUpload />}
                        onClick={handleSubmitVideo}
                        sx={{ py: 1.5, px: 4, fontWeight: 'bold', borderRadius: 3 }}
                      >
                        Submit Video Data
                      </Button>
                    </>
                  )}
                </Box>

                {uploading && <LinearProgress color="primary" sx={{ mt: 2, borderRadius: 2 }} />}
              </Card>
            </Grid>

            {/* Right Column: Environment Tag & Submission Roster */}
            <Grid item xs={12} md={5}>
              {/* Environment Tag Selector */}
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', p: 3, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Select Environment Tag
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Tag the physical location environment of your recording video.
                </Typography>

                <Grid container spacing={1.5}>
                  {environments.map((env) => {
                    const isSelected = selectedTag === env.label;
                    return (
                      <Grid item xs={6} key={env.label}>
                        <Paper
                          onClick={() => setSelectedTag(env.label)}
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            borderRadius: 3,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: isSelected ? '#10b981' : '#f8fafc',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {env.icon}
                          <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'normal'}>
                            {env.label}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Card>

              {/* Submissions History Card */}
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.08)', p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Recent Submitted Videos
                </Typography>
                {submissions.map((sub) => (
                  <Box
                    key={sub.id}
                    sx={{
                      p: 1.5,
                      mt: 1.5,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {sub.id} • {sub.tag}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Duration: {sub.duration} • Submitted: {sub.date}
                      </Typography>
                    </Box>
                    <Chip
                      label={sub.status}
                      size="small"
                      color={sub.status === 'Approved' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Success Modal */}
        <Dialog open={submitSuccess} onClose={() => setSubmitSuccess(false)} PaperProps={{ style: { borderRadius: 16 } }}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            <CheckCircle color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Video Submitted Successfully!
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Your video collection sample for <strong>{selectedTag}</strong> has been uploaded to the server and submitted to Quality Control (QC) review.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setSubmitSuccess(false)}>
              Record Another Video
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
