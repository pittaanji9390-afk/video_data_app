/**
 * QC Review Controller
 */

const qcReviewService = require('../services/qcReview.service');

class QCReviewController {
  /**
   * POST /api/v1/qc-reviews
   * Creates/updates QC review and automatically updates video status.
   */
  async createQCReview(req, res, next) {
    try {
      const { video_id, status, reject_reason, reviewer_name, reviewer_id } = req.body;

      const result = await qcReviewService.createQCReview({
        video_id,
        status,
        reject_reason,
        reviewer_name,
        reviewer_id,
      });

      return res.status(201).json({
        status: 'success',
        message: `Video QC review submitted. Video status updated to "${status}"`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/qc-reviews/video/:video_id
   */
  async getQCReviewByVideoId(req, res, next) {
    try {
      const { video_id } = req.params;
      const review = await qcReviewService.getQCReviewByVideoId(video_id);

      return res.status(200).json({
        status: 'success',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QCReviewController();
