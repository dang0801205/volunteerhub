/** @format */

export const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80";

export const getValidImageUrl = (imageUrl, fallback = DEFAULT_EVENT_IMAGE) => {
  // Return fallback if no URL provided
  if (!imageUrl) return fallback;

  // Return original if it's a valid URL
  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return fallback;
  }
};

export const handleImageError = (event) => {
  if (event.target.src !== DEFAULT_EVENT_IMAGE) {
    event.target.src = DEFAULT_EVENT_IMAGE;
  }
};
