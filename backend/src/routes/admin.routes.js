/**
 * Admin Routes
 * Endpoints under /api/v1/admins
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const {
  validateIdParam,
  validateCreateAdmin,
  validateUpdateAdmin,
} = require('../validators/admin.validator');

// POST /api/v1/admins - Create Admin
router.post('/', validateCreateAdmin, (req, res, next) => adminController.createAdmin(req, res, next));

// GET /api/v1/admins - Get All Admins (Paginated)
router.get('/', (req, res, next) => adminController.getAllAdmins(req, res, next));

// GET /api/v1/admins/:id - Get Admin by ID
router.get('/:id', validateIdParam, (req, res, next) => adminController.getAdminById(req, res, next));

// PUT /api/v1/admins/:id - Update Admin
router.put('/:id', validateIdParam, validateUpdateAdmin, (req, res, next) => adminController.updateAdmin(req, res, next));

// DELETE /api/v1/admins/:id - Soft Delete Admin
router.delete('/:id', validateIdParam, (req, res, next) => adminController.deleteAdmin(req, res, next));

module.exports = router;
