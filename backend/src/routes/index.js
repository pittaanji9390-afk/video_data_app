const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const adminRoutes = require('./admin.routes');
const vendorRoutes = require('./vendor.routes');
const candidateRoutes = require('./candidate.routes');
const videoRoutes = require('./video.routes');

// GET /
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Video Platform Backend Running',
  });
});

// GET /health
router.use('/health', healthRoutes);

// API v1 Routes
router.use('/api/v1/admins', adminRoutes);
router.use('/api/v1/vendors', vendorRoutes);
router.use('/api/v1/candidates', candidateRoutes);
router.use('/api/v1/videos', videoRoutes);

module.exports = router;
