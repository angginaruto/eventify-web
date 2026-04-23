// src/services/review.service.ts
import api from "@/lib/axios";

export interface Review {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  meta: {
    averageRating: number;
    totalReviews: number;
  };
}

export async function getEventReviewsApi(
  eventId: string,
): Promise<ReviewsResponse> {
  const res = await api.get(`/events/${eventId}/reviews`);
  return res.data.data;
}

export async function createReviewApi(
  eventId: string,
  payload: { rating: number; comment?: string },
): Promise<Review> {
  const res = await api.post(`/events/${eventId}/reviews`, payload); // kirim data ke backend
  return res.data.data; // ambil data dari backend
}
