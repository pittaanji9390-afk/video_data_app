/**
 * Video Controller
 */

const videoService = require('../services/video.service');

class VideoController {
  /**
   * POST /api/v1/videos
   */
  async createVideo(req, res, next) {
    try {
      const {
        candidate_id,
        vendor_id,
        title,
        description,
        duration,
        environment_tag,
        latitude,
        longitude,
        status,
      } = req.body;

      const newVideo = await videoService.createVideo({
        candidate_id,
        vendor_id,
        title,
        description,
        duration,
        environment_tag,
        latitude,
        longitude,
        status,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Video metadata created successfully',
        data: newVideo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/videos
   */
  async getAllVideos(req, res, next) {
    try {
      const { candidate_id, vendor_id, status, page, limit } = req.query;
      const result = await videoService.getAllVideos({
        candidate_id,
        vendor_id,
        status,
        page,
        limit,
      });

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/videos/:id
   */
  async getVideoById(req, res, next) {
    try {
      const { id } = req.params;
      const video = await videoService.getVideoById(id);

      return res.status(200).json({
        status: 'success',
        data: video,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/videos/:id
   */
  async updateVideo(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, duration, environment_tag, latitude, longitude, status } = req.body;

      const updatedVideo = await videoService.updateVideo(id, {
        title,
        description,
        duration,
        environment_tag,
        latitude,
        longitude,
        status,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Video metadata updated successfully',
        data: updatedVideo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/videos/:id
   */
  async deleteVideo(req, res, next) {
    try {
      const { id } = req.params;
      const result = await videoService.deleteVideo(id);

      return res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VideoController();
