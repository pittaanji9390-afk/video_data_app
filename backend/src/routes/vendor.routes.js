/**
 * Vendor Routes
 * Endpoints under /api/v1/vendors
 */

const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const {
  validateVendorIdParam,
  validateCreateVendor,
  validateUpdateVendor,
} = require('../validators/vendor.validator');

// Protect all vendor routes with JWT authentication
router.use(authenticateJWT);

// POST /api/v1/vendors - Create Vendor
router.post('/', validateCreateVendor, (req, res, next) => vendorController.createVendor(req, res, next));

// GET /api/v1/vendors - Get All Vendors (Paginated)
router.get('/', (req, res, next) => vendorController.getAllVendors(req, res, next));

// GET /api/v1/vendors/:id - Get Vendor by ID
router.get('/:id', validateVendorIdParam, (req, res, next) => vendorController.getVendorById(req, res, next));

// PUT /api/v1/vendors/:id - Update Vendor
router.put('/:id', validateVendorIdParam, validateUpdateVendor, (req, res, next) => vendorController.updateVendor(req, res, next));

// DELETE /api/v1/vendors/:id - Soft Delete Vendor
router.delete('/:id', validateVendorIdParam, (req, res, next) => vendorController.deleteVendor(req, res, next));

module.exports = router;
