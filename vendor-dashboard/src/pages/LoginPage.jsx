import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  PersonOutlineOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Videocam,
} from '@mui/icons-material';

const vendorTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.identifier.trim() || !formData.password) {
      setAlert({ type: 'error', message: 'Please enter username and password.' });
      return;
    }

    setAlert({ type: 'success', message: 'Signed in successfully! Redirecting...' });
    setTimeout(() => {
      navigate('/');
    }, 600);
  };

  return (
    <ThemeProvider theme={vendorTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8fafc',
          p: 2,
        }}
      >
        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              borderRadius: 6,
              bgcolor: '#ffffff',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #f1f5f9',
            }}
          >
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.35)',
              }}
            >
              <Videocam sx={{ fontSize: 36, color: '#ffffff' }} />
            </Box>

            <Typography variant="h4" fontWeight="800" align="center" sx={{ color: '#0f172a', letterSpacing: '-0.5px', mb: 0.8, fontSize: '1.75rem' }}>
              Welcome Back!
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: '#64748b', mb: 3.5, fontWeight: 500 }}>
              Sign in to continue to your account
            </Typography>

            {alert && <Alert severity={alert.type} sx={{ mb: 2.5, borderRadius: 3 }}>{alert.message}</Alert>}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                  <PersonOutlineOutlined sx={{ color: '#3b82f6', fontSize: 18 }} />
                  <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b', fontSize: '0.85rem' }}>Username</Typography>
                </Box>
                <TextField
                  fullWidth
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  placeholder="Enter your Username"
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      '& fieldset': { borderColor: '#dbeafe' },
                      '&:hover fieldset': { borderColor: '#93c5fd' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '1.5px' },
                    },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonOutlineOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ mb: 3.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                  <LockOutlined sx={{ color: '#3b82f6', fontSize: 18 }} />
                  <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b', fontSize: '0.85rem' }}>Password</Typography>
                </Box>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your Password"
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      '& fieldset': { borderColor: '#dbeafe' },
                      '&:hover fieldset': { borderColor: '#93c5fd' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '1.5px' },
                    },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#94a3b8' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff sx={{ color: '#94a3b8' }} /> : <Visibility sx={{ color: '#94a3b8' }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  py: 1.6,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.45)',
                  },
                }}
              >
                Login
              </Button>
            </form>
          </Paper>

          <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 3, opacity: 0.8, fontWeight: 600, textAlign: 'center' }}>
            Powered by <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>ElevateIQ Softtech</Box>
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
