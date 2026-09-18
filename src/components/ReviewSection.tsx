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
              star <= (hovered || value) ? "text-amber-400" : "text-white/15"
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
        <h2 className="text-lg font-semibold text-white">
          Reviews
          {data && data.meta.totalReviews > 0 && (
            <span className="text-slate-500 font-normal text-sm ml-2">
              ({data.meta.totalReviews})
            </span>
          )}
        </h2>
        {data && data.meta.totalReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(data.meta.averageRating)} readonly />
            <span className="text-sm font-semibold text-white">
              {data.meta.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="bg-violet-500/10 rounded-2xl p-5 border border-violet-400/20">
          <h3 className="text-sm font-semibold text-white mb-4">
            Share your experience
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <p className="text-red-400 text-xs">{formError}</p>}
            {/* Star rating */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Your rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            {/* Comment */}
            <div>
              <p className="text-xs text-slate-400 mb-2">
                Comment <span className="text-slate-500">(optional)</span>
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Tell others about your experience..."
                className="w-full px-4 py-2.5 rounded-xl border border-violet-400/20 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-400/60 resize-none bg-white/5"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/40 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {mutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Success message */}
      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-sm px-4 py-3 rounded-xl">
          ✅ Thank you for your review!
        </div>
      )}

      {/* Already reviewed */}
      {alreadyReviewed && (
        <div className="bg-white/5 border border-white/10 text-slate-400 text-sm px-4 py-3 rounded-xl">
          ✓ You have already reviewed this event.
        </div>
      )}

      {/* Not attended message */}
      {isAuthenticated &&
        user?.role === "CUSTOMER" &&
        isCompleted &&
        !hasAttended && (
          <p className="text-sm text-slate-500 italic">
            Only attendees who purchased a ticket can leave a review.
          </p>
        )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-9 h-9 bg-white/5 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-1/4" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
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
              <div className="w-9 h-9 rounded-full bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-300 font-semibold text-sm shrink-0">
                {review.user.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-medium text-white">
                    {review.user.name}
                  </p>
                  <StarRating value={review.rating} readonly />
                  <span className="text-xs text-slate-500">
                    {format(new Date(review.createdAt), "dd MMM yyyy")}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-400">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && data?.reviews.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">
          No reviews yet. Be the first to review!
        </p>
      )}
    </div>
  );
}