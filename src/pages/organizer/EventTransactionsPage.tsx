// src/pages/organizer/EventTransactionsPage.tsx
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

export default function EventTransactionsPage() {
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
  const totalTickets = filtered.reduce(
    (sum: number, tx: any) => sum + tx.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-[#0a0a12] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/organizer/events"
            className="text-sm text-slate-500 hover:text-violet-400 flex items-center gap-1 mb-4"
          >
            ← Back to My Events
          </Link>
          <h1 className="text-2xl font-semibold text-white">Transactions</h1>
          {event && (
            <p className="text-sm text-slate-500 mt-1 truncate">{event.title}</p>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Transactions",
              value: filtered.length,
              icon: "🧾",
              color: "text-violet-300",
            },
            {
              label: "Tickets Sold",
              value: totalTickets,
              icon: "🎟️",
              color: "text-sky-300",
            },
            {
              label: "Total Revenue",
              value: formatIDR(totalRevenue),
              icon: "💰",
              color: "text-emerald-300",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-[#12121e] rounded-2xl border border-white/10 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{card.label}</p>
                <span className="text-lg">{card.icon}</span>
              </div>
              <p className={`text-xl font-semibold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-400/60"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#12121e] rounded-2xl border border-white/10 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="flex-1 h-4 bg-white/5 rounded" />
                  <div className="w-32 h-4 bg-white/5 rounded" />
                  <div className="w-24 h-4 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-slate-500 text-sm">
                {search
                  ? "No transactions match your search."
                  : "No transactions yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">
                      Customer
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">
                      Qty
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">
                      Base Price
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">
                      Discount
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">
                      Final Price
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-white">
                          {tx.customer.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.customer.email}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">
                        {tx.quantity}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">
                        {formatIDR(tx.basePrice)}
                      </td>
                      <td className="px-5 py-3 text-sm text-emerald-400">
                        {tx.discountAmount + tx.pointsUsed > 0 ? (
                          `− ${formatIDR(tx.discountAmount + tx.pointsUsed)}`
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-white">
                        {tx.finalPrice === 0 ? (
                          <span className="text-emerald-400">Free</span>
                        ) : (
                          formatIDR(tx.finalPrice)
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {format(new Date(tx.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full
                          ${
                            tx.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
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
    </div>
  );
}