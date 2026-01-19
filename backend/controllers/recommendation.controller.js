/** @format */

import {
  getRecommendations,
  getSimilarEvents,
} from "../utils/aiRecommendation.js";

/**
 * @desc    Get AI recommendations for current user
 * @route   GET /api/recommendations
 * @access  Private
 */
const getMyRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await getRecommendations(userId, limit);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get similar events based on event ID
 * @route   GET /api/recommendations/similar/:eventId
 * @access  Public
 */
const getSimilarEventsController = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const similarEvents = await getSimilarEvents(eventId, limit);

    res.status(200).json({
      success: true,
      count: similarEvents.length,
      data: similarEvents,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getMyRecommendations,
  getSimilarEventsController,
};
