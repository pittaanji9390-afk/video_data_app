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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  GroupOutlined,
  ArrowBack,
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

// Static Dummy Vendors List
const DUMMY_VENDORS = [
  { id: 'v1', name: 'Acme Video Solutions', code: 'VENDOR-001' },
  { id: 'v2', name: 'Apex Data Services', code: 'VENDOR-002' },
  { id: 'v3', name: 'Global Vision Media', code: 'VENDOR-003' },
  { id: 'v4', name: 'Starlight Analytics', code: 'VENDOR-004' },
];

// Static Dummy Candidates Dataset
const INITIAL_CANDIDATES = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    candidate_code: 'CND-001',
    full_name: 'John Doe',
    vendor_id: 'v1',
    vendor_name: 'Acme Video Solutions',
    email: 'john.doe@example.com',
    phone: '+1-555-0101',
    is_active: true,
    created_at: '2026-07-20',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    candidate_code: 'CND-002',
    full_name: 'Sarah Smith',
    vendor_id: 'v2',
    vendor_name: 'Apex Data Services',
    email: 'sarah.smith@example.com',
    phone: '+1-555-0102',
    is_active: true,
    created_at: '2026-07-21',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    candidate_code: 'CND-003',
    full_name: 'Michael Brown',
    vendor_id: 'v3',
    vendor_name: 'Global Vision Media',
    email: 'michael.b@example.com',
    phone: '+1-555-0103',
    is_active: true,
    created_at: '2026-07-22',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    candidate_code: 'CND-004',
    full_name: 'Emily Davis',
    vendor_id: 'v1',
    vendor_name: 'Acme Video Solutions',
    email: 'emily.d@example.com',
    phone: '+1-555-0104',
    is_active: true,
    created_at: '2026-07-23',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    candidate_code: 'CND-005',
    full_name: 'Robert Wilson',
    vendor_id: 'v4',
    vendor_name: 'Starlight Analytics',
    email: 'robert.w@example.com',
    phone: '+1-555-0105',
    is_active: false,
    created_at: '2026-07-24',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    candidate_code: 'CND-006',
    full_name: 'Jessica Taylor',
    vendor_id: 'v2',
    vendor_name: 'Apex Data Services',
    email: 'jessica.t@example.com',
    phone: '+1-555-0106',
    is_active: true,
    created_at: '2026-07-25',
  },
];

export default function CandidateManagement() {
  const navigate = useNavigate();

  // State Management
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    vendor_id: '',
    email: '',
    phone: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Search & Vendor Filter Logic
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidate_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVendor =
      selectedVendorFilter === 'ALL' || c.vendor_id === selectedVendorFilter;

    return matchesSearch && matchesVendor;
  });

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
      full_name: '',
      vendor_id: DUMMY_VENDORS[0].id,
      email: '',
      phone: '',
      is_active: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (candidate) => {
    setModalMode('edit');
    setTargetCandidate(candidate);
    setFormData({
      full_name: candidate.full_name,
      vendor_id: candidate.vendor_id,
      email: candidate.email,
      phone: candidate.phone,
      is_active: candidate.is_active,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDeleteDialog = (candidate) => {
    setTargetCandidate(candidate);
    setDeleteDialogOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.full_name.trim()) errors.full_name = 'Full Name is required';
    if (!formData.vendor_id) errors.vendor_id = 'Please select a vendor';
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
  const handleSaveCandidate = () => {
    if (!validateForm()) return;

    const vendorObj = DUMMY_VENDORS.find((v) => v.id === formData.vendor_id);

    if (modalMode === 'add') {
      const nextIdNum = candidates.length + 1;
      const newCandidate = {
        id: `c0000000-0000-0000-0000-0000000000${nextIdNum.toString().padStart(2, '0')}`,
        candidate_code: `CND-${nextIdNum.toString().padStart(3, '0')}`,
        full_name: formData.full_name.trim(),
        vendor_id: formData.vendor_id,
        vendor_name: vendorObj ? vendorObj.name : 'Unknown Vendor',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        is_active: formData.is_active,
        created_at: new Date().toISOString().split('T')[0],
      };
      setCandidates([newCandidate, ...candidates]);
    } else if (modalMode === 'edit' && targetCandidate) {
      setCandidates(
        candidates.map((c) =>
          c.id === targetCandidate.id
            ? {
                ...c,
                full_name: formData.full_name.trim(),
                vendor_id: formData.vendor_id,
                vendor_name: vendorObj ? vendorObj.name : c.vendor_name,
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                is_active: formData.is_active,
              }
            : c
        )
      );
    }

    setModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (targetCandidate) {
      setCandidates(candidates.filter((c) => c.id !== targetCandidate.id));
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
            <GroupOutlined sx={{ mr: 1.5, color: 'secondary.main', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Candidate Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage subject profiles, assigned vendors, and video collection status
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
          {/* Action Bar: Search Input, Vendor Filter & Add Candidate Button */}
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
              {/* Search by Name */}
              <TextField
                id="candidate-search-input"
                placeholder="Search candidates by name, code, or email..."
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

              {/* Filter by Vendor */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="vendor-filter-label">Filter by Vendor</InputLabel>
                <Select
                  labelId="vendor-filter-label"
                  id="vendor-filter-select"
                  value={selectedVendorFilter}
                  label="Filter by Vendor"
                  onChange={(e) => {
                    setSelectedVendorFilter(e.target.value);
                    setPage(0);
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="ALL">All Vendors</MenuItem>
                  {DUMMY_VENDORS.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name} ({v.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Button
              id="add-candidate-button"
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              sx={{
                fontWeight: 'bold',
                py: 1,
                px: 2.5,
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.4)',
              }}
            >
              Add Candidate
            </Button>
          </Paper>

          {/* Candidates Table Paper */}
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
              <Table sx={{ minWidth: 800 }} aria-label="candidate management table">
                <TableHead>
                  <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CANDIDATE CODE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>FULL NAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ASSIGNED VENDOR</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>EMAIL</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>PHONE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CREATED AT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No candidates found matching current search and filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCandidates
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((candidate) => (
                        <TableRow
                          key={candidate.id}
                          sx={{
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                          }}
                        >
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'secondary.main' }}>
                            {candidate.candidate_code}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{candidate.full_name}</TableCell>
                          <TableCell>
                            <Chip label={candidate.vendor_name} size="small" variant="outlined" color="primary" />
                          </TableCell>
                          <TableCell>{candidate.email}</TableCell>
                          <TableCell>{candidate.phone}</TableCell>
                          <TableCell>
                            <Chip
                              label={candidate.is_active ? 'Active' : 'Inactive'}
                              size="small"
                              color={candidate.is_active ? 'success' : 'default'}
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell>{candidate.created_at}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit Candidate">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleOpenEditModal(candidate)}
                                sx={{ mr: 1 }}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Candidate">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog(candidate)}
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
              count={filteredCandidates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
            />
          </Paper>
        </Container>

        {/* Add / Edit Candidate Modal Dialog */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {modalMode === 'add' ? 'Add New Candidate' : `Edit Candidate (${targetCandidate?.candidate_code})`}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <FormControl fullWidth error={Boolean(formErrors.vendor_id)}>
              <InputLabel id="select-vendor-label">Assigned Vendor</InputLabel>
              <Select
                labelId="select-vendor-label"
                value={formData.vendor_id}
                label="Assigned Vendor"
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              >
                {DUMMY_VENDORS.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name} ({v.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Full Name"
              placeholder="e.g. John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              error={Boolean(formErrors.full_name)}
              helperText={formErrors.full_name}
              fullWidth
            />
            <TextField
              label="Email Address"
              placeholder="john.doe@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              fullWidth
            />
            <TextField
              label="Phone Number"
              placeholder="+1-555-0101"
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
              {modalMode === 'add' ? 'Create Candidate' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
            Delete Candidate?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to soft delete candidate <strong>{targetCandidate?.full_name}</strong> ({targetCandidate?.candidate_code})?
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
