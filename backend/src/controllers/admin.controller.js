/**
 * Admin Controller
 * 
 * Handles incoming HTTP requests for Admin routes, delegating logic
 * to AdminService and formatting HTTP responses.
 */

const adminService = require('../services/admin.service');

class AdminController {
  /**
   * POST /api/v1/admins
   * Creates a new admin account.
   */
  async createAdmin(req, res, next) {
    try {
      const { full_name, email, phone, password } = req.body;

      const newAdmin = await adminService.createAdmin({
        full_name,
        email,
        phone,
        password,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Admin created successfully',
        data: newAdmin,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
