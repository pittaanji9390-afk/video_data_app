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
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  LogoutOutlined,
  ArrowBack,
  BarChartOutlined,
  StorefrontOutlined,
  GroupOutlined,
  VideocamOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  AccessTimeOutlined,
  Refresh,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { apiService } from '../services/api';

const adminTheme = createTheme({
  palette: {
    mode: 'light',
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
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
});

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaryStats, setSummaryStats] = useState({
    vendors: 0,
    candidates: 0,
    videos: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    totalHours: '0.00',
  });

  const [environmentChartData, setEnvironmentChartData] = useState([]);
  const [vendorChartData, setVendorChartData] = useState([]);
  const [statusDistributionData, setStatusDistributionData] = useState([]);

  const fetchAnalytics = async () => {
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
      const pendingCount = vList.filter((v) => !v.status || v.status === 'pending' || v.status === 'Pending').length;

      const totalSecs = vList.reduce((acc, v) => acc + (parseFloat(v.duration_seconds) || 0), 0);

      setSummaryStats({
        vendors: Array.isArray(vendorList) ? vendorList.length : 0,
        candidates: Array.isArray(candList) ? candList.length : 0,
        videos: vList.length,
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount,
        totalHours: (totalSecs / 3600).toFixed(2),
      });

      // Environment Tag grouping
      const envMap = {};
      vList.forEach((v) => {
        const env = v.environment_tag || 'Others';
        envMap[env] = (envMap[env] || 0) + 1;
      });
      const envData = Object.keys(envMap).map((env, idx) => ({
        environment: env,
        count: envMap[env],
        color: ['#f97316', '#8b5cf6', '#0ea5e9', '#10b981', '#6366f1', '#64748b'][idx % 6],
      }));
      setEnvironmentChartData(envData.length > 0 ? envData : [
        { environment: 'Kitchen', count: 0, color: '#f97316' },
        { environment: 'Bedroom', count: 0, color: '#8b5cf6' },
      ]);

      // Vendor grouping
      const venMap = {};
      vList.forEach((v) => {
        const ven = v.vendor_name || 'Vendor Partner';
        venMap[ven] = (venMap[ven] || 0) + 1;
      });
      const venData = Object.keys(venMap).map((ven) => ({
        vendor: ven,
        videos: venMap[ven],
      }));
      setVendorChartData(venData);

      // Status distribution
      setStatusDistributionData([
        { name: 'Approved Videos', value: approvedCount, color: '#10b981' },
        { name: 'Pending QC', value: pendingCount, color: '#f59e0b' },
        { name: 'Rejected Videos', value: rejectedCount, color: '#ef4444' },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summaryCards = [
    { title: 'Total Vendors', value: summaryStats.vendors, icon: <StorefrontOutlined sx={{ fontSize: 26 }} />, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.15)' },
    { title: 'Total Candidates', value: summaryStats.candidates, icon: <GroupOutlined sx={{ fontSize: 26 }} />, color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.15)' },
    { title: 'Total Videos', value: summaryStats.videos, icon: <VideocamOutlined sx={{ fontSize: 26 }} />, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
    { title: 'Approved Videos', value: summaryStats.approved, icon: <CheckCircleOutlined sx={{ fontSize: 26 }} />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    { title: 'Rejected Videos', value: summaryStats.rejected, icon: <CancelOutlined sx={{ fontSize: 26 }} />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
    { title: 'Pending Videos', value: summaryStats.pending, icon: <HourglassEmptyOutlined sx={{ fontSize: 26 }} />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
    { title: 'Total Hours Collected', value: `${summaryStats.totalHours} hrs`, icon: <AccessTimeOutlined sx={{ fontSize: 26 }} />, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)' },
  ];

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <BarChartOutlined sx={{ mr: 1.5, color: 'secondary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Platform Analytics & Insights (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live backend REST API analytics visualization
              </Typography>
            </Box>

            <IconButton color="secondary" onClick={fetchAnalytics} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>

            <Button variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {error && (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchAnalytics}>Retry</Button>} sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {summaryCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">{card.title.toUpperCase()}</Typography>
                    <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: card.bgColor, color: card.color }}>{card.icon}</Box>
                  </Box>
                  {loading ? (
                    <CircularProgress size={24} sx={{ my: 0.5 }} />
                  ) : (
                    <Typography variant="h4" fontWeight="bold" sx={{ color: card.color }}>{card.value}</Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
              <CircularProgress color="secondary" />
              <Typography color="text.secondary">Rendering live charts from API...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Videos by Environment Tag</Typography>
                  <Box sx={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={environmentChartData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                        <XAxis dataKey="environment" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: 8 }} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {environmentChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Approval Status Distribution</Typography>
                  <Box sx={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {statusDistributionData.map((entry, idx) => (
                            <Cell key={`pie-cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: 8 }} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
