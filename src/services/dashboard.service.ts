// src/services/dashboard.service.ts
import api from "@/lib/axios";

export interface DashboardStats {
  summary: {
    totalRevenue: number;
    totalAttendees: number;
    totalEvents: number;
    publishedEvents: number;
    completedEvents: number;
  };
  chartData: {
    date: string;
    revenue: number;
    attendees: number;
  }[];
  topEvents: {
    id: string;
    title: string;
    revenue: number;
    attendees: number;
  }[];
}

export interface OrganizerEventStat {
  id: string;
  title: string;
  status: string;
  startDate: string;
  location: string;
  price: number;
  isFree: boolean;
  availableSeats: number;
  bookedSeats: number;
  category: string;
  totalRevenue: number;
  totalAttendees: number;
  totalTransactions: number;
  totalReviews: number;
  averageRating: number;
}

export async function getDashboardStatsApi(
  range: "day" | "month" | "year",
): Promise<DashboardStats> {
  const res = await api.get(`/dashboard/stats?range=${range}`);
  return res.data.data;
}

export async function getOrganizerEventStatsApi(): Promise<
  OrganizerEventStat[]
> {
  const res = await api.get("/dashboard/events");
  return res.data.data;
}
