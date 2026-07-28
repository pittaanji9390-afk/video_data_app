/**
 * Video Service
 * 
 * Business logic and database operations for Video entity (Metadata store).
 */

const db = require('../database/connection');

class VideoService {
  /**
   * Creates a new video metadata record.
   */
  async createVideo({
    candidate_id,
    vendor_id,
    title,
    description,
    duration,
    environment_tag,
    latitude,
    longitude,
    status = 'pending',
  }) {
    // 1. Verify candidate exists and is active
    const candidateCheck = await db.query(
      'SELECT id FROM candidates WHERE id = $1 AND deleted_at IS NULL',
      [candidate_id]
    );

    if (candidateCheck.rowCount === 0) {
      const error = new Error('Candidate not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify vendor exists and is active
    const vendorCheck = await db.query(
      'SELECT id FROM vendors WHERE id = $1 AND deleted_at IS NULL',
      [vendor_id]
    );

    if (vendorCheck.rowCount === 0) {
      const error = new Error('Vendor not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    // 3. Insert video metadata
    const insertQuery = `
      INSERT INTO videos (
        candidate_id,
        vendor_id,
        title,
        description,
        duration,
        environment_tag,
        latitude,
        longitude,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        candidate_id,
        vendor_id,
        title,
        description,
        s3_url,
        file_name,
        file_size,
        duration,
        environment_tag,
        latitude,
        longitude,
        status,
        created_at,
        updated_at
    `;

    const result = await db.query(insertQuery, [
      candidate_id,
      vendor_id,
      title || null,
      description || null,
      duration || null,
      environment_tag || null,
      latitude || null,
      longitude || null,
      status || 'pending',
    ]);

    return result.rows[0];
  }

  /**
   * Gets paginated list of active video metadata records with optional filters.
   */
  async getAllVideos({ candidate_id, vendor_id, status, page = 1, limit = 10 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let countQuery = 'SELECT COUNT(*) FROM videos WHERE deleted_at IS NULL';
    let selectQuery = `
      SELECT
        v.id,
        v.candidate_id,
        c.full_name AS candidate_name,
        v.vendor_id,
        ven.company_name AS vendor_name,
        v.title,
        v.description,
        v.s3_url,
        v.file_name,
        v.file_size,
        v.duration,
        v.environment_tag,
        v.latitude,
        v.longitude,
        v.status,
        v.created_at,
        v.updated_at
      FROM videos v
      JOIN candidates c ON v.candidate_id = c.id
      JOIN vendors ven ON v.vendor_id = ven.id
      WHERE v.deleted_at IS NULL
    `;

    const conditions = [];
    const params = [];

    if (candidate_id) {
      params.push(candidate_id);
      conditions.push(`v.candidate_id = $${params.length}`);
    }

    if (vendor_id) {
      params.push(vendor_id);
      conditions.push(`v.vendor_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`v.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      const whereClause = ' AND ' + conditions.join(' AND ');
      countQuery += whereClause.replace(/v\./g, '');
      selectQuery += whereClause;
    }

    const countResult = await db.query(countQuery, params);
    const total_records = parseInt(countResult.rows[0].count, 10);
    const total_pages = Math.ceil(total_records / limitNum) || 1;

    selectQuery += ` ORDER BY v.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);

    const result = await db.query(selectQuery, params);

    return {
      items: result.rows,
      pagination: {
        total_records,
        page: pageNum,
        limit: limitNum,
        total_pages,
      },
    };
  }

  /**
   * Gets a single video metadata record by ID.
   */
  async getVideoById(id) {
    const query = `
      SELECT
        v.id,
        v.candidate_id,
        c.full_name AS candidate_name,
        v.vendor_id,
        ven.company_name AS vendor_name,
        v.title,
        v.description,
        v.s3_url,
        v.file_name,
        v.file_size,
        v.duration,
        v.environment_tag,
        v.latitude,
        v.longitude,
        v.status,
        v.created_at,
        v.updated_at
      FROM videos v
      JOIN candidates c ON v.candidate_id = c.id
      JOIN vendors ven ON v.vendor_id = ven.id
      WHERE v.id = $1 AND v.deleted_at IS NULL
    `;

    const result = await db.query(query, [id]);

    if (result.rowCount === 0) {
      const error = new Error('Video not found');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  /**
   * Updates video metadata.
   */
  async updateVideo(id, { title, description, duration, environment_tag, latitude, longitude, status }) {
    const existing = await this.getVideoById(id);

    const updatedTitle = title !== undefined ? title : existing.title;
    const updatedDesc = description !== undefined ? description : existing.description;
    const updatedDuration = duration !== undefined ? duration : existing.duration;
    const updatedEnvTag = environment_tag !== undefined ? environment_tag : existing.environment_tag;
    const updatedLat = latitude !== undefined ? latitude : existing.latitude;
    const updatedLong = longitude !== undefined ? longitude : existing.longitude;
    const updatedStatus = status !== undefined ? status : existing.status;

    const updateQuery = `
      UPDATE videos
      SET
        title = $1,
        description = $2,
        duration = $3,
        environment_tag = $4,
        latitude = $5,
        longitude = $6,
        status = $7,
        updated_at = NOW()
      WHERE id = $8 AND deleted_at IS NULL
      RETURNING
        id,
        candidate_id,
        vendor_id,
        title,
        description,
        s3_url,
        file_name,
        file_size,
        duration,
        environment_tag,
        latitude,
        longitude,
        status,
        created_at,
        updated_at
    `;

    const result = await db.query(updateQuery, [
      updatedTitle,
      updatedDesc,
      updatedDuration,
      updatedEnvTag,
      updatedLat,
      updatedLong,
      updatedStatus,
      id,
    ]);

    return result.rows[0];
  }

  /**
   * Soft deletes a video record (sets deleted_at = NOW()).
   */
  async deleteVideo(id) {
    await this.getVideoById(id);

    const deleteQuery = `
      UPDATE videos
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;

    await db.query(deleteQuery, [id]);

    return { message: 'Video deleted successfully' };
  }
}

module.exports = new VideoService();
