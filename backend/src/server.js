const dotenv = require('dotenv');

// 1. Load environment variables first
dotenv.config();

// 2. Validate environment variables
const validateEnv = require('./utils/validateEnv');
validateEnv();

// 3. Import app, config, logger, and DB connection module
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const db = require('./database/connection');

const PORT = config.port;

async function startServer() {
  // 4. Test database connection
  await db.connectDB();

  // 5. Start Express HTTP server
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} signal received: closing HTTP server and database pool...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      await db.closeDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();
