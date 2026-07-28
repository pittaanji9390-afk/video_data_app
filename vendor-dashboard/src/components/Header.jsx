import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Badge,
  InputBase,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  NotificationsOutlined,
  StorefrontOutlined,
} from '@mui/icons-material';

export default function Header({ handleDrawerToggle }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#1e293b',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ py: 0.8, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <StorefrontOutlined sx={{ color: 'secondary.main', fontSize: 28, display: { xs: 'none', sm: 'block' } }} />

          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#f8fafc', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Acme Video Solutions
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Vendor Management Portal • ID: VENDOR-001
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: '2px 8px',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              width: 240,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder="Search candidates or videos..."
              sx={{ color: '#f8fafc', fontSize: '0.85rem', flex: 1 }}
            />
          </Paper>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 1 }}>
            <Badge badgeContent={3} color="secondary">
              <NotificationsOutlined sx={{ color: '#94a3b8' }} />
            </Badge>
          </IconButton>

          {/* User Profile Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: '#0ea5e9', color: '#fff', width: 36, height: 36, fontWeight: 'bold' }}>
              JV
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" fontWeight="bold" sx={{ color: '#f8fafc' }}>
                John Vendor
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Partner Lead
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
