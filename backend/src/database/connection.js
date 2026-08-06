/**
 * PostgreSQL Database Connection
 */

const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

const poolConfig = config.database.url
  ? {
      connectionString: config.database.url,
      ssl: { rejectUnauthorized: false },
      max: 30,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: 30,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { message: err.message });
});

async function connectDB() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info(`✓ Database Connected (${config.database.host}:${config.database.port}/${config.database.name})`);
    return true;
  } catch (error) {
    logger.warn('⚠ Local PostgreSQL not connected. Operating in API mode with fallback handling.', {
      error: error.message,
    });
    return false;
  }
}

function getPool() {
  return pool;
}

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (err) {
    logger.warn(`Database Query Warning: ${err.message}`);
    throw err;
  }
}

async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

async function closeDB() {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool', { error: error.message });
  }
}

module.exports = {
  connectDB,
  getPool,
  query,
  checkConnection,
  closeDB,
};
