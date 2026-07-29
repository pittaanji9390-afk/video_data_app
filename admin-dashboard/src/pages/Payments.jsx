import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  LogoutOutlined,
  Search,
  ArrowBack,
  PaymentsOutlined,
  AttachMoney,
  AccountBalanceWalletOutlined,
  AccessTimeOutlined,
  FilterList,
  Refresh,
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
    warning: {
      main: '#f59e0b',
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

export default function PaymentDashboard() {
  const navigate = useNavigate();

  // State Management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const vendorRes = await apiService.getVendors(1, 100);
      const vendorList = vendorRes.data?.items || vendorRes.data || vendorRes || [];

      // Calculate payments for each vendor via API
      if (Array.isArray(vendorList) && vendorList.length > 0) {
        const paymentPromises = vendorList.map(async (vendor) => {
          try {
            const payRes = await apiService.getVendorPayment(vendor.id, 50);
            const data = payRes.data || payRes;
            return {
              id: `PAY-${vendor.vendor_code || vendor.id.substring(0, 6)}`,
              vendor_name: vendor.company_name,
              vendor_code: vendor.vendor_code,
              approved_hours: parseFloat(data.approved_hours || data.approved_seconds / 3600 || 0),
              hourly_rate: parseFloat(data.hourly_rate || 50.00),
              total_amount: parseFloat(data.total_payment || data.total_amount || 0),
              payment_status: data.payment_status || 'Pending',
              payment_date: new Date().toISOString().split('T')[0],
            };
          } catch (e) {
            return {
              id: `PAY-${vendor.vendor_code || vendor.id.substring(0, 6)}`,
              vendor_name: vendor.company_name,
              vendor_code: vendor.vendor_code,
              approved_hours: 0,
              hourly_rate: 50.00,
              total_amount: 0.00,
              payment_status: 'Pending',
              payment_date: new Date().toISOString().split('T')[0],
            };
          }
        });

        const results = await Promise.all(paymentPromises);
        setPayments(results);
      } else {
        setPayments([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vendor payment data from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.vendor_name && p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.vendor_code && p.vendor_code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || p.payment_status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const totalDisbursed = payments
    .filter((p) => p.payment_status === 'Paid')
    .reduce((acc, p) => acc + p.total_amount, 0);

  const totalPending = payments
    .filter((p) => p.payment_status === 'Pending' || p.payment_status === 'Processing')
    .reduce((acc, p) => acc + p.total_amount, 0);

  const totalApprovedHours = payments.reduce((acc, p) => acc + p.approved_hours, 0);

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
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <PaymentsOutlined sx={{ mr: 1.5, color: 'success.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Vendor Payment Dashboard (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Payment calculations connected to REST API
              </Typography>
            </Box>

            <IconButton color="success" onClick={fetchPayments} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>

            <Button variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Summary Metric Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">TOTAL PAID DISBURSED</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  ${totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWalletOutlined sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">PENDING SETTLEMENTS</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeOutlined sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">APPROVED VIDEO HOURS</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.light">
                  {totalApprovedHours.toFixed(2)} hrs
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
              <TextField
                id="payment-vendor-search"
                placeholder="Search by vendor..."
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

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="payment-status-filter-label">Filter Status</InputLabel>
                <Select
                  labelId="payment-status-filter-label"
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

          {/* Error Banner */}
          {error && (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchPayments}>Retry</Button>} sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Table Container */}
          <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
                <CircularProgress color="success" />
                <Typography color="text.secondary">Calculating vendor payments from API...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ borderBottom: '2px solid rgba(0, 0, 0, 0.1)', bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
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
                        <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          <Typography variant="body1" fontWeight="bold">No Payment Records Found</Typography>
                          <Typography variant="caption">No vendor payment calculations available.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>{row.vendor_name} ({row.vendor_code})</TableCell>
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
            )}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPayments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}
            />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
