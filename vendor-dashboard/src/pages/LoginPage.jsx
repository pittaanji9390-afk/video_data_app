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
  StorefrontOutlined,
} from '@mui/icons-material';

const vendorTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#0ea5e9',
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
      setAlert({ type: 'error', message: 'Please enter email and password.' });
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
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Container maxWidth="xs">
          <Card elevation={8} sx={{ bgcolor: 'background.paper', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <StorefrontOutlined sx={{ fontSize: 32, color: 'secondary.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold">Vendor Portal Login</Typography>
                <Typography variant="caption" color="text.secondary">Acme Video Solutions</Typography>
              </Box>

              {alert && <Alert severity={alert.type} sx={{ mb: 2.5, borderRadius: 3 }}>{alert.message}</Alert>}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  label="Email / Vendor Code"
                  margin="normal"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'text.secondary' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button fullWidth type="submit" variant="contained" color="secondary" size="large" sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}>
                  Sign In to Vendor Portal
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
