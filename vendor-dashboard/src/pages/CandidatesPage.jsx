import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search as SearchIcon, PersonAddOutlined } from '@mui/icons-material';

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const loadCandidates = () => {
    try {
      const stored = localStorage.getItem('platform_candidates_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((c) => ({
            id: c.id || c.candidate_code || 'CND-000',
            name: c.name || c.full_name || 'Candidate',
            email: c.email || 'candidate@example.com',
            phone: c.phone || '+1 555-0000',
            videos: c.videosCount || c.videos || 0,
            status: (c.status || 'active').toLowerCase(),
          }));
          setCandidates(mapped);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed reading candidate state from storage', e);
    }
    setCandidates([]);
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleAddCandidate = () => {
    if (!newName.trim()) return;
    const generatedId = `CND-${8900 + candidates.length + 1}`;
    const generatedEmail = newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`;
    
    const newCand = {
      id: generatedId,
      name: newName.trim(),
      full_name: newName.trim(),
      email: generatedEmail,
      phone: newPhone.trim() || '+1 555-0999',
      videos: 0,
      status: 'active',
      vendor_id: 'v0000000-0000-0000-0000-000000000001',
      vendor_name: 'Acme Video Solutions',
    };

    const updated = [newCand, ...candidates];
    setCandidates(updated);

    try {
      const storedRaw = localStorage.getItem('platform_candidates_list');
      let existingList = storedRaw ? JSON.parse(storedRaw) : [];
      localStorage.setItem('platform_candidates_list', JSON.stringify([newCand, ...existingList]));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setOpenAdd(false);
  };

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Candidate Subject Roster
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage candidates recruited by Acme Video Solutions for video recording collection.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => {
              const headers = ['Candidate ID', 'Name', 'Email', 'Phone', 'Videos Uploaded', 'Status'];
              const rows = candidates.map((c) => [c.id, c.name, c.email, c.phone, c.videos, c.status]);
              const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `vendor_candidates.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            sx={{ borderRadius: 3, textTransform: 'none', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddOutlined />}
            onClick={() => setOpenAdd(true)}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
          >
            Add Candidate
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <TextField
          placeholder="Search candidates by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>CANDIDATE ID</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>NAME</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>EMAIL</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>PHONE</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>VIDEOS UPLOADED</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#f8fafc' }}>{row.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.85rem' }}>
                        {row.name[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#f8fafc' }}>
                        {row.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{row.email}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{row.phone}</TableCell>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 'bold' }}>{row.videos}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status.toUpperCase()}
                      size="small"
                      color={row.status === 'active' ? 'success' : 'warning'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Candidate Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Onboard New Candidate</DialogTitle>
        <DialogContent>
          <TextField
            label="Candidate Full Name"
            fullWidth
            margin="dense"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            margin="dense"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <TextField
            label="Mobile Number (+1 / +91)"
            fullWidth
            margin="dense"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCandidate}>Save Candidate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
