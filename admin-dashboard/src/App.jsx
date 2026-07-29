import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AdminLogin from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import VendorManagement from './pages/Vendors';
import CandidatesList from './pages/Candidates';
import CandidatePortal from './pages/CandidatePortal';
import VendorPortal from './pages/VendorPortal';
import AdminPortal from './pages/AdminPortal';
import VideoManagement from './pages/Videos';
import VideoDetails from './pages/VideoDetails';
import QCReview from './pages/QCReview';
import PaymentDashboard from './pages/Payments';
import AnalyticsDashboard from './pages/Analytics';
import ReportsPage from './pages/Reports';
import MobileNavigation from './components/MobileNavigation';

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1' },
    secondary: { main: '#0ea5e9' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
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
  shape: { borderRadius: 14 },
});

// Wrapper to apply MobileNavigation layout to protected routes
function LayoutWrapper({ children, title }) {
  return <MobileNavigation title={title}>{children}</MobileNavigation>;
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Unified Credentials Login Page */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Three Mobile App Viewport Portals with Top PPT Switchers */}
          <Route path="/admin-portal" element={<AdminPortal />} />
          <Route path="/vendor-portal" element={<VendorPortal />} />
          <Route path="/candidate-portal" element={<CandidatePortal />} />

          {/* Full Web Dashboard Routes */}
          <Route path="/dashboard" element={<LayoutWrapper title="Admin Overview"><AdminDashboard /></LayoutWrapper>} />
          <Route path="/vendors" element={<LayoutWrapper title="Vendor Management"><VendorManagement /></LayoutWrapper>} />
          <Route path="/candidates" element={<LayoutWrapper title="Candidates Directory"><CandidatesList /></LayoutWrapper>} />
          <Route path="/videos" element={<LayoutWrapper title="Video Library"><VideoManagement /></LayoutWrapper>} />
          <Route path="/videos/:id" element={<LayoutWrapper title="Video Details"><VideoDetails /></LayoutWrapper>} />
          <Route path="/qc-review/:id" element={<LayoutWrapper title="QC Evaluation"><QCReview /></LayoutWrapper>} />
          <Route path="/payments" element={<LayoutWrapper title="Payments & Revenue"><PaymentDashboard /></LayoutWrapper>} />
          <Route path="/analytics" element={<LayoutWrapper title="Analytics Platform"><AnalyticsDashboard /></LayoutWrapper>} />
          <Route path="/reports" element={<LayoutWrapper title="Platform Reports"><ReportsPage /></LayoutWrapper>} />

          {/* Fallback & Shortcut Routes */}
          <Route path="/vendor/*" element={<VendorPortal />} />
          <Route path="/candidate/*" element={<CandidatePortal />} />

          {/* Single Entry Point Login Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
