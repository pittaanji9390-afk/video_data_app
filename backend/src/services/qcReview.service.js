/**
 * QC Review Service
 * 
 * Business logic and database operations for QC Reviews.
 * Automatically updates video status upon review submission.
 */

const db = require('../database/connection');

class QCReviewService {
  /**
   * Creates or updates a QC Review for a video and updates the video status.
   */
  async createQCReview({ video_id, status, reject_reason, reviewer_name, reviewer_id }) {
    // 1. Verify video exists and is not deleted
    const videoCheck = await db.query(
      'SELECT id, status FROM videos WHERE id = $1 AND deleted_at IS NULL',
      [video_id]
    );

    if (videoCheck.rowCount === 0) {
      const error = new Error('Video not found or has been deleted');
      error.statusCode = 404;
      throw error;
    }

    // 2. Check if a review already exists for this video
    const existingReview = await db.query(
      'SELECT id FROM qc_reviews WHERE video_id = $1 AND deleted_at IS NULL',
      [video_id]
    );

    let reviewResult;

    if (existingReview.rowCount > 0) {
      // Update existing review
      const updateReviewQuery = `
        UPDATE qc_reviews
        SET
          status = $1,
          reject_reason = $2,
          reviewer_name = $3,
          reviewer_id = $4,
          reviewed_at = NOW(),
          updated_at = NOW()
        WHERE video_id = $5 AND deleted_at IS NULL
        RETURNING
          id,
          video_id,
          reviewer_id,
          reviewer_name,
          status,
          reject_reason,
          reviewed_at,
          created_at,
          updated_at
      `;

      reviewResult = await db.query(updateReviewQuery, [
        status,
        status === 'rejected' ? reject_reason : null,
        reviewer_name || null,
        reviewer_id || null,
        video_id,
      ]);
    } else {
      // Insert new review
      const insertReviewQuery = `
        INSERT INTO qc_reviews (
          video_id,
          status,
          reject_reason,
          reviewer_name,
          reviewer_id,
          reviewed_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING
          id,
          video_id,
          reviewer_id,
          reviewer_name,
          status,
          reject_reason,
          reviewed_at,
          created_at,
          updated_at
      `;

      reviewResult = await db.query(insertReviewQuery, [
        video_id,
        status,
        status === 'rejected' ? reject_reason : null,
        reviewer_name || null,
        reviewer_id || null,
      ]);
    }

    // 3. AUTOMATICALLY update video status in videos table
    const updateVideoQuery = `
      UPDATE videos
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING id, status, updated_at
    `;

    const updatedVideoResult = await db.query(updateVideoQuery, [status, video_id]);

    return {
      review: reviewResult.rows[0],
      updated_video: updatedVideoResult.rows[0],
    };
  }

  /**
   * Gets a QC review by video_id.
   */
  async getQCReviewByVideoId(video_id) {
    const query = `
      SELECT
        r.id,
        r.video_id,
        r.reviewer_id,
        r.reviewer_name,
        r.status,
        r.reject_reason,
        r.reviewed_at,
        r.created_at,
        r.updated_at
      FROM qc_reviews r
      WHERE r.video_id = $1 AND r.deleted_at IS NULL
    `;

    const result = await db.query(query, [video_id]);

    if (result.rowCount === 0) {
      const error = new Error('QC Review not found for this video');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = new QCReviewService();
