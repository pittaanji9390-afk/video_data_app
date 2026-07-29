import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import MobileLogin from './pages/Login';
import CandidatePortal from './pages/CandidatePortal';
import VendorPortal from './pages/VendorPortal';
import AdminPortal from './pages/AdminPortal';

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#0ea5e9' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: {
      default: '#0f172a',
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
  shape: { borderRadius: 16 },
});

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Pure Mobile App Routes */}
          <Route path="/login" element={<MobileLogin />} />
          <Route path="/candidate-portal" element={<CandidatePortal />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route path="/admin-portal" element={<AdminPortal />} />

          {/* Fallback Shortcut Routes */}
          <Route path="/candidate/*" element={<CandidatePortal />} />
          <Route path="/vendor/*" element={<VendorPortal />} />
          <Route path="/admin/*" element={<AdminPortal />} />

          {/* Root & Default Catch-All */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
