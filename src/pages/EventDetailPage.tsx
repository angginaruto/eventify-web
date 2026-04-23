// src/pages/EventDetailPage.tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEventByIdApi } from "@/services/event.service";
import { getMyTransactionsApi } from "@/services/transaction.service";
import { useAuthStore } from "@/store/auth.store";
import ReviewSection from "@/components/ReviewSection";

function formatIDR(amount: number): string {
  // format angka ke format Rupiah Indonesia
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function EventDetailPage() {
  // halaman detail event, route: /events/:id
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventByIdApi(id!),
    enabled: !!id,
  });

  // cek apakah customer sudah beli tiket event ini
  const { data: myTransactions } = useQuery({
    // ambil transaksi-transaksi yang pernah dilakukan user ini
    queryKey: ["my-transactions"],
    queryFn: getMyTransactionsApi,
    enabled: isAuthenticated && user?.role === "CUSTOMER",
  });

  const hasAttended =
    myTransactions?.some(
      (tx) => tx.eventId === id && tx.status === "SUCCESS",
    ) ?? false;

  function handleBuyTicket() {
    // fungsi untuk handle klik tombol beli tiket, jika belum login arahkan ke halaman login, kalau sudah login arahkan ke halaman checkout
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate(`/checkout/${id}`);
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-2xl mb-8" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Event not found
        </h2>
        <p className="text-gray-500 mb-6">
          The event you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">
          ← Back to events
        </Link>
      </div>
    );
  }

  const seatsLeft = event.availableSeats - event.bookedSeats;
  const isCompleted = event.status === "COMPLETED";
  const isCancelled = event.status === "CANCELLED";
  const isSoldOut = seatsLeft <= 0;
  const isOrganizer = user?.role === "ORGANIZER";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        to="/"
        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-6"
      >
        ← Back to events
      </Link>

      {/* Image */}
      <div className="aspect-21/9 bg-linear-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden mb-8">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎪
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {event.category.name}
              </span>
              {isCompleted && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              )}
              {isCancelled && (
                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Cancelled
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            {event.reviewCount > 0 && (
              <p className="text-sm text-gray-500">
                ⭐ {event.averageRating.toFixed(1)} · {event.reviewCount} review
                {event.reviewCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Date & Time</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(event.startDate), "EEEE, dd MMMM yyyy")}
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(event.startDate), "HH:mm")} –{" "}
                {format(new Date(event.endDate), "HH:mm")}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {event.location}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              About this event
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Organizer */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Organizer
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                {event.organizer.name[0].toUpperCase()}
              </div>
              <p className="text-sm font-medium text-gray-900">
                {event.organizer.name}
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div className="border-t border-gray-100 pt-6">
            <ReviewSection
              eventId={id!}
              isCompleted={isCompleted}
              hasAttended={hasAttended}
            />
          </div>
        </div>

        {/* Ticket card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-20 shadow-sm">
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p
                className={`text-2xl font-bold ${event.isFree ? "text-green-600" : "text-gray-900"}`}
              >
                {event.isFree ? "Free" : formatIDR(event.price)}
              </p>
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Available seats</span>
                <span
                  className={`font-medium ${seatsLeft <= 10 ? "text-orange-500" : "text-gray-900"}`}
                >
                  {seatsLeft}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total capacity</span>
                <span className="font-medium text-gray-900">
                  {event.availableSeats}
                </span>
              </div>
            </div>

            {/* Seat progress bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (event.bookedSeats / event.availableSeats) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((event.bookedSeats / event.availableSeats) * 100)}%
                booked
              </p>
            </div>

            {/* CTA button */}
            {isOrganizer ? (
              <p className="text-xs text-center text-gray-400">
                Organizers cannot purchase tickets
              </p>
            ) : isCancelled ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
              >
                Event Cancelled
              </button>
            ) : isCompleted ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
              >
                Event Ended
              </button>
            ) : isSoldOut ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleBuyTicket}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
              >
                {event.isFree ? "Get Free Ticket" : "Buy Ticket"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
