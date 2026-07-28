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
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  AdminPanelSettings,
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

const adminTheme = createTheme({
  palette: {
    mode: 'dark',
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
    warning: {
      main: '#f59e0b',
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

// Static Dummy Datasets for Exporting CSV Reports
const DUMMY_VENDORS = [
  ['VENDOR-001', 'Acme Video Solutions', 'John Vendor', 'john@acmevideos.com', '+1-555-0192', 'Active', '2026-07-20'],
  ['VENDOR-002', 'Apex Data Services', 'Sarah Connor', 'sarah@apexdata.io', '+1-555-0283', 'Active', '2026-07-21'],
  ['VENDOR-003', 'Global Vision Media', 'Michael Scott', 'm.scott@globalvision.com', '+1-555-0374', 'Active', '2026-07-22'],
  ['VENDOR-004', 'Starlight Analytics', 'Elena Rostova', 'elena@starlight.org', '+1-555-0465', 'Active', '2026-07-23'],
];

const DUMMY_CANDIDATES = [
  ['CND-001', 'John Doe', 'Acme Video Solutions', 'john.doe@example.com', '+1-555-0101', 'Active', '2026-07-20'],
  ['CND-002', 'Sarah Smith', 'Apex Data Services', 'sarah.smith@example.com', '+1-555-0102', 'Active', '2026-07-21'],
  ['CND-003', 'Michael Brown', 'Global Vision Media', 'michael.b@example.com', '+1-555-0103', 'Active', '2026-07-22'],
  ['CND-004', 'Emily Davis', 'Acme Video Solutions', 'emily.d@example.com', '+1-555-0104', 'Active', '2026-07-23'],
];

const DUMMY_VIDEOS = [
  ['VID-9001', 'John Doe', 'Acme Video Solutions', 'Kitchen', '45 mins 12 secs', '2026-07-28', 'Approved', '37.774900', '-122.419400'],
  ['VID-9002', 'Sarah Smith', 'Apex Data Services', 'Bedroom', '30 mins 05 secs', '2026-07-28', 'Rejected', '40.712800', '-74.006000'],
  ['VID-9003', 'Michael Brown', 'Global Vision Media', 'Office', '60 mins 00 secs', '2026-07-27', 'Approved', '34.052200', '-118.243700'],
  ['VID-9004', 'Emily Davis', 'Acme Video Solutions', 'Garden', '50 mins 40 secs', '2026-07-27', 'Pending', '41.878100', '-87.629800'],
];

const DUMMY_PAYMENTS = [
  ['PAY-001', 'VENDOR-001', 'Acme Video Solutions', '45.50', '50.00', '2275.00', 'Paid', '2026-07-28'],
  ['PAY-002', 'VENDOR-002', 'Apex Data Services', '32.00', '60.00', '1920.00', 'Pending', '2026-07-28'],
  ['PAY-003', 'VENDOR-003', 'Global Vision Media', '68.25', '55.00', '3753.75', 'Paid', '2026-07-25'],
  ['PAY-004', 'VENDOR-004', 'Starlight Analytics', '22.00', '45.00', '990.00', 'Processing', '2026-07-27'],
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [downloadAlert, setDownloadAlert] = useState(null);

  // CSV Generator & Downloader Utility
  const triggerCSVDownload = (filename, headers, rows) => {
    const csvLines = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
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

    setDownloadAlert(`Successfully generated and downloaded "${filename}"!`);
  };

  const handleExportVendors = () => {
    const headers = ['Vendor Code', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Status', 'Created At'];
    triggerCSVDownload('vendor_report.csv', headers, DUMMY_VENDORS);
  };

  const handleExportCandidates = () => {
    const headers = ['Candidate Code', 'Full Name', 'Vendor Name', 'Email', 'Phone', 'Status', 'Created At'];
    triggerCSVDownload('candidate_report.csv', headers, DUMMY_CANDIDATES);
  };

  const handleExportVideos = () => {
    const headers = ['Video ID', 'Candidate Name', 'Vendor Name', 'Environment Tag', 'Duration', 'Upload Date', 'Status', 'Latitude', 'Longitude'];
    triggerCSVDownload('video_report.csv', headers, DUMMY_VIDEOS);
  };

  const handleExportPayments = () => {
    const headers = ['Payment ID', 'Vendor Code', 'Vendor Name', 'Approved Hours', 'Hourly Rate ($)', 'Total Amount ($)', 'Payment Status', 'Payment Date'];
    triggerCSVDownload('payment_report.csv', headers, DUMMY_PAYMENTS);
  };

  const reportCards = [
    {
      title: 'Vendor Report',
      description: 'Export comprehensive vendor organization details, partner codes, contacts, and active status.',
      icon: <StorefrontOutlined sx={{ fontSize: 32 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.12)',
      filename: 'vendor_report.csv',
      onExport: handleExportVendors,
    },
    {
      title: 'Candidate Report',
      description: 'Export registered candidate subject profiles, assigned vendor affiliations, and registration timestamps.',
      icon: <GroupOutlined sx={{ fontSize: 32 }} />,
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.12)',
      filename: 'candidate_report.csv',
      onExport: handleExportCandidates,
    },
    {
      title: 'Video Collection Report',
      description: 'Export full video dataset logs including environment tags, durations, GPS coordinates, and QC approval statuses.',
      icon: <VideocamOutlined sx={{ fontSize: 32 }} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.12)',
      filename: 'video_report.csv',
      onExport: handleExportVideos,
    },
    {
      title: 'Payment & Financial Report',
      description: 'Export vendor payment calculations, approved hours, hourly rates, total amounts, and settlement statuses.',
      icon: <PaymentsOutlined sx={{ fontSize: 32 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      filename: 'payment_report.csv',
      onExport: handleExportPayments,
    },
  ];

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        {/* Navigation Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <AssessmentOutlined sx={{ mr: 1.5, color: 'primary.light', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Platform Reports & CSV Export Center
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generate and download structured CSV reports for vendors, candidates, videos, and payments
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutOutlined />}
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Content Container */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Section Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Export System Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select any report below to download formatted CSV datasets for offline auditing and analysis.
            </Typography>
          </Box>

          {/* Download Success Alert */}
          {downloadAlert && (
            <Alert
              severity="success"
              icon={<CheckCircleOutlined />}
              onClose={() => setDownloadAlert(null)}
              sx={{ mb: 4, borderRadius: 3, fontWeight: 'bold' }}
            >
              {downloadAlert}
            </Alert>
          )}

          {/* 4 Report Cards Grid */}
          <Grid container spacing={3.5}>
            {reportCards.map((card, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px -8px ${card.bgColor}`,
                      borderColor: card.color,
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {card.title}
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: card.bgColor,
                          color: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                      {card.description}
                    </Typography>

                    <Chip
                      label={`Target File: ${card.filename}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', mb: 3 }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<DownloadOutlined />}
                    onClick={card.onExport}
                    sx={{
                      py: 1.4,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      bgcolor: card.color,
                      '&:hover': {
                        bgcolor: card.color,
                        filter: 'brightness(0.9)',
                      },
                      boxShadow: `0 4px 14px 0 ${card.bgColor}`,
                    }}
                  >
                    Export {card.title} (CSV)
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
