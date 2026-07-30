/**
 * Video Routes
 * Endpoints under /api/v1/videos
 */

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const uploadVideoMiddleware = require('../middleware/upload.middleware');
const { authenticateJWT } = require('../middleware/auth.middleware');
const {
  validateVideoIdParam,
  validateCreateVideo,
  validateUpdateVideo,
  validateUpdateVideoMetadata,
} = require('../validators/video.validator');

// GET /api/v1/videos/candidate-stats - Live Database Candidate Dashboard Metrics
router.get('/candidate-stats', (req, res, next) => videoController.getCandidateStats(req, res, next));

// POST /api/v1/videos/upload - Local MP4 Video File Upload (Public for mobile app capture)
router.post('/upload', uploadVideoMiddleware, (req, res, next) => videoController.uploadVideo(req, res, next));

// GET /api/v1/videos - Get All Videos (Public for portal lists)
router.get('/', (req, res, next) => videoController.getAllVideos(req, res, next));

// Apply JWT authentication middleware to protect private video management endpoints
router.use(authenticateJWT);

// PUT /api/v1/videos/:id/metadata - Update Specific Technical Metadata
router.put('/:id/metadata', validateVideoIdParam, validateUpdateVideoMetadata, (req, res, next) => videoController.updateVideoMetadata(req, res, next));

// POST /api/v1/videos - Create Video Metadata
router.post('/', validateCreateVideo, (req, res, next) => videoController.createVideo(req, res, next));

// GET /api/v1/videos/:id - Get Video by ID
router.get('/:id', validateVideoIdParam, (req, res, next) => videoController.getVideoById(req, res, next));

// PUT /api/v1/videos/:id - Update Video Metadata
router.put('/:id', validateVideoIdParam, validateUpdateVideo, (req, res, next) => videoController.updateVideoMetadata(req, res, next));

// DELETE /api/v1/videos/:id - Soft Delete Video
router.delete('/:id', validateVideoIdParam, (req, res, next) => videoController.deleteVideo(req, res, next));

module.exports = router;
