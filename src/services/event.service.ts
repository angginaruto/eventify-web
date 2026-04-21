// src/services/event.service.ts
import api from "@/lib/axios";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  isFree: boolean;
  availableSeats: number;
  bookedSeats: number;
  imageUrl: string | null;
  status: string;
  averageRating: number;
  reviewCount: number;
  category: { id: string; name: string; slug: string };
  organizer: { id: string; name: string; avatarUrl: string | null };
}

export interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EventQuery {
  search?: string;
  categoryId?: string;
  location?: string;
  type?: "free" | "paid";
  page?: number;
  limit?: number;
}

export async function getEventsApi(
  query: EventQuery = {},
): Promise<EventsResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.location) params.set("location", query.location);
  if (query.type) params.set("type", query.type);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const res = await api.get(`/events?${params.toString()}`);
  return res.data;
}

export async function getEventByIdApi(id: string): Promise<Event> {
  const res = await api.get(`/events/${id}`);
  return res.data.data;
}

export async function getCategoriesApi(): Promise<Category[]> {
  const res = await api.get("/events/categories");
  return res.data.data;
}

export interface CreateEventPayload {
  title: string;
  categoryId: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  imageUrl?: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
}

export async function getOrganizerEventsApi(query?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.status) params.set("status", query.status);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const res = await api.get(`/events/organizer/my-events?${params.toString()}`);
  return res.data;
}

export async function createEventApi(payload: CreateEventPayload) {
  const res = await api.post("/events", payload);
  return res.data.data;
}

export async function updateEventApi(id: string, payload: UpdateEventPayload) {
  const res = await api.put(`/events/${id}`, payload);
  return res.data.data;
}

export async function deleteEventApi(id: string) {
  const res = await api.delete(`/events/${id}`);
  return res.data;
}
