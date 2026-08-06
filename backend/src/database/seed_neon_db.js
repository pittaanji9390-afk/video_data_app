require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const db = require('./connection');

async function seedNeonDatabase() {
  console.log('🌱 Starting Neon Cloud PostgreSQL Database Seeding...');

  try {
    const adminPasswordHash = await bcrypt.hash('password123', 10);
    const vendorPasswordHash = await bcrypt.hash('vendor123', 10);
    const candidatePasswordHash = await bcrypt.hash('anji123', 10);
    const qcPasswordHash = await bcrypt.hash('qc1234', 10);

    // Ensure password_hash column exists on all tables if missing
    await db.query('ALTER TABLE vendors ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);').catch(() => {});
    await db.query('ALTER TABLE candidates ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);').catch(() => {});

    // Ensure reviewer_activity table exists & has password_hash column
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviewer_activity (
        reviewer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reviewer_name VARCHAR(200) NOT NULL,
        reviewer_email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `).catch(() => {});

    await db.query('ALTER TABLE reviewer_activity ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);').catch(() => {});

    // 1. Seed Admins Table
    console.log('1. Seeding Admins table...');
    await db.query(`
      INSERT INTO admins (id, username, email, password_hash, full_name, is_active)
      VALUES 
        ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@videoplatform.com', $1, 'Super Admin', TRUE),
        ('00000000-0000-0000-0000-000000000002', 'admin_example', 'admin@example.com', $1, 'System Administrator', TRUE)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, is_active = TRUE;
    `, [adminPasswordHash]);

    // 2. Seed Vendors Table
    console.log('2. Seeding Vendors table...');
    await db.query(`
      INSERT INTO vendors (id, vendor_code, company_name, contact_person, email, phone, address, password_hash, is_active)
      VALUES 
        ('10000000-0000-4000-8000-000000000001', 'VEN-001', 'Acme Video Solutions', 'Acme Contact', 'vendor@acmevideos.com', '+91 98765 00001', 'Bangalore, India', $1, TRUE),
        ('10000000-0000-4000-8000-000000000002', 'VEN-002', 'ABC Solutions', 'Rahul Kumar', 'rahul@abc.com', '+91 98765 43210', 'Bangalore, India', $1, TRUE),
        ('10000000-0000-4000-8000-000000000003', 'VEN-003', 'PQR Enterprises', 'Priya Sharma', 'priya@pqr.com', '+91 98765 43211', 'Hyderabad, India', $1, TRUE)
      ON CONFLICT (id) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, is_active = TRUE;
    `, [vendorPasswordHash]);

    // 3. Seed Candidates Table
    console.log('3. Seeding Candidates table...');
    await db.query(`
      INSERT INTO candidates (id, vendor_id, full_name, email, phone, password_hash, is_active)
      VALUES 
        ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Anji Candidate', 'anji@gmail.com', '9876543210', $1, TRUE),
        ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Vasavi Kandula', 'vasavi@example.com', '+91 98765 43210', $1, TRUE),
        ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Rahul Kumar', 'rahul.k@example.com', '+91 98765 43213', $1, TRUE)
      ON CONFLICT (id) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, is_active = TRUE;
    `, [candidatePasswordHash]);

    // 4. Seed QC Reviewers Table
    console.log('4. Seeding Reviewer Activity / QC Team table...');
    await db.query(`
      INSERT INTO reviewer_activity (reviewer_id, reviewer_name, reviewer_email, password_hash, is_active, is_available)
      VALUES 
        ('q0000000-0000-0000-0000-000000000001', 'QC Lead Specialist', 'qc@videoplatform.com', $1, TRUE, TRUE),
        ('q0000000-0000-0000-0000-000000000002', 'QC Reviewer Specialist', 'qc.reviewer@videoplatform.com', $1, TRUE, TRUE)
      ON CONFLICT (reviewer_id) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, is_active = TRUE;
    `, [qcPasswordHash]);

    console.log('🎉 Neon Cloud Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err.message || err);
    process.exit(1);
  }
}

seedNeonDatabase();
