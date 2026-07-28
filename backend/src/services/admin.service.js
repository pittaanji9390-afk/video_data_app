/**
 * Admin Service
 * 
 * Contains business logic for Admin operations, including password hashing
 * and database queries via PostgreSQL pool wrapper.
 */

const bcrypt = require('bcryptjs');
const db = require('../database/connection');

class AdminService {
  /**
   * Creates a new admin account in PostgreSQL.
   * 
   * @param {Object} adminData - { full_name, email, phone, password }
   * @returns {Object} Created admin record without password_hash
   */
  async createAdmin({ full_name, email, phone, password }) {
    // 1. Check if email is already registered
    const existingAdmin = await db.query(
      'SELECT id FROM admins WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (existingAdmin.rowCount > 0) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    // 2. Hash the password with bcrypt (salt rounds: 10)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 3. Derive username from email prefix or full_name
    const username = email.split('@')[0];

    // 4. Insert admin into database
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
}

module.exports = new AdminService();
