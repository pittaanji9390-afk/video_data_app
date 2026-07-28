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
  VideocamOutlined,
  ArrowBack,
  FilterList,
  PlayCircleOutlined,
  VisibilityOutlined,
  FactCheckOutlined,
  Refresh,
} from '@mui/icons-material';
import { apiService } from '../services/api';

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

export default function VideoManagement() {
  const navigate = useNavigate();

  // State Management
  const [videos, setVideos] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchVideoData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vidRes, vendorRes] = await Promise.all([
        apiService.getVideos({ page: 1, limit: 100 }),
        apiService.getVendors(1, 100),
      ]);

      const vidList = vidRes.data?.items || vidRes.data || vidRes || [];
      const vendorList = vendorRes.data?.items || vendorRes.data || vendorRes || [];

      setVideos(Array.isArray(vidList) ? vidList : []);
      setVendors(Array.isArray(vendorList) ? vendorList : []);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend videos API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoData();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      (video.candidate_name && video.candidate_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.id && video.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (video.status && video.status.toUpperCase() === statusFilter.toUpperCase());

    const matchesVendor =
      vendorFilter === 'ALL' || video.vendor_id === vendorFilter || video.vendor_name === vendorFilter;

    return matchesSearch && matchesStatus && matchesVendor;
  });

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

  const handleOpenQCReview = (videoId) => {
    navigate(`/qc-review/${videoId}`);
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
        {/* Navigation Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Toolbar sx={{ py: 1 }}>
            <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <VideocamOutlined sx={{ mr: 1.5, color: 'primary.light', fontSize: 32 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Video Collection Management (API Powered)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                View uploaded video logs connected to REST API
              </Typography>
            </Box>

            <IconButton color="primary" onClick={fetchVideoData} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>

            <Button variant="outlined" color="error" startIcon={<LogoutOutlined />} onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
              <TextField
                id="video-search-input"
                placeholder="Search candidate name or video ID..."
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

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                <Select
                  labelId="status-filter-label"
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

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="vendor-filter-label">Filter by Vendor</InputLabel>
                <Select
                  labelId="vendor-filter-label"
                  value={vendorFilter}
                  label="Filter by Vendor"
                  onChange={(e) => {
                    setVendorFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="ALL">All Vendors</MenuItem>
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Error Banner */}
          {error && (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchVideoData}>Retry</Button>} sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Table Container */}
          <Paper elevation={0} sx={{ borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography color="text.secondary">Fetching uploaded videos from backend...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 850 }}>
                  <TableHead>
                    <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>THUMBNAIL</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>CANDIDATE NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ENVIRONMENT TAG</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>DURATION</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredVideos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          <Typography variant="body1" fontWeight="bold">No Videos Found</Typography>
                          <Typography variant="caption">There are no uploaded video records matching your filters.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVideos
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((video) => (
                          <TableRow key={video.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                            <TableCell>
                              <Box
                                sx={{
                                  width: 64,
                                  height: 44,
                                  borderRadius: 2,
                                  bgcolor: '#6366f1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleOpenDetails(video.id)}
                              >
                                <PlayCircleOutlined sx={{ fontSize: 24 }} />
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{video.candidate_name || `Candidate ${video.candidate_id?.substring(0,6) || ''}`}</TableCell>
                            <TableCell>
                              <Chip label={video.environment_tag || 'Dataset'} size="small" variant="outlined" color="primary" />
                            </TableCell>
                            <TableCell>{video.duration_seconds ? `${video.duration_seconds}s` : video.duration || '0s'}</TableCell>
                            <TableCell>
                              <Chip
                                label={video.status || 'Pending'}
                                size="small"
                                color={
                                  video.status === 'approved' || video.status === 'Approved'
                                    ? 'success'
                                    : video.status === 'rejected' || video.status === 'Rejected'
                                    ? 'error'
                                    : 'warning'
                                }
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button size="small" variant="outlined" startIcon={<VisibilityOutlined />} onClick={() => handleOpenDetails(video.id)} sx={{ textTransform: 'none' }}>
                                  Details
                                </Button>
                                <Button size="small" variant="contained" color="warning" startIcon={<FactCheckOutlined />} onClick={() => handleOpenQCReview(video.id)} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                                  QC Review
                                </Button>
                              </Box>
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
