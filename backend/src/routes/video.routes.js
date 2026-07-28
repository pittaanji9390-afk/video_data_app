/**
 * Video Routes
 * Endpoints under /api/v1/videos
 */

const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const uploadVideoMiddleware = require('../middleware/upload.middleware');
const {
  validateVideoIdParam,
  validateCreateVideo,
  validateUpdateVideo,
} = require('../validators/video.validator');

// POST /api/v1/videos/upload - Local MP4 Video File Upload
router.post('/upload', uploadVideoMiddleware, (req, res, next) => videoController.uploadVideo(req, res, next));

// POST /api/v1/videos - Create Video Metadata
router.post('/', validateCreateVideo, (req, res, next) => videoController.createVideo(req, res, next));

// GET /api/v1/videos - Get All Videos (Paginated, filtered)
router.get('/', (req, res, next) => videoController.getAllVideos(req, res, next));

// GET /api/v1/videos/:id - Get Video by ID
router.get('/:id', validateVideoIdParam, (req, res, next) => videoController.getVideoById(req, res, next));

// PUT /api/v1/videos/:id - Update Video Metadata
router.put('/:id', validateVideoIdParam, validateUpdateVideo, (req, res, next) => videoController.updateVideo(req, res, next));

// DELETE /api/v1/videos/:id - Soft Delete Video
router.delete('/:id', validateVideoIdParam, (req, res, next) => videoController.deleteVideo(req, res, next));

module.exports = router;
