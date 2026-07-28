/**
 * Admin Controller
 */

const adminService = require('../services/admin.service');

class AdminController {
  /**
   * POST /api/v1/admins
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

  /**
   * GET /api/v1/admins
   */
  async getAllAdmins(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAllAdmins({ page, limit });

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admins/:id
   */
  async getAdminById(req, res, next) {
    try {
      const { id } = req.params;
      const admin = await adminService.getAdminById(id);

      return res.status(200).json({
        status: 'success',
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admins/:id
   */
  async updateAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const { full_name, phone, email, is_active } = req.body;

      const updatedAdmin = await adminService.updateAdmin(id, {
        full_name,
        phone,
        email,
        is_active,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Admin updated successfully',
        data: updatedAdmin,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admins/:id
   */
  async deleteAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteAdmin(id);

      return res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
