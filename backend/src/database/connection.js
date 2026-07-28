/**
 * PostgreSQL Database Connection
 * 
 * Creates and manages a reusable PostgreSQL connection pool using the `pg` package.
 * 
 * How it works:
 * - Uses `pg.Pool` to maintain a pool of reusable database connections.
 * - The pool automatically manages connection lifecycle (create, reuse, destroy).
 * - `connectDB()` tests the connection on startup and logs success/failure.
 * - `getPool()` returns the pool instance for use in queries throughout the app.
 * - `query()` is a convenience wrapper for executing SQL queries via the pool.
 * - `closeDB()` gracefully shuts down the pool (used on process exit).
 * 
 * Connection pool benefits:
 * - Avoids creating a new connection for every database query (expensive).
 * - Maintains a set of idle connections ready for immediate use.
 * - Automatically handles connection errors and reconnection.
 */

const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

// Create the connection pool with configuration from environment variables
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 20,                    // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout if connection takes longer than 5 seconds
});

// Log pool errors (e.g., unexpected disconnections)
pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { message: err.message });
});

/**
 * Tests the database connection by running a simple query.
 * Called once on server startup.
 * Exits the process if the connection fails.
 */
async function connectDB() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info(`✓ Database Connected (${config.database.host}:${config.database.port}/${config.database.name})`);
    logger.debug('Database time', { serverTime: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('✗ Database Connection Failed', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      error: error.message,
    });
    process.exit(1);
  }
}

/**
 * Returns the pool instance for direct use.
 */
function getPool() {
  return pool;
}

/**
 * Convenience wrapper for executing SQL queries.
 * Usage: const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('Executed query', { text, duration: `${duration}ms`, rows: result.rowCount });
  return result;
}

/**
 * Checks if the database is currently reachable.
 * Used by the /health endpoint — does NOT exit process on failure.
 */
async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return false;
  }
}

/**
 * Gracefully closes all pool connections.
 * Called during process shutdown.
 */
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
