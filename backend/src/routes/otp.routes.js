const express = require('express');
const router = express.Router();
const otpService = require('../services/otp.service');

// POST /api/v1/auth/send-otp
router.post('/send-otp', async (req, res, next) => {
  try {
    const result = await otpService.sendOTP(req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', async (req, res, next) => {
  try {
    const result = await otpService.verifyOTP(req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
