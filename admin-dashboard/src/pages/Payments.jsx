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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  AdminPanelSettings,
  LogoutOutlined,
  Search,
  ArrowBack,
  PaymentsOutlined,
  AttachMoney,
  AccountBalanceWalletOutlined,
  AccessTimeOutlined,
  FilterList,
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

// Static Dummy Payment Summary Dataset
const INITIAL_PAYMENTS = [
  {
    id: 'PAY-001',
    vendor_name: 'Acme Video Solutions',
    vendor_code: 'VENDOR-001',
    approved_hours: 45.50,
    hourly_rate: 50.00,
    total_amount: 2275.00,
    payment_status: 'Paid',
    payment_date: '2026-07-28',
  },
  {
    id: 'PAY-002',
    vendor_name: 'Apex Data Services',
    vendor_code: 'VENDOR-002',
    approved_hours: 32.00,
    hourly_rate: 60.00,
    total_amount: 1920.00,
    payment_status: 'Pending',
    payment_date: '2026-07-28',
  },
  {
    id: 'PAY-003',
    vendor_name: 'Global Vision Media',
    vendor_code: 'VENDOR-003',
    approved_hours: 68.25,
    hourly_rate: 55.00,
    total_amount: 3753.75,
    payment_status: 'Paid',
    payment_date: '2026-07-25',
  },
  {
    id: 'PAY-004',
    vendor_name: 'Starlight Analytics',
    vendor_code: 'VENDOR-004',
    approved_hours: 22.00,
    hourly_rate: 45.00,
    total_amount: 990.00,
    payment_status: 'Processing',
    payment_date: '2026-07-27',
  },
  {
    id: 'PAY-005',
    vendor_name: 'NextGen AI Labs',
    vendor_code: 'VENDOR-005',
    approved_hours: 15.75,
    hourly_rate: 70.00,
    total_amount: 1102.50,
    payment_status: 'Pending',
    payment_date: '2026-07-26',
  },
  {
    id: 'PAY-006',
    vendor_name: 'Quantum Datasets',
    vendor_code: 'VENDOR-006',
    approved_hours: 80.00,
    hourly_rate: 52.50,
    total_amount: 4200.00,
    payment_status: 'Paid',
    payment_date: '2026-07-24',
  },
];

export default function PaymentDashboard() {
  const navigate = useNavigate();

  // State Management
  const [payments] = useState(INITIAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Search & Status Filter Logic
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || p.payment_status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics Summary
  const totalDisbursed = payments
    .filter((p) => p.payment_status === 'Paid')
    .reduce((acc, p) => acc + p.total_amount, 0);

  const totalPending = payments
    .filter((p) => p.payment_status === 'Pending' || p.payment_status === 'Processing')
    .reduce((acc, p) => acc + p.total_amount, 0);

  const totalApprovedHours = payments.reduce((acc, p) => acc + p.approved_hours, 0);

  // Pagination Handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <Chip label="Paid" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'PROCESSING':
        return <Chip label="Processing" color="info" size="small" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
    }
  };

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
            <PaymentsOutlined sx={{ mr: 1.5, color: 'success.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Vendor Payment Dashboard
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Approved video hour calculation, rates, and payment settlement summary
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

        {/* Content Area */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Summary Metric Cards Header */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  backgroundImage: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 41, 59, 1) 100%)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    TOTAL PAID DISBURSED
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  backgroundImage: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(30, 41, 59, 1) 100%)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWalletOutlined sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    PENDING SETTLEMENTS
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(30, 41, 59, 1) 100%)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeOutlined sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    APPROVED VIDEO HOURS
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.light">
                  {totalApprovedHours.toFixed(2)} hrs
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Action & Filter Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
              {/* Search by Vendor Name or Code */}
              <TextField
                id="payment-vendor-search"
                placeholder="Search by vendor name or code..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                sx={{ width: { xs: '100%', sm: 360 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Filter by Payment Status */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="payment-status-filter-label">Filter Status</InputLabel>
                <Select
                  labelId="payment-status-filter-label"
                  id="payment-status-filter-select"
                  value={statusFilter}
                  label="Filter Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Payment Summary Table Paper */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 800 }} aria-label="vendor payment summary table">
                <TableHead>
                  <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VENDOR NAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>APPROVED HOURS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>HOURLY RATE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>TOTAL AMOUNT</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PAYMENT STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PAYMENT DATE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No payment records found matching "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {row.vendor_name}{' '}
                            <Typography component="span" variant="caption" color="text.secondary">
                              ({row.vendor_code})
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: '600' }}>{row.approved_hours.toFixed(2)} hrs</TableCell>
                          <TableCell>${row.hourly_rate.toFixed(2)} / hr</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.05rem' }}>
                            ${row.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{getStatusChip(row.payment_status)}</TableCell>
                          <TableCell align="right">{row.payment_date}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPayments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
            />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
