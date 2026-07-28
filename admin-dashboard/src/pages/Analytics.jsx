import React from 'react';
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
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  AdminPanelSettings,
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

// Static Dummy Dataset for Analytics Summary Cards
const SUMMARY_CARDS = [
  {
    title: 'Total Vendors',
    value: '24',
    icon: <StorefrontOutlined sx={{ fontSize: 26 }} />,
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
  },
  {
    title: 'Total Candidates',
    value: '142',
    icon: <GroupOutlined sx={{ fontSize: 26 }} />,
    color: '#0ea5e9',
    bgColor: 'rgba(14, 165, 233, 0.15)',
  },
  {
    title: 'Total Videos',
    value: '528',
    icon: <VideocamOutlined sx={{ fontSize: 26 }} />,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
  },
  {
    title: 'Approved Videos',
    value: '410',
    icon: <CheckCircleOutlined sx={{ fontSize: 26 }} />,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    title: 'Rejected Videos',
    value: '45',
    icon: <CancelOutlined sx={{ fontSize: 26 }} />,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  {
    title: 'Pending Videos',
    value: '73',
    icon: <HourglassEmptyOutlined sx={{ fontSize: 26 }} />,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  {
    title: 'Total Hours Collected',
    value: '185.50 hrs',
    icon: <AccessTimeOutlined sx={{ fontSize: 26 }} />,
    color: '#ec4899', // Pink
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
];

// Static Dummy Chart Data 1: Videos by Environment
const ENVIRONMENT_CHART_DATA = [
  { environment: 'Kitchen', count: 145, color: '#f97316' },
  { environment: 'Bedroom', count: 120, color: '#8b5cf6' },
  { environment: 'Bathroom', count: 85, color: '#0ea5e9' },
  { environment: 'Garden', count: 95, color: '#10b981' },
  { environment: 'Office', count: 55, color: '#6366f1' },
  { environment: 'Others', count: 28, color: '#64748b' },
];

// Static Dummy Chart Data 2: Videos by Vendor
const VENDOR_CHART_DATA = [
  { vendor: 'Acme Video Solutions', videos: 180 },
  { vendor: 'Apex Data Services', videos: 140 },
  { vendor: 'Global Vision Media', videos: 120 },
  { vendor: 'Starlight Analytics', videos: 88 },
];

// Static Dummy Chart Data 3: Approval Status Distribution
const STATUS_DISTRIBUTION_DATA = [
  { name: 'Approved Videos', value: 410, color: '#10b981' },
  { name: 'Pending QC', value: 73, color: '#f59e0b' },
  { name: 'Rejected Videos', value: 45, color: '#ef4444' },
];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

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
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <BarChartOutlined sx={{ mr: 1.5, color: 'secondary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Platform Analytics & Insights
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Visual distributions of video environment tags, vendor throughput, and approval metrics
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
          {/* Header Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Executive Summary & Visual Charts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time visualization of dataset collection progress across all vendor streams.
            </Typography>
          </Box>

          {/* 7 Summary Cards Responsive Row Grid */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {SUMMARY_CARDS.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} lg={index === 6 ? 3 : 3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: card.color,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      {card.title.toUpperCase()}
                    </Typography>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2.5,
                        bgcolor: card.bgColor,
                        color: card.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: card.color }}>
                    {card.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Charts Row Grid */}
          <Grid container spacing={3}>
            {/* Chart 1: Videos by Environment */}
            <Grid item xs={12} lg={6}>
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
                  Videos by Environment Tag
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                  Distribution of recorded videos across indoor & outdoor environment categories
                </Typography>

                <Box sx={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ENVIRONMENT_CHART_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                      <XAxis dataKey="environment" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: 8, borderColor: '#334155' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {ENVIRONMENT_CHART_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Chart 2: Approval Status Distribution */}
            <Grid item xs={12} lg={6}>
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
                  Approval Status Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                  Proportion of Approved, Pending, and Rejected Quality Control submissions
                </Typography>

                <Box sx={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={STATUS_DISTRIBUTION_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      >
                        {STATUS_DISTRIBUTION_DATA.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: 8, borderColor: '#334155' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Chart 3: Videos by Vendor */}
            <Grid item xs={12}>
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
                  Video Collection Volume by Vendor
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                  Comparative volume of submitted video samples per vendor partner
                </Typography>

                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={VENDOR_CHART_DATA}
                      margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                    >
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis type="category" dataKey="vendor" stroke="#94a3b8" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: 8, borderColor: '#334155' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Bar dataKey="videos" fill="#6366f1" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
