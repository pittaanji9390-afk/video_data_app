import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { qcStore } from '../utils/qcStore';
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
} from '@mui/material';
import {
  AdminPanelSettings,
  Storefront,
  People,
  Videocam,
  FactCheck,
  Payments,
  Search,
  PersonAdd,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  ArrowBack,
  SupportAgent,
  PlayArrow,
  Logout,
  Download,
  Verified,
  BarChart,
  Assessment,
} from '@mui/icons-material';

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1' },
    secondary: { main: '#0ea5e9' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
  shape: { borderRadius: 16 },
});

export default function AdminPortal() {
  const navigate = useNavigate();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [screenHistory, setScreenHistory] = useState(['dashboard']);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // QC Queue & Active Review State
  const [qcQueueIndex, setQcQueueIndex] = useState(0);
  const [qcSubmissions, setQcSubmissions] = useState(() => qcStore.getSubmissions());

  const [supportTickets, setSupportTickets] = useState(() => qcStore.getSupportTickets());

  useEffect(() => {
    return qcStore.subscribeSupport((updated) => {
      setSupportTickets(updated);
    });
  }, []);

  const handleResolveTicket = (id) => {
    qcStore.updateSupportTicketStatus(id, 'Resolved');
    showToast(`Support Ticket ${id} marked as Resolved.`);
  };

  const pendingQcList = qcSubmissions.filter((item) => item.status === 'Pending' || true);

  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [openPayoutModal, setOpenPayoutModal] = useState(false);
  const [pendingPayout, setPendingPayout] = useState(250000);
  const [completedPayout, setCompletedPayout] = useState(1602000);
  const [toastAlert, setToastAlert] = useState(null);

  const showToast = (msg) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 3000);
  };

  const handleApproveQc = () => {
    const current = pendingQcList[qcQueueIndex];
    if (!current) return;
    qcStore.updateStatus(current.id, 'Approved');
    showToast(`Approved ${current.id} (${current.title}) for ${current.candidateName || current.candidate}!`);
    if (qcQueueIndex < pendingQcList.length - 1) {
      setQcQueueIndex(qcQueueIndex + 1);
    }
  };

  const handleRejectQc = () => {
    if (!rejectionReason.trim()) return;
    const current = pendingQcList[qcQueueIndex];
    if (!current) return;
    setOpenRejectModal(false);
    qcStore.updateStatus(current.id, 'Rejected', rejectionReason.trim());
    showToast(`Rejected ${current.id}: ${rejectionReason}`);
    setRejectionReason('');
    if (qcQueueIndex < pendingQcList.length - 1) {
      setQcQueueIndex(qcQueueIndex + 1);
    }
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Vendor,Candidates,Videos,Approved_Payout_INR,Status\nAcme Video Solutions,20,868,1520000,Active\nApex Data Services,158,628,365000,Active\nZenith Media Labs,25,410,253000,Inactive";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Admin_Settlement_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Platform settlement report exported (CSV)');
  };

  // Admin Vendor List State
  const [vendorsList, setVendorsList] = useState(() => {
    const stored = localStorage.getItem('platform_vendors_list');
    return stored ? JSON.parse(stored) : [
      { id: 'VEN-001', vendor_code: 'VENDOR-001', company_name: 'Acme Video Solutions', contact_person: 'John Vendor', email: 'john@acmevideos.com', candidates: 20, videos: 868, earnings: '$152,000', status: 'Active' },
      { id: 'VEN-002', vendor_code: 'VENDOR-002', company_name: 'Apex Data Services', contact_person: 'Sarah Connor', email: 'sarah@apexdata.io', candidates: 158, videos: 628, earnings: '$36,500', status: 'Active' },
      { id: 'VEN-003', vendor_code: 'VENDOR-003', company_name: 'Zenith Media Labs', contact_person: 'Robert Langdon', email: 'robert@zenithmedia.com', candidates: 25, videos: 410, earnings: '$25,300', status: 'Inactive' },
    ];
  });

  const [openAddVendor, setOpenAddVendor] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [contactName, setContactName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [addVendorErr, setAddVendorErr] = useState('');

  const handleAddVendorSubmit = (e) => {
    e.preventDefault();
    if (!vendorName.trim() || !vendorEmail.trim()) {
      setAddVendorErr('Please enter company name and email.');
      return;
    }

    const newCode = `VENDOR-00${vendorsList.length + 1}`;
    const newVendorObj = {
      id: `VEN-00${vendorsList.length + 1}`,
      vendor_code: newCode,
      company_name: vendorName.trim(),
      contact_person: contactName.trim() || 'Primary Contact',
      email: vendorEmail.trim(),
      phone: vendorPhone.trim() || '+1-555-0199',
      candidates: 0,
      videos: 0,
      earnings: '$0',
      status: 'Active',
    };

    const updated = [newVendorObj, ...vendorsList];
    setVendorsList(updated);
    localStorage.setItem('platform_vendors_list', JSON.stringify(updated));

    setVendorName('');
    setContactName('');
    setVendorEmail('');
    setVendorPhone('');
    setAddVendorErr('');
    setOpenAddVendor(false);
  };

  const adminScreens = [
    { id: 'login', label: '1. Admin Login' },
    { id: 'dashboard', label: '2. Admin Dashboard' },
    { id: 'qc_review', label: '3. QC Review Panel' },
    { id: 'vendors', label: '4. Vendor Management' },
    { id: 'analytics', label: '5. Analytics Overview' },
    { id: 'earnings', label: '6. Earnings & Payouts' },
    { id: 'reports', label: '7. Reports Generator' },
  ];

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: { xs: 0, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Mobile Device Container Frame (Clean Mobile UI) */}
        <Box
          sx={{
            width: { xs: '100vw', sm: 380 },
            height: { xs: '100vh', sm: 780 },
            bgcolor: activeScreen === 'login' ? '#312e81' : '#f8fafc',
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
          <Box sx={{ flex: 1, overflowY: 'auto', p: activeScreen === 'login' ? 0 : 2, display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. ADMIN LOGIN SCREEN (Mockup Screen 1) */}
            {activeScreen === 'login' && (
              <Box sx={{ p: 3, pt: 6, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', color: '#fff' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Avatar sx={{ bgcolor: '#6366f1', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    <AdminPanelSettings sx={{ fontSize: 36 }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold">Admin Login</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Welcome back! Please login to continue</Typography>
                </Box>
                <TextField fullWidth label="Email Address" defaultValue="admin@videoplatform.com" size="small" sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }} />
                <TextField fullWidth label="Password" type="password" defaultValue="admin123" size="small" sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2 }} />
                <Button fullWidth variant="contained" color="primary" onClick={() => setActiveScreen('dashboard')} sx={{ py: 1.2, mb: 2 }}>
                  Login
                </Button>
                <Typography variant="caption" align="center" sx={{ opacity: 0.8 }}>or continue with Google</Typography>
              </Box>
            )}

            {/* 2. ADMIN DASHBOARD SCREEN (Mockup Screen 2) */}
            {activeScreen === 'dashboard' && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Hello, Admin 👋</Typography>
                    <Typography variant="caption" color="text.secondary">Here's what's happening today</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#6366f1' }}><AdminPanelSettings /></Avatar>
                </Box>

                {/* 2x3 Grid Stats Cards (Matching Image 2 Screen 2) */}
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  {[
                    { label: 'Vendors', val: vendorsList.length, color: '#6366f1', icon: <Storefront />, target: 'vendors' },
                    { label: 'Candidates', val: '1,248', color: '#0ea5e9', icon: <People />, target: 'vendors' },
                    { label: 'Videos', val: '8,542', color: '#8b5cf6', icon: <Videocam />, target: 'qc_review' },
                    { label: 'Pending QC', val: pendingQcList.length, color: '#f59e0b', icon: <HourglassEmpty />, target: 'qc_review' },
                    { label: 'Approved', val: '7,950', color: '#10b981', icon: <CheckCircle />, target: 'qc_review' },
                    { label: 'Rejected', val: '592', color: '#ef4444', icon: <Cancel />, target: 'qc_review' },
                  ].map((tile, i) => (
                    <Grid item xs={6} key={i}>
                      <Paper
                        elevation={0}
                        onClick={() => handleNavigate(tile.target)}
                        sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 3, cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" fontWeight="bold" style={{ color: tile.color }}>{tile.label}</Typography>
                          {tile.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="bold">{tile.val}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Recent Activities */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Recent Activities</Typography>
                {[
                  { title: 'New Vendor Added', desc: 'Acme Video Solutions', time: '10:30 AM' },
                  { title: 'Video Approved', desc: 'Kitchen Video - Rahul', time: '09:45 AM' },
                  { title: 'Payment Released', desc: 'Vendor ABC - ₹15,200', time: 'Yesterday' },
                ].map((act, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{act.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{act.desc}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{act.time}</Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {/* 3. QC REVIEW PANEL SCREEN (Mockup Screen 3) */}
            {activeScreen === 'qc_review' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Video Review (QC Panel)</Typography>
                {pendingQcList[qcQueueIndex] ? (
                  <>
                    <Box sx={{ width: '100%', height: 180, bgcolor: '#000', borderRadius: 3, overflow: 'hidden', mb: 2, position: 'relative' }}>
                      <video
                        controls
                        src={pendingQcList[qcQueueIndex].videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>

                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">{pendingQcList[qcQueueIndex].title}</Typography>
                        <Chip label={pendingQcList[qcQueueIndex].status} color={pendingQcList[qcQueueIndex].status === 'Approved' ? 'success' : pendingQcList[qcQueueIndex].status === 'Rejected' ? 'error' : 'warning'} size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block"><strong>ID:</strong> {pendingQcList[qcQueueIndex].id}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block"><strong>Candidate:</strong> {pendingQcList[qcQueueIndex].candidateName || pendingQcList[qcQueueIndex].candidate}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block"><strong>Phone:</strong> {pendingQcList[qcQueueIndex].candidatePhone || '+91 98765 43210'}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block"><strong>Vendor:</strong> {pendingQcList[qcQueueIndex].vendor}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block"><strong>Environment Tag:</strong> {pendingQcList[qcQueueIndex].env || 'Kitchen'}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block"><strong>Duration:</strong> {pendingQcList[qcQueueIndex].duration}</Typography>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#dcfce7', borderRadius: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36, fontSize: 14 }}>{pendingQcList[qcQueueIndex].score}%</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="#10b981">Quality Score {pendingQcList[qcQueueIndex].score}%</Typography>
                        <Typography variant="caption" color="text.secondary">Audio, lighting & room environment verified</Typography>
                      </Box>
                    </Paper>

                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <Button fullWidth variant="outlined" color="error" onClick={() => setOpenRejectModal(true)} sx={{ py: 1.2, fontWeight: 'bold' }}>
                        Reject Video
                      </Button>
                      <Button fullWidth variant="contained" color="success" onClick={handleApproveQc} sx={{ py: 1.2, fontWeight: 'bold' }}>
                        Approve Video
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button size="small" disabled={qcQueueIndex === 0} onClick={() => setQcQueueIndex((prev) => prev - 1)}>
                        Previous
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Video {qcQueueIndex + 1} of {pendingQcList.length}
                      </Typography>
                      <Button size="small" disabled={qcQueueIndex >= pendingQcList.length - 1} onClick={() => setQcQueueIndex((prev) => prev + 1)}>
                        Next
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No videos found in QC evaluation queue.
                  </Typography>
                )}
              </Box>
            )}

            {/* 4. VENDOR MANAGEMENT SCREEN (Mockup Screen 4) */}
            {activeScreen === 'vendors' && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Vendor Management</Typography>
                  <Button size="small" variant="contained" color="primary" onClick={() => setOpenAddVendor(true)}>
                    + Add Vendor
                  </Button>
                </Box>
                <TextField fullWidth placeholder="Search vendors..." size="small" sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />

                {vendorsList.map((v, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 2, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{v.company_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{v.vendor_code} • {v.contact_person}</Typography>
                      </Box>
                      <Chip label={v.status || 'Active'} color={v.status === 'Inactive' ? 'default' : 'success'} size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">Candidates: {v.candidates || 20} • Videos: {v.videos || 868}</Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {/* 5. ANALYTICS OVERVIEW SCREEN (Mockup Screen 5) */}
            {activeScreen === 'analytics' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Analytics Overview</Typography>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                      <Typography variant="caption" color="text.secondary">Total Videos</Typography>
                      <Typography variant="h6" fontWeight="bold">8,542</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                      <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                      <Typography variant="h6" fontWeight="bold">652.30</Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                  <Typography variant="caption" fontWeight="bold" gutterBottom>Video Status Distribution</Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Chip label="Approved: 7,950" color="success" size="small" />
                    <Chip label="Rejected: 592" color="error" size="small" />
                    <Chip label="Pending: 124" color="warning" size="small" />
                  </Box>
                </Paper>
              </Box>
            )}

            {/* 6. EARNINGS & PAYOUTS SCREEN (Mockup Screen 6) */}
            {activeScreen === 'earnings' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Earnings & Payouts</Typography>
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#312e81', color: '#fff', borderRadius: 4, mb: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Platform Payout</Typography>
                  <Typography variant="h4" fontWeight="bold">₹{(pendingPayout + completedPayout).toLocaleString()}</Typography>
                </Paper>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fef3c7', borderRadius: 3 }}>
                      <Typography variant="caption" color="#b45309">Pending Settlement</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#b45309">₹{pendingPayout.toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#dcfce7', borderRadius: 3 }}>
                      <Typography variant="caption" color="#10b981">Completed Payouts</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#10b981">₹{completedPayout.toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Button fullWidth variant="contained" color="success" onClick={() => setOpenPayoutModal(true)} disabled={pendingPayout === 0} sx={{ py: 1.4, borderRadius: 3, fontWeight: 'bold' }}>
                  Process Settlement Payout
                </Button>
              </Box>
            )}

            {/* 7. REPORTS GENERATOR SCREEN (Mockup Screen 7) */}
            {activeScreen === 'reports' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Financial Reports</Typography>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Generate Settlement Report</Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>Select Date Range & Export Format</Typography>
                  <Button fullWidth variant="contained" color="primary" startIcon={<Download />} onClick={handleExportReport} sx={{ mb: 2, py: 1.2, borderRadius: 3, fontWeight: 'bold' }}>
                    Generate Report (CSV)
                  </Button>
                  <Button fullWidth variant="outlined" color="error" startIcon={<Logout />} onClick={() => setLogoutDialogOpen(true)} sx={{ py: 1.2, borderRadius: 3, fontWeight: 'bold', textTransform: 'none' }}>
                    Sign Out Admin
                  </Button>
                </Paper>
              </Box>
            )}

            {/* 8. SUPPORT & OPERATIONS TICKETS SCREEN */}
            {activeScreen === 'support' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Support Tickets & Inbox</Typography>
                  <Chip label={`${supportTickets.filter((t) => t.status === 'Open').length} Open`} color="error" size="small" />
                </Box>

                {supportTickets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No support tickets received yet.
                  </Typography>
                ) : (
                  supportTickets.map((item, idx) => (
                    <Paper
                      key={item.id || idx}
                      elevation={0}
                      sx={{ p: 2, mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 3 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">{item.id} • {item.candidateName}</Typography>
                        <Chip label={item.status} color={item.status === 'Open' ? 'error' : 'success'} size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Candidate ID:</strong> {item.candidateId} | <strong>Phone:</strong> {item.phone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        <strong>Received:</strong> {item.timestamp}
                      </Typography>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #cbd5e1', mb: 1.5 }}>
                        <Typography variant="body2" color="text.primary">
                          "{item.message}"
                        </Typography>
                      </Paper>
                      {item.status === 'Open' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleResolveTicket(item.id)}
                          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                    </Paper>
                  ))
                )}
              </Box>
            )}

            {/* Powered by Footer */}
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 'auto', pt: 3, pb: 1.5, fontSize: '0.75rem', fontWeight: 600, opacity: 0.85, textAlign: 'center', width: '100%' }}>
              Powered by <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>ElevateIQ Softtech</Box>
            </Typography>

          </Box>

          {/* Bottom Navigation Bar */}
          <Box sx={{ height: 60, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
            {[
              { id: 'dashboard', icon: <AdminPanelSettings />, label: 'Dashboard' },
              { id: 'vendors', icon: <Storefront />, label: 'Vendors' },
              { id: 'qc_review', icon: <FactCheck />, label: 'QC Review' },
              { id: 'support', icon: <SupportAgent />, label: 'Support' },
              { id: 'earnings', icon: <Payments />, label: 'Payments' },
            ].map((tab) => (
              <IconButton key={tab.id} onClick={() => handleNavigate(tab.id)} color={activeScreen === tab.id ? 'primary' : 'default'}>
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
              Are you sure you want to sign out of the Admin portal? You can log back in anytime using your admin credentials.
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

        {/* Add Vendor Modal Dialog */}
        <Dialog open={openAddVendor} onClose={() => setOpenAddVendor(false)} maxWidth="xs" fullWidth>
          <DialogTitle fontWeight="bold">Add New Vendor</DialogTitle>
          <form onSubmit={handleAddVendorSubmit}>
            <DialogContent>
              {addVendorErr && <Alert severity="error" sx={{ mb: 2 }}>{addVendorErr}</Alert>}
              <TextField fullWidth label="Company Name" size="small" value={vendorName} onChange={(e) => setVendorName(e.target.value)} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Contact Person" size="small" value={contactName} onChange={(e) => setContactName(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth label="Email Address" type="email" size="small" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Phone Number" size="small" value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} placeholder="+1-555-0199" />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpenAddVendor(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Create Vendor</Button>
            </DialogActions>
          </form>
        </Dialog>
        {/* Rejection Reason Dialog Modal */}
        <Dialog open={openRejectModal} onClose={() => setOpenRejectModal(false)} maxWidth="xs" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">Reject Video Sample</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Specify the quality control rejection reason for video sample <strong>{pendingQcList[qcQueueIndex]?.id}</strong>.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              placeholder="e.g. Low lighting, background noise, insufficient duration..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenRejectModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
            <Button onClick={handleRejectQc} variant="contained" color="error" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
              Submit Rejection
            </Button>
          </DialogActions>
        </Dialog>

        {/* Process Settlement Payout Dialog Modal */}
        <Dialog open={openPayoutModal} onClose={() => setOpenPayoutModal(false)} maxWidth="xs" fullWidth paperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle fontWeight="bold">Process Settlement Payout</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Confirm batch settlement payout of <strong>₹{pendingPayout.toLocaleString()}</strong> to active vendors and collection candidates.
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Payout Channel</Typography>
              <Typography variant="body2" fontWeight="bold" color="#166534">NEFT / RTGS Automated Clearing House</Typography>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenPayoutModal(false)} sx={{ textTransform: 'none', color: '#64748b' }}>Cancel</Button>
            <Button
              onClick={() => {
                setOpenPayoutModal(false);
                setCompletedPayout((prev) => prev + pendingPayout);
                setPendingPayout(0);
                showToast('Settlement payout processed successfully!');
              }}
              variant="contained"
              color="success"
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
            >
              Authorize Payout
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
