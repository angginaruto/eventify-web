// src/pages/organizer/AttendeeListPage.tsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "@/lib/axios";
import { useDebounce } from "@/hooks/useDebounce";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function getEventTransactionsApi(eventId: string) {
  const res = await api.get(`/transactions/event/${eventId}`);
  return res.data.data;
}

async function getEventDetailApi(eventId: string) {
  const res = await api.get(`/events/${eventId}`);
  return res.data.data;
}

export default function AttendeeListPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventDetailApi(id!),
    enabled: !!id,
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["event-transactions", id],
    queryFn: () => getEventTransactionsApi(id!),
    enabled: !!id,
  });

  // filter by search
  const filtered =
    transactions?.filter((tx: any) => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        tx.customer.name.toLowerCase().includes(q) ||
        tx.customer.email.toLowerCase().includes(q)
      );
    }) ?? [];

  const totalRevenue = filtered.reduce(
    (sum: number, tx: any) => sum + tx.finalPrice,
    0,
  );
  const totalAttendees = filtered.reduce(
    (sum: number, tx: any) => sum + tx.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/organizer/events"
          className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 mb-4"
        >
          ← Back to My Events
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Attendee List</h1>
        {event && (
          <p className="text-sm text-gray-500 mt-1 truncate">{event.title}</p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Transactions",
            value: filtered.length,
            icon: "🧾",
            color: "text-indigo-600",
          },
          {
            label: "Total Attendees",
            value: totalAttendees,
            icon: "👥",
            color: "text-blue-600",
          },
          {
            label: "Total Revenue",
            value: formatIDR(totalRevenue),
            icon: "💰",
            color: "text-green-600",
          },
          {
            label: "Seats Left",
            value: event ? event.availableSeats - event.bookedSeats : "—",
            icon: "🪑",
            color: "text-orange-500",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{card.label}</p>
              <span className="text-lg">{card.icon}</span>
            </div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="flex-1 h-4 bg-gray-200 rounded" />
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-24 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500 text-sm">
              {search ? "No attendees match your search." : "No attendees yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Attendee
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Qty
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Paid
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Discount
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((tx: any) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {tx.customer.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.customer.email}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {tx.quantity}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {tx.finalPrice === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatIDR(tx.finalPrice)
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-green-600">
                      {tx.discountAmount > 0 || tx.pointsUsed > 0 ? (
                        <span>
                          − {formatIDR(tx.discountAmount + tx.pointsUsed)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {format(new Date(tx.createdAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${
                          tx.status === "SUCCESS"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
