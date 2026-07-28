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
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  AdminPanelSettings,
  LogoutOutlined,
  GroupOutlined,
  StorefrontOutlined,
  VideocamOutlined,
} from '@mui/icons-material';

const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const statCards = [
    { title: 'Total Admins', value: '4 Active', icon: <AdminPanelSettings color="primary" /> },
    { title: 'Registered Vendors', value: '12 Vendors', icon: <StorefrontOutlined color="secondary" /> },
    { title: 'Candidates Registered', value: '85 Candidates', icon: <GroupOutlined color="info" /> },
    { title: 'Uploaded Videos', value: '342 Files', icon: <VideocamOutlined color="warning" /> },
  ];

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Navigation Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Toolbar>
            <AdminPanelSettings sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Admin Control Panel
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutOutlined />}
              onClick={handleLogout}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Dashboard Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Welcome Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              bgcolor: 'background.paper',
              backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(30, 41, 59, 1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome to Video Platform Admin Panel
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage platform administrators, vendors, candidate collections, video quality control reviews, and payment calculations.
            </Typography>
          </Paper>

          {/* Quick Stats Grid */}
          <Grid container spacing={3}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', mr: 1.5 }}>
                      {card.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {card.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
