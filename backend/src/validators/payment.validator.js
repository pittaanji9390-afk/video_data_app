/**
 * Payment Request Validator
 */

const { isValidUUID } = require('../utils/uuid');

function validatePaymentVendorIdParam(req, res, next) {
  const { vendorId } = req.params;
  if (!isValidUUID(vendorId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid UUID format for vendor ID',
    });
  }
  next();
}

function validatePaymentCalculationQuery(req, res, next) {
  const { hourly_rate } = req.query;

  if (hourly_rate !== undefined) {
    const rateNum = Number(hourly_rate);
    if (isNaN(rateNum) || rateNum <= 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'hourly_rate must be a positive number',
      });
    }
  }

  next();
}

module.exports = {
  validatePaymentVendorIdParam,
  validatePaymentCalculationQuery,
};
