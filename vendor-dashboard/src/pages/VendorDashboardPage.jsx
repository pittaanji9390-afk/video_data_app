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
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
  Button,
} from '@mui/material';
import {
  GroupOutlined,
  VideocamOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  PaymentsOutlined,
  Refresh,
  ArrowForward,
  TrendingUp,
} from '@mui/icons-material';
import { vendorApiService } from '../services/api';

export default function VendorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await vendorApiService.getOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const metrics = data?.metrics || {
    totalCandidates: 14,
    uploadedVideos: 84,
    approvedVideos: 72,
    rejectedVideos: 6,
    pendingVideos: 6,
    totalEarnings: 2425.0,
  };

  const cards = [
    {
      title: 'Total Candidates',
      value: metrics.totalCandidates,
      subtitle: 'Assigned Subjects Roster',
      icon: <GroupOutlined sx={{ fontSize: 26 }} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.15)',
    },
    {
      title: 'Uploaded Videos',
      value: metrics.uploadedVideos,
      subtitle: 'Submitted Collection Logs',
      icon: <VideocamOutlined sx={{ fontSize: 26 }} />,
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.15)',
    },
    {
      title: 'Approved Videos',
      value: metrics.approvedVideos,
      subtitle: 'Verified QC Approvals',
      icon: <CheckCircleOutlined sx={{ fontSize: 26 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
    },
    {
      title: 'Rejected Videos',
      value: metrics.rejectedVideos,
      subtitle: 'Requires Re-shoot',
      icon: <CancelOutlined sx={{ fontSize: 26 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
    },
    {
      title: 'Pending Videos',
      value: metrics.pendingVideos,
      subtitle: 'Awaiting QC Audit',
      icon: <HourglassEmptyOutlined sx={{ fontSize: 26 }} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
    },
    {
      title: 'Total Earnings',
      value: `$${metrics.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: 'Approved Hours Settlement',
      icon: <PaymentsOutlined sx={{ fontSize: 26 }} />,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      {/* Title Banner */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
            Vendor Control Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time candidate metrics, video collection progress, and payout statements.
          </Typography>
        </Box>
        <IconButton color="secondary" onClick={loadDashboardData} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Summary Cards Flex Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        {cards.map((card, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              bgcolor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)', borderColor: card.color },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                {card.title.toUpperCase()}
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2.5, bgcolor: card.bgColor, color: card.color }}>
                {card.icon}
              </Box>
            </Box>
            {loading ? (
              <CircularProgress size={22} sx={{ my: 0.5 }} />
            ) : (
              <Typography variant="h4" fontWeight="bold" sx={{ color: card.color, mb: 0.5 }}>
                {card.value}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {card.subtitle}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Main Content Layout: Recent Uploads & Activity Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
        }}
      >
        {/* Recent Uploads Table */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            bgcolor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Video Submissions
            </Typography>
            <Button endIcon={<ArrowForward />} sx={{ textTransform: 'none', color: '#0ea5e9' }}>
              View All
            </Button>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>THUMBNAIL</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>VIDEO ID</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>CANDIDATE</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>TAG</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>DURATION</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 'bold' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentUploads || []).map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={row.thumbnail}
                        sx={{ width: 44, height: 32, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#f8fafc' }}>
                      {row.id}
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc', fontWeight: '600' }}>{row.candidate_name}</TableCell>
                    <TableCell>
                      <Chip label={row.environment_tag} size="small" variant="outlined" sx={{ color: '#94a3b8' }} />
                    </TableCell>
                    <TableCell sx={{ color: '#f8fafc' }}>{row.duration_seconds}s</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status.toUpperCase()}
                        size="small"
                        color={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'error' : 'warning'}
                        sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Activity Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            bgcolor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            height: '100%',
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Recent Activity Feed
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {(data?.recentActivity || []).map((act) => (
              <Box key={act.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    bgcolor:
                      act.type === 'success'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : act.type === 'info'
                        ? 'rgba(14, 165, 233, 0.2)'
                        : 'rgba(99, 102, 241, 0.2)',
                    color:
                      act.type === 'success'
                        ? '#10b981'
                        : act.type === 'info'
                        ? '#0ea5e9'
                        : '#6366f1',
                    width: 36,
                    height: 36,
                  }}
                >
                  <TrendingUp fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#f8fafc', lineHeight: 1.2 }}>
                    {act.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.3 }}>
                    {act.description}
                  </Typography>
                  <Typography variant="caption" color="primary.light" sx={{ fontSize: '0.7rem' }}>
                    {act.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
