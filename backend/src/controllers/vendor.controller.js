/**
 * Vendor Controller
 */

const vendorService = require('../services/vendor.service');

class VendorController {
  /**
   * POST /api/v1/vendors
   */
  async createVendor(req, res, next) {
    try {
      const { company_name, contact_person, email, phone, address, created_by } = req.body;

      const newVendor = await vendorService.createVendor({
        company_name,
        contact_person,
        email,
        phone,
        address,
        created_by,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Vendor created successfully',
        data: newVendor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/vendors
   */
  async getAllVendors(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await vendorService.getAllVendors({ page, limit });

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/vendors/:id
   */
  async getVendorById(req, res, next) {
    try {
      const { id } = req.params;
      const vendor = await vendorService.getVendorById(id);

      return res.status(200).json({
        status: 'success',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/vendors/:id
   */
  async updateVendor(req, res, next) {
    try {
      const { id } = req.params;
      const { company_name, contact_person, email, phone, address, is_active } = req.body;

      const updatedVendor = await vendorService.updateVendor(id, {
        company_name,
        contact_person,
        email,
        phone,
        address,
        is_active,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Vendor updated successfully',
        data: updatedVendor,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/vendors/:id
   */
  async deleteVendor(req, res, next) {
    try {
      const { id } = req.params;
      const result = await vendorService.deleteVendor(id);

      return res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VendorController();
