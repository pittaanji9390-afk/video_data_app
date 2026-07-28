/**
 * Candidate Routes
 * Endpoints under /api/v1/candidates
 */

const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const {
  validateCreateCandidate,
  validateGetCandidatesQuery,
} = require('../validators/candidate.validator');

// POST /api/v1/candidates - Create Candidate
router.post('/', validateCreateCandidate, (req, res, next) => candidateController.createCandidate(req, res, next));

// GET /api/v1/candidates - Get All Candidates (Paginated, optional vendor_id filter)
router.get('/', validateGetCandidatesQuery, (req, res, next) => candidateController.getCandidates(req, res, next));

module.exports = router;
