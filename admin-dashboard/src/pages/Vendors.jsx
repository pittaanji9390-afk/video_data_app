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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tooltip,
} from '@mui/material';
import {
  AdminPanelSettings,
  LogoutOutlined,
  Add,
  Search,
  EditOutlined,
  DeleteOutlined,
  StorefrontOutlined,
  ArrowBack,
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

// Initial Static Dummy Vendor Dataset
const INITIAL_VENDORS = [
  {
    id: 'v0000000-0000-0000-0000-000000000001',
    vendor_code: 'VENDOR-001',
    company_name: 'Acme Video Solutions',
    contact_person: 'John Vendor',
    email: 'john@acmevideos.com',
    phone: '+1-555-0192',
    is_active: true,
    created_at: '2026-07-20',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000002',
    vendor_code: 'VENDOR-002',
    company_name: 'Apex Data Services',
    contact_person: 'Sarah Connor',
    email: 'sarah@apexdata.io',
    phone: '+1-555-0283',
    is_active: true,
    created_at: '2026-07-21',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000003',
    vendor_code: 'VENDOR-003',
    company_name: 'Global Vision Media',
    contact_person: 'Michael Scott',
    email: 'm.scott@globalvision.com',
    phone: '+1-555-0374',
    is_active: true,
    created_at: '2026-07-22',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000004',
    vendor_code: 'VENDOR-004',
    company_name: 'Starlight Analytics',
    contact_person: 'Elena Rostova',
    email: 'elena@starlight.org',
    phone: '+1-555-0465',
    is_active: true,
    created_at: '2026-07-23',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000005',
    vendor_code: 'VENDOR-005',
    company_name: 'NextGen AI Labs',
    contact_person: 'David Miller',
    email: 'david@nextgenlabs.ai',
    phone: '+1-555-0556',
    is_active: false,
    created_at: '2026-07-24',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000006',
    vendor_code: 'VENDOR-006',
    company_name: 'Quantum Datasets',
    contact_person: 'Lisa Vance',
    email: 'lisa@quantumdata.com',
    phone: '+1-555-0647',
    is_active: true,
    created_at: '2026-07-25',
  },
];

export default function VendorManagement() {
  const navigate = useNavigate();

  // State Management
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
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

  // Search Filter Logic
  const filteredVendors = vendors.filter(
    (v) =>
      v.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendor_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase())
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
      company_name: vendor.company_name,
      contact_person: vendor.contact_person,
      email: vendor.email,
      phone: vendor.phone,
      is_active: vendor.is_active,
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
  const handleSaveVendor = () => {
    if (!validateForm()) return;

    if (modalMode === 'add') {
      const nextIdNum = vendors.length + 1;
      const newVendor = {
        id: `v0000000-0000-0000-0000-0000000000${nextIdNum.toString().padStart(2, '0')}`,
        vendor_code: `VENDOR-${nextIdNum.toString().padStart(3, '0')}`,
        company_name: formData.company_name.trim(),
        contact_person: formData.contact_person.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        is_active: formData.is_active,
        created_at: new Date().toISOString().split('T')[0],
      };
      setVendors([newVendor, ...vendors]);
    } else if (modalMode === 'edit' && targetVendor) {
      setVendors(
        vendors.map((v) =>
          v.id === targetVendor.id
            ? {
                ...v,
                company_name: formData.company_name.trim(),
                contact_person: formData.contact_person.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                is_active: formData.is_active,
              }
            : v
        )
      );
    }

    setModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (targetVendor) {
      setVendors(vendors.filter((v) => v.id !== targetVendor.id));
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
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <StorefrontOutlined sx={{ mr: 1.5, color: 'primary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Vendor Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage vendor profiles, status, and partner organizations
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
          {/* Action Bar: Search Input & Add Vendor Button */}
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
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
              }}
            >
              Add Vendor
            </Button>
          </Paper>

          {/* Vendors Table Paper */}
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
              <Table sx={{ minWidth: 750 }} aria-label="vendor management table">
                <TableHead>
                  <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VENDOR CODE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>COMPANY NAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CONTACT PERSON</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>EMAIL</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PHONE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CREATED AT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No vendors found matching "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((vendor) => (
                        <TableRow
                          key={vendor.id}
                          sx={{
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                          }}
                        >
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
                          <TableCell>{vendor.created_at}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit Vendor">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleOpenEditModal(vendor)}
                                sx={{ mr: 1 }}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Vendor">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog(vendor)}
                              >
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

            {/* Pagination Controls */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredVendors.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
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
              placeholder="e.g. Acme Video Solutions"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              error={Boolean(formErrors.company_name)}
              helperText={formErrors.company_name}
              fullWidth
            />
            <TextField
              label="Contact Person"
              placeholder="e.g. John Doe"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              error={Boolean(formErrors.contact_person)}
              helperText={formErrors.contact_person}
              fullWidth
            />
            <TextField
              label="Email Address"
              placeholder="contact@company.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              fullWidth
            />
            <TextField
              label="Phone Number"
              placeholder="+1-555-0192"
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
              Are you sure you want to soft delete vendor <strong>{targetVendor?.company_name}</strong> ({targetVendor?.vendor_code})?
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
