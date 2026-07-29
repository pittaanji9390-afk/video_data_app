import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Grid,
  Chip,
  IconButton,
  Alert,
  Paper,
  Avatar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Switch,
  TextField,
  InputAdornment,
  Badge,
} from '@mui/material';
import {
  Videocam,
  Stop,
  CloudUpload,
  CheckCircle,
  Logout,
  Kitchen,
  Weekend,
  Bed,
  Work,
  Park,
  Notifications,
  Home,
  Person,
  Search,
  Mic,
  Warning,
  WifiOff,
  CloudOff,
  QrCode2,
  Lock,
  Download,
  ArrowForwardIos,
  HelpOutlineOutlined,
  Settings,
  Bathtub,
  LocalFlorist,
  Deck,
  Garage,
  MoreHoriz,
  ArrowBack,
  Timer,
} from '@mui/icons-material';

const candidateTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#0ea5e9' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
  shape: { borderRadius: 16 },
});

export default function CandidatePortal() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('home'); // home, record, voice, alert, env, upload_progress, upload_success, history, earnings, notifications, profile, settings, help, errors, onboarding
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedEnv, setSelectedEnv] = useState('Kitchen');
  const [selectedTab, setSelectedTab] = useState(0);

  // Dynamic Candidate Profile Data from LocalStorage / Session
  const candidateName = localStorage.getItem('userName') || 'Vasavi Kandula';
  const candidateEmail = localStorage.getItem('userEmail') || 'vasavi@example.com';
  const candidateId = localStorage.getItem('candidateId') || 'CAN-2024-001';
  const vendorId = localStorage.getItem('vendorId') || 'VENDOR-001';
  const candidatePhone = localStorage.getItem('candidatePhone') || '+91 98765 43210';

  // Greeting Time Calculation
  const currentHour = new Date().getHours();
  const greetingTime = currentHour < 12 ? 'Good Morning,' : currentHour < 18 ? 'Good Afternoon,' : 'Good Evening,';
  const firstName = candidateName.split(' ')[0] || candidateName;
  const initials = candidateName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'VK';

  // Dynamic candidate activity metrics & history
  const [candidateUploadedCount, setCandidateUploadedCount] = useState(() => {
    const val = localStorage.getItem(`cand_uploads_${candidateId}`);
    return val ? parseInt(val, 10) : 0;
  });

  const candidateHours = (candidateUploadedCount * 0.5).toFixed(1);
  const candidateEarnings = (candidateUploadedCount * 50).toFixed(0);

  const videoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (activeScreen === 'record') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeScreen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Camera access denied or simulation mode:', e);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const handleStartRec = () => {
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
  };

  const handleStopRec = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    setActiveScreen('env');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const environments = [
    { name: 'Kitchen', icon: <Kitchen color="primary" /> },
    { name: 'Bedroom', icon: <Bed color="secondary" /> },
    { name: 'Bathroom', icon: <Bathtub color="info" /> },
    { name: 'Garden', icon: <LocalFlorist color="success" /> },
    { name: 'Office', icon: <Work color="action" /> },
    { name: 'Living Room', icon: <Weekend color="warning" /> },
    { name: 'Balcony', icon: <Deck color="secondary" /> },
    { name: 'Garage', icon: <Garage color="error" /> },
    { name: 'Outdoor', icon: <Park color="success" /> },
    { name: 'Other', icon: <MoreHoriz color="action" /> },
  ];

  return (
    <ThemeProvider theme={candidateTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: { xs: 0, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Mobile Device Container Frame (Clean Mobile UI) */}
        <Box
          sx={{
            width: { xs: '100vw', sm: 380 },
            height: { xs: '100vh', sm: 780 },
            bgcolor: activeScreen === 'record' ? '#000' : '#f8fafc',
            borderRadius: { xs: 0, sm: '40px' },
            border: { xs: 'none', sm: '12px solid #1e293b' },
            boxShadow: { xs: 'none', sm: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* SCREEN CONTENT VIEWPORT */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: activeScreen === 'record' ? 0 : 2 }}>
            
            {/* 1. ONBOARDING SCREEN (Mockup Screens 2, 3, 4) */}
            {activeScreen === 'onboarding' && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center', py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => setActiveScreen('home')}>Skip</Button>
                </Box>
                <Box>
                  <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                    <Videocam sx={{ fontSize: 60, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>Record Videos Easily</Typography>
                  <Typography variant="body2" color="text.secondary">Capture high-quality video data samples using your mobile phone.</Typography>
                </Box>
                <Button fullWidth variant="contained" size="large" onClick={() => setActiveScreen('home')} sx={{ py: 1.5, borderRadius: 3 }}>
                  Get Started
                </Button>
              </Box>
            )}

            {/* 8. HOME DASHBOARD (Mockup Screen 8) */}
            {activeScreen === 'home' && (
              <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{greetingTime}</Typography>
                    <Typography variant="h6" fontWeight="bold">{firstName} 👋</Typography>
                  </Box>
                  <IconButton onClick={() => setActiveScreen('notifications')}>
                    <Badge badgeContent={1} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Box>

                {/* Today's Progress Banner */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#2563eb', color: '#fff', borderRadius: 4, mb: 3 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold' }}>TODAY'S PROGRESS</Typography>
                  <Box sx={{ display: 'flex', mt: 1.5, justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Videos Uploaded</Typography>
                      <Typography variant="h5" fontWeight="bold">{candidateUploadedCount}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Hours Collected</Typography>
                      <Typography variant="h5" fontWeight="bold">{candidateHours} hrs</Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Quick Actions Grid */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Quick Actions</Typography>
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  {[
                    { title: 'Start Recording', sub: 'Camera video', icon: <Videocam color="primary" />, action: () => setActiveScreen('record') },
                    { title: 'Upload History', sub: 'Submitted logs', icon: <CloudUpload color="secondary" />, action: () => setActiveScreen('history') },
                    { title: 'Payment Summary', sub: 'Earnings report', icon: <Lock color="success" />, action: () => setActiveScreen('earnings') },
                    { title: 'Help Center', sub: 'FAQs & Support', icon: <HelpOutlineOutlined color="warning" />, action: () => setActiveScreen('help') },
                  ].map((act, i) => (
                    <Grid item xs={6} key={i}>
                      <Paper onClick={act.action} elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, cursor: 'pointer', '&:hover': { borderColor: '#2563eb' } }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(37,99,235,0.08)', borderRadius: 2, width: 'fit-content', mb: 1 }}>{act.icon}</Box>
                        <Typography variant="body2" fontWeight="bold">{act.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{act.sub}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Recent Activity */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Recent Activity</Typography>
                <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: '#2563eb' }}><Kitchen /></Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">Kitchen Video</Typography>
                      <Typography variant="caption" color="text.secondary">Uploaded • 2 min ago</Typography>
                    </Box>
                  </Box>
                  <Chip label="Approved" color="success" size="small" />
                </Paper>
              </Box>
            )}

            {/* 9. RECORDING SCREEN (Mockup Screen 9) */}
            {activeScreen === 'record' && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2, position: 'relative' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                
                {/* Top REC Indicator */}
                <Box sx={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={`REC ${formatTime(recordingTime)}`} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                  <Button size="small" variant="contained" color="secondary" onClick={() => setActiveScreen('voice')}>Voice</Button>
                </Box>

                {/* Bottom Controls */}
                <Box sx={{ position: 'relative', zIndex: 5, pb: 4, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <IconButton onClick={() => setActiveScreen('alert')} sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: '#fff' }}>
                    <Warning />
                  </IconButton>
                  <IconButton onClick={recording ? handleStopRec : handleStartRec} sx={{ bgcolor: '#ef4444', color: '#fff', p: 2.5 }}>
                    {recording ? <Stop sx={{ fontSize: 36 }} /> : <Videocam sx={{ fontSize: 36 }} />}
                  </IconButton>
                  <IconButton onClick={() => setActiveScreen('env')} sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', color: '#fff' }}>
                    <CheckCircle />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* 10. VOICE COMMAND SCREEN (Mockup Screen 10) */}
            {activeScreen === 'voice' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Voice Command</Typography>
                <Typography variant="caption" color="text.secondary">Speak a command</Typography>
                <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', my: 4, boxShadow: '0 0 30px rgba(37,99,235,0.5)' }}>
                  <Mic sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>Listening...</Typography>
                <Box sx={{ mt: 4, textAlign: 'left', bgcolor: '#f1f5f9', p: 2, borderRadius: 3 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">TRY SAYING:</Typography>
                  <Typography variant="body2">• Start Recording</Typography>
                  <Typography variant="body2">• Pause Recording</Typography>
                  <Typography variant="body2">• Stop Recording</Typography>
                </Box>
                <Button sx={{ mt: 3 }} onClick={() => setActiveScreen('record')}>Back to Camera</Button>
              </Box>
            )}

            {/* 11. 30-MINUTE ALERT MODAL (Mockup Screen 11) */}
            {activeScreen === 'alert' && (
              <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <Timer sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">30 Minutes Completed</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1.5 }}>
                    You have recorded for 30 minutes. Do you want to continue?
                  </Typography>
                  <Button fullWidth variant="contained" onClick={() => setActiveScreen('record')} sx={{ mb: 1, py: 1.2 }}>Continue Recording</Button>
                  <Button fullWidth variant="outlined" color="error" onClick={() => setActiveScreen('upload_progress')}>Stop & Upload</Button>
                </Paper>
              </Box>
            )}

            {/* 12. ENVIRONMENT SELECTION SCREEN (Mockup Screen 12) */}
            {activeScreen === 'env' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Select Environment</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Choose the category that best describes your recording location.
                </Typography>

                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  {environments.map((env) => (
                    <Grid item xs={6} key={env.name}>
                      <Paper
                        onClick={() => setSelectedEnv(env.name)}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          borderRadius: 3,
                          cursor: 'pointer',
                          bgcolor: selectedEnv === env.name ? 'rgba(37,99,235,0.1)' : '#fff',
                          border: selectedEnv === env.name ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        }}
                      >
                        {env.icon}
                        <Typography variant="body2" fontWeight={selectedEnv === env.name ? 'bold' : 'normal'}>{env.name}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Button fullWidth variant="contained" size="large" onClick={() => setActiveScreen('upload_progress')} sx={{ py: 1.5, borderRadius: 3 }}>
                  Continue to Upload
                </Button>
              </Box>
            )}

            {/* 13. UPLOADING VIDEO PROGRESS SCREEN (Mockup Screen 13) */}
            {activeScreen === 'upload_progress' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" fontWeight="bold">Uploading Video</Typography>
                <Typography variant="caption" color="text.secondary">Please don't close the app or lock your screen.</Typography>

                <Box sx={{ position: 'relative', display: 'inline-flex', my: 4 }}>
                  <CircularProgress variant="determinate" value={85} size={140} thickness={4} />
                  <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">85%</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>23.4 MB / 27.5 MB</Typography>

                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 3, display: 'flex', justifyContent: 'space-around', my: 3 }}>
                  <Box><Typography variant="caption" color="text.secondary">Speed</Typography><Typography variant="body2" fontWeight="bold">2.4 MB/s</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Time Left</Typography><Typography variant="body2" fontWeight="bold">00:00:18</Typography></Box>
                </Paper>

                <Button fullWidth variant="contained" onClick={() => setActiveScreen('upload_success')} sx={{ py: 1.5, borderRadius: 3 }}>Complete Upload</Button>
              </Box>
            )}

            {/* 15-16. UPLOAD SUCCESS SCREEN (Mockup Screen 16) */}
            {activeScreen === 'upload_success' && (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Box sx={{ width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <CheckCircle sx={{ fontSize: 54 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Upload Successful!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Your video has been uploaded and encrypted in cloud storage.</Typography>

                <Button fullWidth variant="contained" onClick={() => setActiveScreen('history')} sx={{ mb: 1.5, py: 1.5, borderRadius: 3 }}>View Upload History</Button>
                <Button fullWidth variant="outlined" onClick={() => setActiveScreen('home')} sx={{ py: 1.5, borderRadius: 3 }}>Go to Home</Button>
              </Box>
            )}

            {/* 17. UPLOAD HISTORY SCREEN (Mockup Screen 17) */}
            {activeScreen === 'history' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Upload History</Typography>
                <TextField fullWidth placeholder="Search videos..." size="small" sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />

                {[
                  { title: 'Kitchen Video', time: '12:30 Min • Today, 10:30 AM', status: 'Approved', color: 'success' },
                  { title: 'Bedroom Video', time: '30:00 Min • Today, 09:15 AM', status: 'Pending', color: 'warning' },
                  { title: 'Garden Video', time: '15:45 Min • Yesterday, 06:20 PM', status: 'Rejected', color: 'error' },
                ].map((item, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 1.5, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                    </Box>
                    <Chip label={item.status} color={item.color} size="small" />
                  </Paper>
                ))}
              </Box>
            )}

            {/* 18. PAYMENT SUMMARY SCREEN (Mockup Screen 18) */}
            {activeScreen === 'earnings' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>My Earnings</Typography>
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#2563eb', color: '#fff', borderRadius: 4, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box><Typography variant="caption" sx={{ opacity: 0.8 }}>Approved Hours</Typography><Typography variant="h6" fontWeight="bold">{candidateHours}</Typography></Box>
                    <Box><Typography variant="caption" sx={{ opacity: 0.8 }}>Rate</Typography><Typography variant="h6" fontWeight="bold">₹100 / hour</Typography></Box>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Earnings (This Month)</Typography>
                  <Typography variant="h4" fontWeight="bold">₹{candidateEarnings}</Typography>
                </Paper>

                <Button fullWidth variant="contained" startIcon={<Download />} sx={{ py: 1.5, borderRadius: 3 }}>Download Report (CSV)</Button>
              </Box>
            )}

            {/* 19. NOTIFICATIONS SCREEN (Mockup Screen 19) */}
            {activeScreen === 'notifications' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Notifications</Typography>
                {[
                  { title: 'Video Approved', desc: 'Kitchen Video has been approved.', time: '10:30 AM', color: '#10b981' },
                  { title: 'Upload Complete', desc: 'Bedroom Video upload completed.', time: '09:45 AM', color: '#2563eb' },
                  { title: 'Payment Updated', desc: 'Monthly earnings updated.', time: 'Yesterday', color: '#8b5cf6' },
                ].map((item, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <Typography variant="body2" fontWeight="bold" style={{ color: item.color }}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {/* 20. PROFILE SCREEN (Mockup Screen 20) */}
            {activeScreen === 'profile' && (
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#2563eb', mx: 'auto', mb: 1, fontSize: 32, fontWeight: 'bold' }}>{initials}</Avatar>
                <Typography variant="h6" fontWeight="bold">{candidateName} <Chip label="Verified" color="success" size="small" /></Typography>
                <Typography variant="caption" color="text.secondary">{candidatePhone}</Typography>

                <Paper elevation={0} sx={{ p: 2, mt: 3, border: '1px solid #e2e8f0', borderRadius: 3, textAlign: 'left' }}>
                  <Typography variant="body2"><strong>Candidate ID:</strong> {candidateId}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Vendor ID:</strong> {vendorId}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Email:</strong> {candidateEmail}</Typography>
                </Paper>
                <Box sx={{ mt: 2 }}><QrCode2 sx={{ fontSize: 90, color: 'primary.main' }} /></Box>
              </Box>
            )}

            {/* 21. SETTINGS SCREEN (Mockup Screen 21) */}
            {activeScreen === 'settings' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Settings</Typography>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Auto Upload</Typography>
                    <Switch defaultChecked />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2">Video Quality</Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">1080p</Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* 22. HELP CENTER SCREEN (Mockup Screen 22) */}
            {activeScreen === 'help' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Help Center</Typography>
                {['How to record a video?', 'How to upload video?', 'How are earnings calculated?'].map((q, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{q}</Typography>
                    <ArrowForwardIos sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Paper>
                ))}
              </Box>
            )}

            {/* 23. ERROR STATES SCREEN (Mockup Screen 23) */}
            {activeScreen === 'errors' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <WifiOff sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold">No Internet Connection</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ my: 1.5 }}>Please check your network settings and try again.</Typography>
                <Button variant="contained" onClick={() => setActiveScreen('home')}>Try Again</Button>
              </Box>
            )}

          </Box>

          {/* Bottom Device Navigation Bar (Matching Screen 8) */}
          <Box sx={{ height: 56, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <IconButton onClick={() => setActiveScreen('home')} color={activeScreen === 'home' ? 'primary' : 'default'}><Home /></IconButton>
            <IconButton onClick={() => setActiveScreen('record')} color={activeScreen === 'record' ? 'primary' : 'default'}><Videocam /></IconButton>
            <IconButton onClick={() => setActiveScreen('history')} color={activeScreen === 'history' ? 'primary' : 'default'}><CloudUpload /></IconButton>
            <IconButton onClick={() => setActiveScreen('notifications')} color={activeScreen === 'notifications' ? 'primary' : 'default'}><Notifications /></IconButton>
            <IconButton onClick={() => setActiveScreen('profile')} color={activeScreen === 'profile' ? 'primary' : 'default'}><Person /></IconButton>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
