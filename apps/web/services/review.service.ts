"use client";

import { apiClient } from "@/lib/api-client";
import type { Review } from "@/types/storefront";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ReviewContext = {
  review: Review | null;
  canReview: boolean;
  orderNumber?: string | null;
};

export type ReviewInput = {
  rating: number;
  comment: string;
  images?: string[];
};

export async function fetchProductReviews(productId: string) {
  return apiClient.fetch<{
    data: Review[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      ratingDistribution: Array<{ rating: number; count: number }>;
    };
  }>(`/products/${productId}/reviews`);
}

export async function fetchReviewContext(productId: string) {
  return apiClient.fetch<ApiResponse<ReviewContext>>(`/products/${productId}/reviews/me`);
}

export async function createReview(productId: string, input: ReviewInput) {
  return apiClient.fetch<ApiResponse<Review>>(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateReview(reviewId: string, input: ReviewInput) {
  return apiClient.fetch<ApiResponse<Review>>(`/reviews/${reviewId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteReview(reviewId: string) {
  return apiClient.fetch<{ message?: string }>(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
