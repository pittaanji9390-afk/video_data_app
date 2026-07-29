/**
 * Candidate Routes
 * Endpoints under /api/v1/candidates
 */

const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const {
  validateCreateCandidate,
  validateGetCandidatesQuery,
} = require('../validators/candidate.validator');

// Apply JWT authentication middleware to protect candidate routes
router.use(authenticateJWT);

// GET /api/v1/candidates/stats - Get Candidate Counts by Status for Vendor
router.get('/stats', (req, res, next) => candidateController.getCandidateStats(req, res, next));

// POST /api/v1/candidates - Create Candidate
router.post('/', validateCreateCandidate, (req, res, next) => candidateController.createCandidate(req, res, next));

// GET /api/v1/candidates - Get All Candidates (Paginated)
router.get('/', validateGetCandidatesQuery, (req, res, next) => candidateController.getCandidates(req, res, next));

module.exports = router;
