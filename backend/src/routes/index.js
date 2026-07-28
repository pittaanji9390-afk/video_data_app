const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const vendorRoutes = require('./vendor.routes');
const candidateRoutes = require('./candidate.routes');
const videoRoutes = require('./video.routes');
const qcReviewRoutes = require('./qcReview.routes');
const paymentRoutes = require('./payment.routes');

// GET /
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Video Platform Backend Running',
  });
});

// GET /health
router.use('/health', healthRoutes);

// API v1 Routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/admins', adminRoutes);
router.use('/api/v1/vendors', vendorRoutes);
router.use('/api/v1/candidates', candidateRoutes);
router.use('/api/v1/videos', videoRoutes);
router.use('/api/v1/qc-reviews', qcReviewRoutes);
router.use('/api/v1/payments', paymentRoutes);

module.exports = router;
