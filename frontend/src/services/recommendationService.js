import api from "../api";

export const fetchMyRecommendations = async (limit = 10) => {
  try {
    const response = await api.get(`/recommendations?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch recommendations";
  }
};

export const fetchSimilarEvents = async (eventId, limit = 5) => {
  try {
    const response = await api.get(
      `/recommendations/similar/${eventId}?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch similar events";
  }
};
