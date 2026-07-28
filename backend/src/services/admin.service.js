/**
 * Admin Service
 * 
 * Business logic and database operations for Admin entity.
 */

const bcrypt = require('bcryptjs');
const db = require('../database/connection');

class AdminService {
  /**
   * Creates a new admin account.
   */
  async createAdmin({ full_name, email, phone, password }) {
    const existingAdmin = await db.query(
      'SELECT id FROM admins WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (existingAdmin.rowCount > 0) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const username = email.split('@')[0];

    const insertQuery = `
      INSERT INTO admins (
        full_name,
        email,
        phone,
        password_hash,
        username,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING
        id,
        full_name,
        email,
        phone,
        username,
        is_active,
        created_at,
        updated_at
    `;

    const result = await db.query(insertQuery, [
      full_name,
      email,
      phone,
      password_hash,
      username,
    ]);

    return result.rows[0];
  }

  /**
   * Gets paginated list of active admins (excluding soft-deleted).
   */
  async getAllAdmins({ page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Count total active admins
    const countResult = await db.query(
      'SELECT COUNT(*) FROM admins WHERE deleted_at IS NULL'
    );
    const total_records = parseInt(countResult.rows[0].count, 10);
    const total_pages = Math.ceil(total_records / limitNum) || 1;

    // Fetch paginated active admins
    const selectQuery = `
      SELECT
        id,
        full_name,
        email,
        phone,
        username,
        is_active,
        last_login_at,
        created_at,
        updated_at
      FROM admins
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
   * Gets a single admin by ID.
   */
  async getAdminById(id) {
    const query = `
      SELECT
        id,
        full_name,
        email,
        phone,
        username,
        is_active,
        last_login_at,
        created_at,
        updated_at
      FROM admins
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await db.query(query, [id]);

    if (result.rowCount === 0) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  /**
   * Updates an admin record (does NOT update password).
   */
  async updateAdmin(id, { full_name, phone, email, is_active }) {
    // Check if admin exists
    const existing = await this.getAdminById(id);

    // If email is changing, check uniqueness
    if (email && email !== existing.email) {
      const emailCheck = await db.query(
        'SELECT id FROM admins WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
        [email, id]
      );
      if (emailCheck.rowCount > 0) {
        const error = new Error('Email is already registered to another admin');
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedFullName = full_name !== undefined ? full_name : existing.full_name;
    const updatedEmail = email !== undefined ? email : existing.email;
    const updatedPhone = phone !== undefined ? phone : existing.phone;
    const updatedIsActive = is_active !== undefined ? is_active : existing.is_active;

    const updateQuery = `
      UPDATE admins
      SET
        full_name = $1,
        email = $2,
        phone = $3,
        is_active = $4,
        updated_at = NOW()
      WHERE id = $5 AND deleted_at IS NULL
      RETURNING
        id,
        full_name,
        email,
        phone,
        username,
        is_active,
        last_login_at,
        created_at,
        updated_at
    `;

    const result = await db.query(updateQuery, [
      updatedFullName,
      updatedEmail,
      updatedPhone,
      updatedIsActive,
      id,
    ]);

    return result.rows[0];
  }

  /**
   * Soft deletes an admin (sets deleted_at = NOW()).
   */
  async deleteAdmin(id) {
    // Verify admin exists
    await this.getAdminById(id);

    const deleteQuery = `
      UPDATE admins
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;

    await db.query(deleteQuery, [id]);

    return { message: 'Admin deleted successfully' };
  }
}

module.exports = new AdminService();
