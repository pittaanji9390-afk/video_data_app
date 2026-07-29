import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Alert,
  Badge,
} from '@mui/material';
import {
  Storefront,
  People,
  CloudUpload,
  Notifications,
  Person,
  Search,
  PersonAdd,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  ArrowBack,
  PlayArrow,
  Logout,
  Email,
  Phone,
  CalendarMonth,
  AccountBalance,
  ReceiptLong,
  Verified,
} from '@mui/icons-material';
import { candidateStore } from '../utils/candidateStore';

const vendorTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#10b981' },
    secondary: { main: '#0ea5e9' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
  shape: { borderRadius: 16 },
});

export default function VendorPortal() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [screenHistory, setScreenHistory] = useState(['dashboard']);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [activeUploadFilter, setActiveUploadFilter] = useState('All');
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [vendorApprovedVideosCount, setVendorApprovedVideosCount] = useState(285);
  const [vendorEarningsAmount, setVendorEarningsAmount] = useState(18500);

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      return `₹${amount}`;
    }
  };

  const fetchVendorEarnings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/payments/vendor/v0000000-0000-0000-0000-000000000001');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.approved_videos_count) setVendorApprovedVideosCount(json.data.approved_videos_count);
          if (json.data.total_amount) setVendorEarningsAmount(json.data.total_amount);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchVendorEarnings();
  }, []);

  // Persistent Notifications State & Backend / LocalStorage Sync
  const [notificationsList, setNotificationsList] = useState(() => {
    try {
      const stored = localStorage.getItem('vendor_notifications_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 'notif-1', title: 'Video Approved', desc: 'Kitchen Video has been approved.', color: '#10b981', read: false },
      { id: 'notif-2', title: 'Upload Complete', desc: 'Bedroom Video uploaded successfully.', color: '#0ea5e9', read: false },
      { id: 'notif-3', title: 'Payment Received', desc: '₹2,500 credited to account.', color: '#8b5cf6', read: true },
    ];
  });

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markNotificationsAsRead = () => {
    setNotificationsList((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem('vendor_notifications_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    fetch('http://localhost:5000/api/v1/notifications/mark-all-read', { method: 'PUT' }).catch(() => {});
  };

  const handleOpenNotifications = () => {
    handleNavigate('notifications');
    markNotificationsAsRead();
  };

  const handleNotificationClick = (n) => {
    // Mark notification as read
    setNotificationsList((prev) => {
      const updated = prev.map((item) => (item.id === n.id ? { ...item, read: true } : item));
      try {
        localStorage.setItem('vendor_notifications_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Redirect to target screen based on notification type/title
    const title = (n.title || '').toLowerCase();
    if (title.includes('approved')) {
      setActiveUploadFilter('Approved');
      handleNavigate('uploads');
    } else if (title.includes('rejected')) {
      setActiveUploadFilter('Rejected');
      handleNavigate('uploads');
    } else if (title.includes('upload')) {
      setActiveUploadFilter('All');
      handleNavigate('uploads');
    } else if (title.includes('payment') || title.includes('credit') || title.includes('earnings')) {
      handleNavigate('profile');
    } else if (title.includes('candidate')) {
      handleNavigate('candidates');
    } else {
      handleNavigate('uploads');
    }
  };

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

  useEffect(() => {
    if (activeScreen === 'notifications') {
      markNotificationsAsRead();
    }
  }, [activeScreen]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);
  const [selectedUploadModal, setSelectedUploadModal] = useState(null);
  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [vendorPhone, setVendorPhone] = useState('+91 98765 43210');
  const [vendorGst, setVendorGst] = useState('27ABCDE1234F1ZS');
  const [vendorBank, setVendorBank] = useState('**** 4567');
  const [toastAlert, setToastAlert] = useState(null);

  const showToast = (msg) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 3000);
  };

  // Candidates & Store State
  const [candidatesList, setCandidatesList] = useState([]);
  const [openAddCandidate, setOpenAddCandidate] = useState(false);
  const [newCandName, setNewCandName] = useState('');
  const [newCandEmail, setNewCandEmail] = useState('');
  const [newCandPhone, setNewCandPhone] = useState('');
  const [addCandError, setAddCandError] = useState('');

  const refreshCandidates = () => {
    const list = candidateStore.getCandidatesList();
    setCandidatesList(list);
  };

  useEffect(() => {
    refreshCandidates();
  }, []);

  const handleAddCandidateSubmit = (e) => {
    e.preventDefault();
    if (!newCandName.trim() || !newCandEmail.trim()) {
      setAddCandError('Please enter candidate name and email.');
      return;
    }

    try {
      candidateStore.addCandidate({
        name: newCandName.trim(),
        full_name: newCandName.trim(),
        email: newCandEmail.trim(),
        phone: newCandPhone.trim() || '+91 98765 00000',
        vendor_id: 'VENDOR-001',
        vendor_name: 'Vendor 001',
      });

      setNewCandName('');
      setNewCandEmail('');
      setNewCandPhone('');
      setAddCandError('');
      setOpenAddCandidate(false);
      refreshCandidates();
    } catch (err) {
      setAddCandError(`Failed to add candidate: ${err.message}`);
    }
  };

  const vendorScreens = [
    { id: 'login', label: '1. Vendor Login' },
    { id: 'dashboard', label: '2. Vendor Dashboard' },
    { id: 'candidates', label: '3. Candidates Roster' },
    { id: 'uploads', label: '4. Upload Status' },
    { id: 'upload_details', label: '5. Upload Details' },
    { id: 'notifications', label: '6. Notifications' },
    { id: 'profile', label: '7. Vendor Profile' },
  ];

  return (
    <ThemeProvider theme={vendorTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: { xs: 0, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Mobile Device Container Frame (Clean Mobile UI) */}
        <Box
          sx={{
            width: { xs: '100vw', sm: 380 },
            height: { xs: '100vh', sm: 780 },
            bgcolor: activeScreen === 'login' ? '#f0fdf4' : '#f8fafc',
            borderRadius: { xs: 0, sm: '40px' },
            border: { xs: 'none', sm: '12px solid #1e293b' },
            boxShadow: { xs: 'none', sm: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* Active Screen Content Canvas */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: activeScreen === 'login' ? 0 : 2, pb: 8 }}>
            
            {/* 1. VENDOR LOGIN SCREEN (Mockup Screen 1) */}
            {activeScreen === 'login' && (
              <Box sx={{ p: 3, pt: 6, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    <Storefront sx={{ fontSize: 36 }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">Vendor Login</Typography>
                  <Typography variant="caption" color="text.secondary">Welcome back! Please login to continue</Typography>
                </Box>
                <TextField fullWidth label="Email Address" defaultValue="vendor@acmevideos.com" size="small" sx={{ mb: 2 }} />
                <TextField fullWidth label="Password" type="password" defaultValue="vendor123" size="small" sx={{ mb: 3 }} />
                <Button fullWidth variant="contained" color="success" onClick={() => setActiveScreen('dashboard')} sx={{ py: 1.2, mb: 2 }}>
                  Login
                </Button>
                <Typography variant="caption" align="center" color="text.secondary">or continue with Google</Typography>
              </Box>
            )}

            {/* 2. VENDOR DASHBOARD SCREEN (Mockup Screen 2) */}
            {activeScreen === 'dashboard' && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Good Morning,</Typography>
                    <Typography variant="h6" fontWeight="bold">Vendor 001 👋</Typography>
                  </Box>
                  <IconButton onClick={handleOpenNotifications}>
                    <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Box>

                {/* Today's Progress Banner (Sleek Rounded Rectangle) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: '#10b981',
                    color: '#ffffff',
                    borderRadius: '18px',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                    mb: 2.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: '800', letterSpacing: 0.8, opacity: 0.9 }}>
                    TODAY'S PROGRESS
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.75rem' }}>Videos</Typography>
                      <Typography variant="h4" fontWeight="800" sx={{ lineHeight: 1.1 }}>{candidatesList.length * 3 || 15}</Typography>
                    </Box>
                    <Box sx={{ height: 32, width: '1px', bgcolor: 'rgba(255,255,255,0.25)' }} />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.75rem' }}>Hours</Typography>
                      <Typography variant="h4" fontWeight="800" sx={{ lineHeight: 1.1 }}>06:20</Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Clean Rectangular Approved Videos Stat Card (Earnings Removed) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    bgcolor: '#dcfce7',
                    color: '#166534',
                    borderRadius: '18px',
                    border: '1px solid #bbf7d0',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="caption" fontWeight="800" sx={{ color: '#15803d', letterSpacing: 0.5, display: 'block' }}>
                      APPROVED VIDEOS
                    </Typography>
                    <Typography variant="h4" fontWeight="800" sx={{ color: '#166534', my: 0.5 }}>
                      {vendorApprovedVideosCount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', opacity: 0.85, fontSize: '0.75rem' }}>
                      This month • Verified QC Approvals
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: '14px',
                      bgcolor: 'rgba(22, 101, 52, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      color: '#15803d',
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 26 }} />
                  </Box>
                </Paper>

                {/* Candidate Count & Status Breakdown Card */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: '18px', bgcolor: '#ffffff', border: '1px solid #e2e8f0', mb: 3 }}>
                  <Typography variant="caption" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: 0.5, mb: 1.5, display: 'block' }}>
                    CANDIDATE STATUS BREAKDOWN
                  </Typography>

                  {candidatesList.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                      <Typography variant="body2" color="text.secondary" fontWeight="600">
                        No candidates assigned yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={1}>
                      {[
                        { label: 'Total', count: candidatesList.length, color: '#6366f1', bg: '#eef2ff' },
                        { label: 'Pending', count: candidatesList.filter(c => (c.status || '').toLowerCase() === 'pending').length || 1, color: '#d97706', bg: '#fef3c7' },
                        { label: 'In Review', count: candidatesList.filter(c => ['in_review', 'active', 'in review'].includes((c.status || '').toLowerCase())).length || Math.max(0, candidatesList.length - 1), color: '#0284c7', bg: '#e0f2fe' },
                        { label: 'Shortlisted', count: candidatesList.filter(c => (c.status || '').toLowerCase() === 'shortlisted').length, color: '#16a34a', bg: '#dcfce7' },
                        { label: 'Rejected', count: candidatesList.filter(c => (c.status || '').toLowerCase() === 'rejected').length, color: '#dc2626', bg: '#fee2e2' },
                        { label: 'Hired', count: candidatesList.filter(c => ['hired', 'completed'].includes((c.status || '').toLowerCase())).length, color: '#9333ea', bg: '#f3e8ff' },
                      ].map((item, idx) => (
                        <Grid item xs={4} key={idx}>
                          <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: item.bg, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="800" sx={{ color: item.color, lineHeight: 1.1 }}>
                              {item.count}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: '700', color: item.color }}>
                              {item.label}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>

                {/* Recent Uploads */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Recent Uploads</Typography>
                {[
                  { title: 'Kitchen Video', time: 'Today, 10:30 AM', status: 'Approved', color: 'success' },
                  { title: 'Bedroom Video', time: 'Today, 08:15 AM', status: 'Pending', color: 'warning' },
                  { title: 'Garden Video', time: 'Yesterday', status: 'Rejected', color: 'error' },
                ].map((u, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{u.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.time}</Typography>
                    </Box>
                    <Chip label={u.status} color={u.color} size="small" />
                  </Paper>
                ))}
              </Box>
            )}

            {/* 3. CANDIDATES ROSTER SCREEN (Mockup Screen 3) */}
            {activeScreen === 'candidates' && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Candidates</Typography>
                  <Button size="small" variant="contained" color="success" startIcon={<PersonAdd />} onClick={() => setOpenAddCandidate(true)}>
                    + Add Candidate
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Search candidates by name or code..."
                  size="small"
                  value={candidateSearchQuery}
                  onChange={(e) => setCandidateSearchQuery(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />

                {candidatesList
                  .filter((c) => {
                    const q = candidateSearchQuery.toLowerCase().trim();
                    if (!q) return true;
                    const name = (c.name || c.full_name || '').toLowerCase();
                    const code = (c.candidate_code || c.id || '').toLowerCase();
                    const email = (c.email || '').toLowerCase();
                    return name.includes(q) || code.includes(q) || email.includes(q);
                  })
                  .map((c, i) => (
                    <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 'bold' }}>{(c.name || c.full_name || 'C')[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{c.name || c.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.candidate_code || c.id} • {c.videosCount || 0} Videos</Typography>
                        </Box>
                      </Box>
                      <Chip label={c.status || 'Active'} color="success" size="small" />
                    </Paper>
                  ))}

                {candidatesList.filter((c) => {
                  const q = candidateSearchQuery.toLowerCase().trim();
                  if (!q) return true;
                  const name = (c.name || c.full_name || '').toLowerCase();
                  const code = (c.candidate_code || c.id || '').toLowerCase();
                  const email = (c.email || '').toLowerCase();
                  return name.includes(q) || code.includes(q) || email.includes(q);
                }).length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No candidates found matching "{candidateSearchQuery}"
                  </Typography>
                )}
              </Box>
            )}

            {/* 4. UPLOAD STATUS SCREEN (Mockup Screen 4) */}
            {activeScreen === 'uploads' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Upload Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                    <Chip
                      key={status}
                      label={status}
                      color={activeUploadFilter === status ? (status === 'Rejected' ? 'error' : status === 'Approved' ? 'success' : status === 'Pending' ? 'warning' : 'primary') : 'default'}
                      onClick={() => setActiveUploadFilter(status)}
                      size="small"
                      sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                    />
                  ))}
                </Box>
                {[
                  { title: 'Kitchen Video', time: '10 May 2024, 10:30 AM', status: 'Approved', color: 'success' },
                  { title: 'Bedroom Video', time: '12 May 2024, 09:15 AM', status: 'Pending', color: 'warning' },
                  { title: 'Garden Video', time: '11 May 2024, 06:20 PM', status: 'Rejected', color: 'error' },
                ]
                  .filter((item) => activeUploadFilter === 'All' || item.status === activeUploadFilter)
                  .map((item, idx) => (
                    <Paper key={idx} onClick={() => setActiveScreen('upload_details')} elevation={0} sx={{ p: 1.5, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 44, height: 44, bgcolor: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <PlayArrow />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{item.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                        </Box>
                      </Box>
                      <Chip label={item.status} color={item.color} size="small" />
                    </Paper>
                  ))}
                {[
                  { title: 'Kitchen Video', time: '10 May 2024, 10:30 AM', status: 'Approved', color: 'success' },
                  { title: 'Bedroom Video', time: '12 May 2024, 09:15 AM', status: 'Pending', color: 'warning' },
                  { title: 'Garden Video', time: '11 May 2024, 06:20 PM', status: 'Rejected', color: 'error' },
                ].filter((item) => activeUploadFilter === 'All' || item.status === activeUploadFilter).length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No videos with status "{activeUploadFilter}"
                  </Typography>
                )}
              </Box>
            )}

            {/* 5. UPLOAD DETAILS SCREEN (Mockup Screen 5) */}
            {activeScreen === 'upload_details' && (
              <Box>
                <IconButton size="small" onClick={() => setActiveScreen('uploads')} sx={{ mb: 1 }}><ArrowBack /></IconButton>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Upload Details</Typography>
                <Box sx={{ width: '100%', height: 160, bgcolor: '#000', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', mb: 2 }}>
                  <PlayArrow sx={{ fontSize: 48 }} />
                </Box>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
                  {[
                    { label: 'Environment', val: 'Kitchen' },
                    { label: 'Duration', val: '30:15' },
                    { label: 'File Size', val: '1.24 GB' },
                    { label: 'Resolution', val: '1080p' },
                    { label: 'FPS', val: '30' },
                    { label: 'Uploaded By', val: 'Rahul Kumar' },
                  ].map((row, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none' }}>
                      <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                      <Typography variant="caption" fontWeight="bold">{row.val}</Typography>
                    </Box>
                  ))}
                </Paper>
                <Button fullWidth variant="contained" color="success">View Feedback</Button>
              </Box>
            )}

            {/* 6. NOTIFICATIONS SCREEN (Mockup Screen 6) */}
            {activeScreen === 'notifications' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                  <Button size="small" variant="text" onClick={markNotificationsAsRead} sx={{ fontSize: '0.75rem', textTransform: 'none' }}>
                    Mark all read
                  </Button>
                </Box>

                {notificationsList.map((n, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    onClick={() => handleNotificationClick(n)}
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      border: '1px solid #e2e8f0',
                      borderRadius: 3,
                      cursor: 'pointer',
                      bgcolor: n.read ? '#ffffff' : '#f0f9ff',
                      borderLeft: n.read ? '1px solid #e2e8f0' : `4px solid ${n.color || '#10b981'}`,
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#f1f5f9', transform: 'translateY(-1px)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold" style={{ color: n.color || '#10b981' }}>{n.title}</Typography>
                      {!n.read && <Chip label="New" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }} />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">{n.desc}</Typography>
                  </Paper>
                ))}

                {notificationsList.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No notifications
                  </Typography>
                )}
              </Box>
            )}

            {/* 7. PROFILE SCREEN (Mockup Screen 7) */}
            {activeScreen === 'profile' && (
              <Box sx={{ textAlign: 'center', pb: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: '#10b981', mx: 'auto', mb: 1, fontSize: 24, fontWeight: 'bold' }}>RK</Avatar>
                <Typography variant="h6" fontWeight="bold">Rahul Kumar</Typography>
                <Chip icon={<Verified />} label="Verified Vendor" color="success" size="small" sx={{ mb: 2 }} />

                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2, textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary">Email: rahul@vendor.com</Typography><br />
                  <Typography variant="caption" color="text.secondary">Phone: {vendorPhone}</Typography><br />
                  <Typography variant="caption" color="text.secondary">Joined: 15 Jan 2024</Typography><br />
                  <Typography variant="caption" color="text.secondary">Bank: {vendorBank}</Typography><br />
                  <Typography variant="caption" color="text.secondary">GST: {vendorGst}</Typography>
                </Paper>

                <Button fullWidth variant="outlined" onClick={() => setOpenEditProfileModal(true)} sx={{ mb: 1.5, py: 1.2, borderRadius: 3, fontWeight: 'bold', textTransform: 'none' }}>
                  Edit Profile & Bank Info
                </Button>

                <Button fullWidth variant="contained" color="error" startIcon={<Logout />} onClick={() => setLogoutDialogOpen(true)} sx={{ py: 1.2, borderRadius: 3, fontWeight: 'bold', textTransform: 'none' }}>
                  Sign Out
                </Button>
              </Box>
            )}

          </Box>

          {/* Bottom Navigation Bar */}
          <Box sx={{ height: 60, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
            {[
              { id: 'dashboard', icon: <Storefront />, label: 'Home' },
              { id: 'candidates', icon: <People />, label: 'Candidates' },
              { id: 'uploads', icon: <CloudUpload />, label: 'Uploads' },
              { id: 'notifications', icon: <Notifications />, label: 'Alerts' },
              { id: 'profile', icon: <Person />, label: 'Profile' },
            ].map((tab) => (
              <IconButton key={tab.id} onClick={() => handleNavigate(tab.id)} color={activeScreen === tab.id ? 'success' : 'default'}>
                {tab.icon}
              </IconButton>
            ))}
          </Box>

        </Box>

        {/* Logout Confirmation Dialog Modal */}
        <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">Confirm Sign Out</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to sign out of your vendor account? You can log back in anytime using your vendor credentials.
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

        {/* Edit Vendor Profile Modal Dialog */}
        <Dialog open={openEditProfileModal} onClose={() => setOpenEditProfileModal(false)} maxWidth="xs" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">Edit Vendor Profile</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField fullWidth label="Phone Number" value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} size="small" sx={{ mb: 2, mt: 1 }} />
            <TextField fullWidth label="Bank Account" value={vendorBank} onChange={(e) => setVendorBank(e.target.value)} size="small" sx={{ mb: 2 }} />
            <TextField fullWidth label="GST Number" value={vendorGst} onChange={(e) => setVendorGst(e.target.value)} size="small" />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenEditProfileModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
            <Button
              onClick={() => {
                setOpenEditProfileModal(false);
                showToast('Vendor profile & bank info updated!');
              }}
              variant="contained"
              color="success"
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Feedback Toast Alert */}
        {toastAlert && (
          <Alert severity="success" sx={{ position: 'absolute', bottom: 70, left: 16, right: 16, zIndex: 100, borderRadius: 3, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            {toastAlert}
          </Alert>
        )}

        {/* Add Candidate Modal Dialog */}
        <Dialog open={openAddCandidate} onClose={() => setOpenAddCandidate(false)} maxWidth="xs" fullWidth>
          <DialogTitle fontWeight="bold">Onboard New Candidate</DialogTitle>
          <form onSubmit={handleAddCandidateSubmit}>
            <DialogContent>
              {addCandError && <Alert severity="error" sx={{ mb: 2 }}>{addCandError}</Alert>}
              <TextField fullWidth label="Full Name" size="small" value={newCandName} onChange={(e) => setNewCandName(e.target.value)} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Email Address" type="email" size="small" value={newCandEmail} onChange={(e) => setNewCandEmail(e.target.value)} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Phone Number" size="small" value={newCandPhone} onChange={(e) => setNewCandPhone(e.target.value)} placeholder="+91 98765 43210" />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpenAddCandidate(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="success">Save Candidate</Button>
            </DialogActions>
          </form>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}
