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
  Chip,
  Divider,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  VpnKeyOutlined,
  AdminPanelSettings,
  Storefront,
  PersonPin,
  ArrowForward,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { candidateStore } from '../utils/candidateStore';

const loginTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
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
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
  },
  shape: {
    borderRadius: 16,
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

  const performRoleLogin = (role, email, name, candidateDetails = null) => {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);

    if (role === 'candidate') {
      const cand = candidateDetails || candidateStore.findCandidateByIdentifier(email) || candidateStore.findCandidateByIdentifier(formData.identifier);
      if (cand) {
        localStorage.setItem('candidateId', cand.id || cand.candidate_code || 'CAN-2024-001');
        localStorage.setItem('vendorId', cand.vendor_id || 'VENDOR-001');
        localStorage.setItem('candidatePhone', cand.phone || '+91 98765 43210');
        localStorage.setItem('userName', cand.name || cand.full_name || name);
        localStorage.setItem('userEmail', cand.email || email);
      } else {
        localStorage.setItem('candidateId', 'CND-1000');
        localStorage.setItem('vendorId', 'VENDOR-001');
        localStorage.setItem('candidatePhone', '9876543210');
      }
    }

    const displayName = localStorage.getItem('userName') || name;

    setLoginAlert({
      type: 'success',
      message: `Authenticated as ${displayName} (${role.toUpperCase()})! Redirecting to dashboard...`,
    });

    setTimeout(() => {
      if (role === 'vendor') {
        navigate('/vendor-portal');
      } else if (role === 'candidate') {
        navigate('/candidate-portal');
      } else {
        navigate('/admin-portal');
      }
    }, 600);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email address, username, or phone is required';
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
    const input = formData.identifier.trim().toLowerCase();

    // Check if input matches any registered candidate in candidateStore
    const matchedCandidate = candidateStore.findCandidateByIdentifier(input);

    try {
      // Try backend API auth endpoint
      const res = await apiService.login(input, formData.password);
      const user = res.data?.user || {};
      const role = (user.role || '').toLowerCase() || (matchedCandidate ? 'candidate' : 'admin');
      performRoleLogin(role, user.email || input, user.full_name || matchedCandidate?.name || `${role.toUpperCase()} User`, matchedCandidate);
    } catch (err) {
      // Credential-based automatic role recognition for offline / demo mode
      if (input.includes('vendor') || input === 'vendor@acmevideos.com') {
        performRoleLogin('vendor', 'vendor@acmevideos.com', 'Acme Video Vendor');
      } else if (matchedCandidate || input.includes('candidate') || input === '9876543210' || input.includes('john') || input.includes('vasavi')) {
        const cand = matchedCandidate || {
          name: input.includes('vasavi') ? 'Vasavi Kandula' : 'John Doe',
          email: input.includes('vasavi') ? 'vasavi@example.com' : 'candidate@videoplatform.com',
          id: input.includes('vasavi') ? 'CAN-2024-001' : 'CND-1000',
          vendor_id: 'VENDOR-001',
          phone: input.includes('vasavi') ? '+91 98765 43210' : '9876543210',
        };
        performRoleLogin('candidate', cand.email, cand.name, cand);
      } else {
        // Default admin role fallback for demo
        performRoleLogin('admin', input || 'admin@videoplatform.com', 'System Admin');
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
          bgcolor: '#0f172a',
          p: { xs: 2, sm: 3 },
          backgroundImage:
            'radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.2) 0px, transparent 70%)',
        }}
      >
        <Container maxWidth="xs" disableGutters sx={{ width: '100%', maxWidth: 440 }}>
          <Card
            elevation={12}
            sx={{
              bgcolor: '#1e293b',
              borderRadius: 4,
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Portal Header */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <VpnKeyOutlined sx={{ fontSize: 32, color: '#6366f1' }} />
                </Box>
                <Typography variant="h5" fontWeight="800" align="center" color="#f8fafc" gutterBottom>
                  Single Login Portal
                </Typography>
                <Typography variant="body2" color="#94a3b8" align="center">
                  One Unified Entry Point for Admin, Vendor, and Candidate Access
                </Typography>
              </Box>

              {/* Alert Feedback */}
              {loginAlert && (
                <Alert severity={loginAlert.type} sx={{ mb: 3, borderRadius: 3 }}>
                  {loginAlert.message}
                </Alert>
              )}

              {/* Unified Login Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" color="#94a3b8" fontWeight="700" sx={{ mb: 1, display: 'block', letterSpacing: 0.5 }}>
                    EMAIL / USERNAME / MOBILE NUMBER
                  </Typography>
                  <TextField
                    fullWidth
                    id="single-login-identifier"
                    name="identifier"
                    placeholder="e.g. admin@videoplatform.com or vendor@acmevideos.com"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    error={Boolean(errors.identifier)}
                    helperText={errors.identifier}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#0f172a',
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="#94a3b8" fontWeight="700" sx={{ mb: 1, display: 'block', letterSpacing: 0.5 }}>
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
                          <LockOutlined sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff sx={{ color: '#94a3b8' }} /> : <Visibility sx={{ color: '#94a3b8' }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#0f172a',
                        borderRadius: 3,
                      },
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
                  endIcon={!loading && <ArrowForward />}
                  sx={{
                    py: 1.6,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    bgcolor: '#6366f1',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      bgcolor: '#4f46e5',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Portal'}
                </Button>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="caption" color="#64748b" fontWeight="bold">
                  OR QUICK DEMO ACCESS
                </Typography>
              </Divider>

              {/* 1-Click Role Login Shortcuts for Testing */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Chip
                  icon={<AdminPanelSettings sx={{ color: '#6366f1 !important' }} />}
                  label="Log in as System Admin"
                  onClick={() => performRoleLogin('admin', 'admin@videoplatform.com', 'System Admin')}
                  clickable
                  sx={{
                    py: 2.2,
                    px: 1,
                    justifyContent: 'flex-start',
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#f8fafc',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
                  }}
                />

                <Chip
                  icon={<Storefront sx={{ color: '#0ea5e9 !important' }} />}
                  label="Log in as Vendor Account"
                  onClick={() => performRoleLogin('vendor', 'vendor@acmevideos.com', 'Acme Video Vendor')}
                  clickable
                  sx={{
                    py: 2.2,
                    px: 1,
                    justifyContent: 'flex-start',
                    bgcolor: 'rgba(14, 165, 233, 0.1)',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    color: '#f8fafc',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.2)' },
                  }}
                />

                <Chip
                  icon={<PersonPin sx={{ color: '#10b981 !important' }} />}
                  label="Log in as Candidate (anji@gmail.com)"
                  onClick={() => performRoleLogin('candidate', 'anji@gmail.com', 'Anji')}
                  clickable
                  sx={{
                    py: 2.2,
                    px: 1,
                    justifyContent: 'flex-start',
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#f8fafc',
                    fontWeight: 'bold',
                    borderRadius: 3,
                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.25)' },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
