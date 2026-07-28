/**
 * Admin Request Validator
 * 
 * Middleware for validating incoming request payloads for Admin management.
 * Checks required fields, formats, and constraints before passing to controller.
 */

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

function validatePhone(phone) {
  // Allows international format, digits, spaces, hyphens, plus sign (7 to 20 chars)
  const phoneRegex = /^\+?[0-9\s\-]{7,20}$/;
  return typeof phone === 'string' && phoneRegex.test(phone.trim());
}

function validateCreateAdmin(req, res, next) {
  const { full_name, email, phone, password } = req.body || {};
  const errors = [];

  // Validate full_name
  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    errors.push({
      field: 'full_name',
      message: 'full_name is required and must be at least 2 characters long',
    });
  }

  // Validate email
  if (!email || !validateEmail(email)) {
    errors.push({
      field: 'email',
      message: 'A valid email address is required',
    });
  }

  // Validate phone
  if (!phone || !validatePhone(phone)) {
    errors.push({
      field: 'phone',
      message: 'A valid phone number is required (7 to 20 digits)',
    });
  }

  // Validate password
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({
      field: 'password',
      message: 'password is required and must be at least 6 characters long',
    });
  }

  // Return validation error response if any rules failed
  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation Error',
      errors,
    });
  }

  // Normalize inputs
  req.body.full_name = full_name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = phone.trim();

  next();
}

module.exports = {
  validateCreateAdmin,
};
