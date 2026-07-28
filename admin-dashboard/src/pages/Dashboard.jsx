import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  AdminPanelSettings,
  LogoutOutlined,
  StorefrontOutlined,
  GroupOutlined,
  VideocamOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  AccessTimeOutlined,
  PaymentsOutlined,
  BarChartOutlined,
  AssessmentOutlined,
  TrendingUp,
  Refresh,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
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
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: {
    borderRadius: 14,
  },
});

export default function AdminDashboard() {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    vendors: 0,
    candidates: 0,
    videos: 0,
    approved: 0,
    rejected: 0,
    totalHours: '0.00',
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vendorRes, candRes, videoRes] = await Promise.all([
        apiService.getVendors(1, 100).catch(() => ({ data: [] })),
        apiService.getCandidates({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        apiService.getVideos({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
      ]);

      const vendorList = vendorRes.data?.items || vendorRes.data || vendorRes || [];
      const candList = candRes.data?.items || candRes.data || candRes || [];
      const videoList = videoRes.data?.items || videoRes.data || videoRes || [];

      const vList = Array.isArray(videoList) ? videoList : [];
      const approvedCount = vList.filter((v) => v.status === 'approved' || v.status === 'Approved').length;
      const rejectedCount = vList.filter((v) => v.status === 'rejected' || v.status === 'Rejected').length;

      const totalSecs = vList.reduce((acc, v) => acc + (parseFloat(v.duration_seconds) || 0), 0);

      setStats({
        vendors: Array.isArray(vendorList) ? vendorList.length : 0,
        candidates: Array.isArray(candList) ? candList.length : 0,
        videos: vList.length,
        approved: approvedCount,
        rejected: rejectedCount,
        totalHours: (totalSecs / 3600).toFixed(2),
      });

      setRecentActivities(vList.slice(0, 5));
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard overview metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = [
    {
      title: 'Total Vendors',
      value: stats.vendors,
      unit: 'Active Partners (Click to Manage)',
      icon: <StorefrontOutlined sx={{ fontSize: 28 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.15)',
      onClick: () => navigate('/vendors'),
    },
    {
      title: 'Total Candidates',
      value: stats.candidates,
      unit: 'Registered Subjects (Click to Manage)',
      icon: <GroupOutlined sx={{ fontSize: 28 }} />,
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.15)',
      onClick: () => navigate('/candidates'),
    },
    {
      title: 'Total Videos',
      value: stats.videos,
      unit: 'Uploaded Collections (Click to View)',
      icon: <VideocamOutlined sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      onClick: () => navigate('/videos'),
    },
    {
      title: 'Approved Videos',
      value: stats.approved,
      unit: 'QC Approved (Click to Filter)',
      icon: <CheckCircleOutlined sx={{ fontSize: 28 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      onClick: () => navigate('/videos'),
    },
    {
      title: 'Rejected Videos',
      value: stats.rejected,
      unit: 'Requires Re-shoot (Click to Filter)',
      icon: <CancelOutlined sx={{ fontSize: 28 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      onClick: () => navigate('/videos'),
    },
    {
      title: 'Total Hours Collected',
      value: `${stats.totalHours}`,
      unit: 'Hours (Click for Payment Summary)',
      icon: <AccessTimeOutlined sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      onClick: () => navigate('/payments'),
    },
  ];

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Toolbar sx={{ py: 1 }}>
            <AdminPanelSettings sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Admin Control Dashboard (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Video Data Collection Platform Connected to Backend API
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton color="primary" onClick={fetchDashboardData} sx={{ mr: 1 }}>
                <Refresh />
              </IconButton>
              <Button variant="contained" color="primary" startIcon={<StorefrontOutlined />} onClick={() => navigate('/vendors')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Vendors
              </Button>
              <Button variant="contained" color="secondary" startIcon={<GroupOutlined />} onClick={() => navigate('/candidates')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Candidates
              </Button>
              <Button variant="contained" color="success" startIcon={<VideocamOutlined />} onClick={() => navigate('/videos')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Videos
              </Button>
              <Button variant="contained" color="warning" startIcon={<PaymentsOutlined />} onClick={() => navigate('/payments')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Payments
              </Button>
              <Button variant="contained" color="secondary" startIcon={<BarChartOutlined />} onClick={() => navigate('/analytics')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Analytics
              </Button>
              <Button variant="contained" color="primary" startIcon={<AssessmentOutlined />} onClick={() => navigate('/reports')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Reports
              </Button>
              <Chip avatar={<Avatar sx={{ bgcolor: 'primary.main', color: '#fff' }}>A</Avatar>} label="Super Admin" variant="outlined" color="primary" />
              <Button variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Sign Out
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {error && (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchDashboardData}>Retry</Button>} sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {metrics.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  onClick={card.onClick}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: card.onClick ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-4px)', borderColor: card.color },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="700">
                      {card.title.toUpperCase()}
                    </Typography>
                    <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: card.bgColor, color: card.color }}>
                      {card.icon}
                    </Box>
                  </Box>
                  {loading ? (
                    <CircularProgress size={24} sx={{ my: 1 }} />
                  ) : (
                    <Typography variant="h3" fontWeight="bold" sx={{ color: card.color, mb: 0.5 }}>
                      {card.value}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    {card.unit}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Recent Activities */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Recent Video Submissions (API)
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography color="text.secondary">Fetching recent videos...</Typography>
              </Box>
            ) : recentActivities.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body1">No Recent Video Submissions</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VIDEO ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ENVIRONMENT</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DURATION</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivities.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{row.id}</TableCell>
                        <TableCell><Chip label={row.environment_tag || 'Dataset'} size="small" variant="outlined" /></TableCell>
                        <TableCell>{row.duration_seconds ? `${row.duration_seconds}s` : '0s'}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status || 'Pending'}
                            size="small"
                            color={row.status === 'approved' || row.status === 'Approved' ? 'success' : row.status === 'rejected' || row.status === 'Rejected' ? 'error' : 'warning'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
