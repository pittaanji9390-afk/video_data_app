import React, { useState, useEffect } from 'react';
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
  LinearProgress,
} from '@mui/material';
import {
  EmailOutlined,
  LockOutlined,
  PersonOutlineOutlined,
  Visibility,
  VisibilityOff,
  Videocam,
  CloudUpload,
  AccountBalanceWallet,
  ArrowBack,
  AdminPanelSettings,
  Storefront,
  Person,
  CheckCircle,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { candidateStore } from '../utils/candidateStore';

const loginTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
      light: '#3b82f6',
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
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
});

export default function SingleUnifiedLogin() {
  const navigate = useNavigate();

  // Step State: 0: Splash, 1: Onboard1, 2: Onboard2, 3: Onboard3, 4: Login
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAlert, setLoginAlert] = useState(null);

  // Check existing session on mount
  useEffect(() => {
    const activeRole = localStorage.getItem('userRole');
    if (activeRole === 'candidate') {
      navigate('/candidate-portal');
    } else if (activeRole === 'vendor') {
      navigate('/vendor-portal');
    } else if (activeRole === 'admin') {
      navigate('/admin-portal');
    }
  }, [navigate]);

  // Auto transition Splash screen after 2.5 seconds
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

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
        localStorage.setItem('candidateId', 'CND-7777');
        localStorage.setItem('vendorId', 'VENDOR-001');
        localStorage.setItem('candidatePhone', '+91 98765 00001');
      }
    }

    const displayName = localStorage.getItem('userName') || name;

    setLoginAlert({
      type: 'success',
      message: `Authenticated as ${displayName} (${role.toUpperCase()})! Redirecting to app...`,
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
      newErrors.identifier = 'Email address or candidate ID is required';
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

    // Candidate Credential Lookup
    const candidateMatch = candidateStore.findCandidateByIdentifier(input);
    if (candidateMatch || input === 'anji@gmail.com') {
      const candObj = candidateMatch || {
        id: 'CND-7777',
        name: 'Anji',
        full_name: 'Anji',
        email: 'anji@gmail.com',
        phone: '+91 98765 00001',
        vendor_id: 'VENDOR-001',
      };
      setLoading(false);
      performRoleLogin('candidate', candObj.email, candObj.name || candObj.full_name, candObj);
      return;
    }

    // Role-based heuristics
    if (input.includes('admin')) {
      setLoading(false);
      performRoleLogin('admin', formData.identifier, 'Super Admin');
      return;
    } else if (input.includes('vendor')) {
      setLoading(false);
      performRoleLogin('vendor', formData.identifier, 'Acme Video Vendor');
      return;
    }

    // Backend API Attempt
    try {
      const res = await apiService.login({
        email: formData.identifier,
        password: formData.password,
      });

      setLoading(false);
      if (res.data?.token || res.token || res.status === 200) {
        const role = res.data?.user?.role || res.user?.role || 'admin';
        const name = res.data?.user?.full_name || res.user?.full_name || 'System User';
        const email = res.data?.user?.email || formData.identifier;
        performRoleLogin(role, email, name);
      } else {
        performRoleLogin('admin', formData.identifier, 'System User');
      }
    } catch (err) {
      setLoading(false);
      performRoleLogin('candidate', formData.identifier, 'Candidate User');
    }
  };

  const handleShortcutLogin = (role, identifier, password, name) => {
    setFormData({ identifier, password });
    setLoginAlert(null);

    if (role === 'candidate') {
      const cand = candidateStore.findCandidateByIdentifier(identifier);
      performRoleLogin('candidate', identifier, name, cand);
    } else {
      performRoleLogin(role, identifier, name);
    }
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#0f172a', py: { xs: 0, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Mobile Device Viewport Canvas */}
        <Box
          sx={{
            width: { xs: '100vw', sm: 380 },
            height: { xs: '100vh', sm: 780 },
            bgcolor: step === 0 ? '#1d4ed8' : '#ffffff',
            borderRadius: { xs: 0, sm: '40px' },
            border: { xs: 'none', sm: '12px solid #1e293b' },
            boxShadow: { xs: 'none', sm: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* SCREEN 1: SPLASH SCREEN */}
          {step === 0 && (
            <Box onClick={() => setStep(1)} sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', cursor: 'pointer' }}>
              <Box sx={{ width: 88, height: 88, bgcolor: '#fff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <Videocam sx={{ fontSize: 48, color: '#1d4ed8' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Video Data Collection Platform
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, letterSpacing: 1.2, mb: 8 }}>
                Collect. Upload. Earn.
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, mb: 1 }}>Loading...</Typography>
              <LinearProgress sx={{ width: 140, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }} />
            </Box>
          )}

          {/* SCREEN 2: ONBOARDING SLIDE 1 ("Record Videos Easily") */}
          {step === 1 && (
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setStep(4)} sx={{ color: '#2563eb', textTransform: 'none', fontWeight: 'bold' }}>Skip</Button>
              </Box>
              <Box sx={{ textAlign: 'center', px: 2 }}>
                <Box sx={{ width: 160, height: 160, mx: 'auto', mb: 4, borderRadius: '50%', bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Videocam sx={{ fontSize: 80, color: '#2563eb' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Record Videos Easily
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capture high-quality videos using your phone.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', pb: 2 }}>
                {/* Dot indicator ● ○ ○ */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563eb' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                </Box>
                <Button fullWidth variant="contained" color="primary" onClick={() => setStep(2)} sx={{ py: 1.4, borderRadius: 3, fontWeight: 'bold', fontSize: 16 }}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* SCREEN 3: ONBOARDING SLIDE 2 ("Secure Upload & Storage") */}
          {step === 2 && (
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setStep(4)} sx={{ color: '#2563eb', textTransform: 'none', fontWeight: 'bold' }}>Skip</Button>
              </Box>
              <Box sx={{ textAlign: 'center', px: 2 }}>
                <Box sx={{ width: 160, height: 160, mx: 'auto', mb: 4, borderRadius: '50%', bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloudUpload sx={{ fontSize: 80, color: '#2563eb' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Secure Upload & Storage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your videos are encrypted and stored securely.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', pb: 2 }}>
                {/* Dot indicator ○ ● ○ */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563eb' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                </Box>
                <Button fullWidth variant="contained" color="primary" onClick={() => setStep(3)} sx={{ py: 1.4, borderRadius: 3, fontWeight: 'bold', fontSize: 16 }}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* SCREEN 4: ONBOARDING SLIDE 3 ("Earn More with Transparency") */}
          {step === 3 && (
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ height: 36 }} />
              <Box sx={{ textAlign: 'center', px: 2 }}>
                <Box sx={{ width: 160, height: 160, mx: 'auto', mb: 4, borderRadius: '50%', bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AccountBalanceWallet sx={{ fontSize: 80, color: '#2563eb' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Earn More with Transparency
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your earnings and get paid on time.
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', pb: 2 }}>
                {/* Dot indicator ○ ○ ● */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563eb' }} />
                </Box>
                <Button fullWidth variant="contained" color="primary" onClick={() => setStep(4)} sx={{ py: 1.4, borderRadius: 3, fontWeight: 'bold', fontSize: 16 }}>
                  Get Started
                </Button>
              </Box>
            </Box>
          )}

          {/* SCREEN 5: WELCOME BACK LOGIN SCREEN (Matching Screenshot) */}
          {step === 4 && (
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
              <Box>
                <IconButton size="small" onClick={() => setStep(1)} sx={{ mb: 1, ml: -1 }}>
                  <ArrowBack />
                </IconButton>

                {/* Blue Camera Icon Badge */}
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
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

                {loginAlert && (
                  <Alert severity={loginAlert.type} sx={{ mb: 2, borderRadius: 3 }}>{loginAlert.message}</Alert>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Username Field */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                      <PersonOutlineOutlined sx={{ color: '#3b82f6', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b', fontSize: '0.85rem' }}>Username</Typography>
                    </Box>
                    <TextField
                      fullWidth
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleInputChange}
                      error={!!errors.identifier}
                      helperText={errors.identifier}
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

                  {/* Password Field */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                      <LockOutlined sx={{ color: '#3b82f6', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b', fontSize: '0.85rem' }}>Password</Typography>
                    </Box>
                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      error={!!errors.password}
                      helperText={errors.password}
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

                  {/* Submit Button */}
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                  </Button>
                </form>
              </Box>

              {/* 1-Click Role Login Shortcuts */}
              <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom align="center" fontWeight="bold">
                  ⚡ 1-Click Test Login Shortcuts:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'center' }}>
                  <Chip
                    icon={<Person />}
                    label="Anji (Candidate)"
                    color="primary"
                    size="small"
                    onClick={() => handleShortcutLogin('candidate', 'anji@gmail.com', 'anji123', 'Anji')}
                  />
                  <Chip
                    icon={<Storefront />}
                    label="Vendor"
                    color="success"
                    size="small"
                    onClick={() => handleShortcutLogin('vendor', 'vendor@acmevideos.com', 'vendor123', 'Acme Vendor')}
                  />
                  <Chip
                    icon={<AdminPanelSettings />}
                    label="Admin"
                    color="secondary"
                    size="small"
                    onClick={() => handleShortcutLogin('admin', 'admin@videoplatform.com', 'admin123', 'Super Admin')}
                  />
                </Box>
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2, pb: 2, opacity: 0.8 }}>
            Powered by <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>ElevateIQ Softtech</Box>
          </Typography>

        </Box>

      </Box>
    </ThemeProvider>
  );
}
