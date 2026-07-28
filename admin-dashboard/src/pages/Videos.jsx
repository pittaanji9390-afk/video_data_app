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
  VideocamOutlined,
  ArrowBack,
  FilterList,
  PlayCircleOutlined,
  VisibilityOutlined,
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

// Static Dummy Vendors List for Filter
const DUMMY_VENDORS = [
  'Acme Video Solutions',
  'Apex Data Services',
  'Global Vision Media',
  'Starlight Analytics',
];

// Static Dummy Videos Dataset
const INITIAL_VIDEOS = [
  {
    id: 'VID-9001',
    candidate_name: 'John Doe',
    vendor_name: 'Acme Video Solutions',
    environment_tag: 'Kitchen',
    duration: '45 mins 12 secs',
    upload_date: '2026-07-28',
    status: 'Approved',
    thumbnail_color: '#6366f1',
  },
  {
    id: 'VID-9002',
    candidate_name: 'Sarah Smith',
    vendor_name: 'Apex Data Services',
    environment_tag: 'Bedroom',
    duration: '30 mins 05 secs',
    upload_date: '2026-07-28',
    status: 'Rejected',
    thumbnail_color: '#ef4444',
  },
  {
    id: 'VID-9003',
    candidate_name: 'Michael Brown',
    vendor_name: 'Global Vision Media',
    environment_tag: 'Office',
    duration: '60 mins 00 secs',
    upload_date: '2026-07-27',
    status: 'Approved',
    thumbnail_color: '#10b981',
  },
  {
    id: 'VID-9004',
    candidate_name: 'Emily Davis',
    vendor_name: 'Acme Video Solutions',
    environment_tag: 'Garden',
    duration: '50 mins 40 secs',
    upload_date: '2026-07-27',
    status: 'Pending',
    thumbnail_color: '#f59e0b',
  },
  {
    id: 'VID-9005',
    candidate_name: 'Robert Wilson',
    vendor_name: 'Starlight Analytics',
    environment_tag: 'Bathroom',
    duration: '25 mins 15 secs',
    upload_date: '2026-07-26',
    status: 'Approved',
    thumbnail_color: '#0ea5e9',
  },
  {
    id: 'VID-9006',
    candidate_name: 'Jessica Taylor',
    vendor_name: 'Apex Data Services',
    environment_tag: 'Others',
    duration: '40 mins 30 secs',
    upload_date: '2026-07-25',
    status: 'Pending',
    thumbnail_color: '#8b5cf6',
  },
];

export default function VideoManagement() {
  const navigate = useNavigate();

  // State Management
  const [videos] = useState(INITIAL_VIDEOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter Logic: Candidate Name, Status, and Vendor Filters
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.candidate_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || video.status.toUpperCase() === statusFilter.toUpperCase();

    const matchesVendor =
      vendorFilter === 'ALL' || video.vendor_name === vendorFilter;

    return matchesSearch && matchesStatus && matchesVendor;
  });

  // Pagination Handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetails = (videoId) => {
    navigate(`/videos/${videoId}`);
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
            <VideocamOutlined sx={{ mr: 1.5, color: 'primary.light', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Video Collection Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                View uploaded video logs, candidate metadata, and environment tags
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
              {/* Search by Candidate Name */}
              <TextField
                id="video-search-input"
                placeholder="Search by candidate name..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                sx={{ width: { xs: '100%', sm: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Filter by Status */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter-select"
                  value={statusFilter}
                  label="Filter by Status"
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
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>

              {/* Filter by Vendor */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="vendor-filter-label">Filter by Vendor</InputLabel>
                <Select
                  labelId="vendor-filter-label"
                  id="vendor-filter-select"
                  value={vendorFilter}
                  label="Filter by Vendor"
                  onChange={(e) => {
                    setVendorFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="ALL">All Vendors</MenuItem>
                  {DUMMY_VENDORS.map((vendor) => (
                    <MenuItem key={vendor} value={vendor}>
                      {vendor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Videos Table Paper */}
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
              <Table sx={{ minWidth: 850 }} aria-label="video management table">
                <TableHead>
                  <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>THUMBNAIL</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CANDIDATE NAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>VENDOR NAME</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ENVIRONMENT TAG</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DURATION</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>UPLOAD DATE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVideos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No videos found matching current search and filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVideos
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((video) => (
                        <TableRow
                          key={video.id}
                          sx={{
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                          }}
                        >
                          {/* Thumbnail Column */}
                          <TableCell>
                            <Box
                              sx={{
                                width: 72,
                                height: 48,
                                borderRadius: 2,
                                bgcolor: video.thumbnail_color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleOpenDetails(video.id)}
                            >
                              <PlayCircleOutlined sx={{ fontSize: 24 }} />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{video.candidate_name}</TableCell>
                          <TableCell>{video.vendor_name}</TableCell>
                          <TableCell>
                            <Chip label={video.environment_tag} size="small" variant="outlined" color="primary" />
                          </TableCell>
                          <TableCell>{video.duration}</TableCell>
                          <TableCell>{video.upload_date}</TableCell>
                          <TableCell>
                            <Chip
                              label={video.status}
                              size="small"
                              color={
                                video.status === 'Approved'
                                  ? 'success'
                                  : video.status === 'Rejected'
                                  ? 'error'
                                  : 'warning'
                              }
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityOutlined />}
                              onClick={() => handleOpenDetails(video.id)}
                              sx={{ textTransform: 'none' }}
                            >
                              View Details
                            </Button>
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
              count={filteredVideos.length}
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
