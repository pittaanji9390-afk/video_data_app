/**
 * Payment Controller
 */

const paymentService = require('../services/payment.service');

class PaymentController {
  /**
   * GET /api/v1/payments/vendor/:vendorId
   * Calculates payment for a vendor based on approved videos only.
   */
  async calculateVendorPayment(req, res, next) {
    try {
      const { vendorId } = req.params;
      const { hourly_rate } = req.query;

      const calculation = await paymentService.calculateVendorPayment(
        vendorId,
        hourly_rate ? parseFloat(hourly_rate) : 50.00
      );

      return res.status(200).json({
        status: 'success',
        message: 'Vendor payment calculated successfully based on approved videos',
        data: calculation,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
