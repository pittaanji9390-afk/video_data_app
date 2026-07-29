import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Chip,
  Divider,
  Button,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Group as VendorsIcon,
  People as CandidatesIcon,
  Videocam as VideosIcon,
  FactCheck as QCIcon,
  Payment as PaymentsIcon,
  BarChart as AnalyticsIcon,
  Assessment as ReportsIcon,
  CloudUpload as UploadIcon,
  AccountBalanceWallet as EarningsIcon,
  Mic as RecordingIcon,
  Logout as LogoutIcon,
  SwapHoriz as SwitchRoleIcon,
  VideocamOutlined,
  Person,
  CheckCircle,
} from '@mui/icons-material';

export default function MobileNavigation({ children, title = 'Video Platform' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get current user auth role from localStorage
  const currentRole = (localStorage.getItem('userRole') || 'admin').toLowerCase();
  const userName = localStorage.getItem('userName') || (currentRole === 'vendor' ? 'Acme Vendor' : currentRole === 'candidate' ? 'John Doe' : 'Admin User');
  const userEmail = localStorage.getItem('userEmail') || `${currentRole}@videoplatform.com`;

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // Nav items per role
  const getNavItems = () => {
    if (currentRole === 'vendor') {
      return [
        { label: 'Vendor Overview', path: '/vendor', icon: <DashboardIcon /> },
        { label: 'Candidates', path: '/vendor/candidates', icon: <CandidatesIcon /> },
        { label: 'Upload Videos', path: '/vendor/uploads', icon: <UploadIcon /> },
        { label: 'Earnings & Payouts', path: '/vendor/earnings', icon: <EarningsIcon /> },
      ];
    }

    if (currentRole === 'candidate') {
      return [
        { label: 'Candidate Portal', path: '/candidate', icon: <RecordingIcon /> },
        { label: 'My Recordings', path: '/candidate?tab=history', icon: <VideosIcon /> },
        { label: 'Earnings', path: '/candidate?tab=earnings', icon: <EarningsIcon /> },
      ];
    }

    // Default: Admin role
    return [
      { label: 'Overview Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      { label: 'Vendors Management', path: '/vendors', icon: <VendorsIcon /> },
      { label: 'Candidates List', path: '/candidates', icon: <CandidatesIcon /> },
      { label: 'Videos Library', path: '/videos', icon: <VideosIcon /> },
      { label: 'QC Reviews', path: '/qc-review/1', icon: <QCIcon /> },
      { label: 'Payments & Revenue', path: '/payments', icon: <PaymentsIcon /> },
      { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
      { label: 'Reports', path: '/reports', icon: <ReportsIcon /> },
    ];
  };

  const navItems = getNavItems();

  const getRoleColor = () => {
    if (currentRole === 'admin') return 'primary';
    if (currentRole === 'vendor') return 'secondary';
    return 'success';
  };

  // Determine bottom nav active index
  const getCurrentBottomNavIndex = () => {
    const idx = navItems.findIndex((item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
    return idx >= 0 ? idx : 0;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#0f172a' }}>
      {/* Top Mobile App Header */}
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          bgcolor: '#1e293b',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 0.5, color: '#f8fafc' }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VideocamOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>

            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.2rem' },
                color: '#f8fafc',
                letterSpacing: '-0.3px',
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={currentRole.toUpperCase()}
              color={getRoleColor()}
              size="small"
              sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: { xs: 'none', sm: 'inline-flex' } }}
            />

            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette[getRoleColor()]?.main || '#6366f1',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => setDrawerOpen(true)}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Slide-out Mobile & Desktop Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#1e293b',
            color: '#f8fafc',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {/* Drawer Header with User Profile */}
        <Box sx={{ p: 2.5, bgcolor: '#0f172a' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: theme.palette[getRoleColor()]?.main || '#6366f1',
                fontWeight: 'bold',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap color="#f8fafc">
                {userName}
              </Typography>
              <Typography variant="caption" color="#94a3b8" noWrap display="block">
                {userEmail}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip
              label={`Role: ${currentRole.toUpperCase()}`}
              color={getRoleColor()}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Button
              size="small"
              startIcon={<SwitchRoleIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setDrawerOpen(false);
                navigate('/login');
              }}
              sx={{ color: '#818cf8', textTransform: 'none', fontSize: '0.75rem' }}
            >
              Switch Role
            </Button>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

        {/* Navigation Items */}
        <List sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
          <Typography
            variant="caption"
            sx={{ px: 2, py: 0.5, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}
          >
            Navigation
          </Typography>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    color: isActive ? '#f8fafc' : '#94a3b8',
                    bgcolor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(99, 102, 241, 0.25)',
                      color: '#6366f1',
                      fontWeight: 'bold',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#6366f1' : '#94a3b8', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />

        {/* Logout Button in Drawer Footer */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 'bold',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>

      {/* Main Page Content Body */}
      <Box component="main" sx={{ flexGrow: 1, pb: { xs: 8, md: 2 } }}>
        {children}
      </Box>

      {/* Mobile Touch Bottom Navigation Bar (Visible only on mobile screen viewports < 960px) */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          display: { xs: 'block', md: 'none' },
          bgcolor: '#1e293b',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        }}
        elevation={8}
      >
        <BottomNavigation
          showLabels
          value={getCurrentBottomNavIndex()}
          onChange={(event, newValue) => {
            if (navItems[newValue]) {
              navigate(navItems[newValue].path);
            }
          }}
          sx={{
            bgcolor: 'transparent',
            height: 60,
            '& .MuiBottomNavigationAction-root': {
              color: '#94a3b8',
              minWidth: 'auto',
              padding: '6px 0',
              '&.Mui-selected': {
                color: '#6366f1',
              },
            },
          }}
        >
          {navItems.slice(0, 4).map((item) => (
            <BottomNavigationAction key={item.label} label={item.label.split(' ')[0]} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
