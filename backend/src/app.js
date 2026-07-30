const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// High Scalability Performance Settings (10,000+ Users)
app.disable('x-powered-by');
app.set('etag', 'strong');

// Global middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve pre-compiled Flutter Mobile App for instant release-mode page loading
app.use('/app', express.static(path.join(__dirname, '../../mobile-app/build/web')));

// Mount routes
app.use('/', routes);

// 404 handler for undefined routes
app.use(notFound);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
