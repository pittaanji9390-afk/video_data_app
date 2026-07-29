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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Videocam,
  Stop,
  CloudUpload,
  CheckCircle,
  Logout,
  ArrowBack,
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

const environments = [
  { name: 'Kitchen', icon: <Kitchen color="primary" /> },
  { name: 'Living Room', icon: <Weekend color="primary" /> },
  { name: 'Bedroom', icon: <Bed color="primary" /> },
  { name: 'Bathroom', icon: <Bathtub color="primary" /> },
  { name: 'Office / Work', icon: <Work color="primary" /> },
  { name: 'Outdoor / Park', icon: <Park color="primary" /> },
  { name: 'Garden', icon: <LocalFlorist color="primary" /> },
  { name: 'Balcony / Deck', icon: <Deck color="primary" /> },
  { name: 'Garage', icon: <Garage color="primary" /> },
];

export default function CandidatePortal() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('home');
  const [screenHistory, setScreenHistory] = useState(['home']);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedEnv, setSelectedEnv] = useState('Kitchen');
  const [selectedTab, setSelectedTab] = useState(0);

  // 1-step back navigation handler
  const handleNavigate = (newScreen) => {
    if (newScreen !== activeScreen) {
      setScreenHistory((prev) => [...prev, newScreen]);
      setActiveScreen(newScreen);
    }
  };

  const handleGoBack = () => {
    if (screenHistory.length > 1) {
      const newStack = [...screenHistory];
      newStack.pop();
      const prev = newStack[newStack.length - 1];
      setScreenHistory(newStack);
      setActiveScreen(prev);
    }
  };

  // Hardware back button / browser back gesture popstate listener
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      if (screenHistory.length > 1) {
        handleGoBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screenHistory]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('candidateId');
    localStorage.removeItem('vendorId');
    localStorage.removeItem('candidatePhone');
    navigate('/login');
  };

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

  const [selectedVideoModal, setSelectedVideoModal] = useState(null);
  const [openPayoutModal, setOpenPayoutModal] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState('Available');
  const [openSupportModal, setOpenSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [autoUpload, setAutoUpload] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [toastAlert, setToastAlert] = useState(null);

  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'Video Approved', desc: 'Kitchen Video has been approved by Quality Control.', time: '10:30 AM', color: '#10b981', read: false },
    { id: 2, title: 'Upload Complete', desc: 'Bedroom Video upload completed successfully.', time: '09:45 AM', color: '#2563eb', read: false },
    { id: 3, title: 'Payment Updated', desc: 'Monthly earnings updated in your wallet.', time: 'Yesterday', color: '#8b5cf6', read: true },
  ]);

  const handleDownloadStatement = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Hours,Earnings,Status\n2026-07-29,0.5h,$50.00,Completed\n2026-07-28,1.0h,$100.00,Approved";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Candidate_Statement_${candidateId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Statement downloaded successfully!');
  };

  const showToast = (msg) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 3000);
  };

  const handleClearNotifications = () => {
    setNotificationsList([]);
    showToast('All notifications cleared');
  };

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMsg, setCameraMsg] = useState('Initializing camera stream...');

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
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraMsg('Live Camera HD Active');
      } else {
        setCameraActive(false);
        setCameraMsg('Network Simulation Viewfinder Active');
      }
    } catch (e) {
      console.warn('Camera stream fallback activated:', e);
      setCameraActive(false);
      setCameraMsg('Viewfinder Simulation Active (HTTP Mode)');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleStartRec = () => {
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
  };

  const handleStopRec = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    const newCount = candidateUploadedCount + 1;
    setCandidateUploadedCount(newCount);
    localStorage.setItem(`cand_uploads_${candidateId}`, newCount.toString());
    showToast(`Recorded ${formatTime(recordingTime)} video clip! Saved & uploaded.`);
    setActiveScreen('upload_success');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
              <Box sx={{ height: '100%', minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2, position: 'relative', bgcolor: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
                {/* HTML5 Realtime Camera Stream Element */}
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
                
                {/* Viewfinder Target Reticle Overlay */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <Box sx={{ width: 180, height: 180, border: '2px dashed rgba(255,255,255,0.7)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Videocam sx={{ fontSize: 42, color: 'rgba(255,255,255,0.4)' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#fff', mt: 1, bgcolor: 'rgba(0,0,0,0.6)', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold' }}>
                    {selectedEnv} Environment Frame
                  </Typography>
                </Box>

                {/* Top REC Indicator & Camera Mode Badge */}
                <Box sx={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={`REC ${formatTime(recordingTime)}`} color={recording ? "error" : "default"} size="small" sx={{ fontWeight: 'bold', bgcolor: recording ? '#ef4444' : 'rgba(0,0,0,0.6)', color: '#fff' }} />
                  <Chip label={cameraMsg} size="small" sx={{ bgcolor: 'rgba(37,99,235,0.85)', color: '#fff', fontSize: 11, fontWeight: 'bold' }} />
                </Box>

                {/* Bottom Record Controls */}
                <Box sx={{ position: 'relative', zIndex: 5, pb: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <IconButton onClick={() => setActiveScreen('alert')} sx={{ bgcolor: 'rgba(0, 0, 0, 0.5)', color: '#fff' }}>
                    <Warning />
                  </IconButton>
                  <IconButton onClick={recording ? handleStopRec : handleStartRec} sx={{ bgcolor: recording ? '#ef4444' : '#10b981', color: '#fff', p: 2.5, boxShadow: '0 0 25px rgba(16,185,129,0.5)' }}>
                    {recording ? <Stop sx={{ fontSize: 36 }} /> : <Videocam sx={{ fontSize: 36 }} />}
                  </IconButton>
                  <IconButton onClick={() => setActiveScreen('env')} sx={{ bgcolor: 'rgba(0, 0, 0, 0.5)', color: '#fff' }}>
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
                  { title: 'Kitchen Video', time: '12:30 Min • Today, 10:30 AM', status: 'Approved', color: 'success', env: 'Kitchen', size: '1.24 GB', fps: '30' },
                  { title: 'Bedroom Video', time: '30:00 Min • Today, 09:15 AM', status: 'Pending', color: 'warning', env: 'Bedroom', size: '2.80 GB', fps: '30' },
                  { title: 'Garden Video', time: '15:45 Min • Yesterday, 06:20 PM', status: 'Rejected', color: 'error', env: 'Garden', size: '1.50 GB', fps: '30' },
                ].map((item, idx) => (
                  <Paper
                    key={idx}
                    elevation={0}
                    onClick={() => setSelectedVideoModal(item)}
                    sx={{ p: 1.5, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}
                  >
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
                    <Box><Typography variant="caption" sx={{ opacity: 0.8 }}>Approved Hours</Typography><Typography variant="h6" fontWeight="bold">{candidateHours} hrs</Typography></Box>
                    <Box><Typography variant="caption" sx={{ opacity: 0.8 }}>Rate</Typography><Typography variant="h6" fontWeight="bold">₹100 / hour</Typography></Box>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Earnings (This Month)</Typography>
                  <Typography variant="h4" fontWeight="bold">₹{candidateEarnings}</Typography>
                  <Chip label={payoutStatus} size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold' }} />
                </Paper>

                <Button fullWidth variant="contained" color="success" onClick={() => setOpenPayoutModal(true)} sx={{ mb: 1.5, py: 1.4, borderRadius: 3, fontWeight: 'bold' }}>
                  Request Payout Settlement
                </Button>
                <Button fullWidth variant="outlined" startIcon={<Download />} onClick={handleDownloadStatement} sx={{ py: 1.4, borderRadius: 3, fontWeight: 'bold' }}>
                  Download Statement (CSV)
                </Button>
              </Box>
            )}

            {/* 19. NOTIFICATIONS SCREEN (Mockup Screen 19) */}
            {activeScreen === 'notifications' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                  <Button size="small" onClick={handleClearNotifications} sx={{ textTransform: 'none', color: '#ef4444' }}>Clear All</Button>
                </Box>
                {notificationsList.map((item, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    onClick={() => {
                      const updated = [...notificationsList];
                      updated[i].read = true;
                      setNotificationsList(updated);
                    }}
                    sx={{ p: 1.5, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, cursor: 'pointer', opacity: item.read ? 0.7 : 1, bgcolor: item.read ? '#fff' : '#f0f9ff' }}
                  >
                    <Typography variant="body2" fontWeight="bold" style={{ color: item.color }}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Paper>
                ))}
                {notificationsList.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>No new notifications</Typography>
                )}
              </Box>
            )}

            {/* 20. PROFILE SCREEN (Mockup Screen 20) */}
            {activeScreen === 'profile' && (
              <Box sx={{ textAlign: 'center', pb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#2563eb', mx: 'auto', mb: 1, fontSize: 32, fontWeight: 'bold' }}>{initials}</Avatar>
                <Typography variant="h6" fontWeight="bold">{candidateName} <Chip label="Verified" color="success" size="small" /></Typography>
                <Typography variant="caption" color="text.secondary">{candidatePhone}</Typography>

                <Paper elevation={0} sx={{ p: 2, mt: 3, border: '1px solid #e2e8f0', borderRadius: 3, textAlign: 'left' }}>
                  <Typography variant="body2"><strong>Candidate ID:</strong> {candidateId}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Vendor ID:</strong> {vendorId}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Email:</strong> {candidateEmail}</Typography>
                </Paper>
                
                <Box sx={{ mt: 2 }}><QrCode2 sx={{ fontSize: 90, color: 'primary.main' }} /></Box>

                {/* Prominent Red Logout / Sign Out Button */}
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<Logout />}
                  onClick={() => setLogoutDialogOpen(true)}
                  sx={{ mt: 3, py: 1.2, borderRadius: 3, fontWeight: 'bold', textTransform: 'none' }}
                >
                  Sign Out
                </Button>
              </Box>
            )}

            {/* 21. SETTINGS SCREEN (Mockup Screen 21) */}
            {activeScreen === 'settings' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Settings</Typography>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold">Auto Upload</Typography>
                    <Switch checked={autoUpload} onChange={(e) => { setAutoUpload(e.target.checked); showToast(`Auto Upload ${e.target.checked ? 'Enabled' : 'Disabled'}`); }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" fontWeight="bold">Push Notifications</Typography>
                    <Switch checked={pushNotifications} onChange={(e) => { setPushNotifications(e.target.checked); showToast(`Notifications ${e.target.checked ? 'Enabled' : 'Disabled'}`); }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" fontWeight="bold">Video Quality</Typography>
                    <Button size="small" onClick={() => { const q = videoQuality === '1080p' ? '720p' : '1080p'; setVideoQuality(q); showToast(`Video Quality set to ${q}`); }} variant="outlined">
                      {videoQuality}
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* 22. HELP CENTER SCREEN (Mockup Screen 22) */}
            {activeScreen === 'help' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Help Center</Typography>
                {[
                  { q: 'How to record a video?', a: 'Tap the camera icon on the bottom navigation bar, select environment tag, and tap Record.' },
                  { q: 'How to upload video?', a: 'Videos upload automatically when connected to Wi-Fi, or tap Upload on the video card.' },
                  { q: 'How are earnings calculated?', a: 'Earnings are calculated at ₹100 per approved hour of quality-checked video collection.' },
                ].map((item, i) => (
                  <Paper key={i} elevation={0} onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 3, cursor: 'pointer' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">{item.q}</Typography>
                      <Typography variant="caption">{expandedFaq === i ? '▲' : '▼'}</Typography>
                    </Box>
                    {expandedFaq === i && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{item.a}</Typography>
                    )}
                  </Paper>
                ))}
                <Button fullWidth variant="contained" color="primary" onClick={() => setOpenSupportModal(true)} sx={{ mt: 2, py: 1.2, borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}>
                  Contact Support Team
                </Button>
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

          {/* Bottom Device Navigation Bar */}
          <Box sx={{ height: 56, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <IconButton onClick={() => handleNavigate('home')} color={activeScreen === 'home' ? 'primary' : 'default'}><Home /></IconButton>
            <IconButton onClick={() => handleNavigate('record')} color={activeScreen === 'record' ? 'primary' : 'default'}><Videocam /></IconButton>
            <IconButton onClick={() => handleNavigate('history')} color={activeScreen === 'history' ? 'primary' : 'default'}><CloudUpload /></IconButton>
            <IconButton onClick={() => handleNavigate('notifications')} color={activeScreen === 'notifications' ? 'primary' : 'default'}><Notifications /></IconButton>
            <IconButton onClick={() => handleNavigate('profile')} color={activeScreen === 'profile' ? 'primary' : 'default'}><Person /></IconButton>
          </Box>
        </Box>

        {/* Logout Confirmation Dialog Modal */}
        <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">Confirm Sign Out</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to sign out of your candidate account? You can log back in anytime using your credentials.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setLogoutDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
              Cancel
            </Button>
            <Button onClick={handleLogout} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
              Sign Out
            </Button>
          </DialogActions>
        </Dialog>

        {/* Video Detail Modal Dialog */}
        <Dialog open={!!selectedVideoModal} onClose={() => setSelectedVideoModal(null)} maxWidth="xs" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">{selectedVideoModal?.title}</DialogTitle>
          <DialogContent>
            <Box sx={{ width: '100%', height: 160, bgcolor: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', mb: 2 }}>
              <Videocam sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="body2"><strong>Status:</strong> {selectedVideoModal?.status}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Time:</strong> {selectedVideoModal?.time}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Environment:</strong> {selectedVideoModal?.env || 'Kitchen'}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Size:</strong> {selectedVideoModal?.size || '1.24 GB'}</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setSelectedVideoModal(null)} variant="contained" fullWidth sx={{ textTransform: 'none', borderRadius: 2 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payout Settlement Request Modal Dialog */}
        <Dialog open={openPayoutModal} onClose={() => setOpenPayoutModal(false)} maxWidth="xs" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">Request Payout Settlement</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Request settlement for your approved earnings of <strong>₹{candidateEarnings}</strong> ({candidateHours} hrs @ ₹100/hr).
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Payout Method</Typography>
              <Typography variant="body2" fontWeight="bold">Direct Bank Transfer (**** 4567)</Typography>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenPayoutModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
            <Button
              onClick={() => {
                setOpenPayoutModal(false);
                setPayoutStatus('Processing');
                showToast('Payout request submitted for processing!');
              }}
              variant="contained"
              color="success"
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
            >
              Confirm Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Support Message Dialog Modal */}
        <Dialog open={openSupportModal} onClose={() => setOpenSupportModal(false)} maxWidth="xs" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">Contact Support</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Have a question or issue? Send a message directly to the operations team.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your issue..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenSupportModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
            <Button
              onClick={() => {
                if (!supportMessage.trim()) return;
                setOpenSupportModal(false);
                setSupportMessage('');
                showToast('Support message sent successfully!');
              }}
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>

        {/* Feedback Toast Alert */}
        {toastAlert && (
          <Alert severity="success" sx={{ position: 'absolute', bottom: 70, left: 16, right: 16, zIndex: 100, borderRadius: 3, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            {toastAlert}
          </Alert>
        )}
      </Box>
    </ThemeProvider>
  );
}
