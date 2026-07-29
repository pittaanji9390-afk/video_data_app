/**
 * Notification Routes
 * Endpoints under /api/v1/notifications
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// GET /api/v1/notifications
router.get('/', (req, res, next) => notificationController.getNotifications(req, res, next));

// PUT /api/v1/notifications/mark-all-read
router.put('/mark-all-read', (req, res, next) => notificationController.markAllRead(req, res, next));
router.post('/mark-all-read', (req, res, next) => notificationController.markAllRead(req, res, next));

// PUT /api/v1/notifications/:id/mark-read
router.put('/:id/mark-read', (req, res, next) => notificationController.markSingleRead(req, res, next));

// POST /api/v1/notifications
router.post('/', (req, res, next) => notificationController.createNotification(req, res, next));

module.exports = router;
