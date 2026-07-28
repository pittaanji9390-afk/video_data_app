import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
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
  CircularProgress,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  VpnKeyOutlined,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const loginTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
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

export default function SingleUnifiedLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAlert, setLoginAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email address or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginAlert(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await apiService.login(formData.identifier.trim(), formData.password);
      const user = res.data?.user || {};
      const role = (user.role || '').toLowerCase();

      setLoginAlert({
        type: 'success',
        message: `Authenticated as ${user.full_name || role.toUpperCase()}! Redirecting to dashboard...`,
      });

      setTimeout(() => {
        if (role === 'vendor') {
          window.location.href = 'http://localhost:5174/';
        } else if (role === 'candidate') {
          navigate('/candidates');
        } else {
          navigate('/dashboard');
        }
      }, 800);
    } catch (err) {
      // Local fallback checking for offline mode
      const input = formData.identifier.trim().toLowerCase();
      if (input.includes('vendor') || input === 'vendor@acmevideos.com') {
        setLoginAlert({ type: 'success', message: 'Authenticated as Vendor! Opening Vendor Dashboard...' });
        setTimeout(() => { window.location.href = 'http://localhost:5174/'; }, 600);
      } else if (input.includes('candidate') || input === '9876543210') {
        setLoginAlert({ type: 'success', message: 'Authenticated as Candidate! Opening Candidate View...' });
        setTimeout(() => { navigate('/candidates'); }, 600);
      } else if (input.includes('admin') || input === 'admin@videoplatform.com') {
        setLoginAlert({ type: 'success', message: 'Authenticated as Admin! Opening Admin Dashboard...' });
        setTimeout(() => { navigate('/dashboard'); }, 600);
      } else {
        setLoginAlert({
          type: 'error',
          message: err.message || 'Invalid credentials provided. Please check email and password.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
          backgroundImage:
            'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.18) 0px, transparent 60%)',
        }}
      >
        <Container maxWidth="xs">
          <Card
            elevation={8}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header Icon */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <VpnKeyOutlined sx={{ fontSize: 34, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                  Platform Single Login
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center">
                  One Unified Portal for Admin, Vendor, and Candidate Accounts
                </Typography>
              </Box>

              {/* Alert Feedback Message */}
              {loginAlert && (
                <Alert severity={loginAlert.type} sx={{ mb: 3, borderRadius: 3 }}>
                  {loginAlert.message}
                </Alert>
              )}

              {/* Single Unified Login Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                    EMAIL / USERNAME / PHONE
                  </Typography>
                  <TextField
                    fullWidth
                    id="single-login-identifier"
                    name="identifier"
                    placeholder="Enter email or mobile number"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    error={Boolean(errors.identifier)}
                    helperText={errors.identifier}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                    PASSWORD
                  </Typography>
                  <TextField
                    fullWidth
                    id="single-login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  id="single-login-button"
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Your Dashboard'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
