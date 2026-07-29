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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Add,
  Search,
  GroupOutlined,
  ArrowBack,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { candidateStore } from '../utils/candidateStore';

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

export default function CandidateManagement() {
  const navigate = useNavigate();

  // State Management
  const [candidates, setCandidates] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    vendor_id: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch Candidates and Vendors from Backend & Store
  const fetchData = async () => {
    setLoading(true);
    setError('');
    let apiCands = [];
    let apiVendors = [];

    try {
      const [candRes, vendorRes] = await Promise.allSettled([
        apiService.getCandidates({ page: 1, limit: 100 }),
        apiService.getVendors(1, 100),
      ]);

      if (candRes.status === 'fulfilled') {
        const val = candRes.value;
        apiCands = val.data?.items || val.data || val || [];
      }

      if (vendorRes.status === 'fulfilled') {
        const val = vendorRes.value;
        apiVendors = val.data?.items || val.data || val || [];
      }
    } catch (err) {
      console.warn('Backend candidates fetch warning:', err.message);
    }

    const localCands = candidateStore.getCandidatesList();

    // Combine local + API candidates avoiding duplicates
    const combinedMap = new Map();
    localCands.forEach((c) => combinedMap.set(c.id || c.candidate_code, c));
    if (Array.isArray(apiCands)) {
      apiCands.forEach((c) => {
        if (c && (c.id || c.candidate_code)) {
          combinedMap.set(c.id || c.candidate_code, c);
        }
      });
    }

    setCandidates(Array.from(combinedMap.values()));
    setVendors(Array.isArray(apiVendors) && apiVendors.length > 0 ? apiVendors : [
      { id: 'v0000000-0000-0000-0000-000000000001', company_name: 'Acme Video Solutions' },
      { id: 'v0000000-0000-0000-0000-000000000002', company_name: 'Apex Data Services' },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search & Vendor Filter Logic
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      (c.full_name && c.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.candidate_code && c.candidate_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVendor =
      selectedVendorFilter === 'ALL' || c.vendor_id === selectedVendorFilter;

    return matchesSearch && matchesVendor;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddModal = () => {
    setFormData({
      full_name: '',
      vendor_id: vendors.length > 0 ? vendors[0].id : '',
      email: '',
      phone: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.full_name.trim()) errors.full_name = 'Full Name is required';
    if (!formData.vendor_id) errors.vendor_id = 'Assigned Vendor is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCandidate = async () => {
    if (!validateForm()) return;

    try {
      await apiService.createCandidate({
        full_name: formData.full_name.trim(),
        vendor_id: formData.vendor_id,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`API Error: ${err.message}`);
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
            <GroupOutlined sx={{ mr: 1.5, color: 'secondary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Candidate Management (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage registered candidate profiles connected to REST API
              </Typography>
            </Box>

            <IconButton color="secondary" onClick={fetchData} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>

            <Button variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Content Container */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Action Bar */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
              <TextField
                id="candidate-search-input"
                placeholder="Search candidates..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                sx={{ width: { xs: '100%', sm: 340 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="vendor-filter-label">Filter by Vendor</InputLabel>
                <Select
                  labelId="vendor-filter-label"
                  value={selectedVendorFilter}
                  label="Filter by Vendor"
                  onChange={(e) => {
                    setSelectedVendorFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="ALL">All Vendors</MenuItem>
                  {vendors.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Button variant="contained" color="secondary" startIcon={<Add />} onClick={handleOpenAddModal} sx={{ fontWeight: 'bold', py: 1, px: 2.5, textTransform: 'none' }}>
              Add Candidate
            </Button>
          </Paper>

          {/* Error Banner */}
          {error && (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>} sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Table Container */}
          <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
                <CircularProgress color="secondary" />
                <Typography color="text.secondary">Fetching candidates from backend...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ borderBottom: '2px solid rgba(0, 0, 0, 0.1)', bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CANDIDATE CODE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>FULL NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VENDOR NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>EMAIL</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PHONE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          <Typography variant="body1" fontWeight="bold">No Candidates Found</Typography>
                          <Typography variant="caption">There are no candidate records matching your search or filter criteria.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCandidates
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((candidate) => (
                          <TableRow key={candidate.id} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'secondary.main' }}>
                              {candidate.candidate_code || candidate.id.substring(0, 8)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{candidate.full_name}</TableCell>
                            <TableCell>
                              <Chip label={candidate.vendor_name || 'Assigned Partner'} size="small" variant="outlined" color="primary" />
                            </TableCell>
                            <TableCell>{candidate.email}</TableCell>
                            <TableCell>{candidate.phone}</TableCell>
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
              count={filteredCandidates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}
            />
          </Paper>
        </Container>

        {/* Add Candidate Modal */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Candidate</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <FormControl fullWidth error={Boolean(formErrors.vendor_id)}>
              <InputLabel id="select-vendor-label">Assigned Vendor</InputLabel>
              <Select
                labelId="select-vendor-label"
                value={formData.vendor_id}
                label="Assigned Vendor"
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              >
                {vendors.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.company_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              error={Boolean(formErrors.full_name)}
              helperText={formErrors.full_name}
              fullWidth
            />
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={Boolean(formErrors.phone)}
              helperText={formErrors.phone}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setModalOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSaveCandidate} variant="contained" color="secondary" sx={{ fontWeight: 'bold' }}>
              Create Candidate
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
