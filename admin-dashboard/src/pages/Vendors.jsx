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
  CircularProgress,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tooltip,
} from '@mui/material';
import {
  LogoutOutlined,
  Add,
  Search,
  EditOutlined,
  DeleteOutlined,
  StorefrontOutlined,
  ArrowBack,
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

export default function VendorManagement() {
  const navigate = useNavigate();

  // State Management
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetVendor, setTargetVendor] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch Vendors from Backend API & localStorage
  const fetchVendors = async () => {
    setLoading(true);
    setError('');
    let apiList = [];

    try {
      const res = await apiService.getVendors(1, 100, searchQuery);
      const dataList = res.data?.items || res.data || res || [];
      if (Array.isArray(dataList) && dataList.length > 0) {
        apiList = dataList;
      }
    } catch (err) {
      console.warn('Backend API vendors connection notice:', err.message);
    }

    try {
      const stored = localStorage.getItem('platform_vendors_list');
      const customVendors = stored ? JSON.parse(stored) : [];

      const combined = [...customVendors, ...apiList];
      const uniqueMap = new Map();
      
      combined.forEach((v) => {
        if (v && (v.vendor_code || v.id)) {
          uniqueMap.set(v.vendor_code || v.id, v);
        }
      });

      setVendors(Array.from(uniqueMap.values()));
    } catch (e) {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Search Filter Logic
  const filteredVendors = vendors.filter(
    (v) =>
      (v.company_name && v.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.vendor_code && v.vendor_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.contact_person && v.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.email && v.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination Handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      is_active: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (vendor) => {
    setModalMode('edit');
    setTargetVendor(vendor);
    setFormData({
      company_name: vendor.company_name || '',
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      is_active: vendor.is_active !== undefined ? vendor.is_active : true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDeleteDialog = (vendor) => {
    setTargetVendor(vendor);
    setDeleteDialogOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.company_name.trim()) errors.company_name = 'Company Name is required';
    if (!formData.contact_person.trim()) errors.contact_person = 'Contact Person is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Add / Edit
  const handleSaveVendor = async () => {
    if (!validateForm()) return;

    const newVendorCode = `VENDOR-${String(vendors.length + 1).padStart(3, '0')}`;
    const vendorPayload = {
      id: modalMode === 'edit' && targetVendor ? targetVendor.id : `v_${Date.now()}`,
      vendor_code: modalMode === 'edit' && targetVendor ? targetVendor.vendor_code : newVendorCode,
      company_name: formData.company_name.trim(),
      contact_person: formData.contact_person.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      is_active: formData.is_active,
    };

    // Update local storage
    try {
      const stored = localStorage.getItem('platform_vendors_list');
      let currentStored = stored ? JSON.parse(stored) : [];

      if (modalMode === 'add') {
        currentStored = [vendorPayload, ...currentStored];
      } else {
        currentStored = currentStored.map((v) => (v.id === vendorPayload.id ? vendorPayload : v));
      }
      localStorage.setItem('platform_vendors_list', JSON.stringify(currentStored));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // Try calling backend API
    try {
      if (modalMode === 'add') {
        await apiService.createVendor(vendorPayload);
      } else if (modalMode === 'edit' && targetVendor) {
        await apiService.updateVendor(targetVendor.id, vendorPayload);
      }
    } catch (err) {
      console.warn('Backend API create/update vendor fallback:', err.message);
    }

    setModalOpen(false);
    fetchVendors();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (targetVendor) {
      try {
        await apiService.deleteVendor(targetVendor.id);
        fetchVendors();
      } catch (err) {
        alert(`Failed to delete vendor: ${err.message}`);
      }
    }
    setDeleteDialogOpen(false);
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
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <StorefrontOutlined sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Vendor Management (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage vendor profiles connected to REST API
              </Typography>
            </Box>

            <IconButton color="primary" onClick={fetchVendors} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>

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
          {/* Action Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <TextField
              id="vendor-search-input"
              placeholder="Search vendors by name, code, or email..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              sx={{ width: { xs: '100%', sm: 380 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              id="add-vendor-button"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              sx={{
                fontWeight: 'bold',
                py: 1,
                px: 2.5,
                textTransform: 'none',
              }}
            >
              Add Vendor
            </Button>
          </Paper>

          {/* Error Banner */}
          {error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchVendors}>
                  Retry
                </Button>
              }
              sx={{ mb: 3, borderRadius: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Vendors Table Paper */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography color="text.secondary">Fetching vendors from backend...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-label="vendor management table">
                  <TableHead>
                    <TableRow sx={{ borderBottom: '2px solid rgba(0, 0, 0, 0.1)', bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VENDOR CODE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>COMPANY NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CONTACT PERSON</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>EMAIL</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PHONE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          <Typography variant="body1" fontWeight="bold">No Vendors Found</Typography>
                          <Typography variant="caption">There are no vendors registered in the database matching your criteria.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVendors
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((vendor) => (
                          <TableRow key={vendor.id} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'primary.light' }}>
                              {vendor.vendor_code}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{vendor.company_name}</TableCell>
                            <TableCell>{vendor.contact_person}</TableCell>
                            <TableCell>{vendor.email}</TableCell>
                            <TableCell>{vendor.phone}</TableCell>
                            <TableCell>
                              <Chip
                                label={vendor.is_active ? 'Active' : 'Inactive'}
                                size="small"
                                color={vendor.is_active ? 'success' : 'default'}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit Vendor">
                                <IconButton color="primary" size="small" onClick={() => handleOpenEditModal(vendor)} sx={{ mr: 1 }}>
                                  <EditOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Vendor">
                                <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(vendor)}>
                                  <DeleteOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
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
              count={filteredVendors.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}
            />
          </Paper>
        </Container>

        {/* Add / Edit Vendor Modal Dialog */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {modalMode === 'add' ? 'Add New Vendor' : `Edit Vendor (${targetVendor?.vendor_code})`}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Company Name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              error={Boolean(formErrors.company_name)}
              helperText={formErrors.company_name}
              fullWidth
            />
            <TextField
              label="Contact Person"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              error={Boolean(formErrors.contact_person)}
              helperText={formErrors.contact_person}
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
            <Button onClick={handleSaveVendor} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
              {modalMode === 'add' ? 'Create Vendor' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
            Delete Vendor?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to soft delete vendor <strong>{targetVendor?.company_name}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 'bold' }}>
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
