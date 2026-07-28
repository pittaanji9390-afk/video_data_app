/**
 * Candidate Service
 * 
 * Business logic and database operations for Candidate entity.
 */

const db = require('../database/connection');

class CandidateService {
  /**
   * Creates a new candidate assigned to a valid vendor.
   */
  async createCandidate({ vendor_id, full_name, phone, email }) {
    // 1. Verify vendor exists and is not soft deleted
    const vendorCheck = await db.query(
      'SELECT id FROM vendors WHERE id = $1 AND deleted_at IS NULL',
      [vendor_id]
    );

    if (vendorCheck.rowCount === 0) {
      const error = new Error('Vendor not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    // 2. Check phone number uniqueness
    const phoneCheck = await db.query(
      'SELECT id FROM candidates WHERE phone = $1 AND deleted_at IS NULL',
      [phone]
    );

    if (phoneCheck.rowCount > 0) {
      const error = new Error('Phone number is already registered to a candidate');
      error.statusCode = 409;
      throw error;
    }

    // 3. Insert candidate
    const insertQuery = `
      INSERT INTO candidates (
        vendor_id,
        full_name,
        phone,
        email,
        is_active
      )
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING
        id,
        vendor_id,
        full_name,
        phone,
        email,
        is_active,
        created_at,
        updated_at
    `;

    const result = await db.query(insertQuery, [
      vendor_id,
      full_name,
      phone,
      email || null,
    ]);

    return result.rows[0];
  }

  /**
   * Gets paginated list of active candidates with optional vendor_id filter.
   */
  async getCandidates({ vendor_id, page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let countQuery = 'SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL';
    let selectQuery = `
      SELECT
        c.id,
        c.vendor_id,
        v.company_name AS vendor_name,
        c.full_name,
        c.phone,
        c.email,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM candidates c
      JOIN vendors v ON c.vendor_id = v.id
      WHERE c.deleted_at IS NULL
    `;

    const params = [];
    if (vendor_id) {
      countQuery += ' AND vendor_id = $1';
      selectQuery += ' AND c.vendor_id = $1';
      params.push(vendor_id);
    }

    const countResult = await db.query(countQuery, params);
    const total_records = parseInt(countResult.rows[0].count, 10);
    const total_pages = Math.ceil(total_records / limitNum) || 1;

    selectQuery += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);

    const result = await db.query(selectQuery, params);

    return {
      items: result.rows,
      pagination: {
        total_records,
        page: pageNum,
        limit: limitNum,
        total_pages,
      },
    };
  }
}

module.exports = new CandidateService();
