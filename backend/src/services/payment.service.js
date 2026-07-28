/**
 * Payment Service
 * 
 * Business logic for payment calculation based on approved videos.
 */

const db = require('../database/connection');

class PaymentService {
  /**
   * Calculates payment for a vendor based on approved videos duration only.
   * 
   * Formula:
   *   approved_seconds = SUM(videos.duration) WHERE status = 'approved'
   *   approved_hours = approved_seconds / 3600
   *   total_amount = approved_hours * hourly_rate
   * 
   * @param {string} vendorId - Vendor UUID
   * @param {number} hourlyRateInput - Hourly rate (defaults to 50.00 if not provided)
   */
  async calculateVendorPayment(vendorId, hourlyRateInput = 50.00) {
    // 1. Verify vendor exists and is active
    const vendorCheck = await db.query(
      'SELECT id, company_name, contact_person, email FROM vendors WHERE id = $1 AND deleted_at IS NULL',
      [vendorId]
    );

    if (vendorCheck.rowCount === 0) {
      const error = new Error('Vendor not found or has been deleted');
      error.statusCode = 404;
      throw error;
    }

    const vendor = vendorCheck.rows[0];

    // 2. Sum duration of ALL APPROVED videos for this vendor
    const calcQuery = `
      SELECT
        COALESCE(SUM(duration), 0) AS total_approved_seconds,
        COUNT(id) AS approved_videos_count
      FROM videos
      WHERE vendor_id = $1
        AND status = 'approved'
        AND deleted_at IS NULL
    `;

    const calcResult = await db.query(calcQuery, [vendorId]);
    const row = calcResult.rows[0];

    const approved_seconds = parseInt(row.total_approved_seconds, 10);
    const approved_videos_count = parseInt(row.approved_videos_count, 10);

    const hourly_rate = parseFloat(hourlyRateInput) || 50.00;

    // Formula: approved_seconds / 3600 * hourly_rate
    const approved_hours = parseFloat((approved_seconds / 3600).toFixed(2));
    const total_amount = parseFloat((approved_hours * hourly_rate).toFixed(2));

    return {
      vendor_id: vendor.id,
      vendor_name: vendor.company_name,
      contact_person: vendor.contact_person,
      email: vendor.email,
      approved_videos_count,
      approved_seconds,
      approved_hours,
      hourly_rate,
      total_amount,
    };
  }
}

module.exports = new PaymentService();
