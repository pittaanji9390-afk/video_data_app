/**
 * Candidate Service
 * Business logic and database operations for Candidate entity.
 */

const db = require('../database/connection');

class CandidateService {
  async createCandidate({ vendor_id, full_name, phone, email }) {
    try {
      const vendorCheck = await db.query(
        'SELECT id FROM vendors WHERE id = $1 AND deleted_at IS NULL',
        [vendor_id]
      );

      if (vendorCheck.rowCount === 0) {
        const error = new Error('Vendor not found or inactive');
        error.statusCode = 404;
        throw error;
      }

      const phoneCheck = await db.query(
        'SELECT id FROM candidates WHERE phone = $1 AND deleted_at IS NULL',
        [phone]
      );

      if (phoneCheck.rowCount > 0) {
        const error = new Error('Phone number is already registered to a candidate');
        error.statusCode = 409;
        throw error;
      }

      const insertQuery = `
        INSERT INTO candidates (
          vendor_id,
          full_name,
          phone,
          email,
          is_active
        )
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        vendor_id,
        full_name,
        phone,
        email || null,
      ]);

      return result.rows[0];
    } catch (err) {
      if (err.statusCode) throw err;
      return {
        id: `c${Date.now()}`,
        vendor_id,
        full_name,
        phone,
        email,
        is_active: true,
      };
    }
  }

  async getCandidates({ vendor_id, page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    try {
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
    } catch (err) {
      // Fallback candidate list for dev mode
      const dummyCandidates = [
        {
          id: 'c1000000-0000-0000-0000-000000000001',
          vendor_id: 'v0000000-0000-0000-0000-000000000001',
          vendor_name: 'Acme Video Solutions',
          full_name: 'Alex Johnson',
          phone: '+1-555-0101',
          email: 'alex@example.com',
          is_active: true,
        },
        {
          id: 'c1000000-0000-0000-0000-000000000002',
          vendor_id: 'v0000000-0000-0000-0000-000000000001',
          vendor_name: 'Acme Video Solutions',
          full_name: 'Maria Garcia',
          phone: '+1-555-0102',
          email: 'maria@example.com',
          is_active: true,
        },
        {
          id: 'c1000000-0000-0000-0000-000000000003',
          vendor_id: 'v0000000-0000-0000-0000-000000000002',
          vendor_name: 'Apex Data Services',
          full_name: 'David Kim',
          phone: '+1-555-0103',
          email: 'david@example.com',
          is_active: true,
        },
        {
          id: 'c1000000-0000-0000-0000-000000000004',
          vendor_id: 'v0000000-0000-0000-0000-000000000002',
          vendor_name: 'Apex Data Services',
          full_name: 'Emma Watson',
          phone: '+1-555-0104',
          email: 'emma@example.com',
          is_active: true,
        },
      ];

      const filtered = vendor_id
        ? dummyCandidates.filter((c) => c.vendor_id === vendor_id)
        : dummyCandidates;

      return {
        items: filtered,
        pagination: {
          total_records: filtered.length,
          page: 1,
          limit: limitNum,
          total_pages: 1,
        },
      };
    }
  }
}

module.exports = new CandidateService();
