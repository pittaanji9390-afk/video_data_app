import React, { useState } from 'react';
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
  const [candidates, setCandidates] = useState([
    { id: 'CAND-101', name: 'Alex Johnson', email: 'alex@example.com', phone: '+1 555-0101', videos: 18, status: 'active' },
    { id: 'CAND-102', name: 'Maria Garcia', email: 'maria@example.com', phone: '+1 555-0102', videos: 24, status: 'active' },
    { id: 'CAND-103', name: 'David Kim', email: 'david@example.com', phone: '+1 555-0103', videos: 12, status: 'pending' },
    { id: 'CAND-104', name: 'Emma Watson', email: 'emma@example.com', phone: '+1 555-0104', videos: 30, status: 'active' },
    { id: 'CAND-105', name: 'Michael Brown', email: 'michael@example.com', phone: '+1 555-0105', videos: 14, status: 'active' },
  ]);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddCandidate = () => {
    if (!newName.trim()) return;
    const newCand = {
      id: `CAND-${100 + candidates.length + 1}`,
      name: newName,
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: newPhone || '+1 555-0999',
      videos: 0,
      status: 'active',
    };
    setCandidates([newCand, ...candidates]);
    setNewName('');
    setNewPhone('');
    setOpenAdd(false);
  };

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Candidate Subject Roster
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage candidates recruited by Acme Video Solutions for video recording collection.
          </Typography>
        </Box>
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
