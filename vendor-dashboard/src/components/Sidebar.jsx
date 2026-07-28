import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  DashboardOutlined,
  GroupOutlined,
  VideocamOutlined,
  PaymentsOutlined,
  SettingsOutlined,
  LogoutOutlined,
  StorefrontOutlined,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardOutlined />, path: '/' },
    { text: 'Candidates', icon: <GroupOutlined />, path: '/candidates' },
    { text: 'Video Uploads', icon: <VideocamOutlined />, path: '/uploads' },
    { text: 'Financials & Earnings', icon: <PaymentsOutlined />, path: '/earnings' },
    { text: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1e293b', color: '#f8fafc' }}>
      {/* Brand Logo & Title */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 42, height: 42 }}>
          <StorefrontOutlined sx={{ color: '#fff' }} />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff', lineHeight: 1.2 }}>
            Vendor Portal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Acme Video Solutions
          </Typography>
        </Box>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 3,
                  bgcolor: isActive ? 'rgba(14, 165, 233, 0.18)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#f8fafc',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#38bdf8' : '#94a3b8', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      fontSize: '0.9rem',
                      fontWeight: isActive ? '700' : '500',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Footer Profile & Logout */}
      <Box sx={{ p: 2 }}>
        <Chip label="Partner Code: VENDOR-001" size="small" variant="outlined" color="info" sx={{ width: '100%', mb: 1.5, fontFamily: 'monospace' }} />
        <ListItemButton
          onClick={() => navigate('/login')}
          sx={{ borderRadius: 3, color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            slotProps={{
              primary: { fontSize: '0.9rem', fontWeight: '700' },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid rgba(255, 255, 255, 0.08)' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
