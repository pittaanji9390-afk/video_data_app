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
  const [activeScreen, setActiveScreen] = useState('dashboard'); // login, dashboard, qc_review, vendors, analytics, earnings, reports, settings

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
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Top App Role Switcher Bar */}
        <Paper
          elevation={4}
          sx={{
            p: 1.5,
            mb: 2,
            bgcolor: '#0f172a',
            color: '#fff',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            maxWidth: 1000,
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" fontWeight="bold" sx={{ color: '#38bdf8' }}>
            📱 SWITCH MOBILE APP VIEW:
          </Typography>
          <Button size="small" variant="outlined" sx={{ color: '#38bdf8', borderColor: '#38bdf8', textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }} onClick={() => navigate('/candidate-portal')}>
            👤 Candidate App
          </Button>
          <Button size="small" variant="outlined" sx={{ color: '#10b981', borderColor: '#10b981', textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }} onClick={() => navigate('/vendor-portal')}>
            🏪 Vendor App
          </Button>
          <Button size="small" variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
            🛡️ Admin App
          </Button>
        </Paper>

        {/* Top PPT Screen Switcher Bar */}
        <Paper
          elevation={4}
          sx={{
            p: 1.5,
            mb: 3,
            bgcolor: '#1e293b',
            color: '#fff',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            maxWidth: 1000,
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" fontWeight="bold" sx={{ color: '#818cf8', mr: 1 }}>
            📑 ADMIN MOCKUP SWITCHER:
          </Typography>
          {adminScreens.map((screen) => (
            <Button
              key={screen.id}
              size="small"
              variant={activeScreen === screen.id ? 'contained' : 'outlined'}
              color={activeScreen === screen.id ? 'primary' : 'inherit'}
              onClick={() => setActiveScreen(screen.id)}
              sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
            >
              {screen.label}
            </Button>
          ))}
          <Button size="small" variant="contained" color="error" onClick={() => navigate('/login')} sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}>
            Sign Out
          </Button>
        </Paper>

        {/* Mobile Device Container Frame (Matches Exact PPT Design Frame) */}
        <Box
          sx={{
            width: 380,
            height: 780,
            bgcolor: activeScreen === 'login' ? '#312e81' : '#f8fafc',
            borderRadius: '40px',
            border: '12px solid #1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Notch Status Bar */}
          <Box sx={{ height: 28, bgcolor: activeScreen === 'login' ? '#312e81' : '#fff', px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
            <Typography variant="caption" fontWeight="bold" color={activeScreen === 'login' ? '#fff' : '#0f172a'}>
              9:41
            </Typography>
            <Box sx={{ width: 110, height: 18, bgcolor: '#1e293b', borderRadius: '0 0 10px 10px', mx: 'auto' }} />
            <Typography variant="caption" color={activeScreen === 'login' ? '#fff' : '#0f172a'}>
              📶 🔋
            </Typography>
          </Box>

          {/* Active Screen Content Canvas */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: activeScreen === 'login' ? 0 : 2, pb: 8 }}>
            
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
                    { label: 'Vendors', val: vendorsList.length, color: '#6366f1', icon: <Storefront /> },
                    { label: 'Candidates', val: '1,248', color: '#0ea5e9', icon: <People /> },
                    { label: 'Videos', val: '8,542', color: '#8b5cf6', icon: <Videocam /> },
                    { label: 'Pending QC', val: '124', color: '#f59e0b', icon: <HourglassEmpty /> },
                    { label: 'Approved', val: '7,950', color: '#10b981', icon: <CheckCircle /> },
                    { label: 'Rejected', val: '592', color: '#ef4444', icon: <Cancel /> },
                  ].map((tile, i) => (
                    <Grid item xs={6} key={i}>
                      <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
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
                <Box sx={{ width: '100%', height: 180, bgcolor: '#000', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', mb: 2, position: 'relative' }}>
                  <PlayArrow sx={{ fontSize: 54 }} />
                  <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, right: 12, bgcolor: 'rgba(0,0,0,0.7)', px: 1, borderRadius: 1 }}>30:15</Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Vendor: ABC Solutions</Typography><br />
                  <Typography variant="caption" color="text.secondary">Candidate: Rahul Kumar</Typography><br />
                  <Typography variant="caption" color="text.secondary">Duration: 30:15</Typography><br />
                  <Typography variant="caption" color="text.secondary">Uploaded: 12 May 2024, 10:30 AM</Typography><br />
                  <Typography variant="caption" color="text.secondary">Environment: Kitchen</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#dcfce7', borderRadius: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36, fontSize: 14 }}>92%</Avatar>
                  <Box><Typography variant="body2" fontWeight="bold" color="#10b981">Quality Score 92%</Typography><Typography variant="caption" color="text.secondary">Good video quality</Typography></Box>
                </Paper>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button fullWidth variant="outlined" color="error">Reject</Button>
                  <Button fullWidth variant="contained" color="primary">Approve</Button>
                </Box>
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
                        <Typography variant="caption" color="text.secondary">{v.vendor_code}</Typography>
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
                <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#6366f1', color: '#fff', borderRadius: 4, mb: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Payout</Typography>
                  <Typography variant="h4" fontWeight="bold">₹18,52,000</Typography>
                </Paper>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fef3c7', borderRadius: 3 }}>
                      <Typography variant="caption" color="#b45309">Pending</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#b45309">₹2,50,000</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#dcfce7', borderRadius: 3 }}>
                      <Typography variant="caption" color="#10b981">Completed</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#10b981">₹16,02,000</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* 7. REPORTS GENERATOR SCREEN (Mockup Screen 7) */}
            {activeScreen === 'reports' && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Financial Reports</Typography>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Generate Settlement Report</Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>Select Date Range & Export Format</Typography>
                  <Button fullWidth variant="contained" color="primary" startIcon={<Download />}>
                    Generate Report (CSV)
                  </Button>
                </Paper>
              </Box>
            )}

          </Box>

          {/* Bottom Navigation Bar */}
          <Box sx={{ height: 60, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
            {[
              { id: 'dashboard', icon: <AdminPanelSettings />, label: 'Dashboard' },
              { id: 'vendors', icon: <Storefront />, label: 'Vendors' },
              { id: 'qc_review', icon: <FactCheck />, label: 'QC Review' },
              { id: 'earnings', icon: <Payments />, label: 'Payments' },
              { id: 'reports', icon: <Assessment />, label: 'Reports' },
            ].map((tab) => (
              <IconButton key={tab.id} onClick={() => setActiveScreen(tab.id)} color={activeScreen === tab.id ? 'primary' : 'default'}>
                {tab.icon}
              </IconButton>
            ))}
          </Box>

        </Box>

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

      </Box>
    </ThemeProvider>
  );
}
