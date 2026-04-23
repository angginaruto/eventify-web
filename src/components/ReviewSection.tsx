// src/components/ReviewSection.tsx
import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventReviewsApi, createReviewApi } from "@/services/review.service";
import { useAuthStore } from "@/store/auth.store";

interface ReviewSectionProps {
  eventId: string;
  isCompleted: boolean;
  hasAttended: boolean; // apakah user punya transaksi untuk event ini
}

function StarRating({
  // star rating component
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void; // function klo user klik bintang
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-transform ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          <span
            className={
              star <= (hovered || value) ? "text-yellow-400" : "text-gray-200"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({
  eventId,
  isCompleted,
  hasAttended,
}: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["event-reviews", eventId],
    queryFn: () => getEventReviewsApi(eventId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createReviewApi(eventId, {
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-reviews", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      setSubmitted(true);
      setRating(0);
      setComment("");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to submit review";
      setFormError(message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (rating === 0) {
      setFormError("Please select a rating");
      return;
    }
    mutation.mutate();
  }

  // cek apakah user sudah review event ini
  const alreadyReviewed = data?.reviews.some((r) => r.userId === user?.id);
  const showForm =
    isAuthenticated &&
    user?.role === "CUSTOMER" &&
    isCompleted &&
    hasAttended &&
    !alreadyReviewed &&
    !submitted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews
          {data && data.meta.totalReviews > 0 && (
            <span className="text-gray-400 font-normal text-sm ml-2">
              ({data.meta.totalReviews})
            </span>
          )}
        </h2>
        {data && data.meta.totalReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(data.meta.averageRating)} readonly />
            <span className="text-sm font-semibold text-gray-900">
              {data.meta.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Share your experience
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <p className="text-red-500 text-xs">{formError}</p>}
            {/* Star rating */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Your rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            {/* Comment */}
            <div>
              <p className="text-xs text-gray-500 mb-2">
                Comment <span className="text-gray-400">(optional)</span>
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Tell others about your experience..."
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 text-sm outline-none focus:border-indigo-400 resize-none bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {mutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Success message */}
      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          ✅ Thank you for your review!
        </div>
      )}

      {/* Already reviewed */}
      {alreadyReviewed && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm px-4 py-3 rounded-xl">
          ✓ You have already reviewed this event.
        </div>
      )}

      {/* Not attended message */}
      {isAuthenticated &&
        user?.role === "CUSTOMER" &&
        isCompleted &&
        !hasAttended && (
          <p className="text-sm text-gray-400 italic">
            Only attendees who purchased a ticket can leave a review.
          </p>
        )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review list */}
      {!isLoading && data?.reviews && data.reviews.length > 0 && (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <div key={review.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
                {review.user.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-medium text-gray-900">
                    {review.user.name}
                  </p>
                  <StarRating value={review.rating} readonly />
                  <span className="text-xs text-gray-400">
                    {format(new Date(review.createdAt), "dd MMM yyyy")}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && data?.reviews.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          No reviews yet. Be the first to review!
        </p>
      )}
    </div>
  );
}
