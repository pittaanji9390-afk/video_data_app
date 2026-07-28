/**
 * Vendor Service
 * 
 * Business logic and database operations for Vendor entity.
 */

const db = require('../database/connection');

class VendorService {
  /**
   * Generates a unique vendor code (e.g. VENDOR-001, VENDOR-002).
   */
  async generateVendorCode() {
    const countResult = await db.query('SELECT COUNT(*) FROM vendors');
    let nextNum = parseInt(countResult.rows[0].count, 10) + 1;
    let vendor_code = `VENDOR-${String(nextNum).padStart(3, '0')}`;

    // Ensure uniqueness in case of deleted records or sequence gaps
    while (true) {
      const check = await db.query(
        'SELECT id FROM vendors WHERE vendor_code = $1',
        [vendor_code]
      );
      if (check.rowCount === 0) break;
      nextNum++;
      vendor_code = `VENDOR-${String(nextNum).padStart(3, '0')}`;
    }

    return vendor_code;
  }

  /**
   * Creates a new vendor with auto-generated vendor_code.
   */
  async createVendor({ company_name, contact_person, email, phone, address, created_by }) {
    // Check if email already exists
    const existingVendor = await db.query(
      'SELECT id FROM vendors WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (existingVendor.rowCount > 0) {
      const error = new Error('Vendor email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const vendor_code = await this.generateVendorCode();

    const insertQuery = `
      INSERT INTO vendors (
        vendor_code,
        company_name,
        contact_person,
        email,
        phone,
        address,
        created_by,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING
        id,
        vendor_code,
        company_name,
        contact_person,
        email,
        phone,
        address,
        is_active,
        created_by,
        created_at,
        updated_at
    `;

    const result = await db.query(insertQuery, [
      vendor_code,
      company_name,
      contact_person,
      email,
      phone || null,
      address || null,
      created_by || null,
    ]);

    return result.rows[0];
  }

  /**
   * Gets paginated list of active vendors (excluding deleted).
   */
  async getAllVendors({ page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await db.query(
      'SELECT COUNT(*) FROM vendors WHERE deleted_at IS NULL'
    );
    const total_records = parseInt(countResult.rows[0].count, 10);
    const total_pages = Math.ceil(total_records / limitNum) || 1;

    const selectQuery = `
      SELECT
        id,
        vendor_code,
        company_name,
        contact_person,
        email,
        phone,
        address,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM vendors
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(selectQuery, [limitNum, offset]);

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

  /**
   * Gets a vendor by ID.
   */
  async getVendorById(id) {
    const query = `
      SELECT
        id,
        vendor_code,
        company_name,
        contact_person,
        email,
        phone,
        address,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM vendors
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await db.query(query, [id]);

    if (result.rowCount === 0) {
      const error = new Error('Vendor not found');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  /**
   * Updates vendor details (keeps vendor_code read-only).
   */
  async updateVendor(id, { company_name, contact_person, email, phone, address, is_active }) {
    const existing = await this.getVendorById(id);

    // If email is changing, check uniqueness
    if (email && email !== existing.email) {
      const emailCheck = await db.query(
        'SELECT id FROM vendors WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
        [email, id]
      );
      if (emailCheck.rowCount > 0) {
        const error = new Error('Email is already registered to another vendor');
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedCompanyName = company_name !== undefined ? company_name : existing.company_name;
    const updatedContactPerson = contact_person !== undefined ? contact_person : existing.contact_person;
    const updatedEmail = email !== undefined ? email : existing.email;
    const updatedPhone = phone !== undefined ? phone : existing.phone;
    const updatedAddress = address !== undefined ? address : existing.address;
    const updatedIsActive = is_active !== undefined ? is_active : existing.is_active;

    const updateQuery = `
      UPDATE vendors
      SET
        company_name = $1,
        contact_person = $2,
        email = $3,
        phone = $4,
        address = $5,
        is_active = $6,
        updated_at = NOW()
      WHERE id = $7 AND deleted_at IS NULL
      RETURNING
        id,
        vendor_code,
        company_name,
        contact_person,
        email,
        phone,
        address,
        is_active,
        created_by,
        created_at,
        updated_at
    `;

    const result = await db.query(updateQuery, [
      updatedCompanyName,
      updatedContactPerson,
      updatedEmail,
      updatedPhone,
      updatedAddress,
      updatedIsActive,
      id,
    ]);

    return result.rows[0];
  }

  /**
   * Soft deletes a vendor (does NOT delete related candidates).
   */
  async deleteVendor(id) {
    await this.getVendorById(id);

    const deleteQuery = `
      UPDATE vendors
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;

    await db.query(deleteQuery, [id]);

    return { message: 'Vendor deleted successfully' };
  }
}

module.exports = new VendorService();
