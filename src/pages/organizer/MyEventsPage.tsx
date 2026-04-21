// src/pages/organizer/MyEventsPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  getOrganizerEventsApi,
  deleteEventApi,
  updateEventApi,
} from "@/services/event.service";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useDebounce } from "@/hooks/useDebounce";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-500",
  COMPLETED: "bg-purple-50 text-purple-600",
};

export default function MyEventsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["organizer-events", debouncedSearch, statusFilter, page],
    queryFn: () =>
      getOrganizerEventsApi({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEventApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      setDeleteId(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => updateEventApi(id, { status: "PUBLISHED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      setPublishId(null);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => updateEventApi(id, { status: "COMPLETED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      setCompleteId(null);
    },
  });

  const events = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your events</p>
        </div>
        <Link
          to="/organizer/events/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          + Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search events..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400 bg-white text-gray-600"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && events.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-4xl mb-3">📅</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No events yet
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            {search || statusFilter
              ? "No events match your filter."
              : "Start by creating your first event."}
          </p>
          {!search && !statusFilter && (
            <Link
              to="/organizer/events/create"
              className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Create Event
            </Link>
          )}
        </div>
      )}

      {/* Event list */}
      {!isLoading && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event: any) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {event.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColors[event.status]}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    📅 {format(new Date(event.startDate), "dd MMM yyyy, HH:mm")}
                  </p>
                  <p className="text-xs text-gray-500">📍 {event.location}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>
                      {event.isFree ? "Free" : formatIDR(event.price)}
                    </span>
                    <span>
                      {event.bookedSeats}/{event.availableSeats} seats
                    </span>
                    <span>{event._count?.transactions ?? 0} transactions</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {event.status === "DRAFT" && (
                    <button
                      onClick={() => setPublishId(event.id)}
                      className="text-xs bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  {event.status === "PUBLISHED" && (
                    <button
                      onClick={() => setCompleteId(event.id)}
                      className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate(`/organizer/events/${event.id}/edit`)
                    }
                    className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </button>

                  <Link
                    to={`/organizer/events/${event.id}/attendees`}
                    className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Attendees
                  </Link>
                  <Link
                    to={`/organizer/events/${event.id}/transactions`}
                    className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    Transactions
                  </Link>
                  <button
                    onClick={() => setDeleteId(event.id)}
                    className="text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-3 py-2 text-sm text-gray-500">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />

      {/* Publish confirm dialog */}
      <ConfirmDialog
        isOpen={!!publishId}
        title="Publish Event"
        description="Once published, your event will be visible to all users. Are you sure?"
        confirmLabel="Publish"
        onConfirm={() => publishId && publishMutation.mutate(publishId)}
        onCancel={() => setPublishId(null)}
        isLoading={publishMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!completeId}
        title="Mark as Completed"
        description="This will mark the event as completed. Attendees will be able to leave reviews. This action cannot be undone."
        confirmLabel="Mark Complete"
        onConfirm={() => completeId && completeMutation.mutate(completeId)}
        onCancel={() => setCompleteId(null)}
        isLoading={completeMutation.isPending}
      />
    </div>
  );
}
