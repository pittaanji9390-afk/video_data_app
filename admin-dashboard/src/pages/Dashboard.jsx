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
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  TrendingUp,
} from '@mui/icons-material';

// Tailored Modern Dark Theme
const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
    },
    secondary: {
      main: '#0ea5e9', // Sky Blue
    },
    success: {
      main: '#10b981', // Emerald Green
    },
    error: {
      main: '#ef4444', // Red
    },
    warning: {
      main: '#f59e0b', // Amber
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

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Static Dummy Data for Dashboard Metrics
  const metrics = [
    {
      title: 'Total Vendors',
      value: '24',
      unit: 'Active Partners (Click to Manage)',
      icon: <StorefrontOutlined sx={{ fontSize: 28 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.15)',
      onClick: () => navigate('/vendors'),
    },
    {
      title: 'Total Candidates',
      value: '142',
      unit: 'Registered Subjects (Click to Manage)',
      icon: <GroupOutlined sx={{ fontSize: 28 }} />,
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.15)',
      onClick: () => navigate('/candidates'),
    },
    {
      title: 'Total Videos',
      value: '528',
      unit: 'Uploaded Collections (Click to View)',
      icon: <VideocamOutlined sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      onClick: () => navigate('/videos'),
    },
    {
      title: 'Approved Videos',
      value: '410',
      unit: 'QC Approved (Click to Filter)',
      icon: <CheckCircleOutlined sx={{ fontSize: 28 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      onClick: () => navigate('/videos'),
    },
    {
      title: 'Rejected Videos',
      value: '45',
      unit: 'Requires Re-shoot (Click to Filter)',
      icon: <CancelOutlined sx={{ fontSize: 28 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      onClick: () => navigate('/videos'),
    },
    {
      title: 'Total Hours Collected',
      value: '185.50',
      unit: 'Hours (Click for Payment Summary)',
      icon: <AccessTimeOutlined sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      onClick: () => navigate('/payments'),
    },
  ];

  // Static Dummy Data for Recent Activity Log
  const recentActivities = [
    {
      id: 'VID-9021',
      vendor: 'Acme Video Solutions',
      candidate: 'John Doe (CND-042)',
      environment: 'Kitchen',
      duration: '45 mins',
      status: 'Approved',
      reviewer: 'Alice Auditor',
    },
    {
      id: 'VID-9022',
      vendor: 'Apex Data Services',
      candidate: 'Sarah Smith (CND-089)',
      environment: 'Bedroom',
      duration: '30 mins',
      status: 'Rejected',
      reviewer: 'Bob Reviewer',
    },
    {
      id: 'VID-9023',
      vendor: 'Global Vision Media',
      candidate: 'Michael Brown (CND-112)',
      environment: 'Office',
      duration: '60 mins',
      status: 'Approved',
      reviewer: 'Alice Auditor',
    },
    {
      id: 'VID-9024',
      vendor: 'Acme Video Solutions',
      candidate: 'Emily Davis (CND-055)',
      environment: 'Garden',
      duration: '50 mins',
      status: 'Pending',
      reviewer: 'Unassigned',
    },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        {/* Navigation Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <AdminPanelSettings sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Admin Control Dashboard
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Video Data Collection Platform Management
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<StorefrontOutlined />}
                onClick={() => navigate('/vendors')}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Vendors
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<GroupOutlined />}
                onClick={() => navigate('/candidates')}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Candidates
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<VideocamOutlined />}
                onClick={() => navigate('/videos')}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Videos
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<PaymentsOutlined />}
                onClick={() => navigate('/payments')}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Payments
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<BarChartOutlined />}
                onClick={() => navigate('/analytics')}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Analytics
              </Button>
              <Chip
                avatar={<Avatar sx={{ bgcolor: 'primary.main', color: '#fff' }}>A</Avatar>}
                label="Super Admin"
                variant="outlined"
                color="primary"
              />
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutOutlined />}
                onClick={handleLogout}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Sign Out
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Dashboard Content Container */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Welcome & Overview Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              bgcolor: 'background.paper',
              backgroundImage:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  Platform Metrics & Analytics
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label="View Full Analytics Charts"
                  color="success"
                  onClick={() => navigate('/analytics')}
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                Overview of vendors, candidate dataset collection, quality control approvals, and hours.
              </Typography>
            </Box>
          </Paper>

          {/* 6 Metric Cards Grid */}
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
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px -8px ${card.bgColor}`,
                      borderColor: card.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="700">
                      {card.title.toUpperCase()}
                    </Typography>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
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
                  <Typography variant="h3" fontWeight="bold" sx={{ color: card.color, mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    {card.unit}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Recent Video Collections Table Summary */}
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
              Recent Video Collection Submissions
            </Typography>

            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="recent videos table">
                <TableHead>
                  <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VIDEO ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VENDOR</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CANDIDATE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ENVIRONMENT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DURATION</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>REVIEWER</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {row.id}
                      </TableCell>
                      <TableCell>{row.vendor}</TableCell>
                      <TableCell>{row.candidate}</TableCell>
                      <TableCell>
                        <Chip label={row.environment} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{row.duration}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={
                            row.status === 'Approved'
                              ? 'success'
                              : row.status === 'Rejected'
                              ? 'error'
                              : 'warning'
                          }
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>{row.reviewer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
