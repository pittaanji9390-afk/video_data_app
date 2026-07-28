const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.routes');

// GET /
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Video Platform Backend Running',
  });
});

// GET /health
router.use('/health', healthRoutes);

module.exports = router;
