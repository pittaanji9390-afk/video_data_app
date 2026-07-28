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
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from '@mui/icons-material';

// Tailored Dark/Modern Theme for Admin Panel
const adminTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      dark: '#4f46e5',
      light: '#818cf8',
    },
    background: {
      default: '#0f172a', // Deep slate
      paper: '#1e293b', // Card surface
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
    borderRadius: 12,
  },
});

export default function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginAlert(null);

    if (validateForm()) {
      setLoginAlert({
        type: 'success',
        message: 'Validation successful! Redirecting to Admin Dashboard...',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } else {
      setLoginAlert({
        type: 'error',
        message: 'Please fix the form errors below before proceeding.',
      });
    }
  };

  return (
    <ThemeProvider theme={adminTheme}>
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
            'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%)',
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
                  <AdminPanelSettings sx={{ fontSize: 36, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                  Admin Portal Login
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Video Data Collection Platform
                </Typography>
              </Box>

              {/* Alert Feedback Message */}
              {loginAlert && (
                <Alert severity={loginAlert.type} sx={{ mb: 3 }}>
                  {loginAlert.message}
                </Alert>
              )}

              {/* Form Controls */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Email Field */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                    ADMIN EMAIL ADDRESS
                  </Typography>
                  <TextField
                    fullWidth
                    id="admin-email-input"
                    name="email"
                    placeholder="admin@platform.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={Boolean(errors.email)}
                    helperText={errors.email}
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

                {/* Password Field */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                    PASSWORD
                  </Typography>
                  <TextField
                    fullWidth
                    id="admin-password-input"
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

                {/* Login Button */}
                <Button
                  fullWidth
                  id="admin-login-button"
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.6)',
                    },
                  }}
                >
                  Sign In to Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
