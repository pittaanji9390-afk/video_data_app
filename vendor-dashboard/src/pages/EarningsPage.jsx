import React from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Divider, Chip } from '@mui/material';
import { PaymentsOutlined, AccessTimeOutlined, CheckCircleOutlined } from '@mui/icons-material';

export default function EarningsPage() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        Financials & Earnings Breakdown
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Payout calculations based on verified approved video recording durations.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="caption" color="text.secondary">TOTAL APPROVED HOURS</Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color: '#10b981', my: 1 }}>48.5 hrs</Typography>
            <Typography variant="caption" color="text.secondary">Verified by QC Audit</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="caption" color="text.secondary">CONTRACT HOURLY RATE</Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color: '#0ea5e9', my: 1 }}>$50.00 / hr</Typography>
            <Typography variant="caption" color="text.secondary">Vendor Agreement Rate</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography variant="caption" color="text.secondary">ESTIMATED TOTAL EARNINGS</Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color: '#ec4899', my: 1 }}>$2,425.00</Typography>
            <Chip label="Processing Payment" size="small" color="success" />
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Settlement History</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Cycle: July 2026</Typography>
            <Typography variant="caption" color="text.secondary">48.5 Approved Hours @ $50/hr</Typography>
          </Box>
          <Typography variant="subtitle1" fontWeight="bold" color="success.main">$2,425.00</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
