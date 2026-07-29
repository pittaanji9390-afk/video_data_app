import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  LogoutOutlined,
  ArrowBack,
  AssessmentOutlined,
  DownloadOutlined,
  StorefrontOutlined,
  GroupOutlined,
  VideocamOutlined,
  PaymentsOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#0ea5e9',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
});

export default function ReportsPage() {
  const navigate = useNavigate();
  const [downloadAlert, setDownloadAlert] = useState(null);
  const [exportingCard, setExportingCard] = useState('');

  const triggerCSVDownload = (filename, headers, rows) => {
    const csvLines = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell !== undefined && cell !== null ? cell : '').replace(/"/g, '""')}"`).join(',')),
    ];
    const csvContent = csvLines.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadAlert(`Successfully generated and downloaded "${filename}" from API!`);
  };

  const handleExportVendors = async () => {
    setExportingCard('vendor');
    try {
      const res = await apiService.getVendors(1, 500);
      const list = res.data?.items || res.data || res || [];
      const headers = ['Vendor ID', 'Vendor Code', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Status', 'Created At'];
      const rows = list.map((v) => [
        v.id,
        v.vendor_code || '',
        v.company_name || '',
        v.contact_person || '',
        v.email || '',
        v.phone || '',
        v.is_active ? 'Active' : 'Inactive',
        v.created_at || '',
      ]);
      triggerCSVDownload('vendor_report.csv', headers, rows);
    } catch (err) {
      alert(`API Export Error: ${err.message}`);
    } finally {
      setExportingCard('');
    }
  };

  const handleExportCandidates = async () => {
    setExportingCard('candidate');
    try {
      const res = await apiService.getCandidates({ page: 1, limit: 500 });
      const list = res.data?.items || res.data || res || [];
      const headers = ['Candidate ID', 'Candidate Code', 'Full Name', 'Vendor ID', 'Email', 'Phone', 'Created At'];
      const rows = list.map((c) => [
        c.id,
        c.candidate_code || '',
        c.full_name || '',
        c.vendor_id || '',
        c.email || '',
        c.phone || '',
        c.created_at || '',
      ]);
      triggerCSVDownload('candidate_report.csv', headers, rows);
    } catch (err) {
      alert(`API Export Error: ${err.message}`);
    } finally {
      setExportingCard('');
    }
  };

  const handleExportVideos = async () => {
    setExportingCard('video');
    try {
      const res = await apiService.getVideos({ page: 1, limit: 500 });
      const list = res.data?.items || res.data || res || [];
      const headers = ['Video ID', 'Candidate ID', 'Vendor ID', 'Environment Tag', 'Duration (secs)', 'Status', 'Latitude', 'Longitude', 'Created At'];
      const rows = list.map((v) => [
        v.id,
        v.candidate_id || '',
        v.vendor_id || '',
        v.environment_tag || '',
        v.duration_seconds || 0,
        v.status || 'Pending',
        v.latitude || v.gps_latitude || '',
        v.longitude || v.gps_longitude || '',
        v.created_at || '',
      ]);
      triggerCSVDownload('video_report.csv', headers, rows);
    } catch (err) {
      alert(`API Export Error: ${err.message}`);
    } finally {
      setExportingCard('');
    }
  };

  const handleExportPayments = async () => {
    setExportingCard('payment');
    try {
      const vendorRes = await apiService.getVendors(1, 500);
      const vendors = vendorRes.data?.items || vendorRes.data || vendorRes || [];
      const payPromises = vendors.map(async (v) => {
        try {
          const p = await apiService.getVendorPayment(v.id, 50);
          const data = p.data || p;
          return [
            `PAY-${v.vendor_code || v.id.substring(0, 6)}`,
            v.vendor_code || '',
            v.company_name || '',
            data.approved_hours || (data.approved_seconds / 3600).toFixed(2),
            data.hourly_rate || 50,
            data.total_payment || data.total_amount || 0,
            data.payment_status || 'Pending',
            new Date().toISOString().split('T')[0],
          ];
        } catch (e) {
          return [`PAY-${v.id.substring(0,6)}`, v.vendor_code || '', v.company_name || '', 0, 50, 0, 'Pending', ''];
        }
      });

      const rows = await Promise.all(payPromises);
      const headers = ['Payment ID', 'Vendor Code', 'Vendor Name', 'Approved Hours', 'Hourly Rate ($)', 'Total Amount ($)', 'Payment Status', 'Payment Date'];
      triggerCSVDownload('payment_report.csv', headers, rows);
    } catch (err) {
      alert(`API Export Error: ${err.message}`);
    } finally {
      setExportingCard('');
    }
  };

  const reportCards = [
    { key: 'vendor', title: 'Vendor Report', description: 'Export vendor details from API.', icon: <StorefrontOutlined sx={{ fontSize: 32 }} />, color: '#6366f1', filename: 'vendor_report.csv', onExport: handleExportVendors },
    { key: 'candidate', title: 'Candidate Report', description: 'Export candidate profiles from API.', icon: <GroupOutlined sx={{ fontSize: 32 }} />, color: '#0ea5e9', filename: 'candidate_report.csv', onExport: handleExportCandidates },
    { key: 'video', title: 'Video Collection Report', description: 'Export video logs from API.', icon: <VideocamOutlined sx={{ fontSize: 32 }} />, color: '#8b5cf6', filename: 'video_report.csv', onExport: handleExportVideos },
    { key: 'payment', title: 'Payment & Financial Report', description: 'Export vendor payment calculations from API.', icon: <PaymentsOutlined sx={{ fontSize: 32 }} />, color: '#10b981', filename: 'payment_report.csv', onExport: handleExportPayments },
  ];

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <AssessmentOutlined sx={{ mr: 1.5, color: 'primary.light', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Platform Reports & CSV Export (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generate and download CSV reports connected to REST API
              </Typography>
            </Box>

            <Button variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {downloadAlert && (
            <Alert severity="success" icon={<CheckCircleOutlined />} onClose={() => setDownloadAlert(null)} sx={{ mb: 4, borderRadius: 3, fontWeight: 'bold' }}>
              {downloadAlert}
            </Alert>
          )}

          <Grid container spacing={3.5}>
            {reportCards.map((card) => (
              <Grid item xs={12} md={6} key={card.key}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">{card.title}</Typography>
                      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(0, 0, 0, 0.05)', color: card.color }}>{card.icon}</Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{card.description}</Typography>
                    <Chip label={`Target: ${card.filename}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace', mb: 3 }} />
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={exportingCard === card.key ? <CircularProgress size={20} color="inherit" /> : <DownloadOutlined />}
                    onClick={card.onExport}
                    disabled={Boolean(exportingCard)}
                    sx={{ py: 1.4, fontWeight: 'bold', textTransform: 'none', bgcolor: card.color }}
                  >
                    {exportingCard === card.key ? 'Fetching API Data...' : `Export ${card.title} (CSV)`}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
