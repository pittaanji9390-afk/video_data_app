/**
 * Payment Routes
 * Endpoints under /api/v1/payments
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const {
  validatePaymentVendorIdParam,
  validatePaymentCalculationQuery,
} = require('../validators/payment.validator');

// Protect all payment calculation routes with JWT authentication
router.use(authenticateJWT);

// GET /api/v1/payments/vendor/:vendorId - Calculate Vendor Payment
router.get(
  '/vendor/:vendorId',
  validatePaymentVendorIdParam,
  validatePaymentCalculationQuery,
  (req, res, next) => paymentController.calculateVendorPayment(req, res, next)
);

module.exports = router;
