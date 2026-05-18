"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/product/rating-stars";
import {
  createReview,
  deleteReview,
  fetchProductReviews,
  fetchReviewContext,
  updateReview,
  type ReviewContext,
} from "@/services/review.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Review } from "@/types/storefront";
import { cn } from "@/lib/utils";

type ProductReviewsProps = {
  productId: string;
  averageRating: number;
  reviewCount: number;
  initialReviews?: Review[];
};

export function ProductReviews({
  productId,
  averageRating,
  reviewCount,
  initialReviews = [],
}: ProductReviewsProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [context, setContext] = useState<ReviewContext | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const existingReview = context?.review || null;
  const canWriteReview = Boolean(context?.canReview || existingReview);
  const displayedAverage = useMemo(() => {
    if (reviews.length === 0) return averageRating;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [averageRating, reviews]);

  useEffect(() => {
    setIsLoading(true);
    fetchProductReviews(productId)
      .then((response) => setReviews(response.data))
      .catch(() => setReviews(initialReviews))
      .finally(() => setIsLoading(false));
  }, [initialReviews, productId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setContext(null);
      return;
    }

    fetchReviewContext(productId)
      .then((response) => {
        setContext(response.data);
        if (response.data.review) {
          setRating(response.data.review.rating);
          setComment(response.data.review.comment || "");
        }
      })
      .catch(() => setContext(null));
  }, [isAuthenticated, productId]);

  const handleSubmit = async () => {
    const cleanComment = comment.trim();

    if (cleanComment.length < 10) {
      toast.error("Nhan xet can toi thieu 10 ky tu");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = existingReview?.id
        ? await updateReview(existingReview.id, { rating, comment: cleanComment })
        : await createReview(productId, { rating, comment: cleanComment });

      setContext((current) => ({
        canReview: true,
        orderNumber: current?.orderNumber || null,
        review: response.data,
      }));
      setReviews((current) => {
        const exists = current.some((item) => item.id === response.data.id);
        if (exists) {
          return current.map((item) => (item.id === response.data.id ? response.data : item));
        }
        return [response.data, ...current];
      });
      toast.success(existingReview ? "Da cap nhat danh gia" : "Da gui danh gia");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the gui danh gia");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview?.id) return;

    setIsDeleting(true);
    try {
      await deleteReview(existingReview.id);
      setReviews((current) => current.filter((item) => item.id !== existingReview.id));
      setContext((current) => ({
        canReview: current?.canReview || false,
        orderNumber: current?.orderNumber || null,
        review: null,
      }));
      setRating(5);
      setComment("");
      toast.success("Da xoa danh gia");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the xoa danh gia");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-[260px_1fr]">
      <aside className="rounded-lg bg-muted p-5">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{displayedAverage.toFixed(1)}</p>
          <RatingStars value={displayedAverage} className="mt-3 justify-center" />
          <p className="mt-2 text-sm text-muted-foreground">
            {reviews.length || reviewCount} danh gia
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((item) => {
            const count = reviews.filter((review) => review.rating === item).length;
            const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;

            return (
              <div key={item} className="grid grid-cols-[36px_1fr_36px] items-center gap-2 text-xs">
                <span className="text-muted-foreground">{item} sao</span>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </aside>

      <div className="space-y-5">
        <section className="rounded-lg border border-border p-4">
          {!isAuthenticated ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">Dang nhap de danh gia</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tai khoan da mua va nhan hang co the gui nhan xet.
                </p>
              </div>
              <Button render={<Link href="/login" />}>Dang nhap</Button>
            </div>
          ) : canWriteReview ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {existingReview ? "Cap nhat danh gia cua ban" : "Viet danh gia"}
                  </h3>
                  {context?.orderNumber ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Don hang da giao: {context.orderNumber}
                    </p>
                  ) : null}
                </div>
                {existingReview ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    Xoa
                  </Button>
                ) : null}
              </div>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      className="rounded-md p-1 text-amber-400 transition hover:bg-muted"
                      onClick={() => setRating(value)}
                      aria-label={`${value} sao`}
                    >
                      <Star className={cn("size-6", value <= rating && "fill-amber-400")} />
                    </button>
                  );
                })}
              </div>

              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Chia se trai nghiem ve chat lieu, do em va giao hang..."
                className="min-h-28"
              />
              <Button type="button" className="h-10" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}
                {existingReview ? "Cap nhat" : "Gui danh gia"}
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-foreground">Danh gia sau khi nhan hang</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Chi khach hang co don da giao moi co the danh gia san pham nay.
              </p>
            </div>
          )}
        </section>

        {isLoading ? (
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Chua co danh gia nao cho san pham nay.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {reviews.map((review) => (
              <article key={review.id || `${review.user?.name}-${review.createdAt}`} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{review.user?.name || "Khach hang"}</p>
                    <RatingStars value={review.rating} className="mt-1" />
                  </div>
                  {review.createdAt ? (
                    <time className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </time>
                  ) : null}
                </div>
                <p className="mt-3 leading-7 text-muted-foreground">{review.comment}</p>
                {review.images?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((image) => (
                      <img
                        key={image}
                        src={image}
                        alt="Review"
                        className="size-16 rounded-md border border-border object-cover"
                      />
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
