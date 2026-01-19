/** @format */

/**
 * AI Recommendation Engine for VolunteerHub
 * Analyzes user history and preferences to suggest relevant events
 */

import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";

/**
 * Calculate similarity score between two events based on tags and category
 */
const calculateEventSimilarity = (event1, event2) => {
  let score = 0;

  // Category match (high weight)
  if (event1.category === event2.category) {
    score += 40;
  }

  // Tags overlap
  const tags1 = event1.tags || [];
  const tags2 = event2.tags || [];
  const commonTags = tags1.filter((tag) => tags2.includes(tag));
  score += commonTags.length * 15; // 15 points per matching tag

  // Location match (same province/city)
  if (event1.location && event2.location) {
    const loc1 = event1.location.toLowerCase();
    const loc2 = event2.location.toLowerCase();
    if (loc1.includes(loc2.split(",")[0]) || loc2.includes(loc1.split(",")[0])) {
      score += 20;
    }
  }

  return score;
};

/**
 * Analyze user's event history to build preference profile
 */
const buildUserProfile = async (userId) => {
  try {
    // Get user's past registrations (accepted or completed)
    const pastRegistrations = await Registration.find({
      userId,
      status: { $in: ["accepted", "approved", "registered", "completed"] },
    })
      .populate("eventId")
      .lean();

    if (!pastRegistrations.length) {
      return null; // New user, no history
    }

    const profile = {
      categories: {},
      tags: {},
      locations: {},
      totalEvents: pastRegistrations.length,
      events: [],
    };

    pastRegistrations.forEach((reg) => {
      const event = reg.eventId;
      if (!event) return;

      profile.events.push(event);

      // Count categories
      if (event.category) {
        profile.categories[event.category] =
          (profile.categories[event.category] || 0) + 1;
      }

      // Count tags
      if (event.tags) {
        event.tags.forEach((tag) => {
          profile.tags[tag] = (profile.tags[tag] || 0) + 1;
        });
      }

      // Count locations (extract city/province)
      if (event.location) {
        const location = event.location.split(",")[0].trim();
        profile.locations[location] = (profile.locations[location] || 0) + 1;
      }
    });

    return profile;
  } catch (error) {
    console.error("Error building user profile:", error);
    return null;
  }
};

/**
 * Calculate recommendation score for an event based on user profile
 */
const calculateRecommendationScore = (event, userProfile) => {
  if (!userProfile) return 0;

  let score = 0;
  const totalEvents = userProfile.totalEvents;

  // Category preference (max 40 points)
  if (event.category && userProfile.categories[event.category]) {
    const categoryFrequency = userProfile.categories[event.category] / totalEvents;
    score += categoryFrequency * 40;
  }

  // Tag preferences (max 30 points)
  if (event.tags && event.tags.length > 0) {
    let tagScore = 0;
    event.tags.forEach((tag) => {
      if (userProfile.tags[tag]) {
        const tagFrequency = userProfile.tags[tag] / totalEvents;
        tagScore += tagFrequency * 10;
      }
    });
    score += Math.min(tagScore, 30);
  }

  // Location preference (max 20 points)
  if (event.location) {
    const eventLocation = event.location.split(",")[0].trim();
    if (userProfile.locations[eventLocation]) {
      const locationFrequency =
        userProfile.locations[eventLocation] / totalEvents;
      score += locationFrequency * 20;
    }
  }

  // Similarity to past events (max 10 points)
  let maxSimilarity = 0;
  userProfile.events.forEach((pastEvent) => {
    const similarity = calculateEventSimilarity(event, pastEvent);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  });
  score += Math.min(maxSimilarity / 10, 10);

  return Math.round(score);
};

/**
 * Get AI-powered event recommendations for a user
 */
const getRecommendations = async (userId, limit = 10) => {
  try {
    // Build user preference profile
    const userProfile = await buildUserProfile(userId);

    // Get all available upcoming events
    const now = new Date();
    const availableEvents = await Event.find({
      status: "approved",
      startDate: { $gte: now },
    }).lean();

    if (!availableEvents.length) {
      return [];
    }

    // Get user's already registered events
    const userRegistrations = await Registration.find({
      userId,
      status: { $nin: ["cancelled", "rejected"] },
    }).lean();
    const registeredEventIds = userRegistrations.map((r) =>
      r.eventId.toString()
    );

    // Filter out already registered events
    const candidateEvents = availableEvents.filter(
      (event) => !registeredEventIds.includes(event._id.toString())
    );

    // Calculate scores for each event
    const scoredEvents = candidateEvents.map((event) => ({
      ...event,
      recommendationScore: userProfile
        ? calculateRecommendationScore(event, userProfile)
        : Math.random() * 50, // Random score for new users
      reason: userProfile ? getRecommendationReason(event, userProfile) : "Sự kiện mới",
    }));

    // Sort by score (descending) and limit
    const recommendations = scoredEvents
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
};

/**
 * Generate human-readable reason for recommendation
 */
const getRecommendationReason = (event, userProfile) => {
  const reasons = [];

  // Check category match
  if (event.category && userProfile.categories[event.category]) {
    const count = userProfile.categories[event.category];
    reasons.push(`Bạn đã tham gia ${count} sự kiện ${event.category}`);
  }

  // Check tag match
  if (event.tags && event.tags.length > 0) {
    const matchingTags = event.tags.filter((tag) => userProfile.tags[tag]);
    if (matchingTags.length > 0) {
      reasons.push(`Phù hợp với sở thích: ${matchingTags.slice(0, 2).join(", ")}`);
    }
  }

  // Check location
  if (event.location) {
    const eventLocation = event.location.split(",")[0].trim();
    if (userProfile.locations[eventLocation]) {
      reasons.push(`Gần khu vực bạn thường tham gia`);
    }
  }

  return reasons.length > 0 ? reasons[0] : "Gợi ý dựa trên hồ sơ của bạn";
};

/**
 * Get similar events based on a given event
 */
const getSimilarEvents = async (eventId, limit = 5) => {
  try {
    const baseEvent = await Event.findById(eventId).lean();
    if (!baseEvent) return [];

    const now = new Date();
    const otherEvents = await Event.find({
      _id: { $ne: eventId },
      status: "approved",
      startDate: { $gte: now },
    }).lean();

    const scoredEvents = otherEvents.map((event) => ({
      ...event,
      similarityScore: calculateEventSimilarity(baseEvent, event),
    }));

    return scoredEvents
      .filter((e) => e.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  } catch (error) {
    console.error("Error finding similar events:", error);
    throw error;
  }
};

export {
  getRecommendations,
  getSimilarEvents,
  buildUserProfile,
};
