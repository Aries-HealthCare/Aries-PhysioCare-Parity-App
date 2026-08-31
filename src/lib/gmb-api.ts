/**
 * @fileOverview Google Business Profile (GMB) API Integration Service
 * 
 * This service handles communication with the Google Business Profile API.
 * Note: To enable live sync, you must provide a valid API Key and OAuth2 credentials
 * in your environment variables.
 */

export type GmbReview = {
  id: string;
  reviewerName: string;
  profilePhotoUrl: string;
  rating: number;
  comment: string;
  createTime: string;
  isVerified: boolean;
};

export type GmbPost = {
  title: string;
  summary: string;
  callToActionUrl: string;
  imageUrl: string;
  postType: 'OFFER' | 'NEWS' | 'EVENT';
};

/**
 * Fetches the latest Google reviews for a specific business location.
 * @param locationId The GMB Location ID (e.g., for a specific branch in Mumbai)
 */
export async function getGoogleReviews(locationId: string): Promise<GmbReview[]> {
  throw new Error(
    `Google Business Profile reviews are unavailable for ${locationId}; no server-side OAuth integration is configured`,
  );
}

/**
 * Pushes a new blog post or offer from the website to the Google My Business listing.
 * This should be triggered from your Admin panel or during blog publishing.
 */
export async function pushUpdateToGmb(locationId: string, post: GmbPost) {
  throw new Error(
    `Google Business Profile publishing is unavailable for ${locationId}; no server-side OAuth integration is configured`,
  );
}
