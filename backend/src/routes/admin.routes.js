/**
 * Admin Routes
 * 
 * Defines endpoints under /api/v1/admins
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { validateCreateAdmin } = require('../validators/admin.validator');

// POST /api/v1/admins - Create Admin
router.post('/', validateCreateAdmin, (req, res, next) => adminController.createAdmin(req, res, next));

module.exports = router;
