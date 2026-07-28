/**
 * Application Configuration
 * 
 * Loads environment variables via dotenv and exports a centralized
 * configuration object used throughout the application.
 * 
 * dotenv.config() must be called before this module is imported
 * by any other module — handled in server.js.
 */

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'videoplatform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
};
