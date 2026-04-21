// src/pages/organizer/DashboardPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { getDashboardStatsApi } from "../../services/dashboard.service";

type Range = "day" | "month" | "year";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatIDRShort(amount: number): string {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}K`;
  return `Rp ${amount}`;
}

const rangeOptions: { label: string; value: Range }[] = [
  { label: "Per Day", value: "day" },
  { label: "Per Month", value: "month" },
  { label: "Per Year", value: "year" },
];

export default function DashboardPage() {
  const [range, setRange] = useState<Range>("month");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats", range],
    queryFn: () => getDashboardStatsApi(range),
  });

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your event performance overview
          </p>
        </div>

        {/* Range toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  range === opt.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: isLoading ? "—" : formatIDR(summary?.totalRevenue ?? 0),
            icon: "💰",
            color: "text-green-600",
          },
          {
            label: "Total Attendees",
            value: isLoading
              ? "—"
              : (summary?.totalAttendees ?? 0).toLocaleString(),
            icon: "👥",
            color: "text-blue-600",
          },
          {
            label: "Active Events",
            value: isLoading ? "—" : (summary?.publishedEvents ?? 0).toString(),
            icon: "📅",
            color: "text-indigo-600",
          },
          {
            label: "Completed Events",
            value: isLoading ? "—" : (summary?.completedEvents ?? 0).toString(),
            icon: "✅",
            color: "text-purple-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">{card.label}</p>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className={`text-xl font-bold ${card.color}`}>
              {isLoading ? (
                <span className="inline-block w-24 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">
          Revenue Over Time
        </h2>
        {isLoading ? (
          <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
        ) : data?.chartData && data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatIDRShort}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => {
                  const num = typeof value === "number" ? value : 0;
                  return [formatIDR(num), "Revenue"];
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
            No revenue data yet
          </div>
        )}
      </div>

      {/* Attendees chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">
          Attendees Over Time
        </h2>
        {isLoading ? (
          <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
        ) : data?.chartData && data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data.chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => {
                  const num = typeof value === "number" ? value : undefined;
                  return [num, "Attendees"];
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="attendees"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
            No attendee data yet
          </div>
        )}
      </div>

      {/* Top events */}
      {data?.topEvents && data.topEvents.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Top Events by Revenue
          </h2>
          <div className="space-y-3">
            {data.topEvents.map((event, idx) => (
              <div key={event.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-5 text-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {event.attendees} attendees
                  </p>
                </div>
                <p className="text-sm font-semibold text-green-600 shrink-0">
                  {formatIDR(event.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
