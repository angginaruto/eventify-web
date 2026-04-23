// src/components/EventCard.tsx
import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Event } from "../services/event.service";

function formatIDR(amount: number): string {
  // format rupiah
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="aspect-video bg-linear-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎪</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category + Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {event.category.name}
          </span>
          {event.reviewCount > 0 && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              ⭐ {event.averageRating.toFixed(1)}
              <span className="text-gray-400">({event.reviewCount})</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>

        {/* Date */}
        <p className="text-xs text-gray-500 mb-1">
          📅 {format(new Date(event.startDate), "dd MMM yyyy, HH:mm")}
        </p>

        {/* Location */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-3">
          📍 {event.location}
        </p>

        {/* Price + Seats */}
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-bold ${event.isFree ? "text-green-600" : "text-gray-900"}`}
          >
            {event.isFree ? "Free" : formatIDR(event.price)}
          </span>
          <span className="text-xs text-gray-400">
            {event.availableSeats - event.bookedSeats} seats left
          </span>
        </div>
      </div>
    </Link>
  );
}
