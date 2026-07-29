const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const otpRoutes = require('./otp.routes');
const adminRoutes = require('./admin.routes');
const vendorRoutes = require('./vendor.routes');
const candidateRoutes = require('./candidate.routes');
const videoRoutes = require('./video.routes');
const qcReviewRoutes = require('./qcReview.routes');
const paymentRoutes = require('./payment.routes');
const notificationRoutes = require('./notification.routes');

// GET /
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Video Data Collection Platform Backend Running',
    version: '1.0.0',
    documentation: '/api/v1',
  });
});

// GET /health
router.use('/health', healthRoutes);

// GET /api/v1 Root Route
router.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Video Platform REST API v1 Service Ready',
    endpoints: {
      health: '/health',
      auth_login: 'POST /api/v1/auth/login',
      auth_refresh: 'POST /api/v1/auth/refresh',
      vendors: 'GET /api/v1/vendors',
      candidates: 'GET /api/v1/candidates',
      videos: 'GET /api/v1/videos',
      qc_reviews: 'POST /api/v1/qc-reviews',
      payments: 'GET /api/v1/payments/vendor/:vendorId',
      notifications: 'GET /api/v1/notifications',
    },
  });
});

// API v1 Routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/auth', otpRoutes);
router.use('/api/v1/admins', adminRoutes);
router.use('/api/v1/vendors', vendorRoutes);
router.use('/api/v1/candidates', candidateRoutes);
router.use('/api/v1/videos', videoRoutes);
router.use('/api/v1/qc-reviews', qcReviewRoutes);
router.use('/api/v1/payments', paymentRoutes);
router.use('/api/v1/notifications', notificationRoutes);

module.exports = router;
