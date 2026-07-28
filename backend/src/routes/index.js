const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');
const adminRoutes = require('./admin.routes');

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

module.exports = router;
