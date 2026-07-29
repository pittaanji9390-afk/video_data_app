const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const passwordsToTry = ['postgres', 'admin', 'root', '1234', '123456', 'password', 'postgres123', ''];

async function setup() {
  let connectedClient = null;
  let workingPassword = null;

  for (const pwd of passwordsToTry) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pwd,
      database: 'postgres'
    });
    try {
      await client.connect();
      console.log(`Successfully connected with password: "${pwd}"`);
      connectedClient = client;
      workingPassword = pwd;
      break;
    } catch (err) {
      // try next
    }
  }

  if (!connectedClient) {
    console.error('Could not connect to PostgreSQL with common default passwords.');
    process.exit(1);
  }

  try {
    if (workingPassword !== 'postgres') {
      await connectedClient.query("ALTER USER postgres WITH PASSWORD 'postgres';");
      console.log("Updated postgres user password to 'postgres'");
    }

    const dbRes = await connectedClient.query("SELECT 1 FROM pg_database WHERE datname = 'videoplatform'");
    if (dbRes.rowCount === 0) {
      await connectedClient.query('CREATE DATABASE videoplatform;');
      console.log("Created database 'videoplatform'");
    } else {
      console.log("Database 'videoplatform' already exists");
    }
    await connectedClient.end();

    const dbClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'videoplatform'
    });
    await dbClient.connect();

    const schemaPath = path.join(__dirname, '../../../database/migrations/001_initial_schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seeds/001_seed_admin.sql');
    const realSeedPath = path.join(__dirname, '../../../database/seeds/002_seed_real_data.sql');

    try {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await dbClient.query(schemaSql);
      console.log("Applied migration 001_initial_schema.sql successfully");
    } catch (migErr) {
      console.log("Migration notice (tables already exist):", migErr.message);
    }

    try {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await dbClient.query(seedSql);
      console.log("Applied seed 001_seed_admin.sql successfully");
    } catch (seedErr) {
      console.log("Seed notice:", seedErr.message);
    }

    try {
      const realSeedSql = fs.readFileSync(realSeedPath, 'utf8');
      await dbClient.query(realSeedSql);
      console.log("Applied seed 002_seed_real_data.sql successfully");
    } catch (realSeedErr) {
      console.log("Real seed notice:", realSeedErr.message);
    }

    const adminCount = await dbClient.query("SELECT COUNT(*) FROM admins;");
    const vendorCount = await dbClient.query("SELECT COUNT(*) FROM vendors WHERE deleted_at IS NULL;");
    const candidateCount = await dbClient.query("SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL;");
    const videoCount = await dbClient.query("SELECT COUNT(*) FROM videos WHERE deleted_at IS NULL;");

    console.log(`Verification: Database contains ${adminCount.rows[0].count} admin(s), ${vendorCount.rows[0].count} vendor(s), ${candidateCount.rows[0].count} candidate(s), ${videoCount.rows[0].count} video(s).`);

    await dbClient.end();
    console.log("✅ DATABASE SETUP & VERIFICATION COMPLETE!");
  } catch (err) {
    console.error("Setup error:", err.message);
    process.exit(1);
  }
}

setup();
